const userModel = require("../models/users.js");
const DoctorAvailabilityModel = require("../models/doctor-availability.js")
const doctorModel = require("../models/doctors.js");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const { validateUserRegisterInput } = require("../validation/register.js")
const { handleServerError } = require("../config/resError.js");
const isEmpty = require("../validation/is-empty")
const uuidValidate = require("uuid-validate");
const bcrypt = require("bcryptjs");
const uuid = require('uuid').v4;
const moment = require('moment');
const {
  getAppointmentsByUserId,
  getAppointmentsByUserIdAndType,
  updateAppointmentById
} = require("../models/appointments.js");
const userHelper = require("../helpers/users.js")
const mail = require("../utils/email.js");

exports.register = asyncWrapper(async (req, res, next) => {
  const { errors, isValid } = validateUserRegisterInput(req.body);
  let isUserAvailable = await userModel.getUserByEmail(req.body.email);

  if (isUserAvailable && isEmpty(errors.email)) {
    errors.email = "Email already exists";
  }
  if (!isValid || !isEmpty(errors)) {
    return res.status(422).json({
      success: false,
      data: {},
      message: "Validation Error",
      error: errors
    });
  }

  // adding logic to check dob is 18 or 18+
  const dobDate = moment(req?.body?.dob);
  const currentDate = moment();
  // calculate the age
  const age = currentDate.diff(dobDate, 'years');
  if (age < 18) {
    return res.status(500).json({
      success: false,
      message: "User should be an adult of age 18 or older.",
      data: {},
      error: "User should be an adult of age 18 or older."
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);

  req.body.email = req.body.email.toLowerCase();
  req.body.is_adult = true
  req.body.has_mandatory_fields = userHelper.checkRequiredFields(req.body) || false
  const newUser = await userModel.addUserModel({ ...req.body, password: hash });


  // update New user added by adding family id 
  let userUpdateData = {
    family_id: newUser.id
  }
  const updatedUser = await userModel.updateUserModel(newUser.id, userUpdateData);

  //sending confirmation email for registeration
  const mail_option = {
    filename: "accountRegister",
    data: {
        name:`${req.body.first_name} ${req.body.last_name}`
    },
    subject: `${config.appName} - Account registered successfully`,
    user: {
        email: req.body.email,
    },
};
let send_mail = await mail.send(mail_option);
  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: newUser,
    error: {},
  });
});

exports.getUser = asyncWrapper(async (req, res, next) => {
  let identifier = req.query;
  if (identifier) {
    let data = await userModel.getUserModel(identifier);
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: data || [],
      error: {},
    });
  } else {
    handleServerError(res, { error: "User not found" });
  }
});

exports.getAllUsers = asyncWrapper(async (req, res, next) => {
  let data = await userModel.getAllUsersModel();
  return res.status(200).json({
    success: true,
    message: "List of user details fetched successfully",
    data: data,
    error: {},
  });
});

exports.updateUser = asyncWrapper(async (req, res, next) => {
  const userId = req.params.id;
  userHelper.checkUserBodyNotUpdate(req.body)
  if (!uuidValidate(userId)) {
    throw new Error("Invalid UUID");
  }

  // checking that the user has all the mandatory fields
  const user = await userModel.getUserByIdModel(userId)

  let has_mandatory_fields = userHelper.checkRequiredFields(user) || false

  const updatedData = {
    ...req.body,
    has_mandatory_fields: has_mandatory_fields
  };


  const updatedUser = await userModel.updateUserModel(userId, updatedData);

  return res.status(200).json(updatedUser);
});

exports.getAllAvailableDoctors = asyncWrapper(async (req, res, next) => {
  let avialableDoctorIds = await DoctorAvailabilityModel.getAllAvailableDoctorIdsModel()
  // Extracting doctor IDs from the input array -> avialableDoctorIds
  const doctorIds = avialableDoctorIds.map(doc => doc.doctor_id);

  let doctors = await doctorModel.getDoctorsByIds(doctorIds)
  return res.status(200).json({
    success: true,
    message: "List of user details fetched successfully",
    data: doctors,
    error: {},
  });
});

exports.getDoctorAvailabiltySlots = asyncWrapper(async (req, res, next) => {

  let doctorId = req.query.doctorId

  let doctorAvailabiltySlots = await DoctorAvailabilityModel.getDoctorAvailabilityModel(doctorId)

  return res.status(200).json({
    success: true,
    message: "List of doctor availability slots fetched successfully",
    data: doctorAvailabiltySlots,
    error: {},
  });
});

exports.deleteUserById = asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let response = await userModel.deleteUserByIdModel(id)
  return res.status(200).json({
    success: true,
    message: "Deleted User Successfully",
    data: {},
    error: {},
  });
});

exports.addFamilyMember = asyncWrapper(async (req, res, next) => {
  // family id will be the id of the user who is logged in

  // checking the member is adult or kid
  let isAdult = false

  // adding logic to check dob is 18 or 18+
  const dobDate = moment(req?.body?.dob);
  const currentDate = moment();
  // calculate the age
  const age = currentDate.diff(dobDate, 'years');
  if (age >= 18) {
    isAdult = true
  }


  let newMember
  if (isAdult) {
    const { errors, isValid } = validateUserRegisterInput(req.body);
    let isUserAvailable = await userModel.getUserByEmail(req.body.email);

    if (isUserAvailable && isEmpty(errors.email)) {
      errors.email = "Email already exists";
    }
    if (!isValid || !isEmpty(errors)) {
      return res.status(422).json({
        success: false,
        data: {},
        message: "Validation Error",
        error: errors
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

    req.body.email = req.body.email.toLowerCase();
    req.body.is_adult = true
    req.body.family_id = req.user.family_id
    req.body.has_mandatory_fields = userHelper.checkRequiredFields(req.body) || false

    newMember = await userModel.addUserModel({ ...req.body, password: hash });
  } else {
    let parentUser = await userModel.getUserByIdModel(req.user.id)
    req.body.family_id = req.user.family_id

    let has_mandatory_fields = userHelper.checkRequiredFields(req.body) || false
    newMemberObject = {
      ...req.body,
      emergency_contact_name: parentUser.first_name + " " + parentUser.last_name,
      emergency_contact_number: parentUser.phone_no || "",
      has_mandatory_fields: has_mandatory_fields
    }
    newMember = await userModel.addUserModel(newMemberObject);
  }
  return res.status(200).json({
    success: true,
    message: "Added new member successfully",
    data: newMember,
    error: {},
  });
});

exports.getUserByFamilyId = asyncWrapper(async (req, res, next) => {
  // sending family id from params
  let familyId = req.params.id
  let family = await userModel.getUsersByFamilyIdModel(familyId)

  return res.status(200).json({
    success: true,
    message: "Successfully fetched family members",
    data: family,
    error: {},
  });
});

exports.dashboard = asyncWrapper(async (req, res, next) => {

  let userId = req.user.id

  let userInfo = await userModel.getUserByIdModel(userId);

  let pastAppointment = await getAppointmentsByUserIdAndType(userId, "past")
  let currentAppointment = await getAppointmentsByUserIdAndType(userId, "current")
  let upcomingAppointment = await getAppointmentsByUserIdAndType(userId, "upcoming")


  return res.status(200).json({
    success: true,
    message: "Successfully fetched dashboard infomation",
    data: {
      userInfo,
      pastAppointment,
      currentAppointment,
      upcomingAppointment,
    },
    error: {},
  });
});

exports.updateAppointment = asyncWrapper(async (req, res, next) => {

  let { appointmentId, action } = req.body

  if (action === "CancelRequest") {
    let updatedAppointment = await updateAppointmentById(appointmentId, { status: action })
  }
  if (action === "RescheduleRequest") {
    let updatedAppointment = await updateAppointmentById(appointmentId, { status: action })
  }

  return res.status(200).json({
    success: true,
    message: "Successfully updated appointment",
    data: {},
    error: {},
  });
});
const doctorModel = require("../models/doctors.js");
const appointmentModel = require("../models/appointments.js");
const userModel = require("../models/users.js");
const slotModel = require("../models/slots.js")
const asyncWrapper = require("../middleware/asyncWrapper.js");
const { validateDoctorRegisterInput } = require("../validation/register.js")
const isEmpty = require("../validation/is-empty")
const uuidValidate = require("uuid-validate");
const bcrypt = require("bcryptjs");
const { addDoctorAvailabilityModel } = require("../models/doctor-availability.js");
const { addManySlotModel } = require("../models/slots.js");
const { getAppointmentsByDoctorIdAndStatus, updateAppointmentById, getAppointmentById, updateAppointmentsCancelByDate } = require("../models/appointments.js");
const doctorHelper = require("../helpers/doctors.js")
const AWS = require('aws-sdk')
const Config = require("../config/serverConfig.js");
const config = new Config()
const uuid = require('uuid').v4;


exports.register = asyncWrapper(async (req, res, next) => {
  const { errors, isValid } = validateDoctorRegisterInput(req.body);
  let is_doctor_available = await doctorModel.getDoctorByEmail(req.body.email);

  if (is_doctor_available && isEmpty(errors.email)) {
    errors.email = "Email already exist";
  }
  if (!isValid || !isEmpty(errors)) {
    return res
      .status(422)
      .json({
        success: false,
        data: {},
        message: "Validation Error",
        error: errors
      });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);

  // adding profile photo
  if (req.file) {
    const s3 = new AWS.S3({
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    });

    try {
      let myFile = req.file.originalname.split(".");
      const fileType = myFile[myFile.length - 1];

      const params = {
        Bucket: config.awsBucketName,
        Key: `${uuid()}.${fileType}`,
        Body: req.file.buffer,
      };

      const data = await s3.upload(params).promise();
      req.body.profile = data.Location
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload photo",
        data: {},
        error: error.message,
      });
    }
  }

  const newDoctor = await doctorModel.addDoctorModel({ ...req.body, password: hash });

  // whenever doctor is created - creating one month doctorAvailabilty and its default slots form 9am to 5pm
  let currentDate = new Date();
  for (let i = 0; i < 30; i++) {
    // Clone the current date
    let loginDate = new Date(currentDate);
    let logoutDate = new Date(currentDate);
    // Set login time to 9 AM
    loginDate.setUTCHours(9, 0, 0, 0);
    // Set logout time to 5 PM
    logoutDate.setUTCHours(17, 0, 0, 0);

    let doctoravailability = {
      doctor_id: newDoctor.id,
      date: currentDate,
      login: loginDate.toISOString(),
      logout: logoutDate.toISOString()
    }

    // const newDoctorData = req.body;
    const newDoctoravailability = await addDoctorAvailabilityModel(doctoravailability);
    // creating time slots
    // creating start timestamp array
    const slotDetails = [];
    const loginTime = newDoctoravailability.login
    const logoutTime = newDoctoravailability.logout

    for (let time = new Date(loginTime); time < logoutTime; time.setHours(time.getHours() + 1)) {
      slotDetails.push({
        doctoravailability_id: newDoctoravailability.id,
        start: new Date(time)
      });
    }

    let addedSlots = await addManySlotModel(slotDetails)

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // updating last availability date of doctor for cron

  let has_mandatory_fields = doctorHelper.checkRequiredFields(newDoctor) || false


  const updatedData = {
    last_availability_date: currentDate,
    has_mandatory_fields: has_mandatory_fields
  };

  await doctorModel.updateDoctorModel(newDoctor.id, updatedData)

  return res.status(201).json({
    success: true,
    message: "Doctor register successfully",
    data: newDoctor,
    error: false,
  });
});

exports.getDoctor = asyncWrapper(async (req, res, next) => {
  // req.query ---> {doctor_id:3}, {first_name:"abc"}, {last_name:"xyz"}
  let doctorId = req.doctor.id
  let data = await doctorModel.getDoctorModel(doctorId);
  return res.status(200).json({
    success: true,
    message: "Doctor Details Fetch Successfully",
    data: data || {},
    error: {},
  });
});

exports.getAllDoctor = asyncWrapper(async (req, res, next) => {
  let data = await doctorModel.getAllDoctorModel();
  return res.status(200).json({
    success: true,
    message: "List of Doctor Details Fetch Successfully",
    data: data,
    error: {},
  });
});

exports.updateDoctor = asyncWrapper(async (req, res, next) => {
  const doctorId = req.params.id;
  if (!uuidValidate(doctorId)) {
    throw new Error("Invalid UUID");
  }
  // checking that the user has all the mandatory fields
  const doctor = await doctorModel.getDoctorByIdModel(doctorId)

  let has_mandatory_fields = doctorHelper.checkRequiredFields(doctor) || false

   // adding profile photo
   if (req.file) {
    const s3 = new AWS.S3({
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    });

    try {
      let myFile = req.file.originalname.split(".");
      const fileType = myFile[myFile.length - 1];

      const params = {
        Bucket: config.awsBucketName,
        Key: `${uuid()}.${fileType}`,
        Body: req.file.buffer,
      };

      const data = await s3.upload(params).promise();
      req.body.profile = data.Location
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload photo",
        data: {},
        error: error.message,
      });
    }
  }
  
  const updatedData = {
    ...req.body,
    has_mandatory_fields: has_mandatory_fields
  }

  const updatedDoctor = await doctorModel.updateDoctorModel(doctorId, updatedData);

  return res.status(200).json({
    success: true,
    message: "Doctor details updated Successfully",
    data: updatedDoctor || {},
    error: {}
  });
});

exports.getDoctorPatients = asyncWrapper(async (req, res, next) => {
  // req.query ---> {doctor_id:3}, {first_name:"abc"}, {last_name:"xyz"}
  let doctorId = req.doctor.id
  let userIds = await appointmentModel.getUserIdsByDoctorId(doctorId)
  const uniqueUserIds = Array.from(new Set(userIds));
  let doctorPatients = await userModel.getUsersByIdsModel(uniqueUserIds)
  return res.status(200).json({
    success: true,
    message: "Patient details related to the doctor Fetch Successfully",
    data: doctorPatients || [],
    error: {}
  });

});

exports.deleteDoctorById = asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let response = await doctorModel.deleteDoctorByIdModel(id)
  return res.status(200).json({
    success: true,
    message: "Deleted Doctor Successfully",
    data: {},
    error: {},
  });
});

// getting filter from req.body {
//   "appointmentStatus":"Booked"
// }
exports.getAppointmentsByStatus = asyncWrapper(async (req, res, next) => {

  let doctorId = req.doctor.id
  let status = req.body.appointmentStatus
  let appointments = await getAppointmentsByDoctorIdAndStatus(doctorId, status)
  return res.status(200).json({
    success: true,
    smessage: "Successfully fetched doctor appointments",
    data: appointments,
    error: {},
  });
});

exports.updateAppointment = asyncWrapper(async (req, res, next) => {

  let { appointmentId, action } = req.body
  let doctorId = req.doctor.id

  let appointment
  if (appointmentId) {
    appointment = await getAppointmentById(appointmentId)
  }
  if (action === "Cancel") {
    if (req?.body?.cancelDate) {

      let cancelledAppointment = await updateAppointmentsCancelByDate({
        doctor_id: doctorId,
        appointment_time: req?.body?.cancelDate
      }, { status: "Cancelled" })

      // to update all the slots to null i.e to make slots also cancelled
      for (let i = 0; i < cancelledAppointment.length; i++) {
        const eachCancelledAppointment = cancelledAppointment[i];
        await slotModel.updateSlotById(eachCancelledAppointment.slot_id, { booked: null })
      }
    } else {
      let updatedAppointment = await updateAppointmentById(appointmentId, { status: "Cancelled" })
      let updatedSlot = await slotModel.updateSlotById(appointment.slot_id, { booked: null })
    }

  }
  if (action === "Accept") {
    if (appointment.status === "CancelRequest") {
      let updatedAppointment = await updateAppointmentById(appointmentId, { status: "Cancelled" })
      let updatedSlot = await slotModel.updateSlotById(appointment.slot_id, { booked: false })
    }
    if (appointment.status === "RescheduleRequest") {
      let updatedOldSlot = await slotModel.updateSlotById(appointment.slot_id, { booked: false })

      let updatedAppointment = await updateAppointmentById(appointmentId, { status: "Booked", appointment_time: appointment.request_appointment_time, slot_id: appointment.request_slot_id })

      let updatedNewSlot = await slotModel.updateSlotById(appointment.request_slot_id, { booked: true })

    }
  }
  if (action === "Deny") {
    let updatedAppointment = await updateAppointmentById(appointmentId, { status: "Booked" })
  }

  return res.status(200).json({
    success: true,
    smessage: "Successfully updated doctor appointment",
    data: {},
    error: {},
  });
});
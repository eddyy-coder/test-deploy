const { addDoctorAvailabilityModel, getDoctorAvailabilityModel } = require("../models/doctor-availability.js");
const { addManySlotModel } = require("../models/slots.js");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const { handleServerError } = require("../config/resError.js");
const isEmpty = require("../validation/is-empty")
const uuidValidate = require("uuid-validate");

exports.createDoctorAvailability = asyncWrapper(async (req, res, next) => {
    try {
        // checking user is doctor
        // check doctor exists or not
        // checking input parameters
        // validate the date should be of future
        let doctoravailability = {
            doctor_id: req.doctor.id,
            date: req.body.date,
            login: req.body.login,
            logout: req.body.logout
        }
     
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
        // return res.status(201).json(newDoctor);
        return res.status(201).json({
            success:true,
            message: "Doctor avialabililty and slots are defined",
            data: newDoctoravailability,
            error: {},
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

exports.getDoctorAvailability = asyncWrapper(async (req, res, next) => {
    // req.query ---> {doctor_id:3}, {first_name:"abc"}, {last_name:"xyz"}
    let doctor_id =  req.doctor.id

    if (doctor_id) {
      let data = await getDoctorAvailabilityModel(doctor_id);
      return res.status(200).json({
        success:true,
        message: "Doctor Availability Fetch Successfully",
        data: data || [],
        error: {},
      });
    } else {
      handleServerError(res, { error: "Doctor not found" });
    }
  });
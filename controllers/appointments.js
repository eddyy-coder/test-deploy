const {
    getAppointmentsByUserId,
    // getAppointmentsByDoctorId,
    // getAppointmentByAppointmentId,
    addAppointmentModel,
    getAppointmentsByDoctorId

} = require("../models/appointments.js");
const userModel = require("../models/users.js")
const slotModel = require("../models/slots.js");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const { handleServerError } = require("../config/resError.js");
const isEmpty = require("../validation/is-empty")
const uuidValidate = require("uuid-validate");
const mail = require("../utils/email.js");
const Config = require("../config/serverConfig.js")
const moment = require('moment');
const doctorModel = require("../models/doctors.js")
const config = new Config()

exports.addAppointment = asyncWrapper(async (req, res, next) => {
    try {

        // add validation for checking all mandatory details of the use exists to create appointment

        let appointmentUser = await userModel.getUserByIdModel(req?.body?.appointmentuser_id)

        if (!appointmentUser?.has_mandatory_fields) {
            return res.status(500).json({
                success: false,
                message: "User having appointment should have mandatory fields,Please fill the details of the user creating appointment",
                data: {},
                error: "User having appointment should have mandatory fields"
            });
        }

        // checking slot is already booked or not 
        let checkAvailableSlot = await slotModel.getSlotById(req.body.slot_id)
        if (checkAvailableSlot.booked || checkAvailableSlot.booked === null) {
            throw new Error("Slot already booked or cancelled");
        }
        //add validations to check request body
        let appointment = {
            user_id: req.user.id,
            ...req.body
        }
        let createdAppointment = await addAppointmentModel(appointment)

        // update the slot as status booked
        // let updatedSlot = await updateBookSlotById(createdAppointment.slot_id)
        let updatedSlot = await slotModel.updateSlotById(createdAppointment.slot_id, { booked: "true" })

        // getting the user details 
        let appointmentCreatedUser = await userModel.getUserByIdModel(req.user.id)
        let appointmentCreatedForUser = await userModel.getUserByIdModel(req.body.appointmentuser_id)

        // formating the appointment time to send the email -
        const timestamp = req.body.appointment_time;
        const dateTime = moment(timestamp);
        const formattedDate = dateTime.format('MMMM DD, YYYY');
        const formattedTime = dateTime.format('hh:mm A');

        // get the doctor name
        let doctor = await doctorModel.getDoctorByIdModel(req.body.doctor_id)
        const mail_option = {
            filename: "appointmentConfirmation",
            data: {
                appointment_created_by: `${appointmentCreatedUser.first_name} ${appointmentCreatedUser.last_name}` || "",
                appointment_user_name: `${appointmentCreatedForUser.first_name} ${appointmentCreatedForUser.last_name}` || "",
                appointment_time: `${formattedTime} ${formattedDate}` || "",
                doctor_name:  `${doctor.first_name} ${doctor.last_name}` || "",
                note_for_doctor: `${req.body.note_for_doctor}` || "",
                symptoms: `${req.body.symptoms}` || ""
            },
            subject: `${config.appName} - Appointment Confirmation`,
            user: {
                email: appointmentCreatedUser.email,
            },
        };
        let send_mail = await mail.send(mail_option);

        return res.status(200).json({
            success: true,
            message: "Created appointment successfully",
            data: createdAppointment,
            error: {},
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// exports.appointment_by_user_id = asyncWrapper(async (req, res, next) => {
//     try {
//         let userId = req.query.userId
//         if (!uuidValidate(userId)) {
//             throw new Error("Invalid UUID");
//         }
//         let appointmentList = await getAppointmentsByUserId(userId)

//         return res.status(200).json({
//             error: false,
//             message: "List of appointments datails fetch successfully",
//             appointment_list: appointmentList,
//         });
//     } catch (error) {
//         handleServerError(res, error);
//     }
// });  

// exports.appointment_by_doctor_id = asyncWrapper(async (req, res, next) => {
//     try {
//         let doctorId = req.query.doctorId
//         if (!uuidValidate(doctorId)) {
//             throw new Error("Invalid UUID");
//         }
//         let appointmentList = await getAppointmentsByDoctorId(doctorId)

//         return res.status(200).json({
//             error: false,
//             message: "List of appointments datails fetch successfully",
//             appointment_list: appointmentList,
//         });
//     } catch (error) {
//         handleServerError(res, error);
//     }
// });

exports.appointment_by_appointmentId = asyncWrapper(async (req, res, next) => {
    try {
        let appointmentId = req.params.id
        if (!uuidValidate(appointmentId)) {
            throw new Error("Invalid UUID");
        }
        let appointment = await getAppointmentByAppointmentId(appointmentId)

        return res.status(200).json({
            success: true,
            message: "List of appointments datails fetch successfully",
            data: appointment,
            error: {},
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

exports.appointment_by_user = asyncWrapper(async (req, res, next) => {
    try {
        let userId = req.user.id
        if (!uuidValidate(userId)) {
            throw new Error("Invalid UUID");
        }
        let appointment = await getAppointmentsByUserId(userId)

        return res.status(200).json({
            success: true,
            message: "List of appointments datails fetch successfully",
            data: appointment,
            error: {},
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

exports.appointment_by_doctor = asyncWrapper(async (req, res, next) => {
    try {
        let doctorId = req.doctor.id
        if (!uuidValidate(doctorId)) {
            throw new Error("Invalid UUID");
        }
        let appointment = await getAppointmentsByDoctorId(doctorId)

        return res.status(200).json({
            success: true,
            message: "List of appointments datails fetch successfully",
            data: appointment,
            error: {}
        });
    } catch (error) {
        handleServerError(res, error);
    }
});
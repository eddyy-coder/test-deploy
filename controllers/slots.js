const slotModel = require("../models/slots.js");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const { handleServerError } = require("../config/resError.js");

exports.getAvailableSlotsByDoctorId = asyncWrapper(async (req, res, next) => {
  // sending family id from params
  let doctorId = req.params.id
  let slots = await slotModel.getAvailableSlotsByDoctorId(doctorId)

  return res.status(200).json({
    success: true,
    message: "Successfully fetched slots",
    data: slots,
    error: {},
  });
});

exports.getAvailableSlotsByDoctorIdAndDate = asyncWrapper(async (req, res, next) => {
  // sending family id from params
  let { doctorId, date } = req.body
  let bookedSlots = await slotModel.getAvailableSlotsByDoctorIdAndDate(doctorId, new Date(date), true)
  let notBookedSlots = await slotModel.getAvailableSlotsByDoctorIdAndDate(doctorId, date, false)
  let cancelledSlots = await slotModel.getAvailableSlotsByDoctorIdAndDate(doctorId, date, null)

  return res.status(200).json({
    success: true,
    message: "Successfully fetched slots",
    data: {bookedSlots,notBookedSlots,cancelledSlots},
    error: {},
  });
});
const express = require("express");
const {
  // appointment_by_user_id,
  // appointment_by_doctor_id,
  appointment_by_appointmentId,
  addAppointment,
  appointment_by_user,
  appointment_by_doctor
} = require("../controllers/appointments");
const ensureAuthenticated = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/create-appointment", ensureAuthenticated, addAppointment);
// router.get("/appointment-by-userid", ensureAuthenticated, appointment_by_user_id);
// router.get("/appointment-by-doctorid", ensureAuthenticated, appointment_by_doctor_id);
router.get("/appointment-by-appointmentId/:id", ensureAuthenticated, appointment_by_appointmentId);
router.get("/appointment-by-user", ensureAuthenticated, appointment_by_user);
router.get("/appointment-by-doctor", ensureAuthenticated, appointment_by_doctor);

module.exports = router;
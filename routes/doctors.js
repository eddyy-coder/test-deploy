const express = require("express");
const {
  getDoctor,
  getAllDoctor,
  updateDoctor,
  register,
  getDoctorPatients,
  deleteDoctorById,
  getAppointmentsByStatus,
  updateAppointment,
  getAppointmentByDocIdAndStatus
} = require("../controllers/doctors.js");
const ensureAuthenticated = require("../middleware/authMiddleware.js");
const { upload } = require("../utils/multer.js");
const router = express.Router();

router.post("/register", upload, register);
router.get("/get-doctor",ensureAuthenticated, getDoctor);
router.get("/get-patients", ensureAuthenticated, getDoctorPatients);
router.get("/get-all-doctor", getAllDoctor);
router.patch("/update-doctor/:id",ensureAuthenticated,upload, updateDoctor);
router.delete("/delete-doctor/:id", deleteDoctorById);

router.post("/get-appointments", ensureAuthenticated, getAppointmentsByStatus);
router.patch("/update-appointment", ensureAuthenticated, updateAppointment);

module.exports = router;
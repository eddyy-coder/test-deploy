const express = require("express");
const {
    createDoctorAvailability,
    getDoctorAvailability
} = require("../controllers/doctor-availability");
const ensureAuthenticated = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/add", ensureAuthenticated ,createDoctorAvailability);
router.get("/get", ensureAuthenticated ,getDoctorAvailability);

module.exports = router;
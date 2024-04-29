const express = require("express");
const {
    getAvailableSlotsByDoctorId,
    getAvailableSlotsByDoctorIdAndDate
} = require("../controllers/slots.js");
const ensureAuthenticated = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/get-by-doctorid/:id", ensureAuthenticated, getAvailableSlotsByDoctorId);
router.post("/get-by-doctorid-date", ensureAuthenticated, getAvailableSlotsByDoctorIdAndDate);

module.exports = router;
const express = require("express")
router = express.Router()
doctorRoutes = require("./doctors")
userRoutes = require("./users")
appointmentRoutes = require("./appointments")
authRoutes = require("../auth/auth_route");
reportRoutes = require("./reports");
slotRoutes = require("./slots")
listRoutes = require("./list")
doctorAvailabilityRoutes = require("./doctor-availability")
router.get("/", (req, res, next) => {
    res.status(200).json("OCTOR APP");
});

/*Doctor API ROUTES */
router.use("/api/doctor", doctorRoutes);

/* Doctor Availibility API ROUTES */
router.use("/api/doctor-availability", doctorAvailabilityRoutes);

/* USER API ROUTES */
router.use("/api/user", userRoutes);


/* APPOINTMENT API ROUTES */
router.use("/api/appointment", appointmentRoutes);

/* Report API ROUTES */
router.use("/api/report", reportRoutes);

/* Auth API ROUTES */
router.use("/api/auth", authRoutes);

/* slots API ROUTES */
router.use("/api/slot", slotRoutes);


/* list API ROUTES ---- it is the commom route */
router.use("/api/list", listRoutes);

module.exports = router;

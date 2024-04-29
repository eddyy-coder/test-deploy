const express = require("express");
const {
    addReport,
    getReportsByUser,
    getReportsByDoctor,
    updateReportById,
    deleteReportById,
    getReportsById
} = require("../controllers/reports.js");
const ensureAuthenticated = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/add", ensureAuthenticated, addReport);
router.post("/get-by-id", ensureAuthenticated, getReportsById);
router.get("/get-by-user", ensureAuthenticated, getReportsByUser);
router.get("/get-by-doctor", ensureAuthenticated, getReportsByDoctor);
router.delete("/delete/:id", ensureAuthenticated, deleteReportById);
router.patch("/update/:id", ensureAuthenticated, updateReportById);

module.exports = router;
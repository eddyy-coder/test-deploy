const express = require("express");
const {
  getUser,
  getAllUsers,
  updateUser,
  register,
  getAllAvailableDoctors,
  getDoctorAvailabiltySlots,
  deleteUserById,
  addFamilyMember,
  getUserByFamilyId,
  dashboard,
  updateAppointment
} = require("../controllers/users.js");
const ensureAuthenticated = require("../middleware/authMiddleware.js");
const { upload } = require("../utils/multer.js");

const router = express.Router();

router.post("/register", register);
router.get("/get-user", getUser);
router.get("/get-all-users", ensureAuthenticated, getAllUsers);
router.patch("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUserById);
router.get("/get-available-doctors", ensureAuthenticated, getAllAvailableDoctors);
router.get("/get-doctor-availability-slots", ensureAuthenticated, getDoctorAvailabiltySlots);
router.post("/add-family-member", ensureAuthenticated, addFamilyMember);
router.get("/get-users-by-familyid/:id", ensureAuthenticated, getUserByFamilyId);

router.get("/dashboard", ensureAuthenticated, dashboard);
router.patch("/update-appointment", ensureAuthenticated, updateAppointment);

module.exports = router;

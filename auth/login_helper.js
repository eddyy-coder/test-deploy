const authModel = require("./auth_model");
const { getUserByEmail } = require("../models/users.js");
const { getDoctorByEmail } = require("../models/doctors.js");
const appointmentModel = require("../models/appointments.js")
const TOKEN_LIB = require("../libs/token");

async function loginWithPassword({ email, password, req, res }) {
  let isDoctor = false
  let userData = await getUserByEmail(email);

  if (!userData) {
    userData = await getDoctorByEmail(email);
    isDoctor = true
  }

  if (userData) {
    const verifyPassword = await authModel.verifyPassword({
      email,
      password,
    });
    if (verifyPassword.status) {
      const token = new TOKEN_LIB();
      const refreshToken = await token.createRefreshToken({
        uid: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
      });
      if (refreshToken) {
        if (isDoctor) {
          let countAppointments = await appointmentModel.getAppointmentCountByDoctorId(userData.id)
          let userIds = await appointmentModel.getUserIdsByDoctorId(userData.id)
          const uniqueUserIds = Array.from(new Set(userIds));
          res.json({
            refresh_token: refreshToken,
            user: userData,
            appointmentCount: countAppointments || "0",
            patientCount: uniqueUserIds?.length || "0"
          });
        } else {
          res.json({
            refresh_token: refreshToken,
            user: userData,
          });
        }

      } else {
        return res.status(400).json({
          message: "Error while creating refresh token",
        });
      }
    } else {
      return res.status(400).json({
        message: verifyPassword.message,
      });
    }
  } else {
    return res.status(400).json({
      message: "User not found, please create a new account",
    });
  }
}

module.exports = { loginWithPassword };

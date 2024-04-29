const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Doctor = require("../models/doctors");
const { getDoctorByIdModel } = require("../models/doctors.js");
const { getUserByIdModel } = require("../models/users.js");
const ensureAuthenticated = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY || "octorPrivateKey");

      // if (!decoded) {
      //   new Error("Failed to find user Info")
      // }
      req.user = await getUserByIdModel(decoded.userid)

      req.doctor = await getDoctorByIdModel(decoded.userid)

      if (!req.user && !req.doctor) {
        throw new Error("User does not exist in the database")
      }
      next();
    } catch (error) {
      console.log("Err : ", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = ensureAuthenticated;

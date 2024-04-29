const express = require("express");
const router = express.Router();
const {
  test,
  signup,
  login,
  refreshToken,
  logout,
} = require("./auth_controller.js");

//testing route   
router.get("/auth-test", test);
//

//router.post("/sign-up", signup);
router.post("/login", login);
router.post("/token", refreshToken);
router.post("/logout", logout);

module.exports = router;

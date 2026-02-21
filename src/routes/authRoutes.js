const express = require("express");
const { login, signup, testEmail } = require("../controllers/authController.js");

const router = express.Router();

router.post("/signup", signup);        // sends OTP
// router.post("/send-otp", sendOtp);
router.post("/login", login);
router.get("/test-email",testEmail)

module.exports = router;

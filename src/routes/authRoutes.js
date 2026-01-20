const express = require("express");
const { login, signup, testEmail, verifySignupOtp } = require("../controllers/authController.js");

const router = express.Router();

router.post("/auth/signup", signup);        // sends OTP
router.post("/auth/verify-otp", verifySignupOtp);
router.post("/login", login);
router.get("/test-email",testEmail)

module.exports = router;

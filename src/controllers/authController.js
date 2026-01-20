const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const EmailOtp = require("../models/EmailOtp");
const  ses  = require("../config/ses");
// 🔐 Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET ||'TRUBUTE_CODE', { expiresIn: "24h" });
};

// ------------------------------------
// ⭐ SIGNUP
// ------------------------------------

// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
// console.log("fsadf",email)
//     // Check if user exists
//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ message: "User already exists" });

//     // Hash password
//     const hashed = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashed,
//     });

//     res.status(201).json({
//       message: "Signup successful",
//       token: generateToken(newUser._id),
//       user: { id: newUser._id, email: newUser.email, name: newUser.name },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Signup failed", error: err.message });
//   }
// };



exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Remove old OTPs
    await EmailOtp.deleteMany({ email });

    await EmailOtp.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Signup OTP failed", error: err.message });
  }
};

exports.verifySignupOtp = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const record = await EmailOtp.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await record.deleteOne();

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    res.status(201).json({
      message: "Signup successful",
      token: generateToken(user._id),
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
};


exports.testEmail= async (req, res) => {
  try {
    await ses.sendEmail({
      Source: "Trubute <info@whaleconsultancy.in>",
      Destination: { ToAddresses: ["rajtirole23454@email.com"] },
      Message: {
        Subject: { Data: "SES Test" },
        Body: {
          Text: { Data: "SES is working 🎉" },
        },
      },
    }).promise();

    res.send("Email sent");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}


// ------------------------------------
// ⭐ LOGIN
// ------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

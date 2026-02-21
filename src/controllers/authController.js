const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const EmailOtp = require("../models/EmailOtp");
const ses = require("../config/ses");
const axios = require("axios");
// 🔐 Generate JWT
if (process.env.NODE_ENV !== "production") {
  console.log("prod env");
  require("dotenv").config();
}

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "TRUBUTE_CODE", {
    expiresIn: "24h",
  });
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

// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Generate OTP
//     const otp = crypto.randomInt(100000, 999999).toString();
//     const otpHash = await bcrypt.hash(otp, 10);

//     // Remove old OTPs
//     await EmailOtp.deleteMany({ email });

//     await EmailOtp.create({
//       email,
//       otpHash,
//       expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
//     });

//     await sendOtpEmail(email, otp);

//     res.json({ message: "OTP sent to email" });
//   } catch (err) {
//     res.status(500).json({ message: "Signup OTP failed", error: err.message });
//   }
// };

// exports.signup = async (req, res) => {
//   try {
//     const { name, email, phone, password, otp } = req.body;

//     // 1. Verify OTP
//     const otpVerify = await axios.post(
//       "https://api.msg91.com/api/v5/otp/verify",
//       {
//         mobile: `91${phone}`,
//         otp,
//       },
//       {
//         headers: { authkey: process.env.MSG91_AUTH_KEY },
//       }
//     );

//     if (otpVerify.data.type !== "success") {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // 2. Check user exists
//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // 3. Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 4. Create user
//     const newUser = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       isVerified: true,
//     });

//     // 5. Respond
//     res.status(201).json({
//       message: "Signup successful",
//       token: generateToken(newUser._id),
//       user: {
//         id: newUser._id,
//         email: newUser.email,
//         name: newUser.name,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Signup failed", error: err.message });
//   }
// };

// exports.sendOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;

//     const otp=await axios.post(
//       "https://api.msg91.com/api/v5/otp",
//       {
//         mobile: `91${phone}`,
//         authkey: process.env.MSG91_AUTH_KEY, // ✅ goes in body
//       }
//     );

//     res.json({ message: "OTP sent" });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to send OTP",
//     });
//   }
// };

// exports.verifySignupOtp = async (req, res) => {
//   try {
//     const { name, email, password, otp } = req.body;

//     const record = await EmailOtp.findOne({ email });
//     if (!record) {
//       return res.status(400).json({ message: "OTP expired or invalid" });
//     }

//     if (record.expiresAt < new Date()) {
//       await record.deleteOne();
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     const isValid = await bcrypt.compare(otp, record.otpHash);
//     if (!isValid) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     await record.deleteOne();

//     const hashed = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashed,
//     });

//     res.status(201).json({
//       message: "Signup successful",
//       token: generateToken(user._id),
//       user: { id: user._id, email: user.email, name: user.name },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "OTP verification failed", error: err.message });
//   }
// };

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: "Mobile verification required" });
    }

    // 🔥 1️⃣ Verify access token from MSG91
    const response = await axios.post(
      "https://control.msg91.com/api/v5/widget/verifyAccessToken",
      {
        authkey: process.env.MSG91_AUTH_KEY,
        "access-token": accessToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    if (response.data.type !== "success") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 🔥 2️⃣ Extra Security Check (IMPORTANT)
    const verifiedMobile = response.data.message;

    if (verifiedMobile !== `91${phone}` && verifiedMobile !== phone) {
      return res.status(400).json({
        message: "Mobile number mismatch",
      });
    }

    // 🔥 3️⃣ Check if user exists
    const exists = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔥 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 5️⃣ Create user
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      isVerified: true,
    });

    // 🔥 6️⃣ Generate JWT
    res.status(201).json({
      message: "Signup successful",
      token: generateToken(newUser._id),
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (err) {
   console.log(
  (err && err.response && err.response.data) ||
  (err && err.message)
);


   res.status(500).json({
  message: "Signup failed",
  error:
    (err && err.response && err.response.data) ||
    (err && err.message) ||
    "Internal Server Error",
});

  }
};

exports.testEmail = async (req, res) => {
  try {
    await ses
      .sendEmail({
        Source: "Trubute <info@whaleconsultancy.in>",
        Destination: { ToAddresses: ["rajtirole23454@email.com"] },
        Message: {
          Subject: { Data: "SES Test" },
          Body: {
            Text: { Data: "SES is working 🎉" },
          },
        },
      })
      .promise();

    res.send("Email sent");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

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

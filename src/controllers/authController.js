const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET ||'TRUBUTE_CODE', { expiresIn: "24h" });
};

// ------------------------------------
// ⭐ SIGNUP
// ------------------------------------
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
console.log("fsadf",email)
    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
    });

    res.status(201).json({
      message: "Signup successful",
      token: generateToken(newUser._id),
      user: { id: newUser._id, email: newUser.email, name: newUser.name },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
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

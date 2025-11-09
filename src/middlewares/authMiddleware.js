const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Normalize so all code can use req.user.role safely
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || decoded.userType, // <-- important line
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const memorialRoutes = require("./routes/memorialRoutes");
const { connectDb } = require("./config/database");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

const startServer = async () => {
  await connectDb();

  // ✅ Enable CORS
  app.use(
    cors({
      origin: "http://localhost:3000", // allow frontend
      credentials: true, // allow cookies / tokens if needed
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ Middleware
  app.use(express.json());
  
  //routes
  app.use("/api/memorials", memorialRoutes);
  app.use("/api/auth", authRoutes);

  // ✅ Health Check
  app.get("/health", (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Server is up and running 🚀",
    });
  });

  // ✅ Start server
  app.listen(PORT, () => {
    console.log(`✅ Server running on ${PORT}`);
  });
};

startServer();

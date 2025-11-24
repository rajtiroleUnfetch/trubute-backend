const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const memorialRoutes = require("./routes/memorialRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const { connectDb } = require("./config/database");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

const startServer = async () => {
  await connectDb();

  // ✅ Enable CORS
  app.use(
    cors({
      origin: 'https://www.trubute.com', // allow frontend
      credentials: true, // allow cookies / tokens if needed
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ Middleware
  app.use(express.json());

  //routes
  app.use("/api/memorials", memorialRoutes);
  app.use("/api/memorial", mediaRoutes);
  app.use("/api/auth", authRoutes);



  app.get("/", (req, res) => {
    res.status(200).send("OK");
  });
  // ✅ Start server
  app.get("/health", (req, res) => {
    res.send("OK");
  });
};

startServer();

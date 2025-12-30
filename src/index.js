const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const memorialRoutes = require("./routes/memorialRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const { connectDb } = require("./config/database");
const authMiddleware = require("./middleware/authMiddleware");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

/* ---------------------------------------------
   LOG STARTUP INFO (helps in ECS debugging)
---------------------------------------------- */
console.log("=== Starting Trubute Backend ===");
console.log("PORT:", PORT);
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("MONGO_URI:", process.env.MONGO_URI ? "(set)" : "(missing!)");
console.log("AWS_S3_BUCKET:", process.env.AWS_S3_BUCKET || "(missing)");

/* ---------------------------------------------
   START EXPRESS SERVER
---------------------------------------------- */
app.use(
  cors({
    origin: ["https://www.trubute.com", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ---------------------------------------------
   ALWAYS AVAILABLE ROUTES
---------------------------------------------- */
app.get("/", (req, res) => {
  res.status(200).send("Backend Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

/* ---------------------------------------------
   PROTECTED ROUTES (work even if DB is down)
---------------------------------------------- */
app.use("/api/memorials", memorialRoutes);
app.use("/api/memorial", mediaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment",authMiddleware
  , require("./routes/paymentRoutes"));
app.use("/api/payment",authMiddleware, require("./routes/paymentVerify"));


/* ---------------------------------------------
   ERROR HANDLER — prevents crashes
---------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

/* ---------------------------------------------
   START THE SERVER FIRST
   THEN TRY CONNECTING TO DB
---------------------------------------------- */
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await connectDb();
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Server will continue running without MongoDB…");
  }
});

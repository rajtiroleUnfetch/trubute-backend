const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const memorialRoutes = require("./routes/memorialRoutes");
dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use("/user", userRoutes);
app.use("/memorials", memorialRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  }
};

startServer();

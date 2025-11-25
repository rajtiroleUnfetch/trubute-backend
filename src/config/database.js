// config/database.js
const mongoose = require("mongoose");
require("dotenv").config();
const connectDb = async () => {
  try {
    const uri = 'mongodb+srv://rajtirole:N2xnTp74iSUmCRBE@cluster1.xy31etg.mongodb.net/tribute?retryWrites=true&w=majority&appName=Cluster1';

    if (!uri) {
      throw new Error("❌ MONGO_URI not found in .env");
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDb };

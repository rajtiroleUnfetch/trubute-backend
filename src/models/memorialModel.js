// models/memorialModel.js
const mongoose = require("mongoose");

const memorialSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    description: { type: String },
    createdBy: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Memorial", memorialSchema);

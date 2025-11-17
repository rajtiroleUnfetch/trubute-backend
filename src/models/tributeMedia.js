// models/tributeMedia.js
const mongoose = require("mongoose");

const tributeMediaSchema = new mongoose.Schema(
  {
    memorialId: { type: mongoose.Schema.Types.ObjectId, ref: "Memorial", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: { type: String, enum: ["photo", "video", "audio"], required: true },
    url: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TributeMedia", tributeMediaSchema);

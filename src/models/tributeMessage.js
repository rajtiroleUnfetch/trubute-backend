// models/tributeMessage.js
const mongoose = require("mongoose");

const tributeMessageSchema = new mongoose.Schema(
  {
    memorialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memorial",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TributeMessage", tributeMessageSchema);

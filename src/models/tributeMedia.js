// models/TributeMedia.js
const mongoose = require("mongoose");

const tributeMediaSchema = new mongoose.Schema(
  {
    memorialId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Memorial", 
      required: true 
    },

    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    type: { 
      type: String, 
      enum: ["photo", "video", "audio"], 
      required: true 
    },

    url: { 
      type: String, 
      required: true 
    },

    caption: { 
      type: String, 
      default: "" 
    },

    // for S3 metadata if needed later
    fileSize: Number,
    fileFormat: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("TributeMedia", tributeMediaSchema);

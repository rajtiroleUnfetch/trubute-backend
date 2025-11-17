// models/memorialModel.js
const mongoose = require("mongoose");

const tributeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["text", "photo", "video", "audio"], required: true },
    content: { type: String, required: true }, // text or media URL
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addedByName: { type: String }, // optional display name
  },
  { timestamps: true }
);
const memorialSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    gender: { type: String },
    relationship: { type: String, required: true },
    relationshipOther: { type: String },
    designation: { type: String, required: true },
    designationOther: { type: String },
    specialDesignation: { type: String },
    moreDetails: { type: String },

    // Birth Info
    bornYear: { type: String },
    bornMonth: { type: String },
    bornDay: { type: String },
    bornCity: { type: String },
    bornState: { type: String },
    bornCountry: { type: String },

    // Passing Info
    passedYear: { type: String },
    passedMonth: { type: String },
    passedDay: { type: String },
    passedCity: { type: String },
    passedState: { type: String },
    passedCountry: { type: String },

    // Website and Settings
    website: { type: String, required: true },
    plan: { type: String, enum: ["Basic", "Premium", "Lifetime"], default: "Basic" },
    privacy: { type: String, enum: ["public", "private"], default: "public" },

    // System fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approved: { type: Boolean, default: false },
    tributes: [tributeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Memorial", memorialSchema);


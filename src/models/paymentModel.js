const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema(
  {
    orderId: String,
    paymentId: String,

    planType: {
      type: String,
      enum: ["free", "yearly", "lifetime"],
      required: true,
    },

    planName: {
      type: String,
      enum: ["Basic", "Premium", "Lifetime"],
    },

    amount: Number,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // 🔑 NEW
    isUsed: {
      type: Boolean,
      default: false,
    },

    // 🔑 TEMP memorial reference (before creation)
    tempMemorialId: {
      type: String,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    memorialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memorial",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("payment", paymentSchema);
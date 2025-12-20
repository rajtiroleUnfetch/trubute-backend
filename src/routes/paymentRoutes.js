const express = require("express");
const razorpay = require("../config/razorpay");
const Payment = require("../models/paymentModel");

const router = express.Router();
router.post("/create-order", async (req, res) => {
  try {
    const { planType, userId } = req.body;
    const tempMemorialId = crypto.randomUUID();

    let amount = 0;
    let planName = "Basic";

    if (planType === "yearly") {
      amount = 100;
      planName = "Premium";
    }

    if (planType === "lifetime") {
      amount = 799900;
      planName = "Lifetime";
    }

    if (!amount && planType !== "free") {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // 🆓 FREE PLAN
    if (planType === "free") {
      const payment = await Payment.create({
        planType,
        planName,
        amount: 0,
        paymentStatus: "paid",
        isUsed: false,
        userId,
        tempMemorialId,
      });

      return res.json({
        free: true,
        paymentId: payment._id,
      });
    }

    // Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `trubute_${Date.now()}`,
    });

    await Payment.create({
      orderId: order.id,
      planType,
      planName,
      amount,
      userId,
      tempMemorialId,
      paymentStatus: "pending",
      isUsed: false,
    });

    res.json({
      orderId: order.id,
      amount,
      currency: "INR",
      tempMemorialId,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

module.exports = router;

const crypto = require("crypto");
const express = require("express");
const Payment = require("../models/paymentModel");

const router = express.Router();
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const payment = await Payment.findOne({ orderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.isUsed) {
      return res.status(409).json({ message: "Payment already used" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      payment.paymentStatus = "failed";
      await payment.save();
      return res.status(400).json({ message: "Verification failed" });
    }

    // ✅ Mark paid ONLY
    payment.paymentStatus = "paid";
    payment.paymentId = razorpay_payment_id;
    await payment.save();

    res.json({
      success: true,
      tempMemorialId: payment.tempMemorialId,
      planName: payment.planName,
      paymentId: payment._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;

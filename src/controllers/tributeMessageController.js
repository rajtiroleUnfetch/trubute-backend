// controllers/tributeMessageController.js
const TributeMessage = require("../models/tributeMessage");

exports.addTributeMessage = async (req, res) => {
  try {
    const { id } = req.params; // memorialId
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const newMessage = await TributeMessage.create({
      memorialId: id,
      userId: req.user.id,
      message,
    });

    res.status(201).json({
      message: "Tribute message added",
      data: newMessage,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error adding message",
      error: err.message,
    });
  }
};


// 📌 GET paginated tribute messages
exports.getTributeMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await TributeMessage.find({ memorialId: id })
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await TributeMessage.countDocuments({ memorialId: id });

    res.status(200).json({
      message: "Messages fetched successfully",
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      data: messages,
    });

  } catch (err) {
    res.status(500).json({
      message: "Error fetching messages",
      error: err.message,
    });
  }
};

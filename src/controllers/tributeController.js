// controllers/tributeController.js
const TributeMessage = require("../models/tributeMessage");
const TributeMedia = require("../models/tributeMedia");

exports.addMessage = async (req, res) => {
  try {
    const newMessage = await TributeMessage.create({
      memorialId: req.params.id,
      userId: req.user.id,
      message: req.body.message
    });

    res.status(201).json({ message: "Message added", data: newMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMedia = async (req, res) => {
  try {
    const newMedia = await TributeMedia.create({
      memorialId: req.params.id,
      userId: req.user.id,
      type: req.body.type,      // photo/video/audio
      url: req.body.url         // uploaded URL
    });

    res.status(201).json({ message: "Media added", data: newMedia });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTributes = async (req, res) => {
  try {
    const messages = await TributeMessage.find({ memorialId: req.params.id }).populate("userId", "name");
    const media = await TributeMedia.find({ memorialId: req.params.id }).populate("userId", "name");

    res.json({ messages, media });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

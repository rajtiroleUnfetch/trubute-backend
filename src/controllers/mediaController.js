const tributeMedia = require("../models/tributeMedia");

exports.addMedia = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Media file is required" });

    const type = req.file.mimetype.startsWith("image")
      ? "photo"
      : req.file.mimetype.startsWith("video")
      ? "video"
      : "audio";

    const newMedia = await tributeMedia.create({
      memorialId: req.params.id,
      userId: req.user.id,
      type,
      url: req.file.location,   // <-- S3 URL
      caption: req.body.caption // optional
    });

    res.status(201).json({ message: "Media added", data: newMedia });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 GET paginated media for a memorial
exports.getMediaByMemorial = async (req, res) => {
  try {
    const { id } = req.params;         // memorialId
    const { type, page = 1, limit = 10 } = req.query;

    const query = { memorialId: id };
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const media = await tributeMedia.find(query)
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await tributeMedia.countDocuments(query);

    res.status(200).json({
      message: "Media fetched successfully",
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      data: media,
    });

  } catch (err) {
    res.status(500).json({
      message: "Error fetching media",
      error: err.message,
    });
  }
};

const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMedia");
const { addMedia, getMediaByMemorial } = require("../controllers/mediaController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  addTributeMessage,
  getTributeMessages,
} = require("../controllers/tributeMessageController");
const { updateMemorial } = require("../controllers/memorialController");

// POST /api/memorial/:id/media
router.post(
  "/:id/media",
  authMiddleware,
  upload.single("media"),
  addMedia
);

router.get("/:id/media", getMediaByMemorial);

// POST message
router.post("/:id/messages", authMiddleware, addTributeMessage);

// GET paginated messages
router.get("/:id/messages", getTributeMessages);
module.exports = router;

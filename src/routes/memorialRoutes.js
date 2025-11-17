const express = require("express");
const {
  createMemorial,
  getMemorials,
  updateMemorial,
  deleteMemorial,
  approveMemorial,
  getMemorial,
} = require("../controllers/memorialController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const { addMessage, addMedia } = require("../controllers/tributeController.js");

const router = express.Router();

router.post("/:id/messages", authMiddleware, addMessage);
router.post("/:id/media", authMiddleware, addMedia);
router.post("/",authMiddleware, createMemorial);
router.get("/", getMemorials);
router.get("/:idOrWebsite", getMemorial);
router.put("/:id",authMiddleware, updateMemorial);
router.delete("/:id", authMiddleware,deleteMemorial);
router.put("/:id/approve",authMiddleware, approveMemorial); // admin-only action

module.exports = router;

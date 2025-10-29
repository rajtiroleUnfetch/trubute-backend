const express = require("express");
const router = express.Router();
const {
  createMemorial,
  getMemorials,
  getMemorial,
  updateMemorial,
  deleteMemorial,
  approveMemorial,
} = require("../controllers/memorialController");

const { verifyToken } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
// Public
router.get("/", getMemorials);
router.get("/:idOrWebsite", getMemorial);

// Protected routes
router.post("/create", verifyToken, createMemorial);
router.patch("/:id", verifyToken, updateMemorial);
router.delete("/:id", verifyToken, deleteMemorial);
router.patch("/:id/approve", verifyToken, isAdmin, approveMemorial);

module.exports = router;

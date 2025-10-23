const express = require("express");
const {
  createMemorial,
  getMemorials,
  updateMemorial,
  deleteMemorial,
  approveMemorial,
  getMemorial,
} = require("../controllers/memorialController.js");

const router = express.Router();

router.post("/", createMemorial);
router.get("/", getMemorials);
router.get("/:idOrWebsite", getMemorial);
router.put("/:id", updateMemorial);
router.delete("/:id", deleteMemorial);
router.put("/:id/approve", approveMemorial); // admin-only action

module.exports = router;

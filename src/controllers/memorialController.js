// controllers/memorialController.js
const Memorial = require("../models/memorialModel");

// 🕊️ Create new memorial (requires admin approval)
exports.createMemorial = async (req, res) => {
  try {
    const { firstName, lastName, description, createdBy } = req.body;

    if (!firstName || !lastName || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const memorial = new Memorial({
      firstName,
      lastName,
      description: description || "",
      createdBy,
      approved: false,
    });

    await memorial.save();
    res.status(201).json({ message: "Memorial submitted for approval", memorial });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating memorial", error: err.message });
  }
};

// 📜 Get all memorials (only approved ones unless ?all=true)
exports.getMemorials = async (req, res) => {
  try {
    const showAll = req.query.all === "true";
    const memorials = showAll
      ? await Memorial.find()
      : await Memorial.find({ approved: true });

    res.json(memorials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching memorials", error: err.message });
  }
};

// 🔍 Get single memorial by ID
exports.getMemorialById = async (req, res) => {
  try {
    const memorial = await Memorial.findById(req.params.id);
    if (!memorial) return res.status(404).json({ message: "Memorial not found" });
    res.json(memorial);
  } catch (err) {
    res.status(500).json({ message: "Error fetching memorial", error: err.message });
  }
};

// ✏️ Update memorial (only before approval)
exports.updateMemorial = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, description } = req.body;

    const memorial = await Memorial.findById(id);
    if (!memorial) return res.status(404).json({ message: "Memorial not found" });
    if (memorial.approved)
      return res.status(403).json({ message: "Approved memorials cannot be edited" });

    if (firstName) memorial.firstName = firstName;
    if (lastName) memorial.lastName = lastName;
    if (description) memorial.description = description;

    await memorial.save();
    res.json({ message: "Memorial updated", memorial });
  } catch (err) {
    res.status(500).json({ message: "Error updating memorial", error: err.message });
  }
};

// 🗑️ Delete memorial (admin or creator)
exports.deleteMemorial = async (req, res) => {
  try {
    const { id } = req.params;
    const memorial = await Memorial.findByIdAndDelete(id);
    if (!memorial) return res.status(404).json({ message: "Memorial not found" });

    res.json({ message: "Memorial deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting memorial", error: err.message });
  }
};

// ✅ Approve memorial (admin only)
exports.approveMemorial = async (req, res) => {
  try {
    const { id } = req.params;
    const memorial = await Memorial.findById(id);
    if (!memorial) return res.status(404).json({ message: "Memorial not found" });

    memorial.approved = true;
    await memorial.save();

    res.json({ message: "Memorial approved", memorial });
  } catch (err) {
    res.status(500).json({ message: "Error approving memorial", error: err.message });
  }
};

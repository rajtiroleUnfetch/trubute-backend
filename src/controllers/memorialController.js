// controllers/memorialController.js
const Memorial = require("../models/memorialModel");

// 🕊️ Create new memorial (requires admin approval)
// const Memorial = require("../models/Memorial");

exports.createMemorial = async (req, res) => {
  try {
    const data = req.body;

    // user ID from auth middleware
    const createdBy = req.user.id;

    // Validate required fields (remove data.createdBy)
    if (!data.firstName || !data.lastName || !data.relationship || !data.designation || !data.website) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const memorial = new Memorial({
      ...data,
      createdBy,     // logged-in user ID
      approved: false,
    });

    await memorial.save();

    res.status(201).json({
      message: "Memorial submitted for approval",
      memorial,
    });

  } catch (err) {
    console.error("❌ Error creating memorial:", err);
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
exports.getMemorial = async (req, res) => {
  try {
    const { idOrWebsite } = req.params;

    // Try finding by MongoDB ObjectId first
    let memorial = null;
    if (idOrWebsite.match(/^[0-9a-fA-F]{24}$/)) {
      memorial = await Memorial.findById(idOrWebsite);
    }

    // If not found by ID, try by website slug
    if (!memorial) {
      memorial = await Memorial.findOne({ website: idOrWebsite.toLowerCase() });
    }

    if (!memorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    res.json({ memorial });
  } catch (err) {
    console.error("Error fetching memorial:", err);
    res.status(500).json({
      message: "Error fetching memorial",
      error: err.message,
    });
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

exports.addTribute = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content } = req.body;

    const memorial = await Memorial.findById(id);
    if (!memorial) return res.status(404).json({ message: "Memorial not found" });

    const tribute = {
      type,
      content,
      addedBy: req.user.id,
      addedByName: req.user.name,
    };

    memorial.tributes.push(tribute);
    await memorial.save();

    res.json({ message: "Tribute added", tribute });
  } catch (err) {
    console.error("Error adding tribute:", err);
    res.status(500).json({ message: "Error adding tribute", error: err.message });
  }
};


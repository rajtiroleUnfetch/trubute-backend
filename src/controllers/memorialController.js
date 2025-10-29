const Memorial = require("../models/memorialModel");
const { createMemorialSchema } = require("../schemas/memorialSchema");

// 🕊️ Create new memorial (creator is auto-set, admin approval pending)
exports.createMemorial = async (req, res) => {
  try {
    const validation = createMemorialSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const memorial = new Memorial({
      ...validation.data,
      createdBy: req.user.id, // from JWT
      approved: false,
    });

    await memorial.save();
    res.status(201).json({ message: "Memorial submitted for approval", memorial });
  } catch (err) {
    console.error("Error creating memorial:", err);
    res.status(500).json({ message: "Error creating memorial", error: err.message });
  }
};

// 📜 Get memorials (public sees approved, admin can see all)
exports.getMemorials = async (req, res) => {
  try {
    const showAll = req.query.all === "true";
    let memorials;

    if (req.user?.role === "admin" || showAll) {
      memorials = await Memorial.find();
    } else {
      memorials = await Memorial.find({ approved: true });
    }

    res.json(memorials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching memorials", error: err.message });
  }
};

// 🔍 Get single memorial by ID or website
exports.getMemorial = async (req, res) => {
  try {
    const { idOrWebsite } = req.params;
    let memorial = null;

    if (idOrWebsite.match(/^[0-9a-fA-F]{24}$/)) {
      memorial = await Memorial.findById(idOrWebsite);
    }

    if (!memorial) {
      memorial = await Memorial.findOne({ website: idOrWebsite.toLowerCase() });
    }

    if (!memorial) return res.status(404).json({ message: "Memorial not found" });

    if (!memorial.approved && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Memorial not approved yet" });
    }

    res.json({ memorial });
  } catch (err) {
    res.status(500).json({ message: "Error fetching memorial", error: err.message });
  }
};

// ✏️ Update memorial (creator or admin, before approval)
exports.updateMemorial = async (req, res) => {
  try {
    const { id } = req.params;
    const memorial = await Memorial.findById(id);
    if (!memorial) return res.status(404).json({ message: "Memorial not found" });

    if (memorial.approved)
      return res.status(403).json({ message: "Approved memorials cannot be edited" });

    if (req.user.id !== memorial.createdBy.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to update this memorial" });
    }

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) memorial[key] = req.body[key];
    });

    await memorial.save();
    res.json({ message: "Memorial updated successfully", memorial });
  } catch (err) {
    res.status(500).json({ message: "Error updating memorial", error: err.message });
  }
};

// 🗑️ Delete memorial (creator or admin)
exports.deleteMemorial = async (req, res) => {
  try {
    const { id } = req.params;
    const memorial = await Memorial.findById(id);
    if (!memorial) return res.status(404).json({ message: "Memorial not found" });

    if (req.user.id !== memorial.createdBy.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed to delete this memorial" });
    }

    await Memorial.findByIdAndDelete(id);
    res.json({ message: "Memorial deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting memorial", error: err.message });
  }
};

// ✅ Approve memorial (admin-only)
exports.approveMemorial = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can approve memorials" });
    }

    const { id } = req.params;
    const memorial = await Memorial.findById(id);
    if (!memorial) return res.status(404).json({ message: "Memorial not found" });

    memorial.approved = true;
    await memorial.save();

    res.json({ message: "Memorial approved successfully", memorial });
  } catch (err) {
    res.status(500).json({ message: "Error approving memorial", error: err.message });
  }
};


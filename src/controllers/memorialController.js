// controllers/memorialController.js
const Memorial = require("../models/memorialModel");
const Payment = require("../models/paymentModel");
// 🕊️ Create new memorial (requires admin approval)
// const Memorial = require("../models/Memorial");

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

const generateUniqueWebsite = async (firstName, lastName, bornDay) => {
  const base = slugify(`${firstName}-${lastName}`);
  let website = base;

  const exists = async (name) => await Memorial.exists({ website: name });

  if (!(await exists(website))) return website;

  // add birth year
  const year = new Date(bornDay).getFullYear();
  website = `${base}-${year}`;
  if (!(await exists(website))) return website;

  // fallback counter
  let counter = 2;
  while (await exists(`${website}-${counter}`)) {
    counter++;
  }

  return `${website}-${counter}`;
};

exports.createMemorial = async (req, res) => {
  try {
    const data = req.body;

    // user ID from auth middleware
    const createdBy = req.user.id;

    // 🔎 Find unused, paid payment
    const payment = await Payment.findOne({
      tempMemorialId: data.tempMemorialId,
      paymentStatus: "paid",
      isUsed: false,
    });
    if (!payment) {
      return res.status(403).json({ message: "Valid payment required" });
    }

    // Validate required fields (remove data.createdBy)
    const requiredFields = [
      "firstName",
      "lastName",
      "relationship",
      "designation",
      "bornDay",
      "passedDay",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const website = await generateUniqueWebsite(
      data.firstName,
      data.lastName,
      data.bornDay
    );

    const memorial = new Memorial({
      ...data,
      createdBy, // logged-in user ID
      website,
      theme: "pink",
      approved: false,
      plan: payment.planName,
      paymentStatus: payment.planType === "free" ? "free" : "paid",
    });

    await memorial.save();

    payment.isUsed = true;
    payment.memorialId = memorial._id;

    res.status(201).json({
      message: "Memorial submitted for approval",
      memorial,
    });
  } catch (err) {
    console.error("❌ Error creating memorial:", err);
    res
      .status(500)
      .json({ message: "Error creating memorial", error: err.message });
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
    res
      .status(500)
      .json({ message: "Error fetching memorials", error: err.message });
  }
};

// 🔍 Get single memorial by ID
exports.getMemorial = async (req, res) => {
  try {
    const { idOrWebsite } = req.params;
    let memorial = null;

    if (idOrWebsite.match(/^[0-9a-fA-F]{24}$/)) {
      memorial = await Memorial.findById(idOrWebsite)
        .populate("tributes.addedBy", "name email profileImage")
        .lean();
    }

    if (!memorial) {
      memorial = await Memorial.findOne({ website: idOrWebsite.toLowerCase() })
        .populate("tributes.addedBy", "name email profileImage")
        .lean();
    }

    if (!memorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    // Sort tributes newest first
    memorial.tributes = memorial.tributes.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ memorial });
  } catch (err) {
    console.error("Error fetching memorial:", err);
    res.status(500).json({
      message: "Error fetching memorial",
      error: err.message,
    });
  }
};

exports.updateMemorial = async (req, res) => {
  const memorial = await Memorial.findById(req.params.id);
  if (!memorial) return res.status(404).json({ message: "Not found" });

  if (memorial.createdBy.toString() !== req.user.id)
    return res.status(403).json({ message: "Not allowed" });

  const updated = await Memorial.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updated);
};

// 🗑️ Delete memorial (admin or creator)
exports.deleteMemorial = async (req, res) => {
  try {
    const { id } = req.params;
    const memorial = await Memorial.findByIdAndDelete(id);
    if (!memorial)
      return res.status(404).json({ message: "Memorial not found" });

    res.json({ message: "Memorial deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting memorial", error: err.message });
  }
};

// ✅ Approve memorial (admin only)
exports.approveMemorial = async (req, res) => {
  try {
    const { id } = req.params;
    const memorial = await Memorial.findById(id);
    if (!memorial)
      return res.status(404).json({ message: "Memorial not found" });

    memorial.approved = true;
    await memorial.save();

    res.json({ message: "Memorial approved", memorial });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error approving memorial", error: err.message });
  }
};

exports.addTribute = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content } = req.body;

    const memorial = await Memorial.findById(id);
    if (!memorial)
      return res.status(404).json({ message: "Memorial not found" });

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
    res
      .status(500)
      .json({ message: "Error adding tribute", error: err.message });
  }
};

exports.updateMemorialImage = async (req, res) => {
  try {
    const memorialId = req.params.id;
    const userId = req.user.id;

    // Must have uploaded file
    if (!req.file) {
      return res.status(400).json({ message: "Image file required" });
    }

    const imageType = req.body.type; // "hero" | "profile"
    if (!["hero", "profile"].includes(imageType)) {
      return res.status(400).json({ message: "Invalid image type" });
    }

    // Find memorial
    const memorial = await Memorial.findById(memorialId);
    if (!memorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    // Only creator can update
    if (memorial.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update correct field
    if (imageType === "hero") {
      memorial.backgroud = req.file.location; // S3 URL
    } else {
      memorial.profile = req.file.location;
    }

    await memorial.save();

    res.status(200).json({
      message: "Image updated successfully",
      memorial,
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 Get Featured Tributes (Home Page)
exports.getFeaturedTributes = async (req, res) => {
  try {
    // Only approved memorials
    const memorials = await Memorial.find({ approved: false })
      .select(
        "firstName lastName description address profile backgroud tributes"
      )
      .limit(8); // Show 8 items on homepage

    // Format with latest tribute
    const result = memorials.map((m) => {
      const latestTribute = m.tributes?.length
        ? m.tributes[m.tributes.length - 1]
        : null;

      return {
        id: m._id,
        name: `${m.firstName} ${m.lastName}`,
        description: m.description,
        address: m.address,
        profile: m.profile || null,
        background: m.backgroud || null,
        latestTribute,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching featured tributes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Get Memorials Created by Logged-in User
exports.getUserMemorials = async (req, res) => {
  try {
    const userId = req.user.id; // set by auth middleware

    const memorials = await Memorial.find({ createdBy: userId })
      .select(
        `
        firstName
        middleName
        lastName
        title
        description
        location
        website
        profile
        backgroud
        status
        plan
        paymentStatus
        privacy
        tributes
        createdAt
        `
      )
      .sort({ createdAt: -1 })
      .lean();

    const result = memorials.map((m) => {
      const latestTribute =
        m.tributes && m.tributes.length
          ? m.tributes[m.tributes.length - 1]
          : null;

      return {
        id: m._id,
        name: `${m.firstName} ${m.middleName || ""} ${m.lastName}`.trim(),
        title: m.title || null,
        description: m.description || null,
        location: m.location || null,
        website: m.website,
        profile: m.profile || null,
        background: m.backgroud || null,
        status: m.status, // approved | pending
        plan: m.plan,
        paymentStatus: m.paymentStatus,
        privacy: m.privacy,
        tributesCount: m.tributes?.length || 0,
        latestTribute,
        createdAt: m.createdAt,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching user memorials:", err);
    res.status(500).json({
      message: "Error fetching user memorials",
      error: err.message,
    });
  }
};

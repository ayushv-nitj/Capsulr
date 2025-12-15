const fs = require("fs");

const express = require("express");
const jwt = require("jsonwebtoken");
const Memory = require("../models/memory");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const upload = require("../middleware/upload");
const router = express.Router();

// auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ADD MEMORY
router.post("/", auth, async (req, res) => {
  const { capsuleId, content } = req.body;

  if (!capsuleId || !content) {
    return res
      .status(400)
      .json({ message: "capsuleId and content are required" });
  }

  const memory = await Memory.create({
    capsuleId,
    type: "text",
    content,
    createdBy: req.userId,
  });

  res.json(memory);
});



// GET MEMORIES FOR A CAPSULE
router.get("/:capsuleId", auth, async (req, res) => {
  const memories = await Memory.find({
    capsuleId: req.params.capsuleId
  });

  res.json(memories);
});



// MEDIA MEMORY
router.post("/media", auth, upload.single("file"), async (req, res) => {
  try {
    const { capsuleId, type, caption } = req.body;

    console.log("CAPTION RECEIVED:", caption);
    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "File not received by server" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: type === "audio" || type === "video" ? "video" : "image",
    });

    fs.unlinkSync(req.file.path);

    const memory = await Memory.create({
      capsuleId,
      type,
      content: result.secure_url,
      caption: caption || "",
      createdBy: req.userId,
    });

    res.json(memory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Media upload failed" });
  }
});


// DELETE MEMORY

router.delete("/:id", auth, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    // 🔐 Ownership check (IMPORTANT)
    if (memory.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this memory" });
    }

    // 🧨 Permanent delete from MongoDB
    await Memory.findByIdAndDelete(req.params.id);

    res.json({ message: "Memory deleted permanently" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete memory" });
  }
});


module.exports = router;

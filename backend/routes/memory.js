const express = require("express");
const jwt = require("jsonwebtoken");
const Memory = require("../models/Memory");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const upload = multer({ storage: multer.memoryStorage() });
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
  const memory = await Memory.create({
    capsuleId: req.body.capsuleId,
    type: "text",
    content: req.body.content,
    createdBy: req.userId
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


// IMAGE MEMORY
router.post("/image", auth, upload.single("image"), async (req, res) => {
  const result = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
  );

  const memory = await Memory.create({
    capsuleId: req.body.capsuleId,
    type: "image",
    content: result.secure_url,
    createdBy: req.userId
  });

  res.json(memory);
});
module.exports = router;

const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// UPLOAD PROFILE IMAGE
router.post("/profile-image", auth, upload.single("image"), async (req, res) => {
  const result = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
  );

  const user = await User.findByIdAndUpdate(
    req.userId,
    { profileImage: result.secure_url },
    { new: true }
  );

  res.json({ profileImage: user.profileImage });
});


// GET CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});
module.exports = router;
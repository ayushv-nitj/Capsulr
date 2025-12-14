const express = require("express");
const Capsule = require("../models/capsule");
const jwt = require("jsonwebtoken");

const router = express.Router();

// simple auth middleware
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

// CREATE CAPSULE
router.post("/", auth, async (req, res) => {
  console.log("CAPSULE API HIT");
  console.log("BODY:", req.body);
  console.log("USER:", req.userId);

  const capsule = await Capsule.create({
    ...req.body,
    owner: req.userId
  });

  res.json(capsule);
});


// GET ALL CAPSULES FOR USER (DASHBOARD)
router.get("/", auth, async (req, res) => {
  try {
    const capsules = await Capsule.find({
      $or: [
        { owner: req.userId },
        { contributors: req.userId }
      ]
    }).sort({ createdAt: -1 });

    // 🔐 Auto-unlock capsules whose time has passed
    const now = new Date();

    const updatedCapsules = await Promise.all(
      capsules.map(async (capsule) => {
        if (capsule.isLocked && capsule.unlockAt && now >= capsule.unlockAt) {
          capsule.isLocked = false;
          await capsule.save();
        }
        return capsule;
      })
    );

    res.json(updatedCapsules);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch capsules" });
  }
});

// GET USER CAPSULES
router.get("/:id", auth, async (req, res) => {
  const capsule = await Capsule.findById(req.params.id);

  if (!capsule) {
    return res.status(404).json({ message: "Capsule not found" });
  }

  // 🔐 Auto unlock when time passes
  if (capsule.isLocked && capsule.unlockAt && new Date() >= capsule.unlockAt) {
    capsule.isLocked = false;
    await capsule.save();
  }

  res.json(capsule);
});


module.exports = router;

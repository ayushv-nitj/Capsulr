const express = require("express");
const Reaction = require("../models/Reaction");
const Memory = require("../models/memory");
const Capsule = require("../models/capsule");

const router = express.Router();

// Middleware to verify recipient access (no auth token required for recipients)
const verifyRecipient = async (req, res, next) => {
  const { memoryId } = req.body;
  const { email } = req.query; // Email passed as query param

  if (!email) {
    return res.status(401).json({ message: "Email required" });
  }

  try {
    const memory = await Memory.findById(memoryId);
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }

    const capsule = await Capsule.findById(memory.capsuleId);
    if (!capsule) {
      return res.status(404).json({ message: "Capsule not found" });
    }

    // Check if email is in recipients
    if (!capsule.recipients || !capsule.recipients.includes(email)) {
      return res.status(403).json({ message: "Not a recipient" });
    }

    // Check if capsule is unlocked
    if (capsule.isLocked) {
      return res.status(403).json({ message: "Capsule is still locked" });
    }

    req.userEmail = email;
    next();
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// ADD REACTION
router.post("/", verifyRecipient, async (req, res) => {
  try {
    const { memoryId, emoji, userName } = req.body;

    // Check if user already reacted with this emoji
    const existing = await Reaction.findOne({
      memoryId,
      userEmail: req.userEmail,
      emoji,
    });

    if (existing) {
      // Remove reaction (toggle off)
      await Reaction.findByIdAndDelete(existing._id);
      return res.json({ message: "Reaction removed" });
    }

    // Add new reaction
    const reaction = await Reaction.create({
      memoryId,
      userEmail: req.userEmail,
      userName,
      emoji,
    });

    res.json(reaction);
  } catch (err) {
    res.status(500).json({ message: "Failed to add reaction" });
  }
});

// GET REACTIONS FOR MEMORY
router.get("/:memoryId", async (req, res) => {
  try {
    const reactions = await Reaction.find({
      memoryId: req.params.memoryId,
    });
    res.json(reactions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reactions" });
  }
});

module.exports = router;
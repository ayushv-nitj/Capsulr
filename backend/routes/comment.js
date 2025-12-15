const express = require("express");
const Comment = require("../models/Comment");
const Memory = require("../models/Memory");
const Capsule = require("../models/Capsule");

const router = express.Router();

// Middleware to verify recipient access
const verifyRecipient = async (req, res, next) => {
  const memoryId = req.body.memoryId || req.params.memoryId;
  const { email } = req.query;

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

    if (!capsule.recipients || !capsule.recipients.includes(email)) {
      return res.status(403).json({ message: "Not a recipient" });
    }

    if (capsule.isLocked) {
      return res.status(403).json({ message: "Capsule is still locked" });
    }

    req.userEmail = email;
    next();
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// ADD COMMENT
router.post("/", verifyRecipient, async (req, res) => {
  try {
    const { memoryId, text, userName } = req.body;

    const comment = await Comment.create({
      memoryId,
      userEmail: req.userEmail,
      userName,
      text,
    });

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// GET COMMENTS FOR MEMORY
router.get("/:memoryId", async (req, res) => {
  try {
    const comments = await Comment.find({
      memoryId: req.params.memoryId,
    }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// DELETE COMMENT
router.delete("/:id", verifyRecipient, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userEmail !== req.userEmail) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

module.exports = router;
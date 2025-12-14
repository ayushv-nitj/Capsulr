const express = require("express");
const Capsule = require("../models/capsule");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail } = require("../utils/mailer");

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

// GET SINGLE CAPSULE (with collaborators populated)
router.get("/:id", auth, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id)
      .populate("contributors", "name email profileImage")
      .populate("owner", "name email profileImage");
    if (!capsule) {
      return res.status(404).json({ message: "Capsule not found" });
    }

    // 🔐 Auto-unlock when time passes
    const now = new Date();
    if (capsule.isLocked && capsule.unlockAt && now >= capsule.unlockAt) {
  capsule.isLocked = false;
  capsule.isUnlocked = true;
  await capsule.save();

  // 📧 EMAIL RECIPIENTS
  if (capsule.recipients?.length) {
    for (const email of capsule.recipients) {
      await sendEmail({
        to: email,
        subject: "A Capsule has unlocked 🎉",
        html: `
          <h2>A Capsule is now available</h2>
          <p><b>${capsule.title}</b> has unlocked.</p>
          <p>Log in to Capsulr to view it.</p>
        `
      });
    }
  }
}


    res.json(capsule);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch capsule" });
  }
});

// UPDATE CAPSULE
router.put("/:id", auth, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: "Capsule not found" });
    }

    if (capsule.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Capsule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});


// DELETE CAPSULE
router.delete("/:id", auth, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: "Capsule not found" });
    }

    // only owner can delete
    if (capsule.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Capsule.findByIdAndDelete(req.params.id);
    res.json({ message: "Capsule deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ADD COLLABORATOR BY EMAIL
router.post("/:id/collaborators", auth, async (req, res) => {
  try {
    const { email } = req.body;

    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: "Capsule not found" });

    if (capsule.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Only owner can add collaborators" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (capsule.contributors.includes(user._id)) {
      return res.status(400).json({ message: "Already a collaborator" });
    }

    capsule.contributors.push(user._id);
    await capsule.save();

    // 📧 SEND EMAIL
    await sendEmail({
      to: user.email,
      subject: `You were invited to a Capsule`,
      html: `
        <h2>You've been invited 🎁</h2>
        <p>You are now a collaborator on capsule:</p>
        <b>${capsule.title}</b>
        <p>Login to Capsulr to view and contribute.</p>
      `
    });

    res.json({ message: "Collaborator added & email sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add collaborator" });
  }
});






module.exports = router;

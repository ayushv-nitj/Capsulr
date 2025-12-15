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






// GET ALL CAPSULES FOR A RECIPIENT (no auth)
router.get("/recipient-list/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    const capsules = await Capsule.find({
      recipients: email
    })
    .populate("owner", "name email profileImage")
    .sort({ unlockAt: 1 });

    // Auto-unlock any that should be unlocked
    const now = new Date();
    for (const capsule of capsules) {
      if (capsule.isLocked && capsule.unlockAt && now >= capsule.unlockAt) {
        capsule.isLocked = false;
        capsule.isUnlocked = true;
        await capsule.save();
      }
    }

    res.json(capsules);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch capsules" });
  }
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
  subject: "🎉 A Time Capsule has unlocked!",
  html: `
    <h2>Your capsule is ready!</h2>
    <p><b>${capsule.title}</b> has unlocked and is ready to view!</p>
    <p><a href="http://localhost:3000/recipient/${capsule._id}/${email}" style="display:inline-block;padding:12px 24px;background:#10b981;color:white;text-decoration:none;border-radius:8px;margin-top:16px;">Open Capsule</a></p>
    <p style="margin-top:16px;"><a href="http://localhost:3000/recipient/dashboard/${email}" style="color:#8b5cf6;">View All Your Capsules</a></p>
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
  to: email,
  subject: "You've been added to a Time Capsule 🎁",
  html: `
    <h2>You're a recipient of a Time Capsule!</h2>
    <p><b>${capsule.title}</b> has been shared with you.</p>
    <p>It will unlock on: <b>${new Date(capsule.unlockAt).toLocaleString()}</b></p>
    <p><a href="http://localhost:3000/recipient/dashboard/${email}" style="display:inline-block;padding:12px 24px;background:#8b5cf6;color:white;text-decoration:none;border-radius:8px;margin-top:16px;">View Your Capsules</a></p>
  `
});

    res.json({ message: "Collaborator added & email sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add collaborator" });
  }
});

// SEND EMAIL TO RECIPIENTS WHEN ADDED
router.post("/:id/notify-recipients", auth, async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: "Capsule not found" });

    if (capsule.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Only owner can notify recipients" });
    }

    const { newRecipients } = req.body; // Array of newly added emails

    for (const email of newRecipients) {
      await sendEmail({
        to: email,
        subject: "You've been added to a Time Capsule 🎁",
        html: `
          <h2>You're a recipient of a Time Capsule!</h2>
          <p><b>${capsule.title}</b> has been shared with you.</p>
          <p>It will unlock on: <b>${new Date(capsule.unlockAt).toLocaleDateString()}</b></p>
          <p>You'll receive another email when it unlocks!</p>
        `
      });
    }

    res.json({ message: "Recipients notified" });
  } catch (err) {
    res.status(500).json({ message: "Failed to notify recipients" });
  }
});

// GET CAPSULE BY EMAIL (for recipients, no auth required)
router.get("/recipient/:id/:email", async (req, res) => {
  try {
    const { id, email } = req.params;
    
    const capsule = await Capsule.findById(id)
      .populate("contributors", "name email profileImage")
      .populate("owner", "name email profileImage");
      
    if (!capsule) {
      return res.status(404).json({ message: "Capsule not found" });
    }

    // Verify email is a recipient
    if (!capsule.recipients || !capsule.recipients.includes(email)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Auto-unlock if time passed
    const now = new Date();
    if (capsule.isLocked && capsule.unlockAt && now >= capsule.unlockAt) {
      capsule.isLocked = false;
      capsule.isUnlocked = true;
      await capsule.save();
    }

    // Return capsule data (frontend will handle locked state)
    res.json(capsule);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch capsule" });
  }
});

// GET MEMORIES FOR RECIPIENT (no auth)
router.get("/recipient/:capsuleId/:email/memories", async (req, res) => {
  try {
    const { capsuleId, email } = req.params;
    
    const capsule = await Capsule.findById(capsuleId);
    if (!capsule) {
      return res.status(404).json({ message: "Capsule not found" });
    }

    if (!capsule.recipients || !capsule.recipients.includes(email)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only return memories if unlocked
    if (capsule.isLocked) {
      return res.json([]);
    }

    const Memory = require("../models/memory");
    const memories = await Memory.find({ capsuleId });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch memories" });
  }
});

// TEST EMAIL
router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "YOUR_TEST_EMAIL@gmail.com", // Change this
      subject: "Test Email",
      html: "<h1>Email working!</h1>"
    });
    res.json({ message: "Email sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
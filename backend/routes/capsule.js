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

// GET USER CAPSULES
router.get("/", auth, async (req, res) => {
  const capsules = await Capsule.find({ owner: req.userId });
  res.json(capsules);
});


module.exports = router;

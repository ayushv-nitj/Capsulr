const mongoose = require("mongoose");

const capsuleSchema = new mongoose.Schema({
  title: String,
  theme: String,

  unlockType: {
    type: String,
    enum: ["date", "event"]
  },

  unlockAt: Date,
  unlockEvent: String,

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  recipients: [String],

  contributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  isLocked: {
  type: Boolean,
  default: true
},

  isUnlocked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Capsule", capsuleSchema);

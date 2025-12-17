const mongoose = require("mongoose");

const capsuleSchema = new mongoose.Schema({
  title: String,
  theme: String,

  unlockType: {
    type: String,
    enum: ["date", "event"]
  },

    unlockAt: {
    type: Date,
    required: true
  },
  
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

module.exports =
  mongoose.models.Capsule ||
  mongoose.model("Capsule", capsuleSchema);

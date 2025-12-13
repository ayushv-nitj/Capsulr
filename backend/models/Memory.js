const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  capsuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Capsule"
  },

  type: {
    type: String,
    enum: ["text", "image", "audio", "video"]
  },

  content: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Memory", memorySchema);

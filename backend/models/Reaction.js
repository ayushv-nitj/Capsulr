const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    memoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Memory",
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    emoji: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reaction", reactionSchema);
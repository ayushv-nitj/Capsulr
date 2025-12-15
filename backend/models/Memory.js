const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    capsuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Capsule",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "audio", "video"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Memory ||
  mongoose.model("Memory", memorySchema);

const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    url: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      default: "unknown"
    },

    responseTime: {
      type: Number,
      default: null
    },

    lastChecked: {
      type: Date,
      default: null
    },

    contentHash: {
      type: String,
      default: null
    },

    contentSnapshot: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Website", websiteSchema);

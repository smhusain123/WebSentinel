const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: true
    },

    type: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    aiExplanation: {
      type: String,
      default: ""
},

    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active"
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    resolvedAt: {
      type: Date,
      default: null
    }
  }
);

module.exports = mongoose.model("Alert", alertSchema);
const mongoose = require("mongoose");

const monitoringHistorySchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: true
    },

    status: {
      type: String,
      required: true
    },

    responseTime: {
      type: Number,
      default: null
    },

    httpStatus: {
      type: Number,
      default: null
    },

    checkedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "MonitoringHistory",
  monitoringHistorySchema
);
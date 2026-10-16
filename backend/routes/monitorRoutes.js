const express = require("express");
const axios = require("axios");
const Website = require("../models/Website");
const MonitoringHistory = require("../models/MonitoringHistory");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Check a website
router.post("/:id/check", authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found"
      });
    }

    const startTime = Date.now();

    try {
      const response = await axios.get(website.url, {
        timeout: 10000
      });

      const responseTime = Date.now() - startTime;

      website.status = "up";
      website.responseTime = responseTime;
      website.lastChecked = new Date();

      await website.save();

      await MonitoringHistory.create({
        website: website._id,
        status: "up",
        responseTime: responseTime,
        httpStatus: response.status
      });

      res.json({
        message: "Website checked successfully",
        website: {
          id: website._id,
          name: website.name,
          url: website.url,
          status: website.status,
          responseTime: website.responseTime,
          lastChecked: website.lastChecked,
          httpStatus: response.status
        }
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;

      website.status = "down";
      website.responseTime = responseTime;
      website.lastChecked = new Date();

      await website.save();

      await MonitoringHistory.create({
        website: website._id,
        status: "down",
        responseTime: responseTime,
        httpStatus: null
      });

      res.json({
        message: "Website is down or unreachable",
        website: {
          id: website._id,
          name: website.name,
          url: website.url,
          status: website.status,
          responseTime: website.responseTime,
          lastChecked: website.lastChecked
        }
      });
    }

  } catch (error) {
    res.status(500).json({
      message: "Monitoring failed",
      error: error.message
    });
  }
});

// Get monitoring history for a website
router.get("/:id/history", authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found"
      });
    }

    const history = await MonitoringHistory.find({
      website: website._id
    }).sort({ checkedAt: -1 });

    res.json(history);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch monitoring history",
      error: error.message
    });
  }
});

module.exports = router;
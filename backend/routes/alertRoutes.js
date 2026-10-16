const express = require("express");
const Alert = require("../models/Alert");
const Website = require("../models/Website");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get alerts for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Find websites belonging to the logged-in user
    const websites = await Website.find({
      user: req.user.userId
    }).select("_id");

    const websiteIds = websites.map((website) => website._id);

    // Find alerts for those websites
    const alerts = await Alert.find({
      website: { $in: websiteIds }
    })
      .populate("website", "name url")
      .sort({ createdAt: -1 });

    res.json(alerts);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch alerts",
      error: error.message
    });
  }
});

module.exports = router;
const express = require("express");
const Website = require("../models/Website");
const authMiddleware = require("../middleware/authMiddleware");
const { redisClient } = require("../redis");

const router = express.Router();

// Add a website
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        message: "Name and URL are required"
      });
    }

    const website = await Website.create({
      user: req.user.userId,
      name,
      url
    });

    await redisClient.del(`websites:${req.user.userId}`);

    res.status(201).json({
      message: "Website added successfully",
      website
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add website",
      error: error.message
    });
  }
});

// Get user's websites
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cacheKey = `websites:${req.user.userId}`;

    // Check Redis cache first
    const cachedWebsites = await redisClient.get(cacheKey);

    if (cachedWebsites) {
      console.log("Websites fetched from Redis cache");

      return res.json(JSON.parse(cachedWebsites));
    }

    // Fetch from MongoDB if not cached
    const websites = await Website.find({
      user: req.user.userId
    });

    // Store result in Redis for 30 seconds
    await redisClient.setEx(
      cacheKey,
      30,
      JSON.stringify(websites)
    );

    console.log("Websites fetched from MongoDB and cached in Redis");

    res.json(websites);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch websites",
      error: error.message
    });
  }
});

// Delete a website
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found"
      });
    }

    await redisClient.del(`websites:${req.user.userId}`);

    res.json({
      message: "Website deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete website",
      error: error.message
    });
  }
});

module.exports = router;

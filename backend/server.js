const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const websiteRoutes = require("./routes/websiteRoutes");
const monitorRoutes = require("./routes/monitorRoutes");
const startMonitoring = require("./scheduler");
const alertRoutes = require("./routes/alertRoutes");
const { connectRedis } = require("./redis");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/monitor", monitorRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "WebSentinel API is running"
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async() => {
    console.log("MongoDB connected successfully");

    await connectRedis();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    startMonitoring();
  })

  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
  
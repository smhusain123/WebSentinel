const cron = require("node-cron");
const axios = require("axios");
const crypto = require("crypto");

const Website = require("./models/Website");
const MonitoringHistory = require("./models/MonitoringHistory");
const Alert = require("./models/Alert");
const User = require("./models/User");

const { sendEmail } = require("./emailService");
const { getRenderedPage } = require("./playwrightService");
const { explainContentChange } = require("./geminiService");

const startMonitoring = () => {
  // Run every 1 minute
  cron.schedule("* * * * *", async () => {
    console.log("Automatic monitoring started...");

    try {
      const websites = await Website.find();

      console.log(`Checking ${websites.length} website(s)...`);

      for (const website of websites) {
        const startTime = Date.now();

        try {
          // Check website availability using Axios
          const response = await axios.get(website.url, {
            timeout: 10000
          });

          // Load the rendered page using Playwright
          const renderedContent = await getRenderedPage(website.url);

          // Generate SHA-256 hash of rendered content
          const contentHash = crypto
            .createHash("sha256")
            .update(renderedContent)
            .digest("hex");

          let contentChanged = false;

          // Store previous content before updating it
          const oldContentSnapshot = website.contentSnapshot;

          // Detect content change
          if (
            website.contentHash &&
            website.contentHash !== contentHash
          ) {
            contentChanged = true;
          }

          // Update content information
          website.contentHash = contentHash;
          website.contentSnapshot = renderedContent.slice(0, 50000);

          // Handle content change
          if (contentChanged) {
            const existingAlert = await Alert.findOne({
              website: website._id,
              type: "CONTENT_CHANGE",
              status: "active"
            });

            // Prevent duplicate content-change alerts
            if (!existingAlert) {
              let aiExplanation = "";

              try {
                aiExplanation = await explainContentChange(
                  website.name,
                  oldContentSnapshot ||
                    "No previous content available.",
                  renderedContent.slice(0, 50000)
                );

                console.log(
                  `Gemini explanation generated for ${website.name}`
                );
              } catch (error) {
                console.error(
                  `Gemini explanation failed for ${website.name}:`,
                  error.message
                );
              }

              await Alert.create({
                website: website._id,
                type: "CONTENT_CHANGE",
                message: `${website.name} content has changed`,
                aiExplanation: aiExplanation
              });

              console.log(
                `Content change detected for ${website.name}`
              );
            }
          }

          // Calculate response time
          const responseTime = Date.now() - startTime;

          // Update website status
          website.status = "up";
          website.responseTime = responseTime;
          website.lastChecked = new Date();

          await website.save();

          // Check whether there is an active DOWN alert
          const activeAlert = await Alert.findOne({
            website: website._id,
            type: "DOWN",
            status: "active"
          });

          // Resolve DOWN alert when website comes back up
          if (activeAlert) {
            activeAlert.status = "resolved";
            activeAlert.resolvedAt = new Date();

            await activeAlert.save();

            const user = await User.findById(website.user);

            if (user) {
              try {
                await sendEmail({
                  to: user.email,
                  subject: `✅ WebSentinel: ${website.name} is BACK UP`,
                  text: `
Hello ${user.name},

Good news! WebSentinel detected that your monitored website is back online.

Website: ${website.name}
URL: ${website.url}
Response Time: ${responseTime} ms

The previous DOWN alert has been resolved.

— WebSentinel
                  `
                });

                console.log(
                  `UP notification email sent to ${user.email}`
                );
              } catch (emailError) {
                console.error(
                  `Failed to send UP notification for ${website.name}:`,
                  emailError.message
                );
              }
            }

            console.log(
              `Alert resolved for ${website.name}`
            );
          }

          // Save monitoring history
          await MonitoringHistory.create({
            website: website._id,
            status: "up",
            responseTime: responseTime,
            httpStatus: response.status
          });

          console.log(
            `${website.name} - UP - ${responseTime}ms`
          );
        } catch (error) {
          // Website is DOWN or unreachable
          const responseTime = Date.now() - startTime;

          website.status = "down";
          website.responseTime = responseTime;
          website.lastChecked = new Date();

          await website.save();

          // Check whether an active DOWN alert already exists
          const existingAlert = await Alert.findOne({
            website: website._id,
            type: "DOWN",
            status: "active"
          });

          // Create a new alert only if one doesn't already exist
          if (!existingAlert) {
            await Alert.create({
              website: website._id,
              type: "DOWN",
              message: `${website.name} is down or unreachable`,
              status: "active"
            });

            const user = await User.findById(website.user);

            if (user) {
              try {
                await sendEmail({
                  to: user.email,
                  subject: `🚨 WebSentinel Alert: ${website.name} is DOWN`,
                  text: `
Hello ${user.name},

WebSentinel detected that your monitored website is currently DOWN or unreachable.

Website: ${website.name}
URL: ${website.url}
Response Time: ${responseTime} ms

Please check the website.

— WebSentinel
                  `
                });

                console.log(
                  `DOWN notification email sent to ${user.email}`
                );
              } catch (emailError) {
                console.error(
                  `Failed to send DOWN notification for ${website.name}:`,
                  emailError.message
                );
              }
            }

            console.log(
              `Alert created for ${website.name}`
            );
          }

          // Save monitoring history
          await MonitoringHistory.create({
            website: website._id,
            status: "down",
            responseTime: responseTime,
            httpStatus: null
          });

          console.log(
            `${website.name} - DOWN - ${responseTime}ms`
          );
        }
      }
    } catch (error) {
      console.error(
        "Automatic monitoring failed:",
        error.message
      );
    }
  });

  console.log(
    "Automatic monitoring scheduler started."
  );
};

module.exports = startMonitoring;
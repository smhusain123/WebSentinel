require("dotenv").config();

const { sendEmail } = require("./emailService");

const testEmail = async () => {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "WebSentinel Test Email",
      text: "This is a test email from WebSentinel. Email notifications are working!"
    });

    console.log("Test email sent successfully!");
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};

testEmail();
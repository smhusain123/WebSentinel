require("dotenv").config();

const { explainContentChange } = require("./geminiService");

(async () => {
  try {
    const result = await explainContentChange(
      "Test Website",
      "Welcome to WebSentinel. Pricing is $10.",
      "Welcome to WebSentinel. Pricing is $15."
    );

    console.log("\nGemini response:\n");
    console.log(result);
  } catch (error) {
    console.error("Gemini test failed:", error.message);
  }
})();
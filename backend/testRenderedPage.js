const { getRenderedPage } = require("./playwrightService");

const test = async () => {
  try {
    const content = await getRenderedPage("https://example.com");

    console.log("Rendered page loaded successfully.");
    console.log("Content length:", content.length);
  } catch (error) {
    console.error("Playwright failed:", error.message);
  }
};

test();
const { chromium } = require("playwright");

const getRenderedPage = async (url) => {
  const browser = await chromium.launch({
    headless: true
  });

  try {
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000
    });

    const content = await page.content();

    return content;
  } finally {
    await browser.close();
  }
};

module.exports = {
  getRenderedPage
};
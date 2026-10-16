const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const explainContentChange = async (
  websiteName,
  oldContent,
  newContent
) => {
  const prompt = `
You are an AI assistant for a website monitoring system.

A monitored website has changed.

Website: ${websiteName}

Previous website content:
${oldContent}

Current website content:
${newContent}

Explain the important changes in simple language.

Focus on:
1. What changed?
2. Which sections or information appear to be different?
3. Is the change likely meaningful or minor?
4. Give a short summary for the website owner.

Do not invent information that is not present in the provided content.
`;

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });

      return response.text;
    } catch (error) {
      lastError = error;

      console.log(
        `Gemini attempt ${attempt} failed. Retrying...`
      );

      if (attempt < 3) {
        const delay = attempt * 3000;

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );
      }
    }
  }

  throw lastError;
};

module.exports = {
  explainContentChange
};

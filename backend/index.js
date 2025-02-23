const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // Load environment variables
const cheerio = require("cheerio"); // For HTML parsing
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Route to fetch webpage and extract text
app.post("/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url || !/^https?:\/\/[^\s]+$/.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    console.log(`🔄 Fetching URL: ${url}`);
    const response = await axios.get(url);

    // Parse the HTML with cheerio
    const $ = cheerio.load(response.data);
    let pageText = $("body").text(); // Extract all text from body

    console.log("✅ Extracted Content:", pageText.slice(0, 200)); // Log first 200 characters
    return res.json({ html: pageText });
  } catch (error) {
    console.error("❌ Error fetching webpage:", error.message);
    return res.status(500).json({ error: "Failed to fetch the webpage" });
  }
});

// Route to analyze HTML with Gemini AI
app.post("/analyze-ai", async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) {
      console.error("❌ No HTML provided in request");
      return res.status(400).json({ error: "No HTML provided" });
    }

    console.log(
      `🔄 Sending request to Gemini API (HTML length: ${html.length})`
    );
    const truncatedHtml = html.slice(0, 5000); // Limit size

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const response = await model.generateContent(
      `Analyze this HTML for UI/UX issues:\n\n${truncatedHtml}`
    );
    const result = await response.response.text();

    console.log("✅ Gemini API Response:", result);
    return res.json({ analysis: result });
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

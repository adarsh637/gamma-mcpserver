import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());

const GAMMA_API_URL = "https://api.gamma.app/public-api/v0.1/generate";

app.post("/generate-presentation", async (req, res) => {
  try {
    const { inputText, tone, audience, textAmount, textMode, numCards, imageModel, imageStyle, editorMode, additionalInstructions } =
      req.body ?? {};

    if (!inputText) {
      return res.status(400).json({ error: "Missing 'inputText' in request body" });
    }

    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) {
      console.error("GAMMA_API_KEY is not set");
      return res.status(500).json({ error: "Server not configured with GAMMA_API_KEY" });
    }

    const body = {
      inputText,
      tone,
      audience,
      textAmount,
      textMode,
      numCards,
      imageModel,
      imageStyle,
      editorMode,
      additionalInstructions,
    };

    const gammaRes = await fetch(GAMMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await gammaRes.json();

    if (!gammaRes.ok) {
      console.error("Gamma API error:", gammaRes.status, data);
      return res.status(gammaRes.status).json({ error: "Gamma API error", details: data });
    }

    return res.json(data);
  } catch (err: any) {
    console.error("Error calling Gamma API:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`HTTP Gamma server listening on port ${port}`);
});


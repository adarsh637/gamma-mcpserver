import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());

const GAMMA_API_URL = "https://public-api.gamma.app/v1.0/generations";

app.post("/generate-presentation", async (req, res) => {
  try {
    const { prompt, format = "presentation" } = req.body ?? {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) {
      console.error("GAMMA_API_KEY is not set");
      return res.status(500).json({ error: "Server not configured with GAMMA_API_KEY" });
    }

    const gammaRes = await fetch(GAMMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Gamma API uses X-API-KEY header
        // docs: developers.gamma.app / help.gamma.app
        "X-API-KEY": apiKey
      },
      body: JSON.stringify({
        format,
        prompt
      })
    });

    const data = await gammaRes.json();

    if (!gammaRes.ok) {
      console.error("Gamma API error:", gammaRes.status, data);
      return res
        .status(gammaRes.status)
        .json({ error: "Gamma API error", details: data });
    }

    // Return Gamma's response directly to n8n
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

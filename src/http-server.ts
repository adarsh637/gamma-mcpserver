import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());

// Simple health check so "/" works
app.get("/", (_req, res) => {
  res.send("OpenAI proxy is running");
});

app.post("/ask-openai", async (req, res) => {
  try {
    const { prompt, system } = req.body ?? {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set");
      return res.status(500).json({ error: "Server not configured with OPENAI_API_KEY" });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI API error:", openaiRes.status, data);
      return res
        .status(openaiRes.status)
        .json({ error: "OpenAI API error", details: data });
    }

    const content = data?.choices?.[0]?.message?.content ?? null;

    return res.json({
      content,
      raw: data,
    });
  } catch (err: any) {
    console.error("Error calling OpenAI API:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`HTTP OpenAI server listening on port ${port}`);
});

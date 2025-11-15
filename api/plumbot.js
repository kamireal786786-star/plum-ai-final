// api/plumbot.js
// Server-side proxy to call Gemini (gemini-2.5-flash) securely from your backend.
// Frontend calls this endpoint with { prompt } and gets { reply, raw }.

export default async function handler(req, res) {
  // Allow CORS from your frontend (or set to specific origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { prompt } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY in env." });

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const body = {
      contents: [
        { role: "user", parts: [{ text: prompt || "Hello Gemini, test connection" }] }
      ],
      system_instruction: {
        parts: [
          {
            text:
              process.env.SYSTEM_PROMPT ||
              "You are PlumBot, a friendly, efficient, and professional sales assistant for Plum AI. Help schedule meetings and answer user questions concisely."
          }
        ]
      },
      generationConfig: { temperature: 0.6 }
    };

    const r = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body)
    });

    const data = await r.json();

    if (!r.ok) {
      // Forward Gemini error
      return res.status(r.status).json({ error: "Gemini error", detail: data });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ reply, raw: data });
  } catch (err) {
    console.error("plumbot error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}

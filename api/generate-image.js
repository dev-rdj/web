export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  try {
    const puterRes = await fetch("https://api.puter.com/rest/v1/ai/image/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "free"
      },
      body: JSON.stringify({
        prompt: prompt,
        size: "1024x1024"
      })
    });

    const data = await puterRes.json();

    if (!puterRes.ok) {
      return res.status(500).json({
        error: "Puter API failed",
        details: data
      });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

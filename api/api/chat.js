export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { message } = req.body;

  try {
    const response = await fetch(
      "https://api.sambanova.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SAMBANOVA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-8B-Instruct",
          messages: [
            {
              role: "system",
              content:
                "You are JARVIS, an advanced AI assistant inspired by Marvel. You were created by Jeff. You are helpful, intelligent, and calm."
            },
            { role: "user", content: message }
          ]
        })
      }
    );

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });

  } catch {
    res.status(500).json({ error: "Chat failed" });
  }
}

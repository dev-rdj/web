import Bytez from "bytez.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt missing" });
  }

  try {
    const sdk = new Bytez(process.env.BYTEZ_API_KEY);
    const model = sdk.model("stabilityai/stable-diffusion-xl-base-1.0");

    const { error, output } = await model.run(prompt);

    if (error) {
      return res.status(500).json({ error });
    }

    return res.status(200).json({
      image: output[0]
    });

  } catch (err) {
    return res.status(500).json({ error: "Image generation failed" });
  }
}

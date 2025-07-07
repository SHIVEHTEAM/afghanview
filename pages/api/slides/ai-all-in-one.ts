import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("Received prompt:", prompt);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Anthropic API key not configured." });
    }

    // Compose the system prompt for the AI
    const systemPrompt = `
You are an expert at creating engaging, visually beautiful restaurant slideshows. 

Given the user's description, generate a JSON array of slides for a restaurant display. Each slide should have:
- type (e.g. menu, deal, fact, welcome, etc.)
- title
- content (main text)
- emoji (relevant to the slide)
- gradient (a beautiful CSS linear-gradient string for the background)
- items (array, for menu/deal slides)
- price (for deals, if relevant)

The JSON should look like:
[
  {
    "id": "unique-id-1",
    "type": "menu",
    "title": "Today's Specials",
    "content": "Chef's recommendations",
    "emoji": "🍽️",
    "gradient": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "items": ["Kabuli Pulao - $18", "Mantu - $16"],
    "price": null
  },
  ...
]

IMPORTANT:
- Always return a valid JSON array of slides.
- Each slide must have an emoji and a gradient.
- Use unique IDs for each slide (e.g. "slide-1", "slide-2").
- Do not include any explanation or text outside the JSON array.
`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        "Anthropic API error:",
        response.status,
        response.statusText,
        errorData
      );
      return res.status(response.status).json({
        error: `Failed to generate slides: ${response.statusText}`,
        details: errorData,
        status: response.status,
      });
    }

    const data = await response.json();
    const content = data.content[0]?.text?.trim();
    if (!content) {
      return res.status(500).json({ error: "No content generated" });
    }

    // Parse the JSON array from the AI response
    let slides;
    try {
      slides = JSON.parse(content);
    } catch (e) {
      return res
        .status(500)
        .json({ error: "Failed to parse slides JSON", raw: content });
    }

    if (!Array.isArray(slides)) {
      return res
        .status(500)
        .json({ error: "AI did not return an array of slides", raw: content });
    }

    return res.status(200).json(slides);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

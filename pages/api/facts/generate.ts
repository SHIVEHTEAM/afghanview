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

    // Use environment variable for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.",
      });
    }

    console.log(
      "[Facts API] Generating fact with prompt:",
      prompt.substring(0, 100) + "..."
    );

    // Call Anthropic API with Claude 3 Haiku
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // Using Haiku for speed and cost efficiency
        max_tokens: 500, // Increased for better responses
        messages: [
          {
            role: "user",
            content: `${prompt}

You are an expert on Afghan culture and history. Generate an engaging, educational fact that would be perfect for displaying in an Afghan restaurant.

IMPORTANT GUIDELINES:
- Write in simple, clear language that everyone can understand
- Focus on the specific topic or group mentioned in the prompt
- If the prompt mentions a specific Afghan group (Pashtun, Hazara, Uzbek, Tajik, etc.), focus on that group
- If no specific group is mentioned, you can write about Afghan culture in general
- Be creative and interesting - avoid generic responses
- If you truly don't know something specific, provide a related interesting fact instead of apologizing
- Make it educational and engaging for restaurant customers
- Keep it between 1-3 sentences
- Be factual and accurate

Please provide:
1. A single, engaging fact that would be perfect for displaying in an Afghan restaurant
2. A beautiful background color that complements the fact (in hex format like #1f2937)

The background color should be:
- Rich and visually appealing
- Good contrast for white text
- Professional and elegant
- Thematic to the content

Format your response as JSON:
{
  "fact": "your fact text here",
  "backgroundColor": "#hexcolor"
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Facts API] Anthropic API error:", errorData);
      return res.status(response.status).json({
        error: `Failed to generate fact: ${response.statusText}`,
        details: errorData,
      });
    }

    const data = await response.json();
    const content = data.content[0]?.text?.trim();

    if (!content) {
      return res.status(500).json({ error: "No content generated" });
    }

    // Try to parse as JSON first
    let fact, backgroundColor;
    try {
      const parsed = JSON.parse(content);
      fact = parsed.fact;
      backgroundColor = parsed.backgroundColor || "#1f2937"; // Default fallback
    } catch (e) {
      // If not JSON, treat as plain text fact
      fact = content;
      backgroundColor = "#1f2937"; // Default background
    }

    if (!fact) {
      return res.status(500).json({ error: "No fact generated" });
    }

    // Filter out apologetic responses
    const apologeticPhrases = [
      "i apologize",
      "i'm sorry",
      "unfortunately",
      "i don't have",
      "i cannot provide",
      "i do not have",
      "i'm unable to",
      "i don't know",
      "i cannot share",
      "i do not have enough",
      "i don't have enough",
      "i'm not able to",
      "i cannot give",
      "i do not have any",
      "i don't have any",
    ];

    const isApologetic = apologeticPhrases.some((phrase) =>
      fact.toLowerCase().includes(phrase)
    );

    if (isApologetic) {
      console.log(
        "[Facts API] Filtered out apologetic response:",
        fact.substring(0, 100) + "..."
      );
      return res.status(422).json({
        error:
          "Generated response was apologetic. Please try a different prompt.",
        isApologetic: true,
      });
    }

    console.log("[Facts API] Generated fact:", fact.substring(0, 100) + "...");
    console.log("[Facts API] Background color:", backgroundColor);

    return res.status(200).json({ fact, backgroundColor });
  } catch (error) {
    console.error("[Facts API] Error generating fact:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

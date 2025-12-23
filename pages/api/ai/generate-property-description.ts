import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { address, name, features, type } = req.body;

        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return res
                .status(500)
                .json({ error: "Anthropic API key not configured." });
        }

        // Compose the system prompt for the AI
        const systemPrompt = `
You are a top-tier luxury real estate copywriter and location analyst.
Your goal is to write a **SPECIFIC, KNOWLEDGEABLE, and HIGHLIGHTing** text.

**STRICT RULES:**
1. **Facts over Fluff:** Do not use words like "nestled", "gem", "oasis" unless absolutely necessary.
2. **Specifics Required:** You MUST mention specific neighborhood features.
   - If the address is "123 Ocean Drive, Miami", mention "South Beach nightlife", "Lummus Park", or "Art Deco District".
   - If you don't know the exact house, describe the *neighborhood's* specific premium amenities (e.g. "Walking distance to [Famous Park] and [Popular Street]").
3. **Tone:** Professional, sophisticated, informative.

Output a JSON object:
{
  "description": "2-3 sentences description. Focus on lifestyle and location value. Mention nearby hubs.",
  "aiInsights": "2-3 sentences analyzing the neighborhood vibe. Be specific about commute, schools, or leisure nearby."
}

Input:
- Address: ${address}
- Name: ${name}
- Features: ${features?.join(", ")}
`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-3-haiku-20240307", // Haiku is the only model confirmed working for this user
                max_tokens: 1000,
                system: systemPrompt,
                messages: [{ role: "user", content: "Generate specific property insights." }],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Anthropic API error:", response.status, errorData);
            return res.status(response.status).json({
                error: `AI Generation failed: ${response.statusText}`,
            });
        }

        const data = await response.json();
        const content = data.content[0]?.text?.trim();

        if (!content) {
            return res.status(500).json({ error: "No content generated" });
        }

        // Clean up potential markdown code blocks if the AI adds them despite instructions
        const cleanContent = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");

        let result;
        try {
            result = JSON.parse(cleanContent);
        } catch (e) {
            return res.status(500).json({ error: "Failed to parse AI response", raw: content });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Handler error:", error);
        return res.status(500).json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

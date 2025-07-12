import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, language = "en", group = "general" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Enhanced prompt with better instructions
    const enhancedPrompt = `${prompt}

IMPORTANT INSTRUCTIONS:
1. Create an engaging, educational fact about Afghanistan
2. Keep it concise (1-2 sentences maximum)
3. Make it interesting and culturally relevant
4. Include a relevant emoji at the beginning
5. Suggest a beautiful, unique, and visually distinct background color (hex code like #1f2937) that is different from previous facts and looks good for slideshows
6. Format your response as: "emoji fact text | background_color"

Example format:
"🏔️ The Hindu Kush mountains in Afghanistan are home to some of the world's highest peaks, with Noshaq reaching 7,492 meters above sea level. | #1e40af"

Focus on making the content engaging and visually appealing for a slideshow. Do NOT use the same color for every fact. Always pick a different color for each fact.`;

    // Call Anthropic API (or your preferred AI service)
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Fallback response when API key is not available
      const fallbackFacts = [
        "🏔️ The Hindu Kush mountains in Afghanistan are home to some of the world's highest peaks, with Noshaq reaching 7,492 meters above sea level. | #1e40af",
        "🍽️ Afghan cuisine is famous for its rich flavors, with dishes like Kabuli Pulao and Afghan kebabs being celebrated worldwide. | #dc2626",
        "🤝 Afghan hospitality is legendary - guests are treated as gifts from God and offered the best food and accommodations. | #059669",
        "📜 Afghanistan has been a crossroads of civilizations for over 2,000 years, connecting the East and West through the Silk Road. | #7c3aed",
        "🎨 Afghan carpets are renowned for their intricate designs and vibrant colors, with each region having its unique style. | #ea580c",
        "📖 Afghan poetry, especially the works of Rumi and Khushal Khan Khattak, has influenced literature worldwide. | #0891b2",
        "🎵 Traditional Afghan music features instruments like the rubab, tabla, and harmonium, creating unique melodies. | #be185d",
        "🏛️ The Blue Mosque in Mazar-i-Sharif is one of Afghanistan's most beautiful architectural wonders. | #854d0e",
        "💎 Afghanistan is home to some of the world's finest lapis lazuli, a deep blue gemstone prized for centuries. | #166534",
        "🌹 The Afghan rose is famous for its fragrance and is used to make rose water, a traditional ingredient in many dishes. | #7c2d12",
      ];

      const randomFact =
        fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      const [emojiAndFact, backgroundColor] = randomFact.split(" | ");
      const emoji = emojiAndFact.match(/^[^\s]+/)?.[0] || "🏛️";
      const fact = emojiAndFact.replace(/^[^\s]+\s*/, "");

      return res.status(200).json({
        fact,
        emoji,
        backgroundColor: backgroundColor || "#1f2937",
        isFallback: true,
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Anthropic API error:", response.status, errorData);

      // Return a fallback response instead of error
      const fallbackFacts = [
        "🏔️ The Hindu Kush mountains in Afghanistan are home to some of the world's highest peaks, with Noshaq reaching 7,492 meters above sea level. | #1e40af",
        "🍽️ Afghan cuisine is famous for its rich flavors, with dishes like Kabuli Pulao and Afghan kebabs being celebrated worldwide. | #dc2626",
        "🤝 Afghan hospitality is legendary - guests are treated as gifts from God and offered the best food and accommodations. | #059669",
      ];

      const randomFact =
        fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      const [emojiAndFact, backgroundColor] = randomFact.split(" | ");
      const emoji = emojiAndFact.match(/^[^\s]+/)?.[0] || "🏛️";
      const fact = emojiAndFact.replace(/^[^\s]+\s*/, "");

      return res.status(200).json({
        fact,
        emoji,
        backgroundColor: backgroundColor || "#1f2937",
        isFallback: true,
      });
    }

    const data = await response.json();
    const aiResponse = data.content[0]?.text || "";

    // Parse the AI response to extract emoji, fact, and background color
    const lines = aiResponse.split("\n").filter((line: string) => line.trim());
    let fact = "";
    let emoji = "🏛️";
    let backgroundColor = "#1f2937";

    for (const line of lines as string[]) {
      if (line.includes("|")) {
        const [emojiAndFact, color] = line
          .split("|")
          .map((s: string) => s.trim());
        const emojiMatch = emojiAndFact.match(/^[^\s]+/);
        if (emojiMatch) {
          emoji = emojiMatch[0];
          fact = emojiAndFact.replace(/^[^\s]+\s*/, "").trim();
        }
        if (color && color.match(/^#[0-9a-fA-F]{6}$/)) {
          backgroundColor = color;
        }
        break;
      } else if (line.match(/^[^\s]+\s/)) {
        // If no pipe separator, try to extract emoji from the beginning
        const emojiMatch = line.match(/^[^\s]+/);
        if (emojiMatch) {
          emoji = emojiMatch[0];
          fact = line.replace(/^[^\s]+\s*/, "").trim();
        } else {
          fact = line.trim();
        }
      } else {
        fact = line.trim();
      }
    }

    // Fallback if parsing failed
    if (!fact) {
      fact = aiResponse.trim();
    }

    // Clean up the fact text
    fact = fact
      .replace(/^["']|["']$/g, "") // Remove quotes
      .replace(/\|.*$/, "") // Remove any remaining pipe and content
      .trim();

    // Validate and set defaults
    if (!fact) {
      fact = "Afghanistan is a land of rich culture and beautiful traditions.";
    }

    if (!emoji || emoji.length > 4) {
      emoji = "🏛️";
    }

    // After parsing backgroundColor from AI response, add a fallback:
    // Curated palette of beautiful, distinct colors
    const colorPalette = [
      "#1e40af", // blue
      "#dc2626", // red
      "#059669", // green
      "#7c3aed", // purple
      "#ea580c", // orange
      "#0891b2", // teal
      "#be185d", // pink
      "#854d0e", // brown
      "#166534", // dark green
      "#7c2d12", // dark orange
      "#f59e42", // light orange
      "#fbbf24", // yellow
      "#10b981", // emerald
      "#6366f1", // indigo
      "#f43f5e", // rose
      "#0ea5e9", // sky
      "#a21caf", // violet
      "#facc15", // gold
      "#22d3ee", // cyan
      "#eab308", // amber
    ];

    if (!backgroundColor || !backgroundColor.match(/^#[0-9a-fA-F]{6}$/)) {
      // Pick a random color from the palette
      backgroundColor =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }

    console.log("[Facts API] Generated fact:", fact);
    console.log("[Facts API] Background color:", backgroundColor);

    return res.status(200).json({
      fact,
      emoji,
      backgroundColor,
      isFallback: false,
    });
  } catch (error) {
    console.error("Error generating fact:", error);

    // Return a fallback response instead of error
    const fallbackFacts = [
      "🏔️ The Hindu Kush mountains in Afghanistan are home to some of the world's highest peaks, with Noshaq reaching 7,492 meters above sea level. | #1e40af",
      "🍽️ Afghan cuisine is famous for its rich flavors, with dishes like Kabuli Pulao and Afghan kebabs being celebrated worldwide. | #dc2626",
      "🤝 Afghan hospitality is legendary - guests are treated as gifts from God and offered the best food and accommodations. | #059669",
    ];

    const randomFact =
      fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
    const [emojiAndFact, backgroundColor] = randomFact.split(" | ");
    const emoji = emojiAndFact.match(/^[^\s]+/)?.[0] || "🏛️";
    const fact = emojiAndFact.replace(/^[^\s]+\s*/, "");

    return res.status(200).json({
      fact,
      emoji,
      backgroundColor: backgroundColor || "#1f2937",
      isFallback: true,
    });
  }
}

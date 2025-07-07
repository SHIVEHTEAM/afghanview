import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PROMPTS = {
  "afghan-culture":
    "Generate an interesting fact about Afghan culture, traditions, or history that would be relevant for an Afghan restaurant. Make it engaging and educational for customers.",
  "afghan-cuisine":
    "Share a fascinating fact about Afghan cuisine, traditional dishes, cooking methods, or ingredients that would interest restaurant customers.",
  hospitality:
    "Create a fact about Afghan hospitality traditions, guest customs, or the importance of sharing meals in Afghan culture.",
  "coffee-tea":
    "Generate an interesting fact about Afghan coffee and tea culture, traditional serving methods, or the social importance of tea time.",
  spices:
    "Share a fact about Afghan spices, traditional flavor combinations, or the unique taste profile of Afghan cuisine.",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, settings } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log(
      "[Auto-Generate API] Starting auto-generation for user:",
      userId
    );

    const factsGenerated = [];
    const slidesCreated = [];

    // Generate facts for each selected category
    for (const category of settings.categories || ["afghan-culture"]) {
      const prompt =
        PROMPTS[category as keyof typeof PROMPTS] || PROMPTS["afghan-culture"];

      try {
        // Call the fact generation API
        const factResponse = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/facts/generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          }
        );

        if (factResponse.ok) {
          const factData = await factResponse.json();

          const fact = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            text: factData.fact,
            category: category,
            timestamp: new Date(),
            prompt,
            backgroundColor: factData.backgroundColor || "#1f2937",
            userId,
          };

          factsGenerated.push(fact);

          // If auto-convert to slides is enabled, create a slide
          if (settings.autoConvertToSlides) {
            try {
              const slideData = {
                name: `Auto-Generated: ${category}`,
                type: "text",
                title: fact.text,
                subtitle: category,
                content: {
                  text: fact.text,
                  category: category,
                  timestamp: fact.timestamp,
                },
                styling: {
                  backgroundColor: fact.backgroundColor,
                  textColor: getContrastColor(fact.backgroundColor),
                  fontSize: 32,
                  animation: "fade",
                },
                duration: 5000,
                order_index: 0,
                is_active: true,
                is_published: false,
                is_locked: false,
                restaurant_id: "e46a2c25-fe10-4fd2-a2bd-4c72969a898e",
                created_by: userId,
              };

              const slideResponse = await fetch(
                `${
                  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
                }/api/slides`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(slideData),
                }
              );

              if (slideResponse.ok) {
                const slide = await slideResponse.json();
                slidesCreated.push(slide);
              }
            } catch (slideError) {
              console.error("Error creating slide:", slideError);
            }
          }
        }
      } catch (error) {
        console.error(`Error generating fact for category ${category}:`, error);
      }
    }

    console.log(
      `[Auto-Generate API] Generated ${factsGenerated.length} facts and ${slidesCreated.length} slides`
    );

    return res.status(200).json({
      success: true,
      factsGenerated: factsGenerated.length,
      slidesCreated: slidesCreated.length,
      facts: factsGenerated,
      slides: slidesCreated,
    });
  } catch (error) {
    console.error("Auto-generation error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Helper function to determine text color based on background
function getContrastColor(backgroundColor: string): string {
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

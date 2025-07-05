import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("=== TESTING DATABASE ===");

    // Test 1: Count all slides
    const { count, error: countError } = await supabase
      .from("slides")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error counting slides:", countError);
      return res.status(500).json({ error: countError.message });
    }

    console.log("Total slides in database:", count);

    // Test 2: Get all slides with basic info
    const { data: slides, error: slidesError } = await supabase
      .from("slides")
      .select("id, name, title, type, created_at, restaurant_id")
      .order("created_at", { ascending: false });

    if (slidesError) {
      console.error("Error fetching slides:", slidesError);
      return res.status(500).json({ error: slidesError.message });
    }

    console.log("Slides found:", slides?.length || 0);
    if (slides && slides.length > 0) {
      console.log("First few slides:", slides.slice(0, 3));
    }

    // Test 3: Check if there are any restaurants
    const { data: restaurants, error: restaurantsError } = await supabase
      .from("restaurants")
      .select("id, name, slug")
      .limit(5);

    if (restaurantsError) {
      console.error("Error fetching restaurants:", restaurantsError);
    } else {
      console.log("Restaurants found:", restaurants?.length || 0);
    }

    return res.status(200).json({
      totalSlides: count,
      slides: slides || [],
      restaurants: restaurants || [],
    });
  } catch (error) {
    console.error("Test error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

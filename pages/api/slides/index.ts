import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      console.log("=== FETCHING ALL SLIDES ===");

      const { data, error } = await supabase
        .from("slides")
        .select(
          `
          *,
          restaurant:restaurants(id, name, slug)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error fetching slides:", error);
        return res.status(500).json({
          error: `Database error: ${error.message}`,
          details: error,
        });
      }

      console.log(`✅ Fetched ${data?.length || 0} slides successfully`);
      return res.status(200).json(data || []);
    } catch (error) {
      console.error("Error fetching slides:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else if (req.method === "POST") {
    return handlePost(req, res);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("=== SLIDE CREATION REQUEST RECEIVED ===");
    console.log("Request method:", req.method);
    console.log("Request headers:", req.headers);
    console.log("Request body keys:", Object.keys(req.body || {}));

    const slideData = req.body;

    console.log("=== SLIDE CREATION REQUEST ===");
    console.log(
      "Creating slide with data:",
      JSON.stringify(slideData, null, 2)
    );

    // Validate required fields
    if (!slideData.name || !slideData.title) {
      console.log("Validation failed: Missing name or title");
      return res.status(400).json({ error: "Name and title are required" });
    }

    // Map the data to match the database schema
    const cleanSlideData = {
      restaurant_id: slideData.restaurant_id || null,
      template_id: slideData.template_id || null,
      name: slideData.name,
      type: slideData.type || "image",
      title: slideData.title,
      subtitle: slideData.subtitle || null,
      content: slideData.content || {},
      styling: slideData.styling || {},
      duration: slideData.duration || 6000,
      order_index: slideData.order_index || 0,
      is_active: slideData.is_active ?? true,
      is_published: slideData.is_published ?? false,
      is_locked: slideData.is_locked ?? false,
      published_at: slideData.published_at || null,
      published_by: slideData.published_by || null,
      created_by: slideData.created_by,
      updated_by: slideData.created_by, // Set updated_by to same as created_by initially
    };

    console.log(
      "Clean slide data for database:",
      JSON.stringify(cleanSlideData, null, 2)
    );

    const { data, error } = await supabase
      .from("slides")
      .insert(cleanSlideData)
      .select()
      .single();

    if (error) {
      console.error("Database error during slide creation:", error);
      return res.status(500).json({
        error: `Database error: ${error.message}`,
        details: error,
      });
    }

    console.log("Slide created successfully in database:", data);
    console.log("=== SLIDE CREATION COMPLETE ===");
    return res.status(201).json(data);
  } catch (error) {
    console.error("Unexpected error creating slide:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

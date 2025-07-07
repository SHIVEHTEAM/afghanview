import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      case "PUT":
        return await handlePut(req, res);
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("[Auto-Generation Settings] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const { data, error } = await supabase
    .from("auto_generation_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No settings found, return default settings
      return res.status(200).json({
        is_enabled: false,
        generation_interval_hours: 24,
        categories: ["Afghan Culture", "Afghan Cuisine", "Afghan Hospitality"],
        max_facts_per_generation: 3,
        auto_create_slides: true,
        background_music_url: undefined,
        last_generation_at: undefined,
        next_generation_at: undefined,
      });
    }
    return res.status(500).json({ error: "Failed to fetch settings" });
  }

  return res.status(200).json(data);
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { userId, ...settings } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Check if settings already exist
  const { data: existing } = await supabase
    .from("auto_generation_settings")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    return res
      .status(409)
      .json({ error: "Settings already exist for this user" });
  }

  const { data, error } = await supabase
    .from("auto_generation_settings")
    .insert({
      user_id: userId,
      ...settings,
    })
    .select()
    .single();

  if (error) {
    console.error("[Auto-Generation Settings] Create error:", error);
    return res.status(500).json({ error: "Failed to create settings" });
  }

  return res.status(201).json(data);
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { userId, ...settings } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Check if settings exist
  const { data: existing } = await supabase
    .from("auto_generation_settings")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!existing) {
    // Create new settings if they don't exist
    const { data, error } = await supabase
      .from("auto_generation_settings")
      .insert({
        user_id: userId,
        ...settings,
      })
      .select()
      .single();

    if (error) {
      console.error("[Auto-Generation Settings] Create error:", error);
      return res.status(500).json({ error: "Failed to create settings" });
    }

    return res.status(201).json(data);
  }

  // Update existing settings
  const { data, error } = await supabase
    .from("auto_generation_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("[Auto-Generation Settings] Update error:", error);
    return res.status(500).json({ error: "Failed to update settings" });
  }

  return res.status(200).json(data);
}

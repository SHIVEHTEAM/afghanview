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
      const { businessId } = req.query;

      if (!businessId) {
        return res.status(400).json({ error: "Missing businessId" });
      }

      // Simple approach: Get slideshows directly
      const { data: slideshows, error } = await supabase
        .from("slideshows")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching slideshows:", error);
        return res.status(500).json({ error: "Database error" });
      }

      return res.status(200).json(slideshows || []);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, description, business_id, content, settings, created_by } =
        req.body;

      console.log("Received slideshow creation request:", req.body);

      if (!name || !business_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create slideshow with all fields
      const { data: slideshow, error } = await supabase
        .from("slideshows")
        .insert({
          title: name,
          description: description || "",
          business_id,
          content: content || {},
          settings: settings || {},
          is_active: true,
          created_by: created_by,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating slideshow:", error);
        return res.status(500).json({ error: "Failed to create slideshow" });
      }

      console.log("Created slideshow:", slideshow);
      return res.status(201).json(slideshow);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

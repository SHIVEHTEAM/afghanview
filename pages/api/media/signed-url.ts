import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { path } = req.query;

    if (!path || typeof path !== "string") {
      return res
        .status(400)
        .json({ error: "path query parameter is required" });
    }

    // Get signed URL for the file
    const { data, error } = await supabase.storage
      .from("slideshow-media")
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      console.error("Error creating signed URL:", error);
      return res.status(500).json({ error: "Failed to create signed URL" });
    }

    return res.status(200).json({ url: data.signedUrl });
  } catch (error) {
    console.error("Signed URL handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { path } = req.query;

    if (!path || typeof path !== "string") {
      return res.status(400).json({ error: "Path parameter is required" });
    }

    // Always use slideshow-media bucket
    const bucketName = "slideshow-media";
    const filePath = path;

    console.log(
      `Attempting to get signed URL from bucket: ${bucketName}, path: ${filePath}`
    );

    // Get signed URL for the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error(`Error creating signed URL from ${bucketName}:`, error);
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(200).json({ url: data.signedUrl });
  } catch (error) {
    console.error("Error in signed-url API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

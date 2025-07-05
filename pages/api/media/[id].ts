import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the media file record
    const { data: mediaFile, error: fetchError } = await supabase
      .from("media_files")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !mediaFile) {
      return res.status(404).json({ error: "Media file not found" });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("slideshow-media")
      .remove([mediaFile.file_path]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("media_files")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      return res.status(500).json({ error: "Failed to delete media record" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

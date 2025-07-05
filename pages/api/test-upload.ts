import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        error: "Missing environment variables",
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey,
      });
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test storage access
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      return res.status(500).json({
        error: "Storage access failed",
        bucketError: bucketError.message,
      });
    }

    // Test database access
    const { data: mediaFiles, error: dbError } = await supabase
      .from("media_files")
      .select("id")
      .limit(1);

    if (dbError) {
      return res.status(500).json({
        error: "Database access failed",
        dbError: dbError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Environment and Supabase connection are working",
      buckets: buckets.map((b) => b.id),
      mediaFilesCount: mediaFiles?.length || 0,
    });
  } catch (error) {
    console.error("Test error:", error);
    return res.status(500).json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

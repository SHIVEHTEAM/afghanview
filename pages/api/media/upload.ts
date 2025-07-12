import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Increase body size limit for large file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { file, fileName, contentType, businessId } = req.body;

    // Validate required fields
    if (!file || !fileName || !contentType || !businessId) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Convert base64 to buffer
    const base64Data = file.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique file path
    const timestamp = Date.now();
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${timestamp}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;
    const filePath = `${businessId}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("slideshow-media")
      .upload(filePath, buffer, {
        contentType: contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({
        error: "Failed to upload file",
        details: uploadError.message,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("slideshow-media")
      .getPublicUrl(filePath);

    return res.status(200).json({
      success: true,
      filePath: filePath,
      publicUrl: urlData.publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

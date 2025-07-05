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
    console.log("Upload request received:", {
      hasFile: !!req.body.file,
      hasType: !!req.body.type,
      hasUserId: !!req.body.userId,
      bodyKeys: Object.keys(req.body),
    });

    const { file, type, restaurantId, userId } = req.body;

    // Validate required fields
    if (!file || !type || !userId) {
      console.log("Missing fields:", {
        file: !!file,
        type: !!type,
        userId: !!userId,
      });
      return res.status(400).json({
        error: "Missing required fields: file, type, userId",
      });
    }

    // Validate file type
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/mov",
      "video/avi",
      "video/quicktime",
    ];

    if (type === "image" && !allowedImageTypes.includes(file.type)) {
      return res.status(400).json({
        error: "Invalid image file type. Allowed: JPEG, PNG, GIF, WebP",
      });
    }

    if (type === "video" && !allowedVideoTypes.includes(file.type)) {
      return res.status(400).json({
        error:
          "Invalid video file type. Allowed: MP4, WebM, MOV, AVI, QuickTime",
      });
    }

    // Decode base64 file
    console.log("Processing file:", {
      fileName: file.name,
      fileType: file.type,
      dataLength: file.data?.length || 0,
    });

    const buffer = Buffer.from(file.data.split(",")[1], "base64");
    console.log("Buffer created, size:", buffer.length);

    // Validate file size (50MB limit)
    if (buffer.length > 50 * 1024 * 1024) {
      return res.status(400).json({
        error: "File too large. Maximum size is 50MB",
      });
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "bin";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Create file path based on context
    const filePath = restaurantId
      ? `restaurants/${restaurantId}/media/${fileName}`
      : `templates/media/${fileName}`;

    // Upload to Supabase storage using service role (bypasses RLS)
    console.log("Uploading to Supabase:", { filePath, contentType: file.type });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("slideshow-media")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({
        error: `Upload failed: ${uploadError.message}`,
      });
    }

    console.log("Upload successful:", uploadData);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("slideshow-media").getPublicUrl(filePath);

    // Create media file record in database
    const mediaFileData = {
      restaurant_id: restaurantId || null,
      filename: fileName,
      original_filename: file.name,
      file_path: filePath,
      file_size: buffer.length,
      mime_type: file.type,
      media_type: type,
      is_public: true,
      uploaded_by: userId,
    };

    const { data: mediaRecord, error: dbError } = await supabase
      .from("media_files")
      .insert(mediaFileData)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Try to clean up uploaded file if database insert fails
      await supabase.storage.from("slideshow-media").remove([filePath]);
      return res.status(500).json({
        error: "Failed to save media record",
      });
    }

    // Return success response
    return res.status(200).json({
      id: mediaRecord.id,
      url: publicUrl,
      filename: fileName,
      originalFilename: file.name,
      fileSize: buffer.length,
      mimeType: file.type,
      mediaType: type,
      duration: null, // Could be extracted for videos if needed
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return res.status(500).json({
      error: "Internal server error during upload",
    });
  }
}

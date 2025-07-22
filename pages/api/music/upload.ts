import { NextApiRequest, NextApiResponse } from "next";
import { MusicService } from "../../../lib/music-service";
import formidable from "formidable";
import { promises as fs } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const form = formidable({
        maxFileSize: 50 * 1024 * 1024, // 50MB limit
        allowEmptyFiles: false,
        filter: ({ mimetype }) => {
          return Boolean(mimetype && mimetype.includes("audio"));
        },
      });

      const [fields, files] = await form.parse(req);

      const file = files.music?.[0];
      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No music file provided",
        });
      }

      // Validate file
      if (!file.mimetype?.includes("audio")) {
        return res.status(400).json({
          success: false,
          error: "Invalid file type. Please upload an audio file.",
        });
      }

      // Get metadata from form fields
      const name =
        fields.name?.[0] ||
        file.originalFilename?.replace(/\.[^/.]+$/, "") ||
        "Untitled";
      const artist = fields.artist?.[0] || "Unknown Artist";
      const description = fields.description?.[0] || "";
      const category = fields.category?.[0] || "Other";
      const tags = fields.tags?.[0]
        ? fields.tags[0].split(",").map((tag) => tag.trim())
        : [];
      const is_public = fields.is_public?.[0] === "true";

      // Create File object from uploaded file
      const fileBuffer = await fs.readFile(file.filepath);
      const fileObject = new File(
        [fileBuffer],
        file.originalFilename || "music.mp3",
        {
          type: file.mimetype,
        }
      );

      // Upload to music service
      const result = await MusicService.uploadMusic(fileObject, {
        name,
        artist,
        description,
        category,
        tags,
        is_public,
      });

      // Clean up temporary file
      await fs.unlink(file.filepath);

      if (result.success && result.track) {
        res.status(200).json({
          success: true,
          track: result.track,
          message: "Music uploaded successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || "Upload failed",
        });
      }
    } catch (error) {
      console.error("Music upload error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to upload music file",
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

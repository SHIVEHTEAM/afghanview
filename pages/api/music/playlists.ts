import { NextApiRequest, NextApiResponse } from "next";
import { MusicService } from "../../../lib/music-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const playlists = await MusicService.getUserPlaylists();

      res.status(200).json({
        success: true,
        playlists,
        count: playlists.length,
      });
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch playlists",
      });
    }
  } else if (req.method === "POST") {
    try {
      const { name, description, business_id, play_mode } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: "Playlist name is required",
        });
      }

      const playlist = await MusicService.createPlaylist(
        name,
        description,
        business_id,
        play_mode || "sequential"
      );

      if (playlist) {
        res.status(200).json({
          success: true,
          playlist,
          message: "Playlist created successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Failed to create playlist",
        });
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create playlist",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

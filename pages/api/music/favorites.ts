import { NextApiRequest, NextApiResponse } from "next";
import { MusicService } from "../../../lib/music-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const favorites = await MusicService.getUserFavorites();

      res.status(200).json({
        success: true,
        favorites,
        count: favorites.length,
      });
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch favorites",
      });
    }
  } else if (req.method === "POST") {
    try {
      const { track_id } = req.body;

      if (!track_id) {
        return res.status(400).json({
          success: false,
          error: "Track ID is required",
        });
      }

      const success = await MusicService.toggleFavorite(track_id);

      if (success) {
        res.status(200).json({
          success: true,
          message: "Favorite toggled successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Failed to toggle favorite",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({
        success: false,
        error: "Failed to toggle favorite",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import { MusicService } from "../../../lib/music-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const {
        search,
        category,
        tags,
        source,
        limit,
        offset,
        sort_by,
        sort_order,
      } = req.query;

      const tracks = await MusicService.getTracks({
        search: search as string,
        category: category as string,
        tags: tags
          ? ((Array.isArray(tags) ? tags : [tags]) as string[])
          : undefined,
        source: source as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        sort_by: sort_by as any,
        sort_order: sort_order as "asc" | "desc",
      });

      res.status(200).json({
        success: true,
        tracks,
        count: tracks.length,
      });
    } catch (error) {
      console.error("Error fetching tracks:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch tracks",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

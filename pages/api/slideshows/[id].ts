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
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid slideshow ID is required" });
  }

  switch (req.method) {
    case "GET":
      return getSlideshow(id, res);
    case "PATCH":
      return updateSlideshow(id, req, res);
    case "DELETE":
      return deleteSlideshow(id, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function getSlideshow(id: string, res: NextApiResponse) {
  try {
    const { data: slide, error } = await supabase
      .from("slides")
      .select("*")
      .eq("id", id)
      .eq("type", "image")
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(404).json({ error: "Slideshow not found" });
    }

    const transformedSlideshow = {
      id: slide.id,
      name: slide.name,
      images: slide.content?.images || [],
      settings: {
        defaultDuration: slide.duration || 5000,
        duration: slide.duration || 5000,
        transition: slide.styling?.transition || "fade",
        backgroundMusic: slide.styling?.backgroundMusic,
        musicVolume: slide.styling?.musicVolume || 50,
        musicLoop: slide.styling?.musicLoop || true,
        autoPlay: slide.styling?.autoPlay || true,
        showControls: slide.styling?.showControls || true,
      },
      createdAt: slide.created_at,
      isActive: slide.is_active,
      playCount: slide.content?.playCount || 0,
      lastPlayed: slide.content?.lastPlayed,
      publicLink: slide.content?.publicLink,
      slug: slide.content?.slug,
    };

    return res.status(200).json(transformedSlideshow);
  } catch (error) {
    console.error("Get slideshow error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateSlideshow(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { playCount, lastPlayed, isActive, name, settings } = req.body;

    const updateData: any = {};

    // Update content fields
    if (playCount !== undefined || lastPlayed !== undefined) {
      const { data: currentSlide } = await supabase
        .from("slides")
        .select("content")
        .eq("id", id)
        .single();

      const currentContent = currentSlide?.content || {};
      updateData.content = {
        ...currentContent,
        ...(playCount !== undefined && { playCount }),
        ...(lastPlayed !== undefined && { lastPlayed }),
      };
    }

    // Update other fields
    if (isActive !== undefined) updateData.is_active = isActive;
    if (name !== undefined) updateData.name = name;
    if (settings !== undefined) {
      updateData.styling = {
        transition: settings.transition || "fade",
        backgroundMusic: settings.backgroundMusic,
        musicVolume: settings.musicVolume || 50,
        musicLoop: settings.musicLoop || true,
        autoPlay: settings.autoPlay || true,
        showControls: settings.showControls || true,
      };
      if (settings.duration) updateData.duration = settings.duration;
    }

    const { data: updatedSlide, error } = await supabase
      .from("slides")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to update slideshow" });
    }

    const transformedSlideshow = {
      id: updatedSlide.id,
      name: updatedSlide.name,
      images: updatedSlide.content?.images || [],
      settings: {
        defaultDuration: updatedSlide.duration || 5000,
        duration: updatedSlide.duration || 5000,
        transition: updatedSlide.styling?.transition || "fade",
        backgroundMusic: updatedSlide.styling?.backgroundMusic,
        musicVolume: updatedSlide.styling?.musicVolume || 50,
        musicLoop: updatedSlide.styling?.musicLoop || true,
        autoPlay: updatedSlide.styling?.autoPlay || true,
        showControls: updatedSlide.styling?.showControls || true,
      },
      createdAt: updatedSlide.created_at,
      isActive: updatedSlide.is_active,
      playCount: updatedSlide.content?.playCount || 0,
      lastPlayed: updatedSlide.content?.lastPlayed,
      publicLink: updatedSlide.content?.publicLink,
      slug: updatedSlide.content?.slug,
    };

    return res.status(200).json(transformedSlideshow);
  } catch (error) {
    console.error("Update slideshow error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteSlideshow(id: string, res: NextApiResponse) {
  try {
    const { data: deletedSlide, error } = await supabase
      .from("slides")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to delete slideshow" });
    }

    return res.status(200).json({ message: "Slideshow deleted successfully" });
  } catch (error) {
    console.error("Delete slideshow error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

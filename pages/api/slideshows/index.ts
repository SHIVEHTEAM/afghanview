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
  switch (req.method) {
    case "GET":
      return getSlideshows(req, res);
    case "POST":
      return createSlideshow(req, res);
    case "PATCH":
      return updateSlideshow(req, res);
    case "DELETE":
      return deleteSlideshow(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function getSlideshows(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { restaurantId, userId, slug } = req.query;

    if (!restaurantId && !slug) {
      return res
        .status(400)
        .json({ error: "restaurantId or slug is required" });
    }

    let query = supabase
      .from("slides")
      .select("*")
      .eq("type", "image")
      .order("created_at", { ascending: false });

    // Filter by slug if provided
    if (slug) {
      query = query.eq("content->slug", slug);
    } else if (restaurantId) {
      // Get slides for this restaurant AND template slides (null restaurant_id)
      query = query.or(
        `restaurant_id.eq.${restaurantId},restaurant_id.is.null`
      );
    }

    const { data: slideshows, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to fetch slideshows" });
    }

    console.log("[API] Fetched slideshows:", slideshows.length, "slides");
    slideshows.forEach((slide: any, index: number) => {
      console.log(`[API] Slide ${index}:`, {
        id: slide.id,
        name: slide.name,
        restaurant_id: slide.restaurant_id,
        is_template: slide.restaurant_id === null,
      });
    });

    // Transform the data to match frontend expectations
    const transformedSlideshows = slideshows.map((slide: any) => ({
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
      isTemplate: slide.restaurant_id === null,
    }));

    return res.status(200).json(transformedSlideshows);
  } catch (error) {
    console.error("Get slideshows error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createSlideshow(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, images, settings, restaurantId, userId, slug } = req.body;

    if (!name || !images || !restaurantId || !userId) {
      return res.status(400).json({
        error: "Missing required fields: name, images, restaurantId, userId",
      });
    }

    // Create the slideshow in the slides table
    const { data: slideData, error: slideError } = await supabase
      .from("slides")
      .insert({
        restaurant_id: restaurantId,
        name: name,
        type: "image",
        title: name,
        content: {
          images: images,
          settings: settings,
          playCount: 0,
          publicLink: `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/slideshow/${slug}`,
          slug: slug,
        },
        styling: {
          transition: settings.transition || "fade",
          backgroundMusic: settings.backgroundMusic,
          musicVolume: settings.musicVolume || 50,
          musicLoop: settings.musicLoop || true,
          autoPlay: settings.autoPlay || true,
          showControls: settings.showControls || true,
        },
        duration: settings.duration || 5000,
        is_active: true,
        is_published: false,
        created_by: userId === "default-user" ? null : userId, // Make optional for development
      })
      .select()
      .single();

    if (slideError) {
      console.error("Database error:", slideError);
      return res.status(500).json({ error: "Failed to create slideshow" });
    }

    // Transform the response to match frontend expectations
    const transformedSlideshow = {
      id: slideData.id,
      name: slideData.name,
      images: images,
      settings: settings,
      createdAt: slideData.created_at,
      isActive: slideData.is_active,
      playCount: 0,
      publicLink: `${process.env.NEXT_PUBLIC_BASE_URL}/slideshow/${slug}`,
      slug: slug,
    };

    return res.status(201).json(transformedSlideshow);
  } catch (error) {
    console.error("Create slideshow error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateSlideshow(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { playCount, lastPlayed, isActive, name, settings } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Slideshow ID is required" });
    }

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

    // Transform the response
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

async function deleteSlideshow(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Slideshow ID is required" });
    }

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

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { authenticateRequest } from "../../../lib/auth-middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Increase body size limit for video uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Allow up to 50MB for video uploads
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate all requests
  const authenticatedReq = await authenticateRequest(req, res);
  if (!authenticatedReq) return;

  if (req.method === "GET") {
    return getSlideshows(authenticatedReq, res);
  } else if (req.method === "POST") {
    return createSlideshow(authenticatedReq, res);
  } else if (req.method === "PUT") {
    return updateSlideshow(authenticatedReq, res);
  } else if (req.method === "DELETE") {
    return deleteSlideshow(authenticatedReq, res);
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function getSlideshows(req: any, res: NextApiResponse) {
  try {
    let query = supabase
      .from("slides")
      .select("*")
      .order("created_at", { ascending: false });

    // Restaurant owners can only see their slides
    if (req.user?.role === "restaurant_owner") {
      query = query.eq("restaurant_id", req.user.restaurant_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }

    // Transform slides data to match expected slideshow format
    const transformedSlideshows = (data || []).map((slide: any) => {
      // Extract images from content or create default structure
      let images = [];

      if (slide.content?.images && Array.isArray(slide.content.images)) {
        images = slide.content.images;
      } else if (slide.content?.slides && Array.isArray(slide.content.slides)) {
        images = slide.content.slides;
      } else if (
        slide.original_data?.images &&
        Array.isArray(slide.original_data.images)
      ) {
        images = slide.original_data.images;
      } else if (
        slide.original_data?.slides &&
        Array.isArray(slide.original_data.slides)
      ) {
        images = slide.original_data.slides;
      } else {
        // Create a default image structure if none exists
        images = [
          {
            id: slide.id,
            name: slide.name,
            type: slide.type || "image",
            file_path: slide.content?.file_path || slide.content?.url,
            url: slide.content?.url || slide.content?.file_path,
          },
        ];
      }

      return {
        id: slide.id,
        name: slide.name,
        images: images,
        settings: {
          defaultDuration: slide.duration || 5000,
          duration: slide.duration || 5000,
          transition: slide.styling?.transition || "fade",
          transitionDuration: slide.styling?.transitionDuration || 1000,
          backgroundMusic:
            slide.styling?.backgroundMusic || slide.background_music_url,
          musicVolume: slide.styling?.musicVolume || 50,
          musicLoop: slide.styling?.musicLoop || true,
          autoPlay: slide.styling?.autoPlay || true,
          showControls: slide.styling?.showControls || true,
          showProgress: slide.styling?.showProgress || true,
          loopSlideshow: slide.styling?.loopSlideshow || true,
          shuffleSlides: slide.styling?.shuffleSlides || false,
          aspectRatio: slide.styling?.aspectRatio || "16:9",
          quality: slide.styling?.quality || "high",
        },
        createdAt: slide.created_at,
        updatedAt: slide.updated_at,
        isActive: slide.is_active || false,
        playCount: slide.content?.playCount || 0,
        lastPlayed: slide.content?.lastPlayed,
        publicLink: slide.content?.publicLink,
        slug: slide.content?.slug,
        isFavorite: slide.content?.isFavorite || false,
        isTemplate: slide.content?.isTemplate || false,
        mediaType: slide.content?.mediaType || slide.type,
        slideshowType: slide.content?.slideshowType || slide.type,
        originalData: slide.original_data,
      };
    });

    return res.status(200).json(transformedSlideshows);
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createSlideshow(req: any, res: NextApiResponse) {
  try {
    const slideData = req.body;

    // Validate required fields
    if (!slideData.name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Ensure restaurant owners can only create slides for their restaurant
    if (req.user?.role === "restaurant_owner") {
      slideData.restaurant_id = req.user.restaurant_id;
    }

    // Add user info
    slideData.created_by = req.user?.id;
    slideData.updated_by = req.user?.id;

    const { data, error } = await supabase
      .from("slides")
      .insert(slideData)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateSlideshow(req: any, res: NextApiResponse) {
  try {
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Slide ID is required" });
    }

    // Check if user has permission to update this slide
    const { data: existingSlide, error: fetchError } = await supabase
      .from("slides")
      .select("restaurant_id, created_by")
      .eq("id", id)
      .single();

    if (fetchError || !existingSlide) {
      return res.status(404).json({ error: "Slide not found" });
    }

    // Restaurant owners can only update their own slides
    if (
      req.user?.role === "restaurant_owner" &&
      existingSlide.restaurant_id !== req.user.restaurant_id
    ) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    updateData.updated_by = req.user?.id;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("slides")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteSlideshow(req: any, res: NextApiResponse) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Slide ID is required" });
    }

    // Check if user has permission to delete this slide
    const { data: existingSlide, error: fetchError } = await supabase
      .from("slides")
      .select("restaurant_id, created_by")
      .eq("id", id)
      .single();

    if (fetchError || !existingSlide) {
      return res.status(404).json({ error: "Slide not found" });
    }

    // Restaurant owners can only delete their own slides
    if (
      req.user?.role === "restaurant_owner" &&
      existingSlide.restaurant_id !== req.user.restaurant_id
    ) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { error } = await supabase.from("slides").delete().eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Database error", details: error.message });
    }

    return res.status(200).json({ message: "Slide deleted successfully" });
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

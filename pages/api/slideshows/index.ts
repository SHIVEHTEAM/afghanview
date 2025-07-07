import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      .order("created_at", { ascending: false });

    // Filter by slug if provided
    if (slug) {
      // Use a safer approach to query by slug
      query = query.eq("content->>slug", slug);
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

    // Transform the data to match frontend expectations
    const transformedSlideshows = slideshows.map((slide: any) => {
      // Process images to ensure they have the correct type field
      const processedImagesForDisplay = (slide.content?.images || []).map(
        (image: any) => {
          // If this is a video slideshow, ensure all images have type: "video"
          if (slide.content?.mediaType === "video") {
            return {
              ...image,
              type: "video",
            };
          }
          return image;
        }
      );

      return {
        id: slide.id,
        name: slide.name,
        images: processedImagesForDisplay,
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
        mediaType: slide.content?.mediaType || "image", // Add mediaType to response
        slideshowType: slide.content?.mediaType || "image", // Add slideshowType to response
        originalData: slide.original_data, // Include original data in response
      };
    });

    return res.status(200).json(transformedSlideshows);
  } catch (error) {
    console.error("Get slideshows error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createSlideshow(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      name,
      images,
      settings,
      restaurantId,
      userId,
      slug,
      type,
      originalData,
    } = req.body;

    if (!name || !images || !restaurantId || !userId) {
      return res.status(400).json({
        error: "Missing required fields: name, images, restaurantId, userId",
      });
    }

    // Process images - videos should already be uploaded and have URLs
    let processedImages = images;
    if (type === "video") {
      // For video slideshows, ensure all items have proper URLs
      processedImages = images.map((image: any) => {
        if (image.type === "video") {
          return {
            ...image,
            file_path: image.url || image.file_path, // Use URL if available
            type: "video",
          };
        }
        return image;
      });
    }

    // Handle AI Facts - store SVG data directly in the database
    if (type === "ai-facts") {
      processedImages = images.map((image: any, index: number) => {
        // For AI Facts, store the SVG data URL directly in the file_path
        // This avoids Supabase storage MIME type restrictions
        return {
          ...image,
          file_path: image.file_path || image.url || image.file, // Use the data URL from file_path, url, or file
          type: "image",
        };
      });
    }

    // Create the slideshow in the slides table
    const { data: slideData, error: slideError } = await supabase
      .from("slides")
      .insert({
        restaurant_id: restaurantId,
        name: name,
        type: "image", // Use "image" type for all slideshows (including video)
        title: name,
        content: {
          images: processedImages,
          settings: settings,
          playCount: 0,
          publicLink: `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/slideshow/${slug}`,
          slug: slug,
          mediaType: type, // Store the actual media type (video/image) in content
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
        original_data: originalData || null, // Store the original structured data
      })
      .select()
      .single();

    if (slideError) {
      console.error("Database error:", slideError);
      return res.status(500).json({ error: "Failed to create slideshow" });
    }

    // Transform the response to match frontend expectations
    const processedImagesForResponse = (slideData.content?.images || []).map(
      (image: any) => {
        // If this is a video slideshow, ensure all images have type: "video"
        if (slideData.content?.mediaType === "video") {
          return {
            ...image,
            type: "video",
          };
        }
        return image;
      }
    );

    const response = {
      id: slideData.id,
      name: slideData.name,
      images: processedImagesForResponse,
      settings: {
        defaultDuration: slideData.duration || 5000,
        duration: slideData.duration || 5000,
        transition: slideData.styling?.transition || "fade",
        backgroundMusic: slideData.styling?.backgroundMusic,
        musicVolume: slideData.styling?.musicVolume || 50,
        musicLoop: slideData.styling?.musicLoop || true,
        autoPlay: slideData.styling?.autoPlay || true,
        showControls: slideData.styling?.showControls || true,
      },
      createdAt: slideData.created_at,
      isActive: slideData.is_active,
      playCount: slideData.content?.playCount || 0,
      lastPlayed: slideData.content?.lastPlayed,
      publicLink: slideData.content?.publicLink,
      slug: slideData.content?.slug,
      isTemplate: slideData.restaurant_id === null,
      mediaType: slideData.content?.mediaType || "image",
      slideshowType: type, // Add slideshow type to response
      originalData: slideData.original_data, // Include original data in response
    };

    console.log("[API] Slideshow created successfully:", {
      id: slideData.id,
      name: slideData.name,
      type: type,
      hasOriginalData: !!originalData,
    });

    return res.status(201).json(response);
  } catch (error) {
    console.error("Create slideshow error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateSlideshow(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { playCount, lastPlayed, isActive, name, settings, originalData } =
      req.body;

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
    if (originalData !== undefined) updateData.original_data = originalData;
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
    const processedImagesForUpdate = (updatedSlide.content?.images || []).map(
      (image: any) => {
        // If this is a video slideshow, ensure all images have type: "video"
        if (updatedSlide.content?.mediaType === "video") {
          return {
            ...image,
            type: "video",
          };
        }
        return image;
      }
    );

    const transformedSlideshow = {
      id: updatedSlide.id,
      name: updatedSlide.name,
      images: processedImagesForUpdate,
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
      slideshowType: updatedSlide.content?.mediaType || "image",
      originalData: updatedSlide.original_data,
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

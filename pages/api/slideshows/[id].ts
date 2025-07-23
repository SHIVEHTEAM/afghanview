import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
// Remove NextAuth imports
// import { getToken } from "next-auth/jwt";
// import { authOptions } from "../../../lib/auth";
// If you see a linter error here, restart your dev server or reinstall node_modules. This is the correct import for NextAuth v4+.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Slideshow ID is required" });
  }

  if (req.method === "GET") {
    try {
      // Always fetch the slideshow first
      let { data: slideshow, error: slideshowError } = await supabase
        .from("slideshows")
        .select("*")
        .eq("id", id)
        .single();

      // If not found in slideshows, try slides table and convert
      if (slideshowError && slideshowError.code === "PGRST116") {
        const { data: slide, error: slideError } = await supabase
          .from("slides")
          .select("*")
          .eq("id", id)
          .single();

        if (slideError) {
          return res.status(404).json({ error: "Slideshow not found" });
        }

        // Convert slide to slideshow format
        slideshow = {
          id: slide.id,
          title: slide.name || slide.title,
          description: slide.subtitle,
          business_id: slide.business_id,
          business_type: slide.business_type || "restaurant",
          is_active: slide.is_active,
          settings: slide.styling || {},
          content: slide.content || {},
          created_at: slide.created_at,
          updated_at: slide.updated_at,
          created_by: slide.created_by,
          updated_by: slide.updated_by,
        };
      } else if (slideshowError) {
        return res.status(500).json({ error: "Database error" });
      }

      if (!slideshow) {
        return res.status(404).json({ error: "Slideshow not found" });
      }

      // Extract images from slideshow content
      let images: any[] = [];
      if (
        slideshow.content?.slides &&
        Array.isArray(slideshow.content.slides)
      ) {
        images = slideshow.content.slides;
      } else if (
        slideshow.content?.images &&
        Array.isArray(slideshow.content.images)
      ) {
        images = slideshow.content.images;
      } else if (slideshow.images && Array.isArray(slideshow.images)) {
        images = slideshow.images;
      }

      // Process images to ensure they have proper URLs
      const processedImages = images.map((image, index) => {
        let processedImage = { ...image };
        if (image.base64) {
          processedImage.url = image.base64;
        } else if (image.url) {
          processedImage.url = image.url;
        } else if (image.file_path) {
          if (image.file_path.startsWith("http")) {
            processedImage.url = image.file_path;
          } else if (image.file_path.startsWith("data:")) {
            processedImage.url = image.file_path;
          } else {
            processedImage.url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/slideshow-media/${image.file_path}`;
          }
        } else if (image.image_url) {
          processedImage.url = image.image_url;
        }
        return processedImage;
      });

      // Return slideshow with processed images
      const responseSlideshow = {
        ...slideshow,
        images: processedImages,
        content: {
          ...slideshow.content,
          slides: processedImages,
        },
      };

      return res.status(200).json(responseSlideshow);
    } catch (err) {
      console.error("Error fetching slideshow:", err);
      return res.status(500).json({ error: "Failed to load slideshow" });
    }
  }

  // For non-GET methods, require authentication
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userId = user.id;

  if (req.method === "PATCH") {
    try {
      const { isActive, is_active, settings } = req.body;

      // Handle both field names for compatibility
      const shouldActivate = isActive !== undefined ? isActive : is_active;

      // Prepare update data
      const updateData: any = {};

      if (typeof shouldActivate === "boolean") {
        updateData.is_active = shouldActivate;
      }

      // Handle music settings
      if (settings) {
        const currentSettings = updateData.settings || {};
        updateData.settings = {
          ...currentSettings,
          ...settings,
        };
      }

      // First try to update in slideshows table
      let { data: updatedSlideshow, error } = await supabase
        .from("slideshows")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      // If not found in slideshows table, try slides table
      if (error || !updatedSlideshow) {
        const { data: updatedSlide, error: slideError } = await supabase
          .from("slides")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (slideError || !updatedSlide) {
          return res.status(404).json({ error: "Slideshow not found" });
        }

        updatedSlideshow = updatedSlide;
      }

      res.status(200).json({
        success: true,
        isActive: updatedSlideshow.is_active,
        settings: updatedSlideshow.settings,
        message: `Slideshow updated successfully`,
      });
    } catch (error) {
      console.error("Error updating slideshow:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "HEAD") {
    // Quick status check for polling
    try {
      // First try to find in slideshows table
      let { data: slideshow, error } = await supabase
        .from("slideshows")
        .select("is_active")
        .eq("id", id)
        .single();

      // If not found in slideshows table, try slides table
      if (error || !slideshow) {
        const { data: slide, error: slideError } = await supabase
          .from("slides")
          .select("is_active")
          .eq("id", id)
          .single();

        if (slideError || !slide) {
          return res.status(404).json({ error: "Slideshow not found" });
        }

        slideshow = slide;
      }

      // Return 403 if slideshow is not active, 200 if active
      if (!slideshow.is_active) {
        return res.status(403).json({ error: "Slideshow is not active" });
      }

      return res.status(200).json({ status: "active" });
    } catch (error) {
      console.error("Error checking slideshow status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    // --- Role check start ---
    // Get user from headers/session (example: from a custom header or cookie)
    // You should replace this with your actual auth/session logic
    // const userId = req.headers["x-user-id"] || req.cookies["user_id"];
    // if (!userId) {
    //   return res.status(401).json({ error: "Not authenticated" });
    // }
    // Find the slideshow to get business_id
    const { data: slideshow, error: fetchError } = await supabase
      .from("slideshows")
      .select("business_id")
      .eq("id", id)
      .single();
    if (fetchError || !slideshow) {
      return res.status(404).json({ error: "Slideshow not found" });
    }
    // Find the user's role for this business
    const { data: staff, error: staffError } = await supabase
      .from("business_staff")
      .select("role")
      .eq("user_id", userId)
      .eq("business_id", slideshow.business_id)
      .eq("is_active", true)
      .single();
    if (staffError || !staff) {
      // Check if user is the owner in businesses table
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("user_id")
        .eq("id", slideshow.business_id)
        .single();
      if (business && business.user_id === userId) {
        // Allow owner to delete
        return await deleteSlideshow(id, res);
      }
      return res
        .status(403)
        .json({ error: "No permission to delete slideshow" });
    }
    if (staff.role !== "owner" && staff.role !== "manager") {
      return res
        .status(403)
        .json({ error: "Only owner or manager can delete slideshow" });
    }
    // --- Role check end ---
    return await deleteSlideshow(id, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function getSlideshow(id: string, res: NextApiResponse) {
  try {
    const { data: slide, error } = await supabase
      .from("slides")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(404).json({ error: "Slideshow not found" });
    }

    // Process images to ensure they have the correct type field
    const processedImages = (slide.content?.images || []).map((image: any) => {
      // If this is a video slideshow, ensure all images have type: "video"
      if (slide.content?.mediaType === "video") {
        return {
          ...image,
          type: "video",
        };
      }
      return image;
    });

    const transformedSlideshow = {
      id: slide.id,
      name: slide.name,
      images: processedImages,
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
      mediaType: slide.content?.mediaType || "image",
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
    const { playCount, lastPlayed, isActive, name, settings, images } =
      req.body;

    const updateData: any = {};

    // Update content fields
    if (
      playCount !== undefined ||
      lastPlayed !== undefined ||
      images !== undefined
    ) {
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
        ...(images !== undefined && { images }),
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

    // Process images to ensure they have the correct type field
    const processedImages = (updatedSlide.content?.images || []).map(
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
      images: processedImages,
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
      mediaType: updatedSlide.content?.mediaType || "image",
    };

    return res.status(200).json(transformedSlideshow);
  } catch (error) {
    console.error("Update slideshow error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteSlideshow(id: string, res: NextApiResponse) {
  try {
    // First try to delete from slideshows table
    let { data: deletedSlideshow, error } = await supabase
      .from("slideshows")
      .delete()
      .eq("id", id)
      .select()
      .single();

    // If not found in slideshows table, try slides table
    if (error || !deletedSlideshow) {
      const { data: deletedSlide, error: slideError } = await supabase
        .from("slides")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (slideError || !deletedSlide) {
        console.error("Database error:", slideError);
        return res.status(500).json({ error: "Failed to delete slideshow" });
      }
    }

    return res.status(200).json({ message: "Slideshow deleted successfully" });
  } catch (error) {
    console.error("Delete slideshow error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

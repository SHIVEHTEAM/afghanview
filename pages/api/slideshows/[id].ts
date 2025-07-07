import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

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
      // Fetch slideshow data from database
      const { data: slideshow, error } = await supabase
        .from("slides")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !slideshow) {
        return res.status(404).json({ error: "Slideshow not found" });
      }

      console.log("Raw slideshow data:", slideshow); // Debug log

      // Check if slideshow is active
      if (!slideshow.is_active) {
        return res.status(403).json({
          error: "Slideshow is not active",
          isActive: false,
        });
      }

      // Extract images from multiple possible locations with better debugging
      let images = [];
      console.log("Slideshow content:", slideshow.content);
      console.log("Slideshow mediaType:", slideshow.content?.mediaType);
      console.log("Slideshow original_data:", slideshow.original_data);

      // Try multiple sources for images
      if (
        slideshow.content?.images &&
        Array.isArray(slideshow.content.images)
      ) {
        console.log(
          "Found images in content.images:",
          slideshow.content.images.length
        );
        images = slideshow.content.images;
      } else if (slideshow.images && Array.isArray(slideshow.images)) {
        console.log(
          "Found images in slideshow.images:",
          slideshow.images.length
        );
        images = slideshow.images;
      } else if (slideshow.media && Array.isArray(slideshow.media)) {
        console.log("Found images in slideshow.media:", slideshow.media.length);
        images = slideshow.media;
      } else if (
        slideshow.original_data?.images &&
        Array.isArray(slideshow.original_data.images)
      ) {
        console.log(
          "Found images in original_data.images:",
          slideshow.original_data.images.length
        );
        images = slideshow.original_data.images;
      } else if (
        slideshow.original_data?.slides &&
        Array.isArray(slideshow.original_data.slides)
      ) {
        console.log(
          "Found images in original_data.slides:",
          slideshow.original_data.slides.length
        );
        images = slideshow.original_data.slides;
      } else if (
        slideshow.original_data?.facts &&
        Array.isArray(slideshow.original_data.facts)
      ) {
        console.log(
          "Found facts in original_data.facts:",
          slideshow.original_data.facts.length
        );
        images = slideshow.original_data.facts;
      } else if (
        slideshow.original_data?.menuItems &&
        Array.isArray(slideshow.original_data.menuItems)
      ) {
        console.log(
          "Found menuItems in original_data.menuItems:",
          slideshow.original_data.menuItems.length
        );
        images = slideshow.original_data.menuItems;
      }

      console.log("Final extracted images count:", images.length);

      // Process images to ensure they have the correct type field
      const processedImages = images.map((image: any, index: number) => {
        console.log(`Processing image ${index}:`, image);

        let processedImage = { ...image };

        // If this is a video slideshow, ensure all images have type: "video"
        if (slideshow.content?.mediaType === "video") {
          processedImage.type = "video";
          console.log(`Image ${index} marked as video`);
        }

        // For AI facts slideshows, ensure proper structure
        if (
          slideshow.content?.mediaType === "ai-facts" ||
          slideshow.original_data?.type === "ai-facts"
        ) {
          // AI facts might be stored differently, ensure they have the right structure
          if (image.text && !image.name) {
            processedImage.name = `AI Fact ${index + 1}`;
          }

          // Convert AI fact text to SVG image if no file_path exists
          if (image.text && !image.file_path && !image.url && !image.base64) {
            const backgroundColor = image.backgroundColor || "#1f2937";
            const fontColor = image.fontColor || "#ffffff";
            const fontSize = image.fontSize || 48;

            // Create SVG for the fact
            const svgContent = `
              <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
                <rect width="100%" height="100%" fill="${backgroundColor}"/>
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
                      font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" 
                      fill="${fontColor}" text-align="center">
                  ${image.text
                    .replace(/"/g, "&quot;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")}
                </text>
              </svg>
            `;

            processedImage.base64 = `data:image/svg+xml;base64,${Buffer.from(
              svgContent
            ).toString("base64")}`;
            console.log(`Image ${index} converted to SVG for AI fact`);
          }

          if (image.image_url && !image.file_path && !image.url) {
            processedImage.file_path = image.image_url;
          }
        }

        // For menu slideshows, ensure proper structure
        if (
          slideshow.content?.mediaType === "menu" ||
          slideshow.original_data?.type === "menu"
        ) {
          if (image.name && !processedImage.name) {
            processedImage.name = image.name;
          }
          if (image.image_url && !image.file_path && !image.url) {
            processedImage.file_path = image.image_url;
          }
        }

        console.log(`Processed image ${index}:`, processedImage);
        return processedImage;
      });

      console.log("Processed images:", processedImages);

      // Parse the slideshow data in the same format as main slideshows API
      const slideshowData = {
        id: slideshow.id,
        name: slideshow.name,
        images: processedImages,
        settings: {
          defaultDuration: slideshow.duration || 5000,
          duration: slideshow.duration || 5000,
          transition: slideshow.styling?.transition || "fade",
          backgroundMusic: slideshow.styling?.backgroundMusic,
          musicVolume: slideshow.styling?.musicVolume || 50,
          musicLoop: slideshow.styling?.musicLoop || true,
          autoPlay: slideshow.styling?.autoPlay || true,
          showControls: slideshow.styling?.showControls || true,
        },
        isActive: slideshow.is_active || false,
        createdAt: slideshow.created_at,
        updatedAt: slideshow.updated_at,
        playCount: slideshow.content?.playCount || 0,
        lastPlayed: slideshow.content?.lastPlayed,
        publicLink: slideshow.content?.publicLink,
        slug: slideshow.content?.slug,
        mediaType:
          slideshow.content?.mediaType ||
          slideshow.original_data?.type ||
          "image",
        slideshowType:
          slideshow.content?.mediaType ||
          slideshow.original_data?.type ||
          "image",
        originalData: slideshow.original_data,
      };

      console.log("Final processed slideshow data:", slideshowData);

      res.status(200).json(slideshowData);
    } catch (error) {
      console.error("Error fetching slideshow:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "PATCH") {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }

      // Update the slideshow in the database
      const { data: updatedSlideshow, error } = await supabase
        .from("slides")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Failed to update slideshow" });
      }

      res.status(200).json({
        success: true,
        isActive: updatedSlideshow.is_active,
        message: `Slideshow ${
          isActive ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error) {
      console.error("Error updating slideshow:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
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

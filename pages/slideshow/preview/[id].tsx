import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { SimpleImageViewer } from "../../../components/slideshow";
import { MenuSVGGenerator } from "../../../components/slideshow-creator/menu/svg-generator";

interface Slideshow {
  id: string;
  title: string;
  name?: string;
  description?: string;
  content?: {
    slides?: any[];
    images?: any[];
    [key: string]: any;
  };
  settings?: {
    duration?: number;
    transition?: string;
    background_music?: string;
    [key: string]: any;
  };
  images?: any[];
}

export default function SlideshowPreview() {
  const router = useRouter();
  const { id } = router.query;
  const [slideshow, setSlideshow] = useState<Slideshow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchSlideshow();
    }
  }, [id]);

  const fetchSlideshow = async () => {
    try {
      const response = await fetch(`/api/slideshows/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load slideshow");
      }

      const data = await response.json();
      setSlideshow(data);
    } catch (error) {
      console.error("Error fetching slideshow:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load slideshow"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !slideshow) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Slideshow Not Found</h1>
          <p className="text-gray-400">
            {error || "The slideshow could not be found"}
          </p>
        </div>
      </div>
    );
  }

  // Convert slideshow content to SimpleImageViewer format
  const allMedia = (() => {
    // Priority 1: Use slides array (new format) if available
    if (slideshow.content?.slides && slideshow.content.slides.length > 0) {
      return slideshow.content.slides.map((slide: any, index: number) => {
        // Handle menu items by generating SVG on-demand
        if (slide.type === "menu" && slide.menuData) {
          const svgDataUrl = MenuSVGGenerator.generateMenuSlide(
            slide.menuData.item,
            slide.menuData.theme,
            slide.menuData.layout
          );
          return {
            id: slide.id || `slide-${index}`,
            name: slide.name || slide.alt || `Slide ${index + 1}`,
            url: svgDataUrl,
            file_path: svgDataUrl,
            type: "image" as const,
          };
        }

        // Handle regular slides
        return {
          id: slide.id || `slide-${index}`,
          name: slide.name || slide.alt || `Slide ${index + 1}`,
          url: slide.url || slide.file_path,
          file_path: slide.file_path || slide.url,
          type: slide.type || ("image" as const),
        };
      });
    }

    // Priority 2: Use images array (legacy format) if slides is empty
    if (slideshow.content?.images && slideshow.content.images.length > 0) {
      return slideshow.content.images.map((img: any, index: number) => ({
        id: img.id || `img-${index}`,
        name: img.name || img.alt || `Image ${index + 1}`,
        url: img.url || img.file_path,
        file_path: img.file_path || img.url,
        type: "image" as const,
      }));
    }

    // Priority 3: Use top-level images array if content.images is empty
    if (slideshow.images && slideshow.images.length > 0) {
      return slideshow.images.map((img: any, index: number) => ({
        id: img.id || `img-${index}`,
        name: img.name || img.alt || `Image ${index + 1}`,
        url: img.url || img.file_path,
        file_path: img.file_path || img.url,
        type: "image" as const,
      }));
    }

    // Priority 4: Use videos array if no images found
    if (slideshow.content?.videos && slideshow.content.videos.length > 0) {
      return slideshow.content.videos.map((vid: any, index: number) => ({
        id: vid.id || `vid-${index}`,
        name: vid.name || vid.alt || `Video ${index + 1}`,
        url: vid.url || vid.file_path,
        file_path: vid.file_path || vid.url,
        type: "video" as const,
      }));
    }

    // Fallback: empty array
    return [];
  })();

  const settings = {
    duration: slideshow.settings?.duration || 5000,
    transition: slideshow.settings?.transition || "fade",
    autoPlay: true,
    showControls: true,
    tvMode: false,
    backgroundMusic:
      slideshow.settings?.backgroundMusic ||
      slideshow.settings?.background_music,
    musicVolume:
      slideshow.settings?.musicVolume || slideshow.settings?.music_volume || 50,
    musicLoop:
      slideshow.settings?.musicLoop || slideshow.settings?.music_loop || true,
  };

  return (
    <>
      <Head>
        <title>{slideshow.title || slideshow.name} - Preview</title>
        <meta
          name="description"
          content={`Preview: ${slideshow.title || slideshow.name}`}
        />
      </Head>

      <SimpleImageViewer
        images={allMedia}
        settings={settings}
        onClose={() => window.close()}
      />
    </>
  );
}

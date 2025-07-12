import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Home,
} from "lucide-react";
import { SimpleImageViewer } from "../../components/slideshow";

interface SlideImage {
  id: string;
  file: File;
  url: string;
  name: string;
  base64?: string;
}

interface SlideshowSettings {
  duration: number;
  transition: "fade" | "slide" | "zoom" | "flip" | "bounce";
  backgroundMusic?: File | string;
  musicVolume: number;
  musicLoop: boolean;
  autoPlay: boolean;
  showControls: boolean;
}

interface SavedSlideshow {
  id: string;
  images: SlideImage[];
  settings: SlideshowSettings;
  createdAt: Date;
  name: string;
  isActive: boolean;
  playCount: number;
  lastPlayed?: Date;
  publicLink?: string;
  slug?: string;
}

export default function PublicSlideshow() {
  const router = useRouter();
  const { slug } = router.query;
  const [slideshow, setSlideshow] = useState<SavedSlideshow | null>(null);
  const [showNotFound, setShowNotFound] = useState(false);

  // Load slideshow from API
  useEffect(() => {
    if (slug) {
      const loadSlideshow = async () => {
        try {
          // Try to load by ID first (treat slug as ID if it's not a valid slug)
          const response = await fetch(`/api/slideshows/${slug}`);
          if (response.ok) {
            const foundSlideshow = await response.json();
            if (foundSlideshow) {
              // Convert dates
              const slideshowWithDates = {
                ...foundSlideshow,
                createdAt: new Date(foundSlideshow.created_at),
                lastPlayed: foundSlideshow.last_played
                  ? new Date(foundSlideshow.last_played)
                  : undefined,
                name: foundSlideshow.title, // Map title to name for compatibility
                images:
                  foundSlideshow.content?.slides ||
                  foundSlideshow.content?.images ||
                  [], // Extract images from content
              };
              setSlideshow(slideshowWithDates);

              // Update play count via API
              try {
                await fetch(`/api/slideshows/${foundSlideshow.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    play_count: (foundSlideshow.play_count || 0) + 1,
                    last_played: new Date().toISOString(),
                  }),
                });
              } catch (error) {
                console.error("Failed to update play count:", error);
              }
              return;
            }
          }

          // If not found by ID, try to find by slug (legacy support)
          const slugResponse = await fetch(`/api/slideshows?slug=${slug}`);
          if (slugResponse.ok) {
            const slideshows = await slugResponse.json();
            const foundSlideshow = slideshows.find((s: any) => s.slug === slug);
            if (foundSlideshow) {
              // Convert dates
              const slideshowWithDates = {
                ...foundSlideshow,
                createdAt: new Date(foundSlideshow.createdAt),
                lastPlayed: foundSlideshow.lastPlayed
                  ? new Date(foundSlideshow.lastPlayed)
                  : undefined,
              };
              setSlideshow(slideshowWithDates);

              // Update play count via API
              try {
                await fetch(`/api/slideshows/${foundSlideshow.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    playCount: (foundSlideshow.playCount || 0) + 1,
                    lastPlayed: new Date().toISOString(),
                  }),
                });
              } catch (error) {
                console.error("Failed to update play count:", error);
              }
              return;
            }
          }

          setShowNotFound(true);
        } catch (error) {
          console.error("Error loading slideshow:", error);
          setShowNotFound(true);
        }
      };

      loadSlideshow();
    }
  }, [slug]);

  if (showNotFound) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Slideshow Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The slideshow you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!slideshow) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading slideshow...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{slideshow.name} - Shivehview Slideshow</title>
        <meta
          name="description"
          content={`Viewing slideshow: ${slideshow.name} on Shivehview`}
        />
      </Head>

      <SimpleImageViewer
        images={slideshow.images}
        settings={{
          duration: slideshow.settings.duration || 5000,
          transition: slideshow.settings.transition as any,
          autoPlay: slideshow.settings.autoPlay || true,
          showControls: slideshow.settings.showControls || true,
        }}
        onClose={() => router.push("/")}
      />
    </>
  );
}

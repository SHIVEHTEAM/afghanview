import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";

interface SlideImage {
  id: string;
  name: string;
  url?: string;
  base64?: string;
  file_path?: string;
}

interface SlideshowSettings {
  defaultDuration: number;
  transition: string;
  backgroundMusic?: string;
}

interface Slideshow {
  id: string;
  name: string;
  images: SlideImage[];
  settings: SlideshowSettings;
  isActive: boolean;
}

export default function TvDisplay() {
  const router = useRouter();
  const { id } = router.query;
  const [slideshow, setSlideshow] = useState<Slideshow | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load slideshow data from backend
  useEffect(() => {
    if (!id) return;
    const fetchSlideshow = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/slideshows/${id}`);
        if (!res.ok) throw new Error("Slideshow not found");
        const data = await res.json();
        setSlideshow(data);
      } catch (err: any) {
        setError(err.message || "Failed to load slideshow");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlideshow();
  }, [id]);

  // Convert images to URLs
  useEffect(() => {
    if (!slideshow) return;
    const convertImagesToUrls = async () => {
      const urls: string[] = [];
      for (const image of slideshow.images) {
        let url = "";
        if (image.base64) url = image.base64;
        else if (image.url) url = image.url;
        else if (image.file_path) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          if (supabaseUrl) {
            const possibleUrls = [
              `${supabaseUrl}/storage/v1/object/public/slideshow-media/${image.file_path}`,
              `${supabaseUrl}/storage/v1/object/public/slideshow-media/${image.file_path.replace(
                /^restaurants\//,
                ""
              )}`,
              `${supabaseUrl}/storage/v1/object/public/slide-images/${image.file_path}`,
              `${supabaseUrl}/storage/v1/object/public/slide-images/${image.file_path.replace(
                /^restaurants\//,
                ""
              )}`,
            ];
            for (const testUrl of possibleUrls) {
              try {
                const response = await fetch(testUrl, { method: "HEAD" });
                if (response.ok) {
                  url = testUrl;
                  break;
                }
              } catch {}
            }
            if (!url) {
              url = `${supabaseUrl}/storage/v1/object/public/slideshow-media/${image.file_path}`;
            }
          }
        }
        if (!url) {
          url =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NjAgNTQwQzk0MC4wOSA1NDAgOTI0IDUyMy45MSA5MjQgNTA0QzkyNCA0ODQuMDkgOTQwLjA5IDQ2OCA5NjAgNDY4Qzk3OS45MSA0NjggOTk2IDQ4NC4wOSA5OTYgNTA0Qzk5NiA1MjMuOTEgOTc5LjkxIDU0MCA5NjAgNTQwWiIgZmlsbD0iIzlCOUJBQCIvPgo8cGF0aCBkPSJNOTI0IDY3MkM5MjQgNjUyLjA5IDk0MC4wOSA2MzYgOTYwIDYzNkM5NzkuOTEgNjM2IDk5NiA2NTIuMDkgOTk2IDY3MlY3MjBDOTk2IDczOS45MSA5NzkuOTEgNzU2IDk2MCA3NTZDOTQwLjA5IDc1NiA5MjQgNzM5LjkxIDkyNCA3MjBWNjcyWiIgZmlsbD0iIzlCOUJBQCIvPgo8L3N2Zz4K";
        }
        urls.push(url);
      }
      setImageUrls(urls);
    };
    convertImagesToUrls();
  }, [slideshow]);

  // Auto-advance slides
  useEffect(() => {
    if (!slideshow || slideshow.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshow.images.length);
    }, slideshow.settings.defaultDuration || 5000);
    return () => clearInterval(interval);
  }, [slideshow]);

  // Request fullscreen on load
  useEffect(() => {
    const requestFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    const timer = setTimeout(requestFullscreen, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle image load error
  const handleImageError = (index: number) => {
    if (slideshow && slideshow.images.length > 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slideshow.images.length);
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Slideshow...</title>
        </Head>
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-white text-2xl">Loading slideshow...</div>
        </div>
      </>
    );
  }

  if (error || !slideshow) {
    return (
      <>
        <Head>
          <title>Slideshow Error</title>
        </Head>
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-xl mb-2">Slideshow Unavailable</div>
            <div className="text-gray-400">
              {error || "Slideshow not found"}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (slideshow.images.length === 0) {
    return (
      <>
        <Head>
          <title>No Images</title>
        </Head>
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-4">🖼️</div>
            <div className="text-xl">No Images Available</div>
            <div className="text-gray-400">
              This slideshow has no images to display
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{slideshow.name} - TV Display</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>
      <div className="fixed inset-0 bg-black overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={imageUrls[currentIndex]}
            alt={slideshow.images[currentIndex]?.name || "Slideshow image"}
            className="w-full h-full object-cover select-none pointer-events-none"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1 }}
            draggable={false}
            onError={() => handleImageError(currentIndex)}
          />
        </AnimatePresence>
        {/* Minimal progress indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {slideshow.images.length > 1 &&
              slideshow.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white bg-opacity-30"
                  }`}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

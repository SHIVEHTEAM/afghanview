import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Tv,
  Monitor,
} from "lucide-react";

interface ImageData {
  id: string;
  name: string;
  url?: string;
  base64?: string;
  file_path?: string;
  file?: File;
  type?: "image" | "video";
}

interface SimpleImageViewerProps {
  images: ImageData[];
  settings: {
    duration?: number;
    transition?: string;
    autoPlay?: boolean;
    showControls?: boolean;
    tvMode?: boolean;
  };
  onClose: () => void;
}

export default function SimpleImageViewer({
  images,
  settings,
  onClose,
}: SimpleImageViewerProps) {
  console.log("[SimpleImageViewer] Received images:", images);
  console.log("[SimpleImageViewer] Received settings:", settings);

  // Debug: Log the images array
  console.log("[SimpleImageViewer] images prop:", images);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(settings.autoPlay ?? true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(
    settings.showControls ?? true
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tvMode, setTvMode] = useState(settings.tvMode ?? false);
  const [isActuallyFullscreen, setIsActuallyFullscreen] = useState(false);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsActuallyFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    handleFullscreenChange();
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Clean up scrollbars and force full height in any fullscreen mode
  const isCleanFullscreen = tvMode || isActuallyFullscreen;
  useEffect(() => {
    if (!isCleanFullscreen) return;
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, [isCleanFullscreen]);

  // Convert images to URLs
  useEffect(() => {
    const convertImagesToUrls = async () => {
      const urls: string[] = [];

      for (const image of images) {
        let url = "";
        // Debug: Log the image object
        console.log("[SimpleImageViewer] Processing image:", image);
        // Priority 1: Base64
        if (image.base64) {
          url = image.base64;
        }
        // Priority 2: Direct URL
        else if (image.url) {
          url = image.url;
        }
        // Priority 3: File path (Supabase) - only if it's not a blob URL
        else if (image.file_path && !image.file_path.startsWith("blob:")) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          if (supabaseUrl) {
            // Use the exact file_path without modification
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

            // Test each URL
            for (const testUrl of possibleUrls) {
              try {
                const response = await fetch(testUrl, { method: "HEAD" });
                console.log(
                  "[SimpleImageViewer] Testing URL:",
                  testUrl,
                  "Status:",
                  response.status
                );
                if (response.ok) {
                  url = testUrl;
                  console.log("[SimpleImageViewer] ✅ Found working URL:", url);
                  break;
                }
              } catch (error) {
                console.log(
                  "[SimpleImageViewer] ❌ URL failed:",
                  testUrl,
                  error
                );
              }
            }

            // If no working URL found, use the default with exact path
            if (!url) {
              url = `${supabaseUrl}/storage/v1/object/public/slideshow-media/${image.file_path}`;
              console.log("[SimpleImageViewer] Using default URL:", url);
            }
          }
        }
        // Priority 3.5: Blob URL (if file_path is a blob URL)
        else if (image.file_path && image.file_path.startsWith("blob:")) {
          url = image.file_path;
          console.log("[SimpleImageViewer] Using blob URL:", url);
        }
        // Priority 4: File object
        else if (image.file) {
          url = URL.createObjectURL(image.file);
        }
        // Fallback: Placeholder
        else {
          url =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NjAgNTQwQzk0MC4wOSA1NDAgOTI0IDUyMy45MSA5MjQgNTA0QzkyNCA0ODQuMDkgOTQwLjA5IDQ2OCA5NjAgNDY4Qzk3OS45MSA0NjggOTk2IDQ4NC4wOSA5OTYgNTA0Qzk5NiA1MjMuOTEgOTc5LjkxIDU0MCA5NjAgNTQwWiIgZmlsbD0iIzlCOUJBQCIvPgo8cGF0aCBkPSJNOTI0IDY3MkM5MjQgNjUyLjA5IDk0MC4wOSA2MzYgOTYwIDYzNkM5NzkuOTEgNjM2IDk5NiA2NTIuMDkgOTk2IDY3MlY3MjBDOTk2IDczOS45MSA5NzkuOTEgNzU2IDk2MCA3NTZDOTQwLjA5IDc1NiA5MjQgNzM5LjkxIDkyNCA3MjBWNjcyWiIgZmlsbD0iIzlCOUJBQCIvPgo8L3N2Zz4K";
        }
        // Debug: Log the final URL for this image
        console.log("[SimpleImageViewer] Final image URL:", url);
        urls.push(url);
      }

      setImageUrls(urls);
      setIsLoading(false);
    };

    if (images.length > 0) {
      convertImagesToUrls();
    }
  }, [images]);

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, settings.duration || 5000);

    return () => clearInterval(interval);
  }, [isPlaying, images.length, settings.duration]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (!tvMode) onClose();
          break;
        case " ":
          if (!tvMode) {
            e.preventDefault();
            setIsPlaying(!isPlaying);
          }
          break;
        case "ArrowLeft":
          if (!tvMode) {
            setCurrentIndex(
              (prev) => (prev - 1 + images.length) % images.length
            );
          }
          break;
        case "ArrowRight":
          if (!tvMode) {
            setCurrentIndex((prev) => (prev + 1) % images.length);
          }
          break;
        case "f":
          if (!tvMode) toggleFullscreen();
          break;
        case "t":
          if (!tvMode) setTvMode(true);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, images.length, onClose, tvMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const getTransitionClass = (transition: string = "fade") => {
    switch (transition) {
      case "slide":
        return "slide";
      case "zoom":
        return "zoom";
      case "flip":
        return "flip";
      default:
        return "fade";
    }
  };

  // Handle image load success/error
  const handleImageLoad = useCallback(() => {
    console.log("[SimpleImageViewer] Image loaded successfully");
  }, []);

  const handleImageError = useCallback((error: any) => {
    console.error("[SimpleImageViewer] Image failed to load:", error);
  }, []);

  // Helper function to detect video files
  const isVideoFile = (url: string, imageIndex: number = 0): boolean => {
    if (!url) return false;

    // First check if the image object has a type field
    const currentImage = images[imageIndex];
    console.log(
      "[SimpleImageViewer] Checking video for index",
      imageIndex,
      ":",
      {
        url: url?.substring(0, 100) + "...",
        currentImage: currentImage,
        type: currentImage?.type,
      }
    );

    if (currentImage && currentImage.type === "video") {
      console.log("[SimpleImageViewer] ✅ Video detected by type field");
      return true;
    }

    // Then check URL patterns
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
    const lowerUrl = url.toLowerCase();
    const isVideoByUrl =
      videoExtensions.some((ext) => lowerUrl.includes(ext)) ||
      lowerUrl.includes("video") ||
      lowerUrl.includes("type=video");

    console.log("[SimpleImageViewer] Video detection by URL:", isVideoByUrl);
    return isVideoByUrl;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading slideshow...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-white text-xl">No images to display</div>
      </div>
    );
  }

  if (isCleanFullscreen) {
    return (
      <div className="fixed inset-0 w-screen h-screen z-50 bg-black overflow-hidden">
        <AnimatePresence mode="wait">
          {isVideoFile(imageUrls[currentIndex], currentIndex) ? (
            <motion.video
              key={currentIndex}
              src={imageUrls[currentIndex]}
              className="w-full h-full object-cover select-none pointer-events-none"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1 }}
              autoPlay
              muted
              loop
              controls={false}
              playsInline
              preload="auto"
              onLoadStart={() =>
                console.log(
                  "[SimpleImageViewer] Video loading started:",
                  imageUrls[currentIndex]
                )
              }
              onCanPlay={() =>
                console.log(
                  "[SimpleImageViewer] Video can play:",
                  imageUrls[currentIndex]
                )
              }
              onError={(e) =>
                console.error(
                  "[SimpleImageViewer] Video error:",
                  e,
                  imageUrls[currentIndex]
                )
              }
            />
          ) : (
            <motion.img
              key={currentIndex}
              src={imageUrls[currentIndex]}
              alt=""
              className="w-full h-full object-cover select-none pointer-events-none"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1 }}
              draggable={false}
            />
          )}
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white bg-opacity-30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular mode with controls
  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Main Image Display */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isVideoFile(imageUrls[currentIndex], currentIndex) ? (
            <motion.video
              key={currentIndex}
              src={imageUrls[currentIndex]}
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              autoPlay
              muted
              loop
              controls={false}
              playsInline
              preload="auto"
              onLoadStart={() =>
                console.log(
                  "[SimpleImageViewer] Video loading started:",
                  imageUrls[currentIndex]
                )
              }
              onCanPlay={() =>
                console.log(
                  "[SimpleImageViewer] Video can play:",
                  imageUrls[currentIndex]
                )
              }
              onError={(e) =>
                console.error(
                  "[SimpleImageViewer] Video error:",
                  e,
                  imageUrls[currentIndex]
                )
              }
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <motion.img
              key={currentIndex}
              src={imageUrls[currentIndex]}
              alt={images[currentIndex]?.name || "Slideshow image"}
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          )}
        </AnimatePresence>

        {/* Debug Info */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
          <div>
            Current: {currentIndex + 1}/{images.length}
          </div>
          <div>URL: {imageUrls[currentIndex]?.substring(0, 50)}...</div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / images.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 px-6 py-3 rounded-full">
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + images.length) % images.length
              )
            }
            className="text-white hover:text-gray-300 transition-colors"
          >
            ←
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % images.length)
            }
            className="text-white hover:text-gray-300 transition-colors"
          >
            →
          </button>
        </div>
      )}

      {/* TV Mode Button */}
      <button
        onClick={() => setTvMode(true)}
        className="absolute top-4 right-16 text-white hover:text-gray-300 transition-colors"
        title="TV Mode (No Controls)"
      >
        <Tv size={24} />
      </button>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-white hover:text-gray-300 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-32 text-white hover:text-gray-300 transition-colors"
      >
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>
    </div>
  );
}

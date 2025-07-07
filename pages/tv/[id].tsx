import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
} from "lucide-react";

interface SlideImage {
  id: string;
  name: string;
  url?: string;
  base64?: string;
  file_path?: string;
  image_url?: string;
  type?: string;
  thumbnail?: string;
}

interface SlideshowSettings {
  defaultDuration: number;
  transition: string;
  backgroundMusic?: string;
  musicVolume?: number;
  musicLoop?: boolean;
}

interface Slideshow {
  id: string;
  name: string;
  images: SlideImage[];
  settings: SlideshowSettings;
  isActive: boolean;
  mediaType?: string;
  slideshowType?: string;
}

export default function TvDisplay() {
  const router = useRouter();
  const { id } = router.query;
  const [slideshow, setSlideshow] = useState<Slideshow | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load slideshow data from backend
  useEffect(() => {
    if (!id) return;
    const fetchSlideshow = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/slideshows/${id}`);
        if (res.status === 403) {
          setError(
            "This slideshow is not active. Please activate it in the dashboard."
          );
          setIsLoading(false);
          return;
        }
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

  // Background music functionality
  useEffect(() => {
    if (
      slideshow?.settings?.backgroundMusic &&
      slideshow.settings.backgroundMusic !== "none"
    ) {
      console.log(
        "[TV Display] Setting up background music:",
        slideshow.settings.backgroundMusic
      );

      if (!audioRef.current) {
        const audio = new Audio(slideshow.settings.backgroundMusic);
        audio.loop = slideshow.settings.musicLoop ?? true;
        audio.volume = (slideshow.settings.musicVolume ?? 50) / 100;
        audio.preload = "auto";

        // Add event listeners for debugging
        audio.addEventListener("loadstart", () =>
          console.log("[TV Display] Music: loadstart")
        );
        audio.addEventListener("canplay", () =>
          console.log("[TV Display] Music: canplay")
        );
        audio.addEventListener("canplaythrough", () =>
          console.log("[TV Display] Music: canplaythrough")
        );
        audio.addEventListener("error", (e) =>
          console.error("[TV Display] Music error:", e)
        );
        audio.addEventListener("stalled", () =>
          console.log("[TV Display] Music: stalled")
        );

        audioRef.current = audio;
      }

      // Try to start playing music with user interaction fallback
      const startMusic = async () => {
        try {
          console.log("[TV Display] Attempting to play background music...");
          await audioRef.current!.play();
          setIsMusicPlaying(true);
          console.log("[TV Display] Background music started successfully");
        } catch (error) {
          console.error("[TV Display] Failed to play background music:", error);
          // If autoplay fails, we'll need user interaction
          setIsMusicPlaying(false);

          // Add a click handler to start music on first user interaction
          const handleFirstClick = async () => {
            try {
              await audioRef.current!.play();
              setIsMusicPlaying(true);
              console.log(
                "[TV Display] Background music started on user interaction"
              );
            } catch (e) {
              console.error(
                "[TV Display] Failed to start music on user interaction:",
                e
              );
            }
            document.removeEventListener("click", handleFirstClick);
          };

          document.addEventListener("click", handleFirstClick, { once: true });
        }
      };

      startMusic();
    } else {
      console.log("[TV Display] No background music configured");
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsMusicPlaying(false);
      }
    };
  }, [slideshow]);

  // Convert images to URLs
  useEffect(() => {
    if (!slideshow) return;
    const convertImagesToUrls = async () => {
      console.log(
        "[TV Display] Starting image URL conversion for slideshow:",
        slideshow.name
      );
      console.log(
        "[TV Display] Slideshow type:",
        slideshow.mediaType || slideshow.slideshowType
      );
      console.log(
        "[TV Display] Total images to process:",
        slideshow.images.length
      );

      const urls: string[] = [];
      for (let i = 0; i < slideshow.images.length; i++) {
        const image = slideshow.images[i];
        let url = "";

        // Debug log to see what we're working with
        console.log(`[TV Display] Processing image ${i}:`, image);

        if (image.base64) {
          url = image.base64;
          console.log(`[TV Display] Using base64 for image ${i}`);
        } else if (image.url) {
          url = image.url;
          console.log(`[TV Display] Using url for image ${i}:`, url);
        } else if (image.file_path) {
          // Check if file_path is already a full URL or base64 data
          if (
            image.file_path.startsWith("http://") ||
            image.file_path.startsWith("https://")
          ) {
            url = image.file_path;
            console.log(
              `[TV Display] Using full URL from file_path for image ${i}:`,
              url
            );
          } else if (image.file_path.startsWith("data:")) {
            // Handle base64 data URLs (like AI facts)
            url = image.file_path;
            console.log(
              `[TV Display] Using base64 data URL from file_path for image ${i}`
            );
          } else {
            // It's a relative path, construct the full URL
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (supabaseUrl) {
              // Try multiple possible URL patterns
              const possibleUrls = [
                // Direct file path
                `${supabaseUrl}/storage/v1/object/public/slideshow-media/${image.file_path}`,
                // Without restaurant prefix
                `${supabaseUrl}/storage/v1/object/public/slideshow-media/${image.file_path.replace(
                  /^restaurants\//,
                  ""
                )}`,
                // Slide images bucket
                `${supabaseUrl}/storage/v1/object/public/slide-images/${image.file_path}`,
                `${supabaseUrl}/storage/v1/object/public/slide-images/${image.file_path.replace(
                  /^restaurants\//,
                  ""
                )}`,
                // Try with different bucket names
                `${supabaseUrl}/storage/v1/object/public/media/${image.file_path}`,
                `${supabaseUrl}/storage/v1/object/public/images/${image.file_path}`,
                // Try with just the filename
                `${supabaseUrl}/storage/v1/object/public/slideshow-media/${image.file_path
                  .split("/")
                  .pop()}`,
              ];

              console.log(
                `[TV Display] Trying URLs for image ${i}:`,
                image.file_path
              );
              for (const testUrl of possibleUrls) {
                try {
                  console.log(
                    `[TV Display] Testing URL for image ${i}:`,
                    testUrl
                  );
                  const response = await fetch(testUrl, { method: "HEAD" });
                  if (response.ok) {
                    url = testUrl;
                    console.log(
                      `[TV Display] Found working URL for image ${i}:`,
                      url
                    );
                    break;
                  }
                } catch (error) {
                  console.log(
                    `[TV Display] URL failed for image ${i}:`,
                    testUrl,
                    error
                  );
                }
              }

              if (!url) {
                // Fallback to the most likely URL
                url = `${supabaseUrl}/storage/v1/object/public/slideshow-media/${image.file_path}`;
                console.log(
                  `[TV Display] Using fallback URL for image ${i}:`,
                  url
                );
              }
            }
          }
        } else if (image.image_url) {
          // Handle AI facts and other slideshows that might use image_url
          url = image.image_url;
          console.log(`[TV Display] Using image_url for image ${i}:`, url);
        }

        if (!url) {
          // Placeholder image
          url =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NjAgNTQwQzk0MC4wOSA1NDAgOTI0IDUyMy45MSA5MjQgNTA0QzkyNCA0ODQuMDkgOTQwLjA5IDQ2OCA5NjAgNDY4Qzk3OS45MSA0NjggOTk2IDQ4NC4wOSA5OTYgNTA0Qzk5NiA1MjMuOTEgOTc5LjkxIDU0MCA5NjAgNTQwWiIgZmlsbD0iIzlCOUJBQCIvPgo8cGF0aCBkPSJNOTI0IDY3MkM5MjQgNjUyLjA5IDk0MC4wOSA2MzYgOTYwIDYzNkM5NzkuOTEgNjM2IDk5NiA2NTIuMDkgOTk2IDY3MlY3MjBDOTk2IDczOS45MSA5NzkuOTEgNzU2IDk2MCA3NTZDOTQwLjA5IDc1NiA5MjQgNzM5LjkxIDkyNCA3MjBWNjcyWiIgZmlsbD0iIzlCOUJBQCIvPgo8L3N2Zz4K";
          console.log(
            `[TV Display] Using placeholder for image ${i} - no valid URL found`
          );
        }

        urls.push(url);
        console.log(`[TV Display] Final URL for image ${i}:`, url);
      }
      setImageUrls(urls);
      console.log("[TV Display] All URLs processed:", urls);
    };
    convertImagesToUrls();
  }, [slideshow]);

  // Auto-advance slides
  useEffect(() => {
    if (!slideshow || slideshow.images.length <= 1 || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshow.images.length);
    }, slideshow.settings.defaultDuration || 5000);
    return () => clearInterval(interval);
  }, [slideshow, isPlaying]);

  // Ensure video plays when it's ready
  useEffect(() => {
    if (
      videoRef.current &&
      imageUrls[currentIndex] &&
      isVideoFile(imageUrls[currentIndex], slideshow?.images[currentIndex])
    ) {
      console.log(
        `[TV Display] Attempting to play video for index ${currentIndex}`
      );

      const playVideo = async () => {
        try {
          await videoRef.current!.play();
          console.log(
            `[TV Display] Video play successful for index ${currentIndex}`
          );
        } catch (error) {
          console.error(
            `[TV Display] Video play failed for index ${currentIndex}:`,
            error
          );
        }
      };

      // Try to play immediately
      playVideo();

      // Also try after a short delay in case the video is still loading
      const timeoutId = setTimeout(playVideo, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, imageUrls, slideshow]);

  // Request fullscreen on load and check video support
  useEffect(() => {
    const requestFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    const timer = setTimeout(requestFullscreen, 1000);

    // Check browser video support
    checkVideoSupport();

    return () => clearTimeout(timer);
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Control functions
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (slideshow) {
      setCurrentIndex((prev) => (prev + 1) % slideshow.images.length);
    }
  };

  const handlePrevious = () => {
    if (slideshow) {
      setCurrentIndex(
        (prev) => (prev - 1 + slideshow.images.length) % slideshow.images.length
      );
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Handle image load error
  const handleImageError = (index: number) => {
    if (slideshow && slideshow.images.length > 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slideshow.images.length);
      }, 1000);
    }
  };

  // Function to detect if a file is a video
  const isVideoFile = (url: string, image: any): boolean => {
    // First check the type field
    if (image && image.type === "video") {
      console.log("[TV Display] ✅ Video detected by type field");
      return true;
    }

    // Defensive: url must be a string
    if (typeof url !== "string") {
      console.warn("[TV Display] isVideoFile: url is not a string", url);
      return false;
    }

    // Then check URL patterns
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
    const lowerUrl = url.toLowerCase();
    const isVideoByUrl =
      videoExtensions.some((ext) => lowerUrl.includes(ext)) ||
      lowerUrl.includes("video") ||
      lowerUrl.includes("type=video");

    console.log("[TV Display] Video detection by URL:", isVideoByUrl);
    return isVideoByUrl;
  };

  const checkVideoSupport = () => {
    const video = document.createElement("video");
    const supportedFormats = {
      mp4: video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
      webm: video.canPlayType('video/webm; codecs="vp8, vorbis"'),
      ogg: video.canPlayType('video/ogg; codecs="theora, vorbis"'),
    };

    console.log("[TV Display] Browser video support:", supportedFormats);
    return supportedFormats;
  };

  // Handle video loading states
  const handleVideoLoadStart = (index: number) => {
    console.log(`[TV Display] Video load start for index ${index}`);
    setVideoLoading((prev) => ({ ...prev, [index]: true }));
  };

  const handleVideoCanPlay = (index: number) => {
    console.log(`[TV Display] Video can play for index ${index}`);
    setVideoLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleVideoError = async (index: number) => {
    console.log(`[TV Display] Video error for index ${index}`);
    setVideoLoading((prev) => ({ ...prev, [index]: false }));

    const currentImage = slideshow?.images[index];
    if (!currentImage) {
      handleImageError(index);
      return;
    }

    // Try to get a fresh signed URL first
    if (currentImage.file_path && !currentImage.file_path.startsWith("data:")) {
      try {
        console.log(
          `[TV Display] Attempting to get fresh signed URL for video ${index}`
        );
        const response = await fetch(
          `/api/media/signed-url?path=${encodeURIComponent(
            currentImage.file_path
          )}`
        );
        if (response.ok) {
          const { url } = await response.json();
          console.log(
            `[TV Display] Got fresh signed URL for video ${index}:`,
            url
          );

          // Update the URL to use the fresh signed URL
          setImageUrls((prev) => {
            const newUrls = [...prev];
            newUrls[index] = url;
            return newUrls;
          });
          return;
        }
      } catch (error) {
        console.error(
          `[TV Display] Failed to get fresh signed URL for video ${index}:`,
          error
        );
      }
    }

    // Try to show thumbnail as fallback
    if (currentImage.thumbnail) {
      console.log(
        `[TV Display] Using thumbnail as fallback for video ${index}`
      );
      // Update the URL to use thumbnail
      setImageUrls((prev) => {
        const newUrls = [...prev];
        newUrls[index] = currentImage.thumbnail!;
        return newUrls;
      });
    } else {
      handleImageError(index);
    }
  };

  const handleVideoPlay = (index: number) => {
    console.log(`[TV Display] Video play event for index ${index}`);
  };

  const handleVideoPause = (index: number) => {
    console.log(`[TV Display] Video pause event for index ${index}`);
  };

  const handleVideoEnded = (index: number) => {
    console.log(`[TV Display] Video ended for index ${index}`);
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
            <div className="mt-4 text-sm text-gray-500">
              This slideshow may be inactive. Please check the dashboard.
            </div>
          </div>
        </div>
      </>
    );
  }

  if (slideshow.images.length === 0 || imageUrls.length === 0) {
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
      <div
        className="fixed inset-0 bg-black overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          {imageUrls[currentIndex] &&
          currentIndex < imageUrls.length &&
          isVideoFile(
            imageUrls[currentIndex],
            slideshow.images[currentIndex]
          ) ? (
            // Video display
            <div className="relative w-full h-full">
              {videoLoading[currentIndex] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <div className="text-sm">Loading video...</div>
                  </div>
                </div>
              )}
              <motion.video
                ref={videoRef}
                key={currentIndex}
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
                onLoadStart={() => handleVideoLoadStart(currentIndex)}
                onCanPlay={() => handleVideoCanPlay(currentIndex)}
                onError={() => handleVideoError(currentIndex)}
                onPlay={() => handleVideoPlay(currentIndex)}
                onPause={() => handleVideoPause(currentIndex)}
                onEnded={() => handleVideoEnded(currentIndex)}
                onLoadedData={() =>
                  console.log(
                    `[TV Display] Video loaded data for index ${currentIndex}`
                  )
                }
                onLoadedMetadata={() =>
                  console.log(
                    `[TV Display] Video loaded metadata for index ${currentIndex}`
                  )
                }
              >
                <source src={imageUrls[currentIndex]} type="video/mp4" />
                <source src={imageUrls[currentIndex]} type="video/webm" />
                <source src={imageUrls[currentIndex]} type="video/ogg" />
                Your browser does not support the video tag.
              </motion.video>
            </div>
          ) : imageUrls[currentIndex] ? (
            // Image display
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
          ) : (
            // Loading or error state
            <div className="w-full h-full bg-black flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <div className="text-sm">Loading...</div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Controls Overlay */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
            >
              {/* Center Controls */}
              <div className="flex items-center gap-4 bg-black bg-opacity-75 rounded-full px-6 py-3">
                <button
                  onClick={handlePrevious}
                  className="text-white hover:text-gray-300 transition-colors p-2"
                  title="Previous"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-gray-300 transition-colors p-2"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="text-white hover:text-gray-300 transition-colors p-2"
                  title="Next"
                >
                  <SkipForward className="w-6 h-6" />
                </button>

                {/* Music Control Button */}
                {slideshow?.settings?.backgroundMusic &&
                  slideshow.settings.backgroundMusic !== "none" && (
                    <button
                      onClick={handleToggleMute}
                      className="text-white hover:text-gray-300 transition-colors p-2"
                      title={isMusicPlaying ? "Stop Music" : "Start Music"}
                    >
                      {isMusicPlaying ? (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                          <line
                            x1="1"
                            y1="1"
                            x2="23"
                            y2="23"
                            stroke="currentColor"
                            strokeWidth={2}
                          />
                        </svg>
                      )}
                    </button>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-4 flex items-center gap-2"
            >
              {/* Music Controls */}
              {slideshow.settings?.backgroundMusic &&
                slideshow.settings.backgroundMusic !== "none" && (
                  <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isMusicPlaying
                          ? "bg-green-400 animate-pulse"
                          : "bg-yellow-400"
                      }`}
                    ></span>
                    {isMusicPlaying ? "Music Playing" : "Music Loading"}
                    <button
                      onClick={handleToggleMute}
                      className="text-white hover:text-gray-300 transition-colors"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

              {/* Fullscreen Button */}
              <button
                onClick={handleToggleFullscreen}
                className="bg-black bg-opacity-75 text-white p-2 rounded-full hover:bg-opacity-90 transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
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

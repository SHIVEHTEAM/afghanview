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
  Music,
} from "lucide-react";
import { MusicService } from "../../lib/music-service";
import { MusicTrack, MusicPlaylist } from "../../types/music";

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
    backgroundMusic?: string;
    musicVolume?: number;
    musicLoop?: boolean;
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
  console.log("[SimpleImageViewer] Music settings:", {
    backgroundMusic: settings.backgroundMusic,
    musicVolume: settings.musicVolume,
    musicLoop: settings.musicLoop,
  });

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
  const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [tvMode, setTvMode] = useState(settings.tvMode ?? false);
  const [isActuallyFullscreen, setIsActuallyFullscreen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Enhanced music state for playlists
  const [currentPlaylist, setCurrentPlaylist] = useState<MusicPlaylist | null>(
    null
  );
  const [playlistTracks, setPlaylistTracks] = useState<MusicTrack[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [playMode, setPlayMode] = useState<"sequential" | "shuffle" | "random">(
    "sequential"
  );
  const [shuffledPlaylist, setShuffledPlaylist] = useState<number[]>([]);

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
      console.log(
        "[SimpleImageViewer] 🚀 convertImagesToUrls called with",
        images.length,
        "images"
      );
      const urls: string[] = [];

      for (const image of images) {
        let url = "";
        // Debug: Log the image object
        console.log("[SimpleImageViewer] Processing image:", {
          id: image.id,
          name: image.name,
          type: image.type,
          file_path: image.file_path,
          url: image.url,
          hasFilePath: !!image.file_path,
          hasUrl: !!image.url,
          filePathStartsWithData: image.file_path?.startsWith("data:"),
          urlStartsWithData: image.url?.startsWith("data:"),
        });
        // Priority 1: Data URL (for AI Facts SVG) - check both file_path and url
        console.log("[SimpleImageViewer] Checking for data URL...");
        console.log(
          "[SimpleImageViewer] file_path starts with data:",
          image.file_path?.startsWith("data:")
        );
        console.log(
          "[SimpleImageViewer] url starts with data:",
          image.url?.startsWith("data:")
        );

        if (
          (image.file_path && image.file_path.startsWith("data:")) ||
          (image.url && image.url.startsWith("data:"))
        ) {
          url = image.file_path?.startsWith("data:")
            ? image.file_path
            : image.url || "";
          console.log(
            "[SimpleImageViewer] ✅ Using data URL from:",
            image.file_path?.startsWith("data:") ? "file_path" : "url"
          );
          console.log(
            "[SimpleImageViewer] Data URL preview:",
            url.substring(0, 100) + "..."
          );
          console.log("[SimpleImageViewer] Full data URL length:", url.length);
          console.log("[SimpleImageViewer] Data URL type:", url.split(",")[0]);
          // Skip all other processing for data URLs
          urls.push(url);
          continue;
        } else if (image.base64) {
          // Priority 2: Base64
          url = image.base64;
        } else if (image.url) {
          // Priority 3: Direct URL
          // For videos, check if we need a fresh signed URL
          if (image.type === "video") {
            url = await getVideoUrl(image);
          } else {
            url = image.url;
          }
        } else if (image.file_path && !image.file_path.startsWith("blob:")) {
          // Priority 4: File path (Supabase) - only if it's not a blob URL

          // Check if file_path is already a full URL
          if (image.file_path.startsWith("http")) {
            url = image.file_path;
            console.log(
              "[SimpleImageViewer] ✅ Using full URL from file_path:",
              url
            );
          } else {
            // It's a relative path, construct the full URL
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
                    console.log(
                      "[SimpleImageViewer] ✅ Found working URL:",
                      url
                    );
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
        } else if (image.file_path && image.file_path.startsWith("blob:")) {
          // Priority 4.5: Blob URL (if file_path is a blob URL)
          url = image.file_path;
          console.log("[SimpleImageViewer] Using blob URL:", url);
        } else if (image.file) {
          // Priority 5: File object
          url = URL.createObjectURL(image.file);
        } else {
          // Fallback: Placeholder
          url =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NjAgNTQwQzk0MC4wOSA1NDAgOTI0IDUyMy45MSA5MjQgNTA0QzkyNCA0ODQuMDkgOTQwLjA5IDQ2OCA5NjAgNDY4Qzk3OS45MSA0NjggOTk2IDQ4NC4wOSA5OTYgNTA0Qzk5NiA1MjMuOTEgOTc5LjkxIDU0MCA5NjAgNTQwWiIgZmlsbD0iIzlCOUJBQCIvPgo8cGF0aCBkPSJNOTI0IDY3MkM5MjQgNjUyLjA5IDk0MC4wOSA2MzYgOTYwIDYzNkM5NzkuOTEgNjM2IDk5NiA2NTIuMDkgOTk2IDY3MlY3MjBDOTk2IDczOS45MSA5NzkuOTEgNzU2IDk2MCA3NTZDOTQwLjA5IDc1NiA5MjQgNzM5LjkxIDkyNCA3MjBWNjcyWiIgZmlsbD0iIzlCOUJBQCIvPgo8L3N2Zz4K";
        }
        // Debug: Log the final URL for this image
        console.log("[SimpleImageViewer] Final image URL:", url);
        console.log("[SimpleImageViewer] Final URL type:", url.split(",")[0]);
        console.log("[SimpleImageViewer] Final URL length:", url.length);
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

  const handleImageError = useCallback(
    (error: any) => {
      console.error("[SimpleImageViewer] Image failed to load:", error);

      // Track this image as failed
      setFailedImages((prev) => new Set([...prev, currentIndex]));

      // Try to decode and log the SVG content for debugging
      const currentUrl = getImageUrl(currentIndex);
      if (currentUrl.startsWith("data:image/svg+xml;base64,")) {
        try {
          const base64Data = currentUrl.split(",")[1];
          const svgContent = atob(base64Data);
          console.log(
            "[SimpleImageViewer] Decoded SVG content from file_path:",
            svgContent.substring(0, 200) + "..."
          );
        } catch (decodeError) {
          console.error("[SimpleImageViewer] Error decoding SVG:", decodeError);
        }
      }
    },
    [currentIndex]
  );

  // Helper function to get the actual URL for an image
  const getImageUrl = (imageIndex: number): string => {
    const image = images[imageIndex];
    if (!image) return "";

    console.log(
      "[SimpleImageViewer] getImageUrl called for index:",
      imageIndex
    );
    console.log("[SimpleImageViewer] Image object:", {
      id: image.id,
      name: image.name,
      type: image.type,
      hasUrl: !!image.url,
      hasFilePath: !!image.file_path,
      urlStartsWithData: image.url?.startsWith("data:"),
      filePathStartsWithData: image.file_path?.startsWith("data:"),
      urlPreview: image.url?.substring(0, 50) + "...",
      filePathPreview: image.file_path?.substring(0, 50) + "...",
    });

    // Priority 1: Check if the image has a data URL in url property
    if (image.url && image.url.startsWith("data:")) {
      console.log(
        "[SimpleImageViewer] ✅ Using data URL directly from image.url"
      );
      return image.url;
    }

    // Priority 2: Check if the image has a data URL in file_path property
    if (image.file_path && image.file_path.startsWith("data:")) {
      console.log(
        "[SimpleImageViewer] ✅ Using data URL directly from image.file_path"
      );
      return image.file_path;
    }

    // Otherwise use the processed URL
    const processedUrl = imageUrls[imageIndex] || "";
    console.log("[SimpleImageViewer] Using processed URL from imageUrls");

    // Debug: Decode and log the SVG content if it's a data URL
    if (processedUrl.startsWith("data:image/svg+xml;base64,")) {
      try {
        const base64Data = processedUrl.split(",")[1];
        const svgContent = atob(base64Data);
        console.log(
          "[SimpleImageViewer] Decoded SVG content:",
          svgContent.substring(0, 200) + "..."
        );
      } catch (error) {
        console.error("[SimpleImageViewer] Error decoding SVG:", error);
      }
    }

    return processedUrl;
  };

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

  // Function to get fresh signed URL for videos
  const getVideoUrl = async (image: ImageData): Promise<string> => {
    if (
      image.type === "video" &&
      image.file_path &&
      !image.url?.includes("signed")
    ) {
      try {
        const response = await fetch("/api/media/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: image.file_path }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.signedUrl;
        }
      } catch (error) {
        console.error("Error getting signed URL:", error);
      }
    }
    return image.url || "";
  };

  // Play current music (for playlists)
  const playCurrentMusic = async () => {
    if (!audioRef) return;

    let musicUrl = "";

    if (currentPlaylist && playlistTracks.length > 0) {
      let trackIndex = currentPlaylistIndex;

      if (playMode === "shuffle" && shuffledPlaylist.length > 0) {
        trackIndex =
          shuffledPlaylist[currentPlaylistIndex % shuffledPlaylist.length];
      } else if (playMode === "random") {
        trackIndex = Math.floor(Math.random() * playlistTracks.length);
      }

      const track = playlistTracks[trackIndex];
      if (track) {
        musicUrl = track.file_url;
        console.log(
          "[SimpleImageViewer] Playing track:",
          track.name,
          "from URL:",
          musicUrl
        );
      }
    }

    if (musicUrl) {
      audioRef.src = musicUrl;
      audioRef.loop = settings.musicLoop ?? true;
      audioRef.volume = (settings.musicVolume ?? 50) / 100;

      try {
        await audioRef.play();
        setIsMusicPlaying(true);
        console.log("[SimpleImageViewer] Music started playing successfully");
      } catch (error) {
        console.error("Failed to play music:", error);
        setIsMusicPlaying(false);
      }
    } else {
      console.log("[SimpleImageViewer] No music URL available to play");
    }
  };

  // Handle music end (for playlists)
  const handleMusicEnd = () => {
    if (currentPlaylist && playlistTracks.length > 0) {
      // Move to next track in playlist
      const nextIndex = (currentPlaylistIndex + 1) % playlistTracks.length;
      setCurrentPlaylistIndex(nextIndex);

      if (nextIndex === 0 && !settings.musicLoop) {
        // End of playlist and not looping
        setIsMusicPlaying(false);
      }
    } else if (!settings.musicLoop) {
      // Single track ended and not looping
      setIsMusicPlaying(false);
    }
  };

  // Load music data (playlist or single track)
  useEffect(() => {
    const loadMusicData = async () => {
      try {
        console.log(
          "[SimpleImageViewer] Loading music data for:",
          settings.backgroundMusic
        );
        if (settings.backgroundMusic?.startsWith("playlist:")) {
          // Handle playlist
          const playlistId = settings.backgroundMusic.replace("playlist:", "");
          console.log(
            "[SimpleImageViewer] Loading playlist with ID:",
            playlistId
          );
          const playlist = await MusicService.getPlaylist(playlistId);
          console.log("[SimpleImageViewer] Playlist loaded:", playlist);
          if (playlist) {
            setCurrentPlaylist(playlist);
            setPlaylistTracks(playlist.tracks || []);
            setPlayMode(playlist.play_mode);

            // Initialize shuffled playlist if needed
            if (playlist.play_mode === "shuffle") {
              const shuffled = Array.from(
                { length: playlist.tracks?.length || 0 },
                (_, i) => i
              );
              for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
              }
              setShuffledPlaylist(shuffled);
            }
          }
        }
      } catch (error) {
        console.error("Error loading music data:", error);
      }
    };

    loadMusicData();
  }, [settings.backgroundMusic]);

  // Background music functionality
  useEffect(() => {
    if (settings.backgroundMusic && settings.backgroundMusic !== "none") {
      if (currentPlaylist && playlistTracks.length > 0) {
        // Handle playlist music
        console.log(
          "[SimpleImageViewer] Playing playlist music with",
          playlistTracks.length,
          "tracks"
        );
        playCurrentMusic();
      } else if (!settings.backgroundMusic.startsWith("playlist:")) {
        // Handle single track
        console.log(
          "[SimpleImageViewer] Playing single track music:",
          settings.backgroundMusic
        );
        if (!audioRef) {
          const audio = new Audio(settings.backgroundMusic);
          audio.loop = settings.musicLoop ?? true;
          audio.volume = (settings.musicVolume ?? 50) / 100;
          setAudioRef(audio);
        }

        if (isPlaying && !isMuted) {
          audioRef
            ?.play()
            .then(() => {
              setIsMusicPlaying(true);
              console.log(
                "[SimpleImageViewer] Single track music started playing"
              );
            })
            .catch((error) => {
              console.error("Failed to play background music:", error);
            });
        } else {
          audioRef?.pause();
          setIsMusicPlaying(false);
        }
      } else if (
        settings.backgroundMusic.startsWith("playlist:") &&
        !currentPlaylist
      ) {
        // Playlist is being loaded, wait for it
        console.log("[SimpleImageViewer] Waiting for playlist to load...");
      }
    }

    return () => {
      if (audioRef) {
        audioRef.pause();
        setIsMusicPlaying(false);
      }
    };
  }, [
    isPlaying,
    isMuted,
    settings.backgroundMusic,
    settings.musicVolume,
    settings.musicLoop,
    audioRef,
    currentPlaylist,
    playlistTracks,
    currentPlaylistIndex,
  ]);

  // Update music volume when settings change
  useEffect(() => {
    if (audioRef && settings.musicVolume !== undefined) {
      audioRef.volume = settings.musicVolume / 100;
    }
  }, [settings.musicVolume, audioRef]);

  // Update music loop when settings change
  useEffect(() => {
    if (audioRef && settings.musicLoop !== undefined) {
      audioRef.loop = settings.musicLoop;
    }
  }, [settings.musicLoop, audioRef]);

  // Set up audio element for playlist functionality
  useEffect(() => {
    if (currentPlaylist && playlistTracks.length > 0) {
      if (!audioRef) {
        const audio = new Audio();
        audio.addEventListener("ended", handleMusicEnd);
        setAudioRef(audio);
      }
    }
  }, [currentPlaylist, playlistTracks]);

  // Cleanup audio event listeners
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.removeEventListener("ended", handleMusicEnd);
      }
    };
  }, [audioRef]);

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
          {isVideoFile(getImageUrl(currentIndex), currentIndex) ? (
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
                key={currentIndex}
                src={getImageUrl(currentIndex)}
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
                    getImageUrl(currentIndex)
                  )
                }
                onCanPlay={() =>
                  console.log(
                    "[SimpleImageViewer] Video can play:",
                    getImageUrl(currentIndex)
                  )
                }
                onError={(e) => {
                  console.error(
                    "[SimpleImageViewer] Video error:",
                    e,
                    getImageUrl(currentIndex)
                  );
                  // Log additional error details
                  const videoElement = e.target as HTMLVideoElement;
                  console.error("[SimpleImageViewer] Video error details:", {
                    error: videoElement.error,
                    networkState: videoElement.networkState,
                    readyState: videoElement.readyState,
                    src: videoElement.src,
                  });
                }}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          ) : (
            <>
              {failedImages.has(currentIndex) ? (
                // Fallback display for failed images in fullscreen mode
                <motion.div
                  key={`fallback-fullscreen-${currentIndex}`}
                  className="w-full h-full flex items-center justify-center bg-gray-800"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 1 }}
                >
                  <div className="text-center text-white p-8">
                    <div className="text-8xl mb-6">⚠️</div>
                    <h3 className="text-3xl font-semibold mb-4">
                      Image Failed to Load
                    </h3>
                    <p className="text-gray-300 text-xl mb-6">
                      {images[currentIndex]?.name || "Unknown image"}
                    </p>
                    <button
                      onClick={() => {
                        setFailedImages((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(currentIndex);
                          return newSet;
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-lg"
                    >
                      Retry
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {getImageUrl(currentIndex).startsWith(
                    "data:image/svg+xml"
                  ) ? (
                    // Use object tag for SVG data URLs in fullscreen mode
                    <motion.object
                      key={currentIndex}
                      data={getImageUrl(currentIndex)}
                      type="image/svg+xml"
                      className="w-full h-full object-cover select-none pointer-events-none"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 1 }}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  ) : (
                    <motion.img
                      key={currentIndex}
                      src={getImageUrl(currentIndex)}
                      alt=""
                      className="w-full h-full object-cover select-none pointer-events-none"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 1 }}
                      draggable={false}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  )}
                </>
              )}
            </>
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
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Main Image Display */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {isVideoFile(getImageUrl(currentIndex), currentIndex) ? (
            <div className="relative">
              {videoLoading[currentIndex] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 rounded-lg">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <div className="text-sm">Loading video...</div>
                  </div>
                </div>
              )}
              <motion.video
                key={currentIndex}
                src={getImageUrl(currentIndex)}
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
                    getImageUrl(currentIndex)
                  )
                }
                onCanPlay={() =>
                  console.log(
                    "[SimpleImageViewer] Video can play:",
                    getImageUrl(currentIndex)
                  )
                }
                onError={(e) => {
                  console.error(
                    "[SimpleImageViewer] Video error:",
                    e,
                    getImageUrl(currentIndex)
                  );
                  // Log additional error details
                  const videoElement = e.target as HTMLVideoElement;
                  console.error("[SimpleImageViewer] Video error details:", {
                    error: videoElement.error,
                    networkState: videoElement.networkState,
                    readyState: videoElement.readyState,
                    src: videoElement.src,
                  });
                }}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
          ) : (
            <>
              {failedImages.has(currentIndex) ? (
                // Fallback display for failed images
                <motion.div
                  key={`fallback-${currentIndex}`}
                  className="max-w-full max-h-full flex items-center justify-center bg-gray-800 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    minWidth: "400px",
                    minHeight: "300px",
                  }}
                >
                  <div className="text-center text-white p-8">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold mb-2">
                      Image Failed to Load
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {images[currentIndex]?.name || "Unknown image"}
                    </p>
                    <button
                      onClick={() => {
                        setFailedImages((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(currentIndex);
                          return newSet;
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {getImageUrl(currentIndex).startsWith(
                    "data:image/svg+xml"
                  ) ? (
                    // Use object tag for SVG data URLs for better compatibility
                    <motion.object
                      key={currentIndex}
                      data={getImageUrl(currentIndex)}
                      type="image/svg+xml"
                      className="max-w-full max-h-full object-contain"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        background: "transparent",
                      }}
                    />
                  ) : (
                    <motion.img
                      key={currentIndex}
                      src={getImageUrl(currentIndex)}
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
                </>
              )}
            </>
          )}
        </AnimatePresence>

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

        {/* Top Controls Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          {/* Left side - Counter */}
          <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Center - Music Indicator */}
          {settings.backgroundMusic && settings.backgroundMusic !== "none" && (
            <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm flex items-center gap-2">
              <Music className="w-4 h-4" />
              {isMusicPlaying ? "Playing" : "Paused"}
            </div>
          )}

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="bg-black bg-opacity-75 text-white p-2 rounded-lg hover:bg-opacity-90 transition-all backdrop-blur-sm"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            {/* TV Mode Button */}
            <button
              onClick={() => setTvMode(true)}
              className="bg-black bg-opacity-75 text-white p-2 rounded-lg hover:bg-opacity-90 transition-all backdrop-blur-sm"
              title="TV Mode (No Controls)"
            >
              <Tv size={18} />
            </button>

            {/* Close Button (only in modal mode) */}
            {!tvMode && (
              <button
                onClick={onClose}
                className="bg-black bg-opacity-75 text-white p-2 rounded-lg hover:bg-opacity-90 transition-all backdrop-blur-sm"
                title="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-75 px-6 py-3 rounded-full backdrop-blur-sm">
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + images.length) % images.length
              )
            }
            className="text-white hover:text-gray-300 transition-colors p-1"
            title="Previous"
          >
            ←
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:text-gray-300 transition-colors p-1"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % images.length)
            }
            className="text-white hover:text-gray-300 transition-colors p-1"
            title="Next"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

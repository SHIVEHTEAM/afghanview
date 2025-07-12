import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Share2,
  Maximize,
  Settings,
  RotateCcw,
  Music,
  Minimize,
} from "lucide-react";

interface Slide {
  id: string;
  name: string;
  type: string;
  title: string;
  subtitle?: string;
  content: any;
  styling: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    animation: string;
  };
  duration: number;
  order_index: number;
}

interface SlideshowPlayerProps {
  slideshow: {
    id: string;
    name: string;
    images: Slide[];
    settings?: {
      backgroundMusic?: string;
      musicVolume?: number;
      musicLoop?: boolean;
    };
    title?: string;
    description?: string;
  };
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
}

export default function SlideshowPlayer({
  slideshow,
  isFullscreen = false,
  onFullscreenToggle,
  autoPlay = true,
  showControls = true,
}: SlideshowPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [transitionDuration, setTransitionDuration] = useState(1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    // Generate share URL
    const url = `${window.location.origin}/slideshow/${slideshow.id}`;
    setShareUrl(url);
  }, [slideshow.id]);

  useEffect(() => {
    if (isPlaying && slideshow.images.length > 0) {
      const currentSlide = slideshow.images[currentIndex];
      const duration = currentSlide?.duration || 5000;

      intervalRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slideshow.images.length);
      }, duration);

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [isPlaying, currentIndex, slideshow.images]);

  // Background music functionality
  useEffect(() => {
    if (
      slideshow.settings?.backgroundMusic &&
      slideshow.settings.backgroundMusic !== "none"
    ) {
      if (!audioRef.current) {
        audioRef.current = new Audio(slideshow.settings.backgroundMusic);
        audioRef.current.loop = slideshow.settings.musicLoop ?? true;
        audioRef.current.volume = (slideshow.settings.musicVolume ?? 50) / 100;
      }

      if (isPlaying && !isMuted) {
        audioRef.current
          .play()
          .then(() => {
            setIsMusicPlaying(true);
          })
          .catch((error) => {
            console.error("Failed to play background music:", error);
          });
      } else {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    };
  }, [
    isPlaying,
    isMuted,
    slideshow.settings?.backgroundMusic,
    slideshow.settings?.musicVolume,
    slideshow.settings?.musicLoop,
  ]);

  // Update music volume when settings change
  useEffect(() => {
    if (audioRef.current && slideshow.settings?.musicVolume !== undefined) {
      audioRef.current.volume = slideshow.settings.musicVolume / 100;
    }
  }, [slideshow.settings?.musicVolume]);

  // Update music loop when settings change
  useEffect(() => {
    if (audioRef.current && slideshow.settings?.musicLoop !== undefined) {
      audioRef.current.loop = slideshow.settings.musicLoop;
    }
  }, [slideshow.settings?.musicLoop]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slideshow.images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + slideshow.images.length) % slideshow.images.length
    );
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Slideshow URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      // Fallback: show URL in alert
      alert(`Share this URL: ${shareUrl}`);
    }
  };

  const currentSlide = slideshow.images[currentIndex];

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No slides available</p>
      </div>
    );
  }

  const getAnimationVariants = (animation: string) => {
    switch (animation) {
      case "fade":
        return {
          enter: { opacity: 0 },
          center: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case "slide":
        return {
          enter: { x: 300, opacity: 0 },
          center: { x: 0, opacity: 1 },
          exit: { x: -300, opacity: 0 },
        };
      case "zoom":
        return {
          enter: { scale: 0.8, opacity: 0 },
          center: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 },
        };
      case "flip":
        return {
          enter: { rotateY: 90, opacity: 0 },
          center: { rotateY: 0, opacity: 1 },
          exit: { rotateY: -90, opacity: 0 },
        };
      default:
        return {
          enter: { opacity: 0 },
          center: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const toggleFullscreen = () => {
    if (onFullscreenToggle) {
      onFullscreenToggle();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div
      className={`relative bg-black ${
        isFullscreen ? "fixed inset-0 z-50" : "rounded-lg overflow-hidden"
      }`}
    >
      {/* Slideshow Display */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            variants={getAnimationVariants(currentSlide.styling.animation)}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: transitionDuration / 1000 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: currentSlide.styling.backgroundColor,
              color: currentSlide.styling.textColor,
              perspective:
                currentSlide.styling.animation === "flip"
                  ? "1000px"
                  : undefined,
            }}
          >
            <div className="text-center px-8 max-w-4xl">
              {currentSlide.type === "text" && (
                <>
                  <h1
                    className="font-bold mb-4 leading-tight"
                    style={{ fontSize: `${currentSlide.styling.fontSize}px` }}
                  >
                    {currentSlide.title}
                  </h1>
                  {currentSlide.subtitle && (
                    <p className="text-lg opacity-90 mb-4">
                      {currentSlide.subtitle}
                    </p>
                  )}
                  {currentSlide.content?.text && (
                    <p className="text-xl leading-relaxed opacity-95">
                      {currentSlide.content.text}
                    </p>
                  )}
                </>
              )}

              {currentSlide.type === "image" &&
                currentSlide.content?.image_url && (
                  <div className="relative">
                    <img
                      src={currentSlide.content.image_url}
                      alt={currentSlide.title}
                      className="max-w-full max-h-full object-contain"
                    />
                    {currentSlide.title && (
                      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded">
                        <h2 className="text-xl font-bold">
                          {currentSlide.title}
                        </h2>
                        {currentSlide.subtitle && (
                          <p className="text-sm opacity-90">
                            {currentSlide.subtitle}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: (currentSlide.duration || 5000) / 1000,
              ease: "linear",
            }}
          />
        </div>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {slideshow.images.length}
        </div>

        {/* Music Indicator */}
        {slideshow.settings?.backgroundMusic &&
          slideshow.settings.backgroundMusic !== "none" && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <Music className="w-4 h-4" />
              {isMusicPlaying ? "Playing" : "Paused"}
            </div>
          )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={handleRestart}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleMute}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleShare}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {onFullscreenToggle && (
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg"
        >
          <h3 className="font-semibold mb-3">Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">
                Transition Duration (ms)
              </label>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                value={transitionDuration}
                onChange={(e) =>
                  setTransitionDuration(parseInt(e.target.value))
                }
                className="w-full"
              />
              <span className="text-xs">{transitionDuration}ms</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Slideshow Info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
        <h2 className="font-semibold">{slideshow.title}</h2>
        <p className="text-sm opacity-90">{slideshow.images.length} slides</p>
      </div>
    </div>
  );
}

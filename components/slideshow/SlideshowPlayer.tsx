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
      className={`relative bg-black ${isFullscreen ? "fixed inset-0 z-50 w-screen h-screen" : "w-full h-full rounded-lg overflow-hidden"}`}
      style={{ height: isFullscreen ? '100dvh' : '100%' }}
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
            {currentSlide.type === "property-listing" ? (
              // Explicit check for property data
              !currentSlide.content?.property ? (
                <div className="text-white text-center">
                  <h2 className="text-2xl font-bold">Error Loading Property</h2>
                  <p className="text-gray-400">Missing property data for slide {currentSlide.id}</p>
                  <pre className="text-xs text-left bg-gray-900 p-4 mt-4 rounded overflow-auto max-w-lg mx-auto">
                    {JSON.stringify(currentSlide, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="w-full h-full relative bg-gray-900 overflow-hidden" style={{ fontFamily: currentSlide.content.theme?.fontFamily || 'inherit' }}>
                  {/* Background Image (Blurred) */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={(() => {
                        const img = currentSlide.content.property.images?.[0];
                        if (img instanceof File) return URL.createObjectURL(img);
                        if (typeof img === 'string' && img.length > 0) return img;
                        return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80";
                      })()}
                      className="w-full h-full object-cover filter blur-md opacity-30"
                      alt="Background"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                  </div>

                  {/* Main Content Container */}
                  <div className="absolute inset-0 z-10 flex flex-col lg:flex-row pointer-events-none">
                    {/* Image Section (Top/Left) */}
                    <div className="relative flex-1 min-h-0 w-full lg:h-full bg-gray-800/50 pointer-events-auto group">
                      {/* Image Carousel */}
                      {(() => {
                        // Property Image Cycler Logic
                        const [imgIndex, setImgIndex] = React.useState(0);
                        const images = currentSlide.content.property.images;
                        const hasMultipleImages = images && images.length > 1;

                        React.useEffect(() => {
                          if (!hasMultipleImages) return;
                          const timer = setInterval(() => {
                            setImgIndex((prev) => (prev + 1) % images.length);
                          }, 3000); // Rotate every 3s
                          return () => clearInterval(timer);
                        }, [hasMultipleImages, images]);

                        const currentImg = images?.[imgIndex];

                        return (
                          <>
                            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                              <img
                                key={imgIndex} // Key forces re-render for clean transition
                                src={(() => {
                                  if (currentImg instanceof File) return URL.createObjectURL(currentImg);
                                  if (typeof currentImg === 'string' && currentImg.length > 0) return currentImg;
                                  return "https://images.unsplash.com/photo-1600596542815-2a4d9f6fac52?q=80&w=2942&auto=format&fit=crop";
                                })()}
                                className="w-full h-full object-cover animate-in fade-in duration-700"
                                alt={currentSlide.content.property.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-800');
                                  e.currentTarget.parentElement!.innerHTML = '<span class="text-gray-400">Image not available</span>';
                                }}
                              />
                            </div>

                            {/* Carousel Indicators */}
                            {hasMultipleImages && (
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                {images.slice(0, 5).map((_: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === imgIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {/* Price Tag with Gradient */}
                      <div className="absolute top-6 left-6 z-20">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-2 rounded-xl font-bold text-xl shadow-lg border border-white/20 backdrop-blur-md">
                          {currentSlide.content.property.price || "Price on Request"}
                        </div>
                      </div>
                    </div>

                    {/* Details Section (Bottom/Right) */}
                    <div className="relative flex-1 min-h-0 w-full lg:h-full bg-gray-900/90 backdrop-blur-xl p-8 lg:p-12 overflow-y-auto pointer-events-auto border-t lg:border-t-0 lg:border-l border-white/10 text-left flex flex-col">
                      <div className="max-w-xl mx-auto lg:mx-0 w-full space-y-8">
                        {/* Header */}
                        <div>
                          <h2 className="text-3xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-3 leading-tight tracking-tight">
                            {currentSlide.content.property.name || "Property Name"}
                          </h2>
                          <p className="text-gray-400 text-lg flex items-center gap-2 font-medium">
                            <span className="text-emerald-500">📍</span> {currentSlide.content.property.address || "Address Unavailable"}
                          </p>
                        </div>

                        {/* AI Neighborhood Insights (New Feature) */}
                        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-2xl border border-blue-500/20 relative overflow-hidden group">
                          {/* AI Badge */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            AI Insights
                          </div>

                          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            Neighborhood Vibe
                          </h3>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {currentSlide.content.property.aiInsights ||
                              "This property is located in a high-demand area with excellent appreciation potential. " +
                              "The neighborhood features a mix of urban convenience and quiet residential charm, " +
                              "making it perfect for both families and young professionals looking for a vibrant community."}
                          </p>
                        </div>


                        {/* Stats Grid - Modern Cards */}
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: "Bedrooms", value: currentSlide.content.property.bedrooms, icon: "🛏️" },
                            { label: "Bathrooms", value: currentSlide.content.property.bathrooms, icon: "🚿" },
                            { label: "Square Ft", value: currentSlide.content.property.squareFeet, icon: "📏" }
                          ].map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                              <div className="text-2xl mb-1">{stat.icon}</div>
                              <div className="text-2xl font-bold text-white">{stat.value || 0}</div>
                              <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Features - Pill Tags */}
                        {currentSlide.content.property.features && currentSlide.content.property.features.length > 0 && (
                          <div>
                            <h3 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-4">Property Highlights</h3>
                            <div className="flex flex-wrap gap-2">
                              {currentSlide.content.property.features.slice(0, 10).map((feature: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-emerald-500/10 text-emerald-300 rounded-lg text-sm font-medium border border-emerald-500/20">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Agent Info - Floating Card */}
                        <div className="mt-auto pt-6 border-t border-white/10">
                          <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white text-xl border-2 border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                {currentSlide.content.property.agentName ? currentSlide.content.property.agentName.charAt(0) : 'A'}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Listed By</div>
                              <div className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{currentSlide.content.property.agentName || "Listing Agent"}</div>
                              <div className="text-sm text-gray-400">{currentSlide.content.property.agentPhone || "Contact for info"}</div>
                            </div>
                            <button className="px-5 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg active:scale-95 transform">
                              Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )
            ) : (
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
            )}
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
      {
        showControls && (
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
        )
      }

      {/* Settings Panel */}
      {
        showSettings && (
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
        )
      }

      {/* Slideshow Info (Positioned to avoid conflicts) */}
      <div className="absolute top-16 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded z-40 block md:hidden">
        <h2 className="font-semibold">{slideshow.name || slideshow.title}</h2>
        <p className="text-sm opacity-90">{slideshow.images.length} slides</p>
      </div>

    </div>
  );
}

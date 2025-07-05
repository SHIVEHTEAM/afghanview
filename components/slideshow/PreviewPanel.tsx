import React, { useState, useEffect } from "react";
import { Play, Pause, Image as ImageIcon } from "lucide-react";
import { SlideMedia, SlideshowSettings } from "./types";

interface PreviewPanelProps {
  media: SlideMedia[];
  currentSlide: number;
  isPlaying: boolean;
  settings: SlideshowSettings;
  onStartPreview: () => void;
  onStopPreview: () => void;
}

export default function PreviewPanel({
  media,
  currentSlide,
  isPlaying,
  settings,
  onStartPreview,
  onStopPreview,
}: PreviewPanelProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousSlide, setPreviousSlide] = useState(currentSlide);

  // Handle slide transitions
  useEffect(() => {
    if (currentSlide !== previousSlide) {
      setIsTransitioning(true);
      setPreviousSlide(currentSlide);

      // Reset transition state after transition duration
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, settings.transitionDuration);

      return () => clearTimeout(timer);
    }
  }, [currentSlide, previousSlide, settings.transitionDuration]);

  // Get transition styles based on current transition type
  const getTransitionStyles = () => {
    const duration = settings.transitionDuration;

    switch (settings.transition) {
      case "fade":
        return {
          transition: `opacity ${duration}ms ease-in-out`,
          opacity: isTransitioning ? 0.5 : 1,
        };
      case "slide":
        return {
          transition: `transform ${duration}ms ease-in-out`,
          transform: isTransitioning ? "translateX(-20px)" : "translateX(0)",
        };
      case "zoom":
        return {
          transition: `transform ${duration}ms ease-in-out`,
          transform: isTransitioning ? "scale(0.95)" : "scale(1)",
        };
      case "flip":
        return {
          transition: `transform ${duration}ms ease-in-out`,
          transform: isTransitioning ? "rotateY(10deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d" as const,
        };
      case "bounce":
        return {
          transition: `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
          transform: isTransitioning ? "scale(0.9)" : "scale(1)",
        };
      case "cube":
        return {
          transition: `transform ${duration}ms ease-in-out`,
          transform: isTransitioning
            ? "rotateY(15deg) translateZ(50px)"
            : "rotateY(0deg) translateZ(0)",
          transformStyle: "preserve-3d" as const,
        };
      case "page":
        return {
          transition: `transform ${duration}ms ease-in-out`,
          transform: isTransitioning ? "rotateY(20deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d" as const,
        };
      case "wipe":
        return {
          transition: `clip-path ${duration}ms ease-in-out`,
          clipPath: isTransitioning ? "inset(0 20% 0 0)" : "inset(0 0 0 0)",
        };
      default:
        return {
          transition: `opacity ${duration}ms ease-in-out`,
          opacity: isTransitioning ? 0.5 : 1,
        };
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Controls */}
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onStartPreview}
            disabled={media.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Start Preview
          </button>
          <button
            onClick={onStopPreview}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Pause className="w-4 h-4" />
            Stop
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Slide {currentSlide + 1} of {media.length}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-black flex items-center justify-center p-8">
        {media.length > 0 ? (
          <div className="relative w-full max-w-4xl">
            <div className="aspect-video bg-white rounded-xl overflow-hidden shadow-2xl">
              {(() => {
                const currentMedia = media[currentSlide];
                if (!currentMedia) return null;

                return (
                  <div
                    className="relative w-full h-full"
                    style={getTransitionStyles()}
                  >
                    {currentMedia.type === "video" ? (
                      <video
                        src={currentMedia.url}
                        className="w-full h-full object-cover"
                        autoPlay={isPlaying}
                        muted
                        loop={false}
                      />
                    ) : (
                      <img
                        src={currentMedia.url}
                        alt={currentMedia.name}
                        className="w-full h-full object-cover"
                        style={{
                          filter: currentMedia.effects
                            ? `
                              brightness(${currentMedia.effects.brightness}%)
                              contrast(${currentMedia.effects.contrast}%)
                              saturate(${currentMedia.effects.saturation}%)
                              blur(${currentMedia.effects.blur}px)
                            `
                            : undefined,
                        }}
                      />
                    )}

                    {/* Text Overlay */}
                    {currentMedia.textOverlay && (
                      <div
                        className={`absolute left-4 right-4 text-white text-center ${
                          currentMedia.textOverlay.position === "top"
                            ? "top-4"
                            : currentMedia.textOverlay.position === "center"
                            ? "top-1/2 transform -translate-y-1/2"
                            : "bottom-4"
                        }`}
                        style={{
                          fontSize: `${currentMedia.textOverlay.fontSize}px`,
                          color: currentMedia.textOverlay.color,
                          backgroundColor:
                            currentMedia.textOverlay.backgroundColor,
                          opacity: currentMedia.textOverlay.opacity,
                          padding: currentMedia.textOverlay.backgroundColor
                            ? "8px 16px"
                            : "0",
                          borderRadius: currentMedia.textOverlay.backgroundColor
                            ? "8px"
                            : "0",
                        }}
                      >
                        {currentMedia.textOverlay.text}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Progress Bar */}
            {isPlaying && (
              <div className="mt-4 bg-gray-800 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentSlide + 1) / media.length) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-white">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No media to preview</p>
            <p className="text-gray-400">Add some images or videos first</p>
          </div>
        )}
      </div>
    </div>
  );
}

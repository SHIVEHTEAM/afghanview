import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Eye, Clock, Star } from "lucide-react";

interface BeautifulPreviewProps {
  images: any[];
  settings: any;
  name: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  currentIndex?: number;
  totalCount?: number;
  showControls?: boolean;
  height?: string;
  backgroundColor?: string;
}

export default function BeautifulPreview({
  images,
  settings,
  name,
  isPlaying = false,
  onPlay,
  onPause,
  onReset,
  currentIndex = 0,
  totalCount,
  showControls = true,
  height = "h-96",
  backgroundColor = "#1f2937",
}: BeautifulPreviewProps) {
  const hasMultipleImages = images && images.length > 1;
  const currentImage = images?.[currentIndex];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      {showControls && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
            <div className="flex items-center gap-3">
              {hasMultipleImages && totalCount && (
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {totalCount}
                </span>
              )}
              {onReset && (
                <button
                  onClick={onReset}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              {onPlay &&
                onPause &&
                (isPlaying ? (
                  <button
                    onClick={onPause}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={onPlay}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide Display */}
      <div className={`${height} relative`} style={{ backgroundColor }}>
        {images && images.length > 0 ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            {/* Image/Video Display */}
            {currentImage?.type === "video" ||
            (currentImage?.file_path &&
              currentImage.file_path.match(
                /\.(mp4|webm|ogg|mov|avi|mkv)$/i
              )) ? (
              <video
                src={currentImage.file_path || currentImage.url}
                className="w-full h-full object-cover"
                autoPlay={isPlaying}
                muted
                loop
                playsInline
                controls={false}
              />
            ) : (
              <img
                src={
                  currentImage?.file_path ||
                  currentImage?.url ||
                  currentImage?.base64
                }
                alt={currentImage?.name || "Slide content"}
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay with slide info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {currentImage?.name || name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {totalCount || images.length} items
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {settings?.duration
                        ? `${settings.duration / 1000}s`
                        : "Auto"}
                    </span>
                    {settings?.transition && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {settings.transition}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image counter for multiple images */}
            {hasMultipleImages && (
              <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No content</p>
              <p className="text-sm">Add images or videos to see preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

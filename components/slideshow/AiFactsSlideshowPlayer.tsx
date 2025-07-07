import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateFact } from "../slideshow-creator/ai-facts/utils";

interface AiFact {
  id: string;
  text: string;
  backgroundColor: string;
  timestamp: Date;
}

interface AiFactsSlideshowPlayerProps {
  slideshow: {
    id: string;
    name: string;
    facts: AiFact[];
    settings: {
      autoRandomFact: boolean;
      randomFactInterval: number; // hours
      loopSlideshow: boolean;
      shuffleSlides: boolean;
      autoPlay: boolean;
      showControls: boolean;
      slideDuration: number;
      transition: string;
    };
  };
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

export default function AiFactsSlideshowPlayer({
  slideshow,
  isFullscreen = false,
  onFullscreenToggle,
}: AiFactsSlideshowPlayerProps) {
  const [facts, setFacts] = useState<AiFact[]>(slideshow.facts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(slideshow.settings.autoPlay);
  const [lastFactGeneration, setLastFactGeneration] = useState<Date>(
    new Date()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoGenIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate new facts
  useEffect(() => {
    if (!slideshow.settings.autoRandomFact) return;

    const checkAndGenerateFact = async () => {
      const now = new Date();
      const hoursSinceLastGeneration =
        (now.getTime() - lastFactGeneration.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastGeneration >= slideshow.settings.randomFactInterval) {
        try {
          setIsGenerating(true);
          console.log("Auto-generating new fact...");

          const fallbackPrompts = [
            "Share an interesting fact about Afghan culture",
            "Tell a story about Afghan hospitality",
            "Describe a traditional Afghan dish",
            "Share a famous Afghan proverb",
            "Describe a beautiful place in Afghanistan",
            "Tell about Afghan music or poetry",
            "Share a fact about Afghan history",
            "Describe an Afghan tradition or celebration",
          ];

          const randomPrompt =
            fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
          const data = await generateFact(randomPrompt);

          const newFact: AiFact = {
            id: Date.now().toString(),
            text: data.fact,
            backgroundColor: data.backgroundColor,
            timestamp: new Date(),
          };

          setFacts((prev) => [...prev, newFact]);
          setLastFactGeneration(now);
          console.log(
            "New fact generated:",
            newFact.text.substring(0, 50) + "..."
          );
        } catch (error) {
          console.error("Failed to auto-generate fact:", error);
        } finally {
          setIsGenerating(false);
        }
      }
    };

    // Check every hour
    autoGenIntervalRef.current = setInterval(
      checkAndGenerateFact,
      60 * 60 * 1000
    );

    // Initial check
    checkAndGenerateFact();

    return () => {
      if (autoGenIntervalRef.current) {
        clearInterval(autoGenIntervalRef.current);
      }
    };
  }, [
    slideshow.settings.autoRandomFact,
    slideshow.settings.randomFactInterval,
    lastFactGeneration,
  ]);

  // Normal slideshow logic
  useEffect(() => {
    if (isPlaying && facts.length > 0) {
      intervalRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % facts.length);
      }, slideshow.settings.slideDuration);

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [isPlaying, currentIndex, facts.length, slideshow.settings.slideDuration]);

  const currentFact = facts[currentIndex];

  if (!currentFact) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No facts available</p>
      </div>
    );
  }

  // Get transition variants based on selected transition
  const getTransitionVariants = (transitionType: string) => {
    switch (transitionType) {
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
      case "bounce":
        return {
          enter: { y: 50, opacity: 0 },
          center: { y: 0, opacity: 1 },
          exit: { y: -50, opacity: 0 },
        };
      default:
        return {
          enter: { opacity: 0 },
          center: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
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
            key={currentFact.id}
            variants={getTransitionVariants(slideshow.settings.transition)}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: currentFact.backgroundColor,
              perspective:
                slideshow.settings.transition === "flip" ? "1000px" : "none",
            }}
          >
            <div className="text-center px-8 max-w-4xl text-white">
              <p className="text-2xl leading-relaxed font-medium">
                {currentFact.text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Auto-generation indicator */}
        {slideshow.settings.autoRandomFact && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            {isGenerating ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                🔄 Auto-generating every {slideshow.settings.randomFactInterval}
                h
              </>
            )}
          </div>
        )}

        {/* Slide counter */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {facts.length}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: slideshow.settings.slideDuration / 1000,
              ease: "linear",
            }}
          />
        </div>
      </div>

      {/* Controls */}
      {slideshow.settings.showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + facts.length) % facts.length
              )
            }
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            ⬅️
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            {isPlaying ? "⏸️" : "▶️"}
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % facts.length)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            ➡️
          </button>

          <button
            onClick={() => setCurrentIndex(0)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            🔄
          </button>

          {onFullscreenToggle && (
            <button
              onClick={onFullscreenToggle}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              {isFullscreen ? "⏹️" : "⛶"}
            </button>
          )}
        </div>
      )}

      {/* Slideshow Info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
        <h2 className="font-semibold">{slideshow.name}</h2>
        <p className="text-sm opacity-90">{facts.length} facts</p>
        <p className="text-xs opacity-70">
          Transition: {slideshow.settings.transition}
        </p>
      </div>
    </div>
  );
}

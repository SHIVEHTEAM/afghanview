import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Slide {
  id: number;
  type: "image" | "menu" | "promo" | "quote" | "hours";
  src?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  quote?: string;
  author?: string;
  items?: string[];
  hours?: string[];
  duration: number;
}

interface SlideshowProps {
  slides: Slide[];
  currentSlide: number;
}

const Slideshow: React.FC<SlideshowProps> = ({ slides, currentSlide }) => {
  const slide = slides[currentSlide];

  const renderSlide = () => {
    switch (slide.type) {
      case "image":
        return (
          <div className="relative w-full h-screen">
            {slide.src && (
              <Image
                src={slide.src}
                alt={slide.title || "Afghan cuisine"}
                fill
                className="object-cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-32 left-12 right-12 text-white">
              <motion.h1
                className="text-6xl font-bold mb-6 text-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              <motion.p
                className="text-3xl text-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {slide.subtitle}
              </motion.p>
            </div>
          </div>
        );

      case "menu":
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-green via-afghan-red to-afghan-gold flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-8">
              <motion.h1
                className="text-6xl font-bold mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              <motion.p
                className="text-3xl mb-12 opacity-90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {slide.subtitle}
              </motion.p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {slide.items?.map((item, index) => (
                  <motion.div
                    key={index}
                    className="text-2xl font-medium bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case "promo":
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-gold via-afghan-red to-afghan-green flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-8">
              <motion.h1
                className="text-6xl font-bold mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              <motion.p
                className="text-4xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                className="text-5xl font-bold bg-white/20 backdrop-blur-sm rounded-2xl p-8 inline-block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                {slide.content}
              </motion.div>
            </div>
          </div>
        );

      case "hours":
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-green to-afghan-red flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-8">
              <motion.h1
                className="text-6xl font-bold mb-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              <div className="space-y-6">
                {slide.hours?.map((hour, index) => (
                  <motion.div
                    key={index}
                    className="text-3xl font-medium bg-white/10 backdrop-blur-sm rounded-lg p-6"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.2 }}
                  >
                    {hour}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case "quote":
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-gold to-afghan-red flex items-center justify-center">
            <div className="text-center text-white max-w-5xl mx-auto px-8">
              <motion.blockquote
                className="text-5xl font-light italic mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                "{slide.quote}"
              </motion.blockquote>
              <motion.cite
                className="text-3xl font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                — {slide.author}
              </motion.cite>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="relative w-full h-screen overflow-hidden"
      key={currentSlide}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {renderSlide()}
    </motion.div>
  );
};

export default Slideshow;

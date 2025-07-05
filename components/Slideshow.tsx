import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Slide } from "../lib/supabase";

interface SlideshowProps {
  slides: Slide[];
  currentSlide: number;
}

const Slideshow: React.FC<SlideshowProps> = ({ slides, currentSlide }) => {
  const slide = slides[currentSlide];

  if (!slide) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-afghan-green to-afghan-red flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">No Slides Available</h1>
          <p className="text-xl">Please add some slides to your slideshow</p>
        </div>
      </div>
    );
  }

  const renderSlide = () => {
    switch (slide.type) {
      case "image":
        const imageUrl =
          slide.images && slide.images.length > 0
            ? slide.images[0].image_url
            : null;
        return (
          <div className="relative w-full h-screen">
            {imageUrl && (
              <Image
                src={imageUrl}
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
              {slide.subtitle && (
                <motion.p
                  className="text-3xl text-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {slide.subtitle}
                </motion.p>
              )}
            </div>
          </div>
        );

      case "custom":
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-green to-afghan-red flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-8">
              <motion.h1
                className="text-6xl font-bold mb-6 text-shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              {slide.subtitle && (
                <motion.p
                  className="text-3xl mb-8 text-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {slide.subtitle}
                </motion.p>
              )}
              {slide.content &&
                typeof slide.content === "object" &&
                slide.content.text && (
                  <motion.div
                    className="text-2xl bg-black/30 backdrop-blur-sm rounded-2xl p-8 inline-block text-white border border-white/20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {slide.content.text}
                  </motion.div>
                )}
              {slide.content && typeof slide.content === "string" && (
                <motion.div
                  className="text-2xl bg-black/30 backdrop-blur-sm rounded-2xl p-8 inline-block text-white border border-white/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {slide.content}
                </motion.div>
              )}
            </div>
          </div>
        );

      case "menu":
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-green to-afghan-red flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-8">
              <motion.h1
                className="text-5xl font-bold mb-8 text-shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              {slide.subtitle && (
                <motion.p
                  className="text-2xl mb-8 text-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {slide.subtitle}
                </motion.p>
              )}
              {slide.content && typeof slide.content === "string" && (
                <motion.div
                  className="text-xl bg-black/30 backdrop-blur-sm rounded-2xl p-8 inline-block text-white border border-white/20 max-w-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <pre className="text-left font-sans whitespace-pre-wrap">
                    {slide.content}
                  </pre>
                </motion.div>
              )}
            </div>
          </div>
        );

      case "promo":
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-green to-afghan-red flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-8">
              <motion.h1
                className="text-5xl font-bold mb-8 text-shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              {slide.subtitle && (
                <motion.p
                  className="text-2xl mb-8 text-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {slide.subtitle}
                </motion.p>
              )}
              {slide.content && typeof slide.content === "string" && (
                <motion.div
                  className="text-3xl font-bold bg-yellow-500/90 text-black rounded-2xl p-8 inline-block border-4 border-yellow-300 shadow-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {slide.content}
                </motion.div>
              )}
            </div>
          </div>
        );

      case "quote":
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-green to-afghan-red flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-8">
              <motion.h1
                className="text-5xl font-bold mb-8 text-shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              {slide.content && typeof slide.content === "string" && (
                <motion.div
                  className="text-3xl italic bg-black/30 backdrop-blur-sm rounded-2xl p-8 inline-block text-white border border-white/20 max-w-3xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  "{slide.content}"
                </motion.div>
              )}
              {slide.subtitle && (
                <motion.p
                  className="text-2xl mt-6 text-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  — {slide.subtitle}
                </motion.p>
              )}
            </div>
          </div>
        );

      case "hours":
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-green to-afghan-red flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-8">
              <motion.h1
                className="text-5xl font-bold mb-8 text-shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              {slide.subtitle && (
                <motion.p
                  className="text-2xl mb-8 text-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {slide.subtitle}
                </motion.p>
              )}
              {slide.content && typeof slide.content === "string" && (
                <motion.div
                  className="text-2xl bg-black/30 backdrop-blur-sm rounded-2xl p-8 inline-block text-white border border-white/20 max-w-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <pre className="text-left font-sans whitespace-pre-wrap">
                    {slide.content}
                  </pre>
                </motion.div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-screen bg-gradient-to-br from-afghan-green to-afghan-red flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4 text-shadow-lg">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-2xl text-shadow-lg">{slide.subtitle}</p>
              )}
            </div>
          </div>
        );
    }
  };

  return <div className="w-full h-screen overflow-hidden">{renderSlide()}</div>;
};

export default Slideshow;

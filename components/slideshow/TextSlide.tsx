import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Quote } from "lucide-react";

interface TextSlideProps {
  text: string;
  category?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  showIcon?: boolean;
  animation?: "fade" | "slide" | "zoom" | "bounce";
}

export default function TextSlide({
  text,
  category = "Afghan Fact",
  backgroundColor = "#1f2937",
  textColor = "#ffffff",
  fontSize = 24,
  fontFamily = "Inter",
  showIcon = true,
  animation = "fade",
}: TextSlideProps) {
  const getAnimationProps = () => {
    switch (animation) {
      case "slide":
        return {
          initial: { x: 100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -100, opacity: 0 },
        };
      case "zoom":
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 },
        };
      case "bounce":
        return {
          initial: { y: 50, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -50, opacity: 0 },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center p-8 relative overflow-hidden"
      style={{ backgroundColor }}
      {...getAnimationProps()}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-current rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-current rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-current transform rotate-45"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Category Badge */}
        {category && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-medium mb-6"
            style={{ color: textColor }}
          >
            {showIcon && <Sparkles className="w-4 h-4" />}
            {category}
          </motion.div>
        )}

        {/* Quote Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-6"
        >
          <Quote
            className="w-16 h-16 mx-auto opacity-30"
            style={{ color: textColor }}
          />
        </motion.div>

        {/* Main Text */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mb-8"
        >
          <p
            className="leading-relaxed font-medium"
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontFamily,
              lineHeight: 1.6,
            }}
          >
            {text}
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex justify-center gap-4"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: textColor, opacity: 0.6 }}
          ></div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: textColor, opacity: 0.4 }}
          ></div>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: textColor, opacity: 0.6 }}
          ></div>
        </motion.div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-6 right-6 opacity-20">
        <div className="w-8 h-8 border-t-2 border-r-2 border-current rounded-tr-lg"></div>
      </div>
      <div className="absolute bottom-6 left-6 opacity-20">
        <div className="w-8 h-8 border-b-2 border-l-2 border-current rounded-bl-lg"></div>
      </div>
    </motion.div>
  );
}

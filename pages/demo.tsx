import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { Fullscreen, Minimize2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Slideshow from "@/components/Slideshow";
import RestaurantInfo from "@/components/RestaurantInfo";

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

export default function Demo() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Demo slideshow data
  const slides: Slide[] = [
    {
      id: 1,
      type: "image",
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Welcome to Afghan Palace",
      subtitle: "Authentic Afghan Cuisine & Culture",
      duration: 6000,
    },
    {
      id: 2,
      type: "menu",
      title: "Today's Specials",
      subtitle: "Fresh & Authentic",
      items: [
        "🍚 Kabuli Pulao - $22.99",
        "🥟 Mantu Dumplings - $18.99",
        "🍖 Qorma-e-Gosht - $24.99",
        "🥖 Naan-e-Afghan - $3.99",
      ],
      duration: 8000,
    },
    {
      id: 3,
      type: "image",
      src: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Traditional Afghan Hospitality",
      subtitle: "Experience the warmth of Afghan culture",
      duration: 6000,
    },
    {
      id: 4,
      type: "promo",
      title: "Weekend Special",
      subtitle: "Family Feast Package",
      content: "Get 20% off on orders over $50",
      duration: 7000,
    },
    {
      id: 5,
      type: "quote",
      quote: "The best way to experience a culture is through its food.",
      author: "Afghan Proverb",
      duration: 6000,
    },
    {
      id: 6,
      type: "hours",
      title: "Restaurant Hours",
      hours: [
        "Monday - Friday: 11:00 AM - 10:00 PM",
        "Saturday - Sunday: 12:00 PM - 11:00 PM",
      ],
      duration: 6000,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % slides.length);
    }, slides[currentSlide]?.duration || 6000);

    return () => clearInterval(interval);
  }, [currentSlide, slides]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <>
      <Head>
        <title>Demo - AfghanView Restaurant Display</title>
        <meta
          name="description"
          content="See AfghanView in action - Live demo of our restaurant display platform"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-black relative overflow-hidden">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="fixed top-6 left-6 z-50 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Fullscreen button */}
        <motion.button
          onClick={toggleFullscreen}
          className="fixed top-6 right-6 z-50 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 mr-2 inline" />
          ) : (
            <Fullscreen className="w-5 h-5 mr-2 inline" />
          )}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </motion.button>

        {/* Demo Info Overlay */}
        <motion.div
          className="fixed top-20 left-6 z-40 bg-white/15 backdrop-blur-md rounded-2xl p-4 text-white border border-white/20 shadow-2xl max-w-sm"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-lg font-bold mb-2">Live Demo</h3>
          <p className="text-sm opacity-90 mb-3">
            This is how AfghanView looks in your restaurant. Auto-playing
            slideshows with your content.
          </p>
          <Link
            href="/auth/signup"
            className="bg-afghan-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-afghan-green/90 transition-colors inline-block"
          >
            Get Started
          </Link>
        </motion.div>

        {/* Slideshow */}
        <AnimatePresence mode="wait">
          <Slideshow
            key={currentSlide}
            slides={slides}
            currentSlide={currentSlide}
          />
        </AnimatePresence>

        {/* Restaurant Info Overlay */}
        <RestaurantInfo />

        {/* Progress Bar */}
        <div className="fixed bottom-0 left-0 right-0 h-2 bg-black/50">
          <motion.div
            className="h-full bg-gradient-to-r from-afghan-green via-afghan-red to-afghan-gold"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Slide Counter */}
        <motion.div
          className="fixed bottom-6 left-6 text-white/80 text-lg font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {currentSlide + 1} / {slides.length}
        </motion.div>

        {/* Afghan Flag Colors Accent */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-afghan-green via-afghan-red to-afghan-gold"></div>
      </main>
    </>
  );
}

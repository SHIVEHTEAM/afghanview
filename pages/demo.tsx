import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Maximize, ArrowLeft, Eye } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function Demo() {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoUrl =
    "https://taoojskqlzxvhqfnzstu.supabase.co/storage/v1/object/public/slideshow-media/videos/e46a2c25-fe10-4fd2-a2bd-4c72969a898e/Black%20and%20White%20Minimalist%20Video%20Centric%20YouTube%20Outro.mp4";

  const toggleMute = () => setIsMuted(!isMuted);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const videoRef = React.useRef<HTMLDivElement>(null);

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        // Fullscreen request failed
      });
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        // Exit fullscreen failed
      });
    }
  };

  return (
    <>
      <Head>
        <title>Demo - Shivehview</title>
        <meta
          name="description"
          content="Experience Shivehview's AI-powered restaurant display platform in action"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <div className="min-h-screen bg-gray-900">
        {/* Main Demo Area */}
        <div className="pt-16 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            {/* Demo Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Live Demo
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Experience how Shivehview transforms any Smart TV into a
                cultural showcase.
              </p>
            </motion.div>

            {/* Video Display */}
            <motion.div
              ref={videoRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              style={{ aspectRatio: "16/9" }}
            >
              {/* Video Player */}
              <video
                src={videoUrl}
                autoPlay
                loop
                muted={isMuted}
                className="w-full h-full object-cover"
              />

              {/* Controls */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Simple CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

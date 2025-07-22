import React from "react";
import { motion } from "framer-motion";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 text-white">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/90">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Restaurant Displays
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-white">
              Transform Your Restaurant with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 font-extrabold drop-shadow-lg">
                Smart Digital Displays
              </span>
            </h1>

            <p className="text-xl text-white/80 leading-relaxed font-medium">
              Create stunning slideshows, showcase your menu, and engage
              customers with beautiful digital displays powered by AI. Perfect
              for Afghan restaurants and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-300 text-white font-semibold rounded-lg hover:bg-purple-800 transition-all duration-300 backdrop-blur-sm"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-purple-100">
              <div className="aspect-video bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <div className="text-2xl font-extrabold mb-2 text-white drop-shadow-lg">
                    Taimorian
                  </div>
                  <div className="text-lg font-semibold text-white/90 drop-shadow">
                    Authentic Afghan Cuisine
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                Live
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-purple-700 font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                📺 TV Display
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Image,
  Video,
  Sparkles,
  ChefHat,
  Gift,
  Type,
  Plus,
  X,
  Brain,
} from "lucide-react";

interface SlideshowCreatorProps {
  onClose: () => void;
  onStartCreation: (type: string) => void;
}

const slideshowTypes = [
  {
    id: "image",
    title: "Image Slideshow",
    description: "Create slideshows from photos",
    icon: Image,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "video",
    title: "Video Slideshow",
    description: "Create slideshows from videos",
    icon: Video,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "ai-facts",
    title: "AI Facts",
    description: "Generate Afghan cultural facts with AI",
    icon: Sparkles,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "ai-all-in-one",
    title: "AI All-in-One",
    description: "Generate complete slideshows from a single prompt",
    icon: Brain,
    color: "from-pink-500 to-purple-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    id: "menu",
    title: "Menu Slideshow",
    description: "Create menu displays",
    icon: ChefHat,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "deals",
    title: "Special Deals",
    description: "Promote offers and deals",
    icon: Gift,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    id: "text",
    title: "Text Slideshow",
    description: "Create text announcements",
    icon: Type,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
];

export default function SlideshowCreator({
  onClose,
  onStartCreation,
}: SlideshowCreatorProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plus className="w-6 h-6" />
              <h2 className="text-xl font-bold">Create New Slideshow</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 text-center">
            Choose the type of slideshow you want to create
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slideshowTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartCreation(type.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${type.bgColor} ${type.borderColor} hover:border-opacity-60`}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div
                      className={`p-3 rounded-full bg-gradient-to-r ${type.color} text-white`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Settings,
  Image as ImageIcon,
  FileText,
  Quote,
  Clock,
  Tag,
  Copy,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";

interface Slide {
  id: number;
  type: "image" | "menu" | "promo" | "quote" | "hours";
  title: string;
  subtitle?: string;
  content?: string;
  src?: string;
  duration: number;
  isActive: boolean;
  order: number;
}

export default function ClientDashboard() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      type: "image",
      title: "Welcome to Afghan Palace",
      subtitle: "Authentic Afghan Cuisine & Culture",
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      duration: 6000,
      isActive: true,
      order: 1,
    },
    {
      id: 2,
      type: "menu",
      title: "Today's Specials",
      subtitle: "Fresh & Authentic",
      content:
        "🍚 Kabuli Pulao - $22.99\n🥟 Mantu Dumplings - $18.99\n🍖 Qorma-e-Gosht - $24.99\n🥖 Naan-e-Afghan - $3.99",
      duration: 8000,
      isActive: true,
      order: 2,
    },
    {
      id: 3,
      type: "promo",
      title: "Weekend Special",
      subtitle: "Family Feast Package",
      content: "Get 20% off on orders over $50",
      duration: 7000,
      isActive: false,
      order: 3,
    },
  ]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

  const slideTypes = [
    { value: "image", label: "Image Slide", icon: ImageIcon },
    { value: "menu", label: "Menu Slide", icon: FileText },
    { value: "promo", label: "Promotion Slide", icon: Tag },
    { value: "quote", label: "Quote Slide", icon: Quote },
    { value: "hours", label: "Hours Slide", icon: Clock },
  ];

  const getSlideTypeIcon = (type: string) => {
    const slideType = slideTypes.find((t) => t.value === type);
    return slideType ? slideType.icon : ImageIcon;
  };

  const handleAddSlide = () => {
    setShowAddModal(true);
    setEditingSlide(null);
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setShowAddModal(true);
  };

  const handleDeleteSlide = (id: number) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      setSlides(slides.filter((slide) => slide.id !== id));
    }
  };

  const handleToggleActive = (id: number) => {
    setSlides(
      slides.map((slide) =>
        slide.id === id ? { ...slide, isActive: !slide.isActive } : slide
      )
    );
  };

  const copyRestaurantUrl = () => {
    navigator.clipboard.writeText(
      "https://afghanview.com/restaurant/afghan-palace"
    );
    alert("Restaurant URL copied to clipboard!");
  };

  const activeSlides = slides.filter((slide) => slide.isActive);

  return (
    <ProtectedRoute requiredRole="restaurant_owner">
      <>
        <Head>
          <title>Client Dashboard - AfghanView</title>
          <meta name="description" content="Manage your restaurant slideshow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <Link
                    href="/"
                    className="text-afghan-green hover:text-afghan-green/80"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Afghan Palace Dashboard
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isPlaying
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 mr-1 inline" />
                    ) : (
                      <Play className="w-4 h-4 mr-1 inline" />
                    )}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <Link
                    href="/restaurant/afghan-palace"
                    target="_blank"
                    className="bg-afghan-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-afghan-green/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1 inline" />
                    View Display
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Slides
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {slides.length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Active Slides
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {activeSlides.length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Duration
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Math.round(
                        activeSlides.reduce(
                          (sum, slide) => sum + slide.duration,
                          0
                        ) / 1000
                      )}
                      s
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Settings className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {isPlaying ? "Playing" : "Paused"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleAddSlide}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-afghan-green hover:bg-afghan-green/5 transition-colors"
                >
                  <Plus className="w-6 h-6 text-gray-400 mr-2" />
                  <span className="text-gray-600 font-medium">
                    Add New Slide
                  </span>
                </button>
                <button
                  onClick={copyRestaurantUrl}
                  className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Copy className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="text-blue-700 font-medium">
                    Copy Display URL
                  </span>
                </button>
                <Link
                  href="/restaurant/afghan-palace"
                  target="_blank"
                  className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <ExternalLink className="w-6 h-6 text-green-600 mr-2" />
                  <span className="text-green-700 font-medium">
                    Preview Display
                  </span>
                </Link>
              </div>
            </div>

            {/* Slides List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Slides
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {slides.map((slide, index) => (
                  <motion.div
                    key={slide.id}
                    className="p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {React.createElement(getSlideTypeIcon(slide.type), {
                            className: "w-5 h-5 text-gray-600",
                          })}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {slide.title}
                          </h3>
                          {slide.subtitle && (
                            <p className="text-sm text-gray-500">
                              {slide.subtitle}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-400">
                              Duration: {slide.duration / 1000}s
                            </span>
                            <span className="text-xs text-gray-400">
                              Order: {slide.order}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                slide.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {slide.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(slide.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            slide.isActive
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                        >
                          {slide.isActive ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditSlide(slide)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingSlide ? "Edit Slide" : "Add New Slide"}
                  </h3>

                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slide Type
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-afghan-green">
                        {slideTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-afghan-green"
                        placeholder="Enter slide title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-afghan-green"
                        placeholder="6"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-afghan-green text-white px-4 py-2 rounded-md hover:bg-afghan-green/90 transition-colors"
                      >
                        {editingSlide ? "Update" : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  );
}

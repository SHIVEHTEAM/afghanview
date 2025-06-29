import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Image as ImageIcon,
  FileText,
  Quote,
  Clock,
  Tag,
} from "lucide-react";
import AdminLayout from "./layout";

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

export default function SlideshowManagement() {
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
      isActive: true,
      order: 3,
    },
  ]);

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

  return (
    <>
      <Head>
        <title>Slideshow Management - AfghanView Admin</title>
        <meta
          name="description"
          content="Manage your restaurant slideshow content"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Slideshow Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your restaurant's slideshow content and settings.
              </p>
            </div>
            <motion.button
              onClick={handleAddSlide}
              className="bg-afghan-green text-white px-4 py-2 rounded-lg hover:bg-afghan-green/90 transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Slide
            </motion.button>
          </div>

          {/* Slides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide, index) => {
              const Icon = getSlideTypeIcon(slide.type);
              return (
                <motion.div
                  key={slide.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Slide Preview */}
                  <div className="relative h-48 bg-gray-100">
                    {slide.src ? (
                      <img
                        src={slide.src}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Icon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          slide.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {slide.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Slide Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 capitalize">
                          {slide.type}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        #{slide.order}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">
                      {slide.title}
                    </h3>
                    {slide.subtitle && (
                      <p className="text-sm text-gray-600 mb-2">
                        {slide.subtitle}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{slide.duration / 1000}s</span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSlide(slide)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(slide.id)}
                        className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center ${
                          slide.isActive
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {slide.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {slides.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No slides
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first slide.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleAddSlide}
                  className="bg-afghan-green text-white px-4 py-2 rounded-lg hover:bg-afghan-green/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add New Slide
                </button>
              </div>
            </motion.div>
          )}
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
      </AdminLayout>
    </>
  );
}

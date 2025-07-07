import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Plus,
  Play,
  Image as ImageIcon,
  Music,
  Palette,
  Edit,
  Trash2,
  Upload,
  Power,
  PowerOff,
  Clock,
  Eye,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Download,
  Share,
  Copy,
  Star,
  Users,
  Settings,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "../../components/auth";
import { ImageSlideshowEditor } from "../../components/editor";
import { SimpleImageViewer } from "../../components/slideshow";
import { DeleteConfirmationModal } from "../../components/common";
import { useAuth } from "../../lib/auth";
import { SlideshowSettings } from "../../components/slideshow";
import AdminLayout from "./layout";

interface SlideImage {
  id: string;
  file: File;
  url: string;
  name: string;
}

interface SavedSlideshow {
  id: string;
  images: SlideImage[];
  settings: SlideshowSettings;
  createdAt: Date;
  name: string;
  isActive: boolean;
  playCount: number;
  lastPlayed?: Date;
  mediaType?: "image" | "video";
}

export default function AdminSlideshow() {
  const [savedSlideshows, setSavedSlideshows] = useState<SavedSlideshow[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentSlideshow, setCurrentSlideshow] =
    useState<SavedSlideshow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Load saved slideshows from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin-slideshows");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedSlideshows(
          parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }))
        );
      } catch (error) {
        console.error("Error loading saved slideshows:", error);
      }
    }
  }, []);

  // Save slideshows to localStorage
  const saveSlideshows = (slideshows: SavedSlideshow[]) => {
    localStorage.setItem("admin-slideshows", JSON.stringify(slideshows));
  };

  const handleSaveSlideshow = (
    images: SlideImage[],
    settings: SlideshowSettings
  ) => {
    // Convert File to URL for the viewer
    const viewerSettings = {
      ...settings,
      backgroundMusic:
        settings.backgroundMusic instanceof File
          ? URL.createObjectURL(settings.backgroundMusic)
          : settings.backgroundMusic,
    };

    const newSlideshow: SavedSlideshow = {
      id: Math.random().toString(36).substr(2, 9),
      images,
      settings: viewerSettings,
      createdAt: new Date(),
      name: `Admin Slideshow ${savedSlideshows.length + 1}`,
      isActive: true,
      playCount: 0,
    };

    const updatedSlideshows = [...savedSlideshows, newSlideshow];
    setSavedSlideshows(updatedSlideshows);
    saveSlideshows(updatedSlideshows);
    setShowEditor(false);
  };

  const handleDeleteSlideshow = (id: string) => {
    if (!confirm("Are you sure you want to delete this slideshow?")) return;

    const updatedSlideshows = savedSlideshows.filter((s) => s.id !== id);
    setSavedSlideshows(updatedSlideshows);
    saveSlideshows(updatedSlideshows);
  };

  const handlePlaySlideshow = (slideshow: SavedSlideshow) => {
    setCurrentSlideshow(slideshow);
    setShowViewer(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <Head>
            <title>Admin - Image Slideshow Manager</title>
            <meta
              name="description"
              content="Manage image slideshows for your restaurant"
            />
          </Head>

          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Admin Slideshow Manager
                    </h1>
                    <p className="text-sm text-gray-600">
                      Create and manage image slideshows for your restaurant
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/client"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    View Client Page
                  </Link>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Slideshow
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {savedSlideshows.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-12 h-12 text-gray-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Create Your First Admin Slideshow
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Upload images, add background music, choose transitions, and
                  create professional slideshows for your restaurant display.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                    <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Upload Images
                    </h3>
                    <p className="text-gray-600">
                      Drag & drop your restaurant images or browse to select
                      them
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                    <Palette className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Choose Transitions
                    </h3>
                    <p className="text-gray-600">
                      Pick from fade, slide, zoom, flip, and bounce effects
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                    <Music className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Add Music</h3>
                    <p className="text-gray-600">
                      Upload background music to enhance your presentation
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowEditor(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  Start Creating
                </button>
              </div>
            ) : (
              /* Slideshows Grid */
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Admin Slideshows
                  </h2>
                  <p className="text-gray-600">
                    {savedSlideshows.length} slideshow
                    {savedSlideshows.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedSlideshows.map((slideshow) => (
                    <motion.div
                      key={slideshow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 overflow-hidden group"
                    >
                      {/* Preview Image */}
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        {slideshow.images.length > 0 ? (
                          <img
                            src={slideshow.images[0].url}
                            alt={slideshow.images[0].name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <ImageIcon className="w-12 h-12" />
                          </div>
                        )}

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                            <button
                              onClick={() => handlePlaySlideshow(slideshow)}
                              className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Play className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentSlideshow(slideshow);
                                setShowEditor(true);
                              }}
                              className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentSlideshow(slideshow);
                                setShowDeleteConfirmation(true);
                              }}
                              className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Media Count Badge */}
                        {slideshow.images.length > 1 && (
                          <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs">
                            {slideshow.images.length}{" "}
                            {slideshow.mediaType === "video"
                              ? "videos"
                              : "images"}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {slideshow.name}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <span>
                            {slideshow.images.length}{" "}
                            {slideshow.mediaType === "video"
                              ? "video"
                              : "image"}
                            {slideshow.images.length !== 1 ? "s" : ""}
                          </span>
                          <span>
                            {slideshow.settings.duration / 1000}s per slide
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Palette className="w-3 h-3" />
                            {slideshow.settings.transition}
                          </span>
                          {slideshow.settings.backgroundMusic && (
                            <span className="flex items-center gap-1">
                              <Music className="w-3 h-3" />
                              Music
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400">
                          Created {formatDate(slideshow.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Editor Modal */}
          {showEditor && (
            <ImageSlideshowEditor
              restaurantId={"mock-restaurant-id"}
              userId={"mock-user-id"}
              onSave={handleSaveSlideshow}
              onCancel={() => setShowEditor(false)}
            />
          )}

          {/* Viewer Modal */}
          {showViewer && currentSlideshow && (
            <SimpleImageViewer
              images={currentSlideshow.images}
              settings={{
                duration: currentSlideshow.settings.defaultDuration || 5000,
                transition: currentSlideshow.settings.transition as any,
                autoPlay: currentSlideshow.settings.autoPlay || true,
                showControls: currentSlideshow.settings.showControls || true,
              }}
              onClose={() => setShowViewer(false)}
            />
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirmation && currentSlideshow && (
            <DeleteConfirmationModal
              isOpen={showDeleteConfirmation}
              onClose={() => setShowDeleteConfirmation(false)}
              onConfirm={() => {
                handleDeleteSlideshow(currentSlideshow.id);
                setShowDeleteConfirmation(false);
              }}
              title="Delete Slideshow"
              message="Are you sure you want to delete this slideshow? This action cannot be undone and will permanently remove the slideshow and all its images."
              itemName={currentSlideshow.name}
              type="slideshow"
            />
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

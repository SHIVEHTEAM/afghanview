import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Clock,
  Music,
  Palette,
  Eye,
  TrendingUp,
  BarChart3,
  Users,
  Building,
  Image,
  Link,
  Copy,
  ExternalLink,
  Sparkles,
  Calendar,
  Heart,
  Share2,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  QrCode,
  X,
  Star,
  Award,
  Activity,
  Target,
  Zap,
  Check,
} from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoute";
import ImageSlideshowEditor from "../../components/ImageSlideshowEditor";
import SimpleImageViewer from "../../components/slideshow/SimpleImageViewer";
import ClientLayout from "./layout";
import { useAuth } from "../../lib/auth";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import TvManager from "../../components/TvManager";
import TvQrCode from "../../components/TvQrCode";

import {
  SlideMedia,
  SlideshowSettings,
} from "../../components/slideshow/types";

interface SlideImage extends SlideMedia {
  base64?: string;
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
  publicLink?: string;
  slug?: string;
  isFavorite?: boolean;
  isTemplate?: boolean;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [savedSlideshows, setSavedSlideshows] = useState<SavedSlideshow[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentSlideshow, setCurrentSlideshow] =
    useState<SavedSlideshow | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedSlideshowId, setSelectedSlideshowId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"slideshows" | "tvs">(
    "slideshows"
  );
  const [showQrCode, setShowQrCode] = useState<string | null>(null);

  // Load saved slideshows from API
  useEffect(() => {
    const loadSlideshows = async () => {
      try {
        const response = await fetch(
          `/api/slideshows?restaurantId=e46a2c25-fe10-4fd2-a2bd-4c72969a898e&userId=${
            user?.id || "default-user"
          }`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const slideshows = await response.json();
        console.log("[Client] Loaded slideshows:", slideshows);

        // Debug: Check image types
        slideshows.forEach((slideshow: any, index: number) => {
          console.log(
            `[Client] Slideshow ${index} (${slideshow.name}) images:`,
            slideshow.images
          );
          slideshow.images.forEach((img: any, imgIndex: number) => {
            console.log(`[Client] Image ${imgIndex}:`, {
              name: img.name,
              type: img.type,
              file_path: img.file_path,
              url: img.url,
            });
          });
        });

        // Convert date strings to Date objects
        const slideshowsWithProperDates = slideshows.map((slideshow: any) => ({
          ...slideshow,
          createdAt: new Date(slideshow.createdAt),
          lastPlayed: slideshow.lastPlayed
            ? new Date(slideshow.lastPlayed)
            : undefined,
        }));

        setSavedSlideshows(slideshowsWithProperDates);
      } catch (error) {
        console.error("Error loading slideshows:", error);
      }
    };

    loadSlideshows();
  }, []);

  // Save slideshows to localStorage
  const saveSlideshows = (slideshows: SavedSlideshow[]) => {
    localStorage.setItem("client-slideshows", JSON.stringify(slideshows));
  };

  // Convert File to base64 for persistence
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Generate unique slug for public link
  const generateSlug = (name: string): string => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).substr(2, 6)
    );
  };

  const handleSaveSlideshow = async (
    media: SlideMedia[],
    settings: SlideshowSettings
  ) => {
    try {
      const slideshowName = `Client Slideshow ${savedSlideshows.length + 1}`;
      const slug = generateSlug(slideshowName);

      // Save slideshow via API
      const response = await fetch("/api/slideshows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: slideshowName,
          images: media.map((img) => ({
            id: img.id,
            file_path: img.file_path || img.url,
            name: img.name,
            type: img.type,
          })),
          settings: {
            ...settings,
            backgroundMusic:
              settings.backgroundMusic instanceof File
                ? await fileToBase64(settings.backgroundMusic)
                : settings.backgroundMusic,
          },
          restaurantId: "e46a2c25-fe10-4fd2-a2bd-4c72969a898e", // Real restaurant ID from test data
          userId: user?.id || "default-user", // Get from auth context
          slug,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save slideshow: ${response.statusText}`);
      }

      const newSlideshow = await response.json();

      // Convert date strings to Date objects
      const slideshowWithProperDates = {
        ...newSlideshow,
        createdAt: new Date(newSlideshow.createdAt),
        lastPlayed: newSlideshow.lastPlayed
          ? new Date(newSlideshow.lastPlayed)
          : undefined,
      };

      const updatedSlideshows = [...savedSlideshows, slideshowWithProperDates];
      setSavedSlideshows(updatedSlideshows);
      saveSlideshows(updatedSlideshows);
      setShowEditor(false);
    } catch (error) {
      console.error("Error saving slideshow:", error);
      alert("Error saving slideshow. Please try again.");
    }
  };

  const handleDeleteSlideshow = (id: string) => {
    setSelectedSlideshowId(id);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSlideshowId) return;

    try {
      const response = await fetch(`/api/slideshows/${selectedSlideshowId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedSlideshows = savedSlideshows.filter(
          (slideshow) => slideshow.id !== selectedSlideshowId
        );
        setSavedSlideshows(updatedSlideshows);
        saveSlideshows(updatedSlideshows);
      } else {
        console.error("Failed to delete slideshow");
      }
    } catch (error) {
      console.error("Error deleting slideshow:", error);
    }

    setShowDeleteConfirmation(false);
    setSelectedSlideshowId(null);
  };

  const handlePlaySlideshow = (slideshow: SavedSlideshow) => {
    setCurrentSlideshow(slideshow);
    setShowViewer(true);
  };

  const handleToggleActive = (slideshow: SavedSlideshow) => {
    const updatedSlideshows = savedSlideshows.map((s) =>
      s.id === slideshow.id ? { ...s, isActive: !s.isActive } : s
    );
    setSavedSlideshows(updatedSlideshows);
    saveSlideshows(updatedSlideshows);
  };

  const handleCopyLink = async (slideshow: SavedSlideshow) => {
    const link = `${window.location.origin}/slideshow/${slideshow.slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(slideshow.id);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleToggleFavorite = (slideshow: SavedSlideshow) => {
    const updatedSlideshows = savedSlideshows.map((s) =>
      s.id === slideshow.id ? { ...s, isFavorite: !s.isFavorite } : s
    );
    setSavedSlideshows(updatedSlideshows);
    saveSlideshows(updatedSlideshows);
  };

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActiveSlideshow = () => {
    return savedSlideshows.find((slideshow) => slideshow.isActive);
  };

  const activeSlideshow = getActiveSlideshow();

  // Calculate stats
  const stats = {
    total: savedSlideshows.length,
    active: savedSlideshows.filter((s) => s.isActive).length,
    inactive: savedSlideshows.filter((s) => !s.isActive).length,
    totalPlays: savedSlideshows.reduce((sum, s) => sum + s.playCount, 0),
    favorites: savedSlideshows.filter((s) => s.isFavorite).length,
  };

  return (
    <ProtectedRoute requiredRole="restaurant_owner">
      <ClientLayout>
        <Head>
          <title>Dashboard - AfghanView</title>
          <meta name="description" content="Manage your slideshows" />
        </Head>

        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.first_name || "User"}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your slideshows and track performance
              </p>
            </div>
            <button
              onClick={() => setShowEditor(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Slideshow
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.active}
              </div>
              <div className="text-sm text-gray-600 font-medium">Active</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="text-3xl font-bold text-gray-600 mb-1">
                {stats.inactive}
              </div>
              <div className="text-sm text-gray-600 font-medium">Inactive</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.totalPlays}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Plays
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {stats.favorites}
              </div>
              <div className="text-sm text-gray-600 font-medium">Favorites</div>
            </motion.div>
          </div>

          {/* Active Slideshow Banner */}
          {activeSlideshow && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    🎬 Currently Playing: {activeSlideshow.name}
                  </h3>
                  <p className="text-green-100">
                    {activeSlideshow.images.length} images •{" "}
                    {activeSlideshow.settings.duration / 1000}s duration
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center text-green-100">
                    <Activity className="w-4 h-4 mr-2" />
                    {activeSlideshow.playCount} plays
                  </span>
                  <button
                    onClick={() => handleToggleActive(activeSlideshow)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Stop
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("slideshows")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "slideshows"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Image className="w-4 h-4 inline mr-2" />
              Slideshows
            </button>
            <button
              onClick={() => setActiveTab("tvs")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "tvs"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Tv className="w-4 h-4 inline mr-2" />
              TV Displays
            </button>
          </div>

          {/* Content */}
          {activeTab === "slideshows" ? (
            <div>
              {savedSlideshows.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">📺</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No slideshows yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first slideshow to get started
                  </p>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Slideshow
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedSlideshows.map((slideshow, index) => (
                    <motion.div
                      key={slideshow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                    >
                      {/* Preview Image */}
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {slideshow.images.length > 0 ? (
                          <img
                            src={slideshow.images[0].url}
                            alt={slideshow.images[0].name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <Eye className="w-12 h-12" />
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          {slideshow.isActive ? (
                            <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
                              <Power className="w-3 h-3" />
                              Active
                            </div>
                          ) : (
                            <div className="bg-gray-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
                              <PowerOff className="w-3 h-3" />
                              Inactive
                            </div>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={() => handleToggleFavorite(slideshow)}
                          className={`absolute top-3 right-3 p-1 rounded-full transition-all duration-200 ${
                            slideshow.isFavorite
                              ? "text-yellow-400 bg-yellow-50"
                              : "text-gray-400 hover:text-yellow-400 hover:bg-gray-50"
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              slideshow.isFavorite ? "fill-current" : ""
                            }`}
                          />
                        </button>

                        {/* Play Count */}
                        {slideshow.playCount > 0 && (
                          <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                            {slideshow.playCount} plays
                          </div>
                        )}

                        {/* Image Count Badge */}
                        {slideshow.images.length > 1 && (
                          <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                            {slideshow.images.length} images
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-gray-900 text-lg leading-tight flex-1">
                            {slideshow.name}
                          </h4>
                          <button
                            onClick={() => handleToggleFavorite(slideshow)}
                            className={`p-2 rounded-xl transition-all duration-200 ${
                              slideshow.isFavorite
                                ? "text-yellow-400 bg-yellow-50"
                                : "text-gray-400 hover:text-yellow-400 hover:bg-gray-50"
                            }`}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                slideshow.isFavorite ? "fill-current" : ""
                              }`}
                            />
                          </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {slideshow.images.length} image
                            {slideshow.images.length !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {slideshow.settings.duration / 1000}s
                          </span>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {slideshow.isTemplate && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Star className="w-3 h-3 mr-1" />
                              Template
                            </span>
                          )}
                          {slideshow.settings.transition && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Palette className="w-3 h-3 mr-1" />
                              {slideshow.settings.transition}
                            </span>
                          )}
                          {slideshow.settings.backgroundMusic && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Music className="w-3 h-3 mr-1" />
                              Music
                            </span>
                          )}
                          {slideshow.lastPlayed && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(slideshow.lastPlayed)}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mb-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePlaySlideshow(slideshow)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                          >
                            <Play className="w-4 h-4" />
                            Play
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleActive(slideshow)}
                            className={`px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                              slideshow.isActive
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            title={
                              slideshow.isActive ? "Deactivate" : "Activate"
                            }
                          >
                            {slideshow.isActive ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCopyLink(slideshow)}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Copy Link"
                          >
                            {copiedLink === slideshow.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Link className="w-4 h-4" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteSlideshow(slideshow.id)}
                            className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <TvManager
              restaurantId="e46a2c25-fe10-4fd2-a2bd-4c72969a898e"
              slideshows={savedSlideshows.map((s) => ({
                id: s.id,
                name: s.name,
                slug: s.slug || "",
              }))}
            />
          )}
        </div>

        {/* Slideshow Editor Modal */}
        {showEditor && (
          <ImageSlideshowEditor
            onSave={handleSaveSlideshow}
            onCancel={() => setShowEditor(false)}
            restaurantId="e46a2c25-fe10-4fd2-a2bd-4c72969a898e"
            userId={user?.id || "default-user"}
          />
        )}

        {/* Slideshow Viewer Modal */}
        {showViewer && currentSlideshow && (
          <SimpleImageViewer
            images={currentSlideshow.images}
            settings={currentSlideshow.settings}
            onClose={() => {
              setShowViewer(false);
              setCurrentSlideshow(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Slideshow"
          message="Are you sure you want to delete this slideshow? This action cannot be undone."
        />

        {/* QR Code Modal */}
        {showQrCode && (
          <TvQrCode
            slideshowId={showQrCode}
            slideshowName={
              savedSlideshows.find((s) => s.id === showQrCode)?.name ||
              "Slideshow"
            }
            baseUrl={
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000"
            }
            onClose={() => setShowQrCode(null)}
          />
        )}
      </ClientLayout>
    </ProtectedRoute>
  );
}

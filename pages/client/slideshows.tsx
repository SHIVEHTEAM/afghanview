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
  X,
  RefreshCw,
} from "lucide-react";
import { ProtectedRoute } from "../../components/auth";
import SlideshowCreator from "../../components/slideshow-creator/SlideshowCreator";
import SlideshowWizard from "../../components/slideshow-creator/SlideshowWizard";
import ImageSlideshowWizard from "../../components/slideshow-creator/image/ImageSlideshowWizard";
import VideoSlideshowWizard from "../../components/slideshow-creator/video/VideoSlideshowWizard";
import { SimpleImageViewer } from "../../components/slideshow";
import { DeleteConfirmationModal } from "../../components/common";
import { ImageSlideshowEditor } from "../../components/editor";
import ClientLayout from "./layout";
import { useAuth } from "../../lib/auth";
import { SlideshowSettings } from "../../components/slideshow";

interface SlideImage {
  id: string;
  file?: File;
  url?: string;
  name: string;
  type?: "image" | "video";
  file_path?: string;
  base64?: string;
}

interface SavedSlideshow {
  id: string;
  name: string;
  restaurant_id: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  // Additional fields for compatibility
  images?: SlideImage[];
  settings?: SlideshowSettings;
  isActive?: boolean;
  playCount?: number;
  lastPlayed?: Date;
  isFavorite?: boolean;
  tags?: string[];
  mediaType?: "image" | "video";
}

export default function SlideshowsPage() {
  const { user } = useAuth();
  const [savedSlideshows, setSavedSlideshows] = useState<SavedSlideshow[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardType, setWizardType] = useState<string>("");
  const [showViewer, setShowViewer] = useState(false);
  const [currentSlideshow, setCurrentSlideshow] =
    useState<SavedSlideshow | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "name" | "created" | "plays" | "lastPlayed"
  >("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSlideshows, setSelectedSlideshows] = useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedSlideshowId, setSelectedSlideshowId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch slideshows from API
  const fetchSlideshows = async () => {
    try {
      const response = await fetch("/api/slideshows");
      if (!response.ok) {
        throw new Error("Failed to fetch slideshows");
      }
      const data = await response.json();
      setSavedSlideshows(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch slideshows"
      );
    }
  };

  // Load slideshows on component mount and when user changes
  useEffect(() => {
    fetchSlideshows();
  }, [user?.restaurant?.id, user?.id]);

  const handleStartCreation = (type: string) => {
    setWizardType(type);
    setShowCreator(false);
    setShowWizard(true);
  };

  const handleSaveSlideshow = async (slideshowData: any) => {
    try {
      const response = await fetch("/api/slideshows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...slideshowData,
          restaurant_id: user?.restaurant?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create slideshow");
      }

      const newSlideshow = await response.json();
      setSavedSlideshows([newSlideshow, ...savedSlideshows]);
      setShowCreator(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create slideshow"
      );
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

      if (!response.ok) {
        throw new Error("Failed to delete slideshow");
      }

      await fetchSlideshows();
      setSelectedSlideshows(
        selectedSlideshows.filter((s) => s !== selectedSlideshowId)
      );
      setShowDeleteConfirmation(false);
      setSelectedSlideshowId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete slideshow"
      );
    }
  };

  const handlePlaySlideshow = (slideshow: SavedSlideshow) => {
    // For now, just open the viewer
    // TODO: Implement play tracking
    setCurrentSlideshow(slideshow);
    setShowViewer(true);
  };

  const handleToggleActive = async (slideshow: SavedSlideshow) => {
    // TODO: Implement API call to toggle active status
    const updatedSlideshows = savedSlideshows.map((s) =>
      s.id === slideshow.id ? { ...s, isActive: !s.isActive } : s
    );
    setSavedSlideshows(updatedSlideshows);
  };

  const handleToggleFavorite = (slideshow: SavedSlideshow) => {
    const updatedSlideshows = savedSlideshows.map((s) =>
      s.id === slideshow.id ? { ...s, isFavorite: !s.isFavorite } : s
    );
    setSavedSlideshows(updatedSlideshows);
  };

  const handleDuplicateSlideshow = async (slideshow: SavedSlideshow) => {
    try {
      const response = await fetch("/api/slideshows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${slideshow.name} (Copy)`,
          restaurant_id: user?.restaurant?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate slideshow");
      }

      await fetchSlideshows();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to duplicate slideshow"
      );
    }
  };

  const handleEditSlideshow = (slideshow: SavedSlideshow) => {
    setCurrentSlideshow(slideshow);
    setShowEditor(true);
  };

  const handleBulkAction = async (action: string) => {
    if (!selectedSlideshows.length) return;

    try {
      switch (action) {
        case "activate":
          const activatedSlideshows = savedSlideshows.map((s) =>
            selectedSlideshows.includes(s.id) ? { ...s, isActive: true } : s
          );
          setSavedSlideshows(activatedSlideshows);
          break;
        case "deactivate":
          const deactivatedSlideshows = savedSlideshows.map((s) =>
            selectedSlideshows.includes(s.id) ? { ...s, isActive: false } : s
          );
          setSavedSlideshows(deactivatedSlideshows);
          break;
        case "delete":
          for (const id of selectedSlideshows) {
            const response = await fetch(`/api/slideshows/${id}`, {
              method: "DELETE",
            });
            if (!response.ok) {
              throw new Error(`Failed to delete slideshow ${id}`);
            }
          }
          await fetchSlideshows();
          break;
      }

      setSelectedSlideshows([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to perform bulk action"
      );
    }
  };

  const formatDate = (date: Date | undefined | null) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "N/A";
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Filter and sort slideshows
  const filteredSlideshows = savedSlideshows
    .filter((slideshow) => {
      const matchesSearch = slideshow.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && slideshow.isActive) ||
        (filterStatus === "inactive" && !slideshow.isActive);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "created":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "plays":
          comparison = (a.playCount ?? 0) - (b.playCount ?? 0);
          break;
        case "lastPlayed":
          comparison =
            (a.lastPlayed?.getTime() || 0) - (b.lastPlayed?.getTime() || 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const stats = {
    total: savedSlideshows.length,
    active: savedSlideshows.filter((s) => s.isActive).length,
    inactive: savedSlideshows.filter((s) => !s.isActive).length,
    favorites: savedSlideshows.filter((s) => s.isFavorite).length,
    totalPlays: savedSlideshows.reduce((acc, s) => acc + (s.playCount ?? 0), 0),
  };

  return (
    <ProtectedRoute requiredRole="restaurant_owner">
      <ClientLayout>
        <Head>
          <title>My Slideshows - ShivehView</title>
          <meta name="description" content="Manage your slideshows" />
        </Head>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Slideshows
              </h1>
              <p className="text-gray-600">
                Manage and organize your slideshow collection
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreator(true)}
              className="bg-gradient-to-r from-purple-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create New
            </motion.button>
          </div>

          {/* Stats */}
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
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {stats.favorites}
              </div>
              <div className="text-sm text-gray-600 font-medium">Favorites</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.totalPlays}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Plays
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search slideshows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="created">Created Date</option>
                  <option value="name">Name</option>
                  <option value="plays">Play Count</option>
                  <option value="lastPlayed">Last Played</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-5 h-5" />
                  ) : (
                    <SortDesc className="w-5 h-5" />
                  )}
                </motion.button>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-xl overflow-hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-green-600 text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedSlideshows.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedSlideshows.length} selected
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBulkAction("activate")}
                    className="px-4 py-2 bg-purple-500 text-white text-sm rounded-xl hover:bg-purple-700 transition-all duration-200 font-medium"
                  >
                    Activate
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBulkAction("deactivate")}
                    className="px-4 py-2 bg-gray-500 text-white text-sm rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium"
                  >
                    Deactivate
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBulkAction("delete")}
                    className="px-4 py-2 bg-pink-500 text-white text-sm rounded-xl hover:bg-pink-600 transition-all duration-200 font-medium"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slideshows Grid/List */}
        {filteredSlideshows.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all"
                ? "No slideshows found"
                : "No slideshows yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first slideshow to get started"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-purple-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Create Slideshow
              </motion.button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredSlideshows.map((slideshow) => (
              <motion.div
                key={slideshow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Preview Image */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {(slideshow.images?.length ?? 0) > 0 ? (
                    <img
                      src={slideshow.images?.[0]?.url}
                      alt={slideshow.images?.[0]?.name}
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

                  {/* Favorite Badge */}
                  {slideshow.isFavorite && (
                    <div className="absolute top-3 right-3">
                      <Star className="w-5 h-5 text-yellow-400 fill-current drop-shadow-lg" />
                    </div>
                  )}

                  {/* Media Count Badge */}
                  {(slideshow.images?.length ?? 0) > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                      {slideshow.images?.length ?? 0} images
                    </div>
                  )}

                  {/* Checkbox for bulk selection */}
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={selectedSlideshows.includes(slideshow.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSlideshows([
                            ...selectedSlideshows,
                            slideshow.id,
                          ]);
                        } else {
                          setSelectedSlideshows(
                            selectedSlideshows.filter(
                              (id) => id !== slideshow.id
                            )
                          );
                        }
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-600"
                    />
                  </div>
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
                      {(slideshow.images ?? []).map((img, idx) => (
                        <span
                          key={`${img.id}-${idx}`}
                          className="flex items-center gap-1"
                        >
                          {img.name}
                          {idx < (slideshow.images?.length ?? 0) - 1 && (
                            <span>, </span>
                          )}
                        </span>
                      ))}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {slideshow.settings?.duration
                        ? slideshow.settings.duration / 1000
                        : "N/A"}
                      s
                    </span>
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                      <Palette className="w-3 h-3" />
                      {slideshow.settings?.transition || "N/A"}
                    </span>
                    {slideshow.settings?.backgroundMusic && (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                        <Music className="w-3 h-3" />
                        Music
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
                      onClick={() => handleEditSlideshow(slideshow)}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDuplicateSlideshow(slideshow)}
                      className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleActive(slideshow)}
                      className={`px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                        slideshow.isActive
                          ? "bg-red-500 text-white hover:bg-pink-700"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      title={slideshow.isActive ? "Deactivate" : "Activate"}
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
                      onClick={() => handleDeleteSlideshow(slideshow.id)}
                      className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Play Stats */}
                  <div className="text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Played {slideshow.playCount ?? 0} times</span>
                      {slideshow.lastPlayed && (
                        <span>Last: {formatDate(slideshow.lastPlayed)}</span>
                      )}
                    </div>
                    <div>
                      Created {formatDate(new Date(slideshow.created_at))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Creator Modal */}
        {showCreator && (
          <SlideshowCreator
            onClose={() => setShowCreator(false)}
            onStartCreation={handleStartCreation}
          />
        )}

        {/* Wizard Modal */}
        {showWizard && wizardType === "image" && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <ImageSlideshowWizard
                  step={0}
                  formData={{}}
                  updateFormData={() => {}}
                  onComplete={(data) => {
                    handleSaveSlideshow(data);
                    setShowWizard(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {showWizard && wizardType === "video" && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <VideoSlideshowWizard
                  step={0}
                  formData={{}}
                  updateFormData={() => {}}
                  onComplete={(data) => {
                    handleSaveSlideshow(data);
                    setShowWizard(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Viewer Modal */}
        {showViewer && currentSlideshow && (
          <SimpleImageViewer
            images={(currentSlideshow.images || []) as any}
            settings={{
              duration: currentSlideshow.settings?.duration || 5000,
              transition: currentSlideshow.settings?.transition as any,
              autoPlay: currentSlideshow.settings?.autoPlay || true,
              showControls: currentSlideshow.settings?.showControls || true,
            }}
            onClose={() => setShowViewer(false)}
          />
        )}

        {/* Editor Modal */}
        {showEditor && currentSlideshow && (
          <ImageSlideshowEditor
            onSave={handleSaveSlideshow}
            onCancel={() => {
              setShowEditor(false);
              setCurrentSlideshow(null);
            }}
            restaurantId={currentSlideshow.restaurant_id}
            userId={user?.id || "default-user"}
            initialMedia={(currentSlideshow.images || []) as any}
            initialSettings={currentSlideshow.settings}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && selectedSlideshowId && (
          <DeleteConfirmationModal
            isOpen={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onConfirm={handleConfirmDelete}
            title="Delete Slideshow"
            message="Are you sure you want to delete this slideshow? This action cannot be undone and will permanently remove the slideshow and all its images."
            itemName={
              savedSlideshows.find((s) => s.id === selectedSlideshowId)?.name
            }
            type="slideshow"
          />
        )}
      </ClientLayout>
    </ProtectedRoute>
  );
}

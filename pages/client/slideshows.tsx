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
} from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoute";
import ImageSlideshowEditor from "../../components/ImageSlideshowEditor";
import SimpleImageViewer from "../../components/slideshow/SimpleImageViewer";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import ClientLayout from "./layout";
import { useAuth } from "../../lib/auth";
import { SlideshowSettings } from "../../components/slideshow/types";

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
  images: SlideImage[];
  settings: SlideshowSettings;
  createdAt: Date;
  name: string;
  isActive: boolean;
  playCount: number;
  lastPlayed?: Date;
  isFavorite?: boolean;
  tags?: string[];
}

export default function SlideshowsPage() {
  const { user } = useAuth();
  const [savedSlideshows, setSavedSlideshows] = useState<SavedSlideshow[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentSlideshow, setCurrentSlideshow] =
    useState<SavedSlideshow | null>(null);
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

  // Load saved slideshows from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("client-slideshows");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedSlideshows(
          parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            lastPlayed: item.lastPlayed ? new Date(item.lastPlayed) : undefined,
            isFavorite: item.isFavorite || false,
            tags: item.tags || [],
          }))
        );
      } catch (error) {
        console.error("Error loading saved slideshows:", error);
      }
    }
  }, []);

  // Save slideshows to localStorage
  const saveSlideshows = (slideshows: SavedSlideshow[]) => {
    localStorage.setItem("client-slideshows", JSON.stringify(slideshows));
  };

  const handleSaveSlideshow = (
    images: SlideImage[],
    settings: SlideshowSettings
  ) => {
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
      name: `Slideshow ${savedSlideshows.length + 1}`,
      isActive: true,
      playCount: 0,
      isFavorite: false,
      tags: [],
    };

    const updatedSlideshows = [...savedSlideshows, newSlideshow];
    setSavedSlideshows(updatedSlideshows);
    saveSlideshows(updatedSlideshows);
    setShowEditor(false);
  };

  const handleDeleteSlideshow = (id: string) => {
    setSelectedSlideshowId(id);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSlideshowId) {
      const updatedSlideshows = savedSlideshows.filter(
        (s) => s.id !== selectedSlideshowId
      );
      setSavedSlideshows(updatedSlideshows);
      saveSlideshows(updatedSlideshows);
      setSelectedSlideshows(
        selectedSlideshows.filter((s) => s !== selectedSlideshowId)
      );
      setShowDeleteConfirmation(false);
      setSelectedSlideshowId(null);
    }
  };

  const handlePlaySlideshow = (slideshow: SavedSlideshow) => {
    const updatedSlideshows = savedSlideshows.map((s) =>
      s.id === slideshow.id
        ? {
            ...s,
            playCount: s.playCount + 1,
            lastPlayed: new Date(),
          }
        : s
    );
    setSavedSlideshows(updatedSlideshows);
    saveSlideshows(updatedSlideshows);

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

  const handleToggleFavorite = (slideshow: SavedSlideshow) => {
    const updatedSlideshows = savedSlideshows.map((s) =>
      s.id === slideshow.id ? { ...s, isFavorite: !s.isFavorite } : s
    );
    setSavedSlideshows(updatedSlideshows);
    saveSlideshows(updatedSlideshows);
  };

  const handleDuplicateSlideshow = (slideshow: SavedSlideshow) => {
    const duplicatedSlideshow: SavedSlideshow = {
      ...slideshow,
      id: Math.random().toString(36).substr(2, 9),
      name: `${slideshow.name} (Copy)`,
      createdAt: new Date(),
      playCount: 0,
      lastPlayed: undefined,
      isFavorite: false,
    };

    const updatedSlideshows = [...savedSlideshows, duplicatedSlideshow];
    setSavedSlideshows(updatedSlideshows);
    saveSlideshows(updatedSlideshows);
  };

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    if (selectedSlideshows.length === 0) return;

    if (
      action === "delete" &&
      !confirm(
        `Are you sure you want to delete ${selectedSlideshows.length} slideshow(s)?`
      )
    ) {
      return;
    }

    const updatedSlideshows = savedSlideshows
      .map((s) => {
        if (selectedSlideshows.includes(s.id)) {
          switch (action) {
            case "activate":
              return { ...s, isActive: true };
            case "deactivate":
              return { ...s, isActive: false };
            case "delete":
              return null;
          }
        }
        return s;
      })
      .filter(Boolean) as SavedSlideshow[];

    setSavedSlideshows(updatedSlideshows);
    saveSlideshows(updatedSlideshows);
    setSelectedSlideshows([]);
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
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "plays":
          comparison = a.playCount - b.playCount;
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
    totalPlays: savedSlideshows.reduce((acc, s) => acc + s.playCount, 0),
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
              onClick={() => setShowEditor(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
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
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
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
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition-all duration-200 font-medium"
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
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-all duration-200 font-medium"
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
                onClick={() => setShowEditor(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
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

                  {/* Favorite Badge */}
                  {slideshow.isFavorite && (
                    <div className="absolute top-3 right-3">
                      <Star className="w-5 h-5 text-yellow-400 fill-current drop-shadow-lg" />
                    </div>
                  )}

                  {/* Image Count Badge */}
                  {slideshow.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                      {slideshow.images.length} images
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
                      {slideshow.images.length} image
                      {slideshow.images.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {slideshow.settings.duration / 1000}s
                    </span>
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                      <Palette className="w-3 h-3" />
                      {slideshow.settings.transition}
                    </span>
                    {slideshow.settings.backgroundMusic && (
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
                      onClick={() => {
                        setCurrentSlideshow(slideshow);
                        setShowEditor(true);
                      }}
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
                          ? "bg-red-500 text-white hover:bg-red-600"
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
                      <span>Played {slideshow.playCount} times</span>
                      {slideshow.lastPlayed && (
                        <span>Last: {formatDate(slideshow.lastPlayed)}</span>
                      )}
                    </div>
                    <div>Created {formatDate(slideshow.createdAt)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Editor Modal */}
        {showEditor && (
          <ImageSlideshowEditor
            restaurantId={"mock-restaurant-id"}
            userId={user?.id || "mock-user-id"}
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

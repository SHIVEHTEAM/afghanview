import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Star,
  Quote,
  Clock,
  Eye,
  X,
  Save,
  Settings,
  Layout,
  Play,
  Pause,
  Volume2,
  VolumeX,
  GripVertical,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Edit3,
  Lock,
  Unlock,
  Building,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface SlideCreatorProps {
  onSave: (slideData: any) => void;
  onCancel: () => void;
  initialData?: any;
  isAdmin?: boolean;
  user?: any;
}

interface MediaItem {
  id: string;
  url: string;
  alt: string;
  order: number;
  type: "image" | "video";
  duration?: number;
}

interface SlideTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  thumbnail_url: string;
  template_data: any;
}

export default function ModernSlideCreator({
  onSave,
  onCancel,
  initialData,
  isAdmin = false,
  user,
}: SlideCreatorProps) {
  // Basic slide info
  const [slideName, setSlideName] = useState(initialData?.name || "");
  const [slideTitle, setSlideTitle] = useState(initialData?.title || "");
  const [slideSubtitle, setSlideSubtitle] = useState(
    initialData?.subtitle || ""
  );
  const [slideDescription, setSlideDescription] = useState(
    initialData?.description || ""
  );
  const [slideType, setSlideType] = useState(initialData?.type || "image");
  const [slideDuration, setSlideDuration] = useState(
    initialData?.duration || 5000
  );
  const [slideOrder, setSlideOrder] = useState(initialData?.order_index || 1);

  // Media
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // Settings
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isPublished, setIsPublished] = useState(
    initialData?.is_published ?? false
  );
  const [isLocked, setIsLocked] = useState(initialData?.is_locked ?? false);

  const [selectedTemplate, setSelectedTemplate] =
    useState<SlideTemplate | null>(null);

  // UI State
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Styling
  const [styling, setStyling] = useState({
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: "Inter",
    fontSize: "20px",
    alignment: "center",
    overlay: false,
    overlayOpacity: 0.5,
  });

  // Animation
  const [animation, setAnimation] = useState({
    type: "fade",
    duration: 1000,
    delay: 0,
  });

  // Initialize media from initial data
  useEffect(() => {
    if (initialData?.content) {
      const images =
        initialData.content.images?.map((img: any, index: number) => ({
          ...img,
          type: "image" as const,
          order: index,
        })) || [];

      const videos =
        initialData.content.videos?.map((vid: any, index: number) => ({
          ...vid,
          type: "video" as const,
          order: images.length + index,
        })) || [];

      setMediaItems([...images, ...videos].sort((a, b) => a.order - b.order));
    }
  }, [initialData]);

  // Upload handlers - FIXED: Use server-side upload API
  const handleFileUpload = async (files: FileList, type: "image" | "video") => {
    if (!user?.id) {
      setUploadError("Authentication required. Please sign in again.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const uploadedItems: MediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);

        // Validate file
        if (type === "video" && !file.type.startsWith("video/")) {
          throw new Error(`${file.name} is not a valid video file`);
        }
        if (type === "image" && !file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not a valid image file`);
        }

        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 50MB.`);
        }

        // Convert file to base64 for server-side upload
        console.log("Converting file to base64:", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });

        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        console.log("Base64 conversion complete, length:", base64.length);

        const uploadData = {
          file: {
            name: file.name,
            type: file.type,
            data: base64,
          },
          type,
          userId: user.id,
        };

        console.log("Sending upload request:", {
          type,
          userId: user.id,
          fileSize: base64.length,
        });

        const response = await fetch("/api/media/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(uploadData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const uploadResult = await response.json();

        uploadedItems.push({
          id: uploadResult.id,
          url: uploadResult.url,
          alt: file.name,
          order: mediaItems.length + i,
          type,
          duration: uploadResult.duration,
        });
      }

      // Add to media items
      setMediaItems((prev) => [...prev, ...uploadedItems]);
      setUploadProgress(100);

      // Clear progress after a moment
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = async (id: string) => {
    try {
      // Remove from server if it's a real file (not temp)
      if (!id.startsWith("temp-")) {
        await fetch(`/api/media/${id}`, {
          method: "DELETE",
        });
      }

      setMediaItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing media:", error);
      // Still remove from UI even if server deletion fails
      setMediaItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setMediaItems((prev) => {
      const newItems = [...prev];
      const draggedItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(index, 0, draggedItem);

      // Update order numbers
      return newItems.map((item, idx) => ({ ...item, order: idx }));
    });

    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  // Save handler
  const handleSave = async () => {
    if (!slideName || !slideTitle) {
      setUploadError("Please fill in all required fields");
      return;
    }

    if (!user?.id) {
      setUploadError("Authentication required. Please sign in again.");
      return;
    }

    if (mediaItems.length === 0) {
      setUploadError("Please add at least one media item (image or video)");
      return;
    }

    setLoading(true);
    setUploadError("");

    try {
      // Determine slide type based on media content
      const hasVideos = mediaItems.some((item) => item.type === "video");
      const hasImages = mediaItems.some((item) => item.type === "image");

      // Map to database-allowed types
      let finalSlideType = slideType;
      if (hasVideos && !hasImages) {
        finalSlideType = "custom"; // Use 'custom' for video slides
      } else if (hasImages && !hasVideos) {
        finalSlideType = "image";
      } else if (hasVideos && hasImages) {
        finalSlideType = "custom"; // Use 'custom' for mixed content
      }

      // Ensure the type is valid for database
      const validTypes = ["image", "menu", "promo", "quote", "hours", "custom"];
      if (!validTypes.includes(finalSlideType)) {
        finalSlideType = "custom"; // Default to custom if invalid
      }

      // Adjust duration for videos (videos should play their natural duration)
      let finalDuration = slideDuration;
      if (hasVideos) {
        // For videos, use a longer duration or let them play naturally
        finalDuration = Math.max(slideDuration, 10000); // Minimum 10 seconds for videos
      }

      const slideContent = {
        images: mediaItems.filter((item) => item.type === "image"),
        videos: mediaItems.filter((item) => item.type === "video"),
        text: {
          title: slideTitle,
          subtitle: slideSubtitle,
          description: slideDescription,
        },
        styling,
        animation,
        mediaCount: mediaItems.length,
        hasVideos,
        hasImages,
      };

      const slideData = {
        template_id: selectedTemplate?.id || null,
        name: slideName,
        type: finalSlideType,
        title: slideTitle,
        subtitle: slideSubtitle,
        content: slideContent,
        styling,
        duration: finalDuration,
        order_index: slideOrder,
        is_active: isActive,
        is_published: isPublished,
        is_locked: isLocked,
        published_at: isPublished ? new Date().toISOString() : null,
        created_by: user.id,
      };

      console.log("Prepared slide data:", slideData);
      onSave(slideData);
    } catch (error) {
      console.error("Error preparing slide data:", error);
      setUploadError("Error preparing slide data");
    } finally {
      setLoading(false);
    }
  };

  const slideTypes = [
    { value: "image", label: "Image Slide", icon: ImageIcon },
    { value: "custom", label: "Video/Mixed Slide", icon: Video },
    { value: "menu", label: "Menu Slide", icon: FileText },
    { value: "promo", label: "Promotion Slide", icon: Star },
    { value: "quote", label: "Quote Slide", icon: Quote },
    { value: "hours", label: "Hours Slide", icon: Clock },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-afghan-green to-afghan-green-dark text-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">
                {initialData ? "Edit Slide" : "Create New Slide"}
              </h1>
              <p className="text-white/80 text-sm">
                {isAdmin ? "Admin Dashboard" : "Restaurant Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-6 py-2 bg-white text-afghan-green hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Slide
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(95vh-120px)]">
          {/* Left Panel - Main Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slide Name *
                  </label>
                  <input
                    type="text"
                    value={slideName}
                    onChange={(e) => setSlideName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-afghan-green focus:border-transparent"
                    placeholder="Enter slide name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slide Type
                  </label>
                  <select
                    value={slideType}
                    onChange={(e) => setSlideType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-afghan-green focus:border-transparent"
                  >
                    {slideTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={slideTitle}
                    onChange={(e) => setSlideTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-afghan-green focus:border-transparent"
                    placeholder="Enter slide title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={slideSubtitle}
                    onChange={(e) => setSlideSubtitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-afghan-green focus:border-transparent"
                    placeholder="Enter subtitle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (ms)
                  </label>
                  <input
                    type="number"
                    value={slideDuration}
                    onChange={(e) => setSlideDuration(Number(e.target.value))}
                    min="1000"
                    max="30000"
                    step="500"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-afghan-green focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Media
              </h2>

              {/* Upload Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-afghan-green transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files &&
                      handleFileUpload(e.target.files, "image")
                    }
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block"
                  >
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Upload Images
                    </p>
                    <p className="text-xs text-gray-500">
                      Drag & drop or click to select
                    </p>
                  </label>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-afghan-green transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) =>
                      e.target.files &&
                      handleFileUpload(e.target.files, "video")
                    }
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer block"
                  >
                    <Video className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Upload Videos
                    </p>
                    <p className="text-xs text-gray-500">
                      MP4, WebM, MOV (max 50MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Uploading...
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-afghan-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Display */}
              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">{uploadError}</span>
                  </div>
                </div>
              )}

              {/* Media Grid */}
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {mediaItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`relative group rounded-lg overflow-hidden border-2 ${
                          dragIndex === index
                            ? "border-afghan-green"
                            : "border-gray-200"
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={item.alt}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-32 bg-gray-900">
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              controls
                              preload="metadata"
                            />
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                              Video
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                              <Play className="h-6 w-6 text-white opacity-80" />
                            </div>
                          </div>
                        )}

                        {/* Drag Handle */}
                        <div className="absolute top-2 left-2 p-1 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-3 w-3 text-white" />
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeMedia(item.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        {/* Order Badge */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Settings & Preview */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Admin Settings */}
              {isAdmin && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Admin Settings
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Locked
                      </span>
                      <input
                        type="checkbox"
                        checked={isLocked}
                        onChange={(e) => setIsLocked(e.target.checked)}
                        className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      Active
                    </span>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      Published
                    </span>
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                    />
                  </div>
                </div>
              </div>

              {/* Templates */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Layout className="h-4 w-4 mr-2" />
                  Templates
                </h3>

                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Browse Templates
                </button>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </h3>

                  <div
                    className="w-full h-48 bg-white rounded-lg shadow-lg overflow-hidden"
                    style={{
                      backgroundColor: styling.backgroundColor,
                      color: styling.textColor,
                      fontFamily: styling.fontFamily,
                      fontSize: styling.fontSize,
                      textAlign: styling.alignment as any,
                    }}
                  >
                    {mediaItems.length > 0 ? (
                      <div className="relative w-full h-full">
                        {mediaItems[0].type === "image" ? (
                          <img
                            src={mediaItems[0].url}
                            alt={mediaItems[0].alt}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              src={mediaItems[0].url}
                              className="w-full h-full object-cover"
                              controls
                              preload="metadata"
                            />
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              Video
                            </div>
                          </div>
                        )}

                        {styling.overlay && (
                          <div
                            className="absolute inset-0 bg-black"
                            style={{ opacity: styling.overlayOpacity }}
                          />
                        )}

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-4">
                            <h2 className="text-xl font-bold mb-2 drop-shadow-lg">
                              {slideTitle}
                            </h2>
                            {slideSubtitle && (
                              <p className="text-sm opacity-90 drop-shadow-lg">
                                {slideSubtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Media count indicator */}
                        {mediaItems.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            +{mediaItems.length - 1} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">No media added</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview info */}
                  <div className="mt-3 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Type: {slideType}</span>
                      <span>Duration: {slideDuration}ms</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Media: {mediaItems.length} items</span>
                      <span>Status: {isPublished ? "Published" : "Draft"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

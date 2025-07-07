import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Save,
  Play,
  Settings,
  Image as ImageIcon,
  Music,
  Palette,
  Clock,
  Eye,
  Trash2,
  Plus,
  Upload,
  Grid,
  List,
  RotateCcw,
  Download,
  Share,
  Copy,
  Star,
  Users,
  BarChart3,
  Calendar,
  TrendingUp,
  Check,
  AlertCircle,
  Info,
  Zap,
  Sparkles,
} from "lucide-react";
import { SlideMedia, SlideshowSettings, SimpleImageViewer } from "../slideshow";

interface ImageSlideshowEditorProps {
  onSave: (media: SlideMedia[], settings: SlideshowSettings) => void;
  onCancel: () => void;
  restaurantId: string;
  userId: string;
  initialMedia?: SlideMedia[];
  initialSettings?: SlideshowSettings;
}

export default function ImageSlideshowEditor({
  onSave,
  onCancel,
  restaurantId,
  userId,
  initialMedia = [],
  initialSettings,
}: ImageSlideshowEditorProps) {
  console.log("ImageSlideshowEditor received:", {
    initialMedia,
    initialSettings,
    restaurantId,
    userId,
  });

  const [media, setMedia] = useState<SlideMedia[]>(initialMedia);
  const [settings, setSettings] = useState<SlideshowSettings>(
    initialSettings || {
      defaultDuration: 5000,
      duration: 5000,
      transition: "fade",
      transitionDuration: 1000,
      musicVolume: 50,
      musicLoop: true,
      autoPlay: true,
      showControls: true,
      showProgress: true,
      loopSlideshow: true,
      shuffleSlides: false,
      aspectRatio: "16:9",
      quality: "high",
    }
  );

  // Update media and settings when initialMedia/initialSettings change
  useEffect(() => {
    console.log(
      "🔄 ImageSlideshowEditor: Updating media and settings from props"
    );
    console.log("🔄 New initialMedia:", initialMedia);
    console.log("🔄 New initialSettings:", initialSettings);

    if (initialMedia && initialMedia.length > 0) {
      setMedia(initialMedia);
      setSelectedMedia(initialMedia[0]);
    }

    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialMedia, initialSettings]);
  const [selectedMedia, setSelectedMedia] = useState<SlideMedia | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">(
    "all"
  );
  const [uploading, setUploading] = useState(false);

  // Handle media upload
  const handleMediaUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const newMedia: SlideMedia[] = [];

      for (const file of files) {
        const mediaItem: SlideMedia = {
          id: `media-${Date.now()}-${Math.random()}`,
          file: file,
          url: URL.createObjectURL(file),
          name: file.name,
          type: file.type.startsWith("image/") ? "image" : "video",
        };
        newMedia.push(mediaItem);
      }

      setMedia((prev) => [...prev, ...newMedia]);
      if (newMedia.length > 0) {
        setSelectedMedia(newMedia[0]);
      }
    } catch (error) {
      console.error("Error uploading media:", error);
    } finally {
      setUploading(false);
    }
  };

  // Handle media selection
  const handleMediaSelect = (item: SlideMedia) => {
    setSelectedMedia(item);
  };

  // Handle media deletion
  const handleMediaDelete = (id: string) => {
    setMedia((prev) => prev.filter((item) => item.id !== id));
    if (selectedMedia?.id === id) {
      setSelectedMedia(media.length > 1 ? media[0] : null);
    }
  };

  // Handle settings update
  const handleSettingsUpdate = (newSettings: Partial<SlideshowSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Handle save
  const handleSave = async () => {
    if (media.length === 0) {
      alert("Please add at least one image or video to the slideshow.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(media, settings);
    } catch (error) {
      console.error("Error saving slideshow:", error);
      alert("Failed to save slideshow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter media based on search and type
  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Slideshow Editor</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ImageIcon className="w-4 h-4" />
            {media.length} media items
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={media.length === 0}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || media.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Slideshow
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Media Management */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          {/* Media Upload */}
          <div className="p-4 border-b border-gray-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Upload Media</h2>
              <div
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.multiple = true;
                  input.accept = "image/*,video/*";
                  input.onchange = (e) => {
                    const files = Array.from(
                      (e.target as HTMLInputElement).files || []
                    );
                    handleMediaUpload(files);
                  };
                  input.click();
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  uploading
                    ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                }`}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {uploading
                    ? "Uploading files..."
                    : "Click to upload images & videos"}
                </p>
                <p className="text-gray-500 mb-4">
                  {uploading ? "Please wait..." : "or drag & drop files here"}
                </p>
                <div className="flex justify-center gap-2 text-sm text-gray-400">
                  <span>Images: JPG, PNG, GIF, WebP</span>
                  <span>•</span>
                  <span>Videos: MP4, WebM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Media List */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Media Items</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleMediaSelect(item)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMedia?.id === item.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.type === "image" ? "🖼️" : "🎥"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.type}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaDelete(item.id);
                        }}
                        className="p-1 text-pink-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Details & Preview */}
        <div className="w-1/2 flex flex-col">
          {selectedMedia ? (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Media Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedMedia.name}
                    onChange={(e) => {
                      const updated = {
                        ...selectedMedia,
                        name: e.target.value,
                      };
                      setMedia((prev) =>
                        prev.map((item) =>
                          item.id === selectedMedia.id ? updated : item
                        )
                      );
                      setSelectedMedia(updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedMedia.type}
                  </p>
                </div>

                {selectedMedia.type === "video" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="number"
                      value={selectedMedia.duration || 0}
                      onChange={(e) => {
                        const updated = {
                          ...selectedMedia,
                          duration: Number(e.target.value),
                        };
                        setMedia((prev) =>
                          prev.map((item) =>
                            item.id === selectedMedia.id ? updated : item
                          )
                        );
                        setSelectedMedia(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Duration in seconds"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No media selected</p>
                <p className="text-sm">
                  Select an image or video to edit its details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Slideshow Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slide Duration (ms)
                  </label>
                  <input
                    type="number"
                    value={settings.duration}
                    onChange={(e) =>
                      handleSettingsUpdate({ duration: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="1000"
                    max="30000"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transition
                  </label>
                  <select
                    value={settings.transition}
                    onChange={(e) =>
                      handleSettingsUpdate({
                        transition: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="zoom">Zoom</option>
                    <option value="flip">Flip</option>
                    <option value="bounce">Bounce</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoPlay}
                      onChange={(e) =>
                        handleSettingsUpdate({ autoPlay: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Auto Play
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.showControls}
                      onChange={(e) =>
                        handleSettingsUpdate({ showControls: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Show Controls
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50">
          <SimpleImageViewer
            images={media}
            settings={{
              duration: settings.duration,
              transition: settings.transition,
              autoPlay: settings.autoPlay,
              showControls: settings.showControls,
            }}
            onClose={() => setShowPreview(false)}
          />
        </div>
      )}
    </div>
  );
}

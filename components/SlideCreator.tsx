import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  Plus,
  GripVertical,
  Image as ImageIcon,
  Video,
  FileText,
  Star,
  Quote,
  Clock,
  Settings,
  Palette,
  Type,
  Layout,
  Eye,
  Save,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface SlideCreatorProps {
  restaurantId?: string; // Optional for admin, required for restaurant owner
  restaurants?: Array<{
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
  }>;
  onSave: (slideData: any) => void;
  onCancel: () => void;
  initialData?: any;
  isAdmin?: boolean;
  user?: any;
}

interface SlideTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  thumbnail_url: string;
  template_data: any;
}

interface SlideContent {
  images: Array<{
    id: string;
    url: string;
    alt: string;
    order: number;
  }>;
  videos: Array<{
    id: string;
    url: string;
    alt: string;
    order: number;
    duration?: number;
  }>;
  text: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  styling: {
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontSize: string;
    alignment: string;
    overlay: boolean;
    overlayOpacity: number;
  };
  animation: {
    type: string;
    duration: number;
    delay: number;
  };
}

export default function SlideCreator({
  restaurantId,
  restaurants = [],
  onSave,
  onCancel,
  initialData,
  isAdmin = false,
  user,
}: SlideCreatorProps) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<SlideTemplate[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    restaurantId || ""
  );
  const [slideName, setSlideName] = useState(initialData?.name || "");
  const [slideType, setSlideType] = useState(initialData?.type || "image");
  const [slideTitle, setSlideTitle] = useState(initialData?.title || "");
  const [slideSubtitle, setSlideSubtitle] = useState(
    initialData?.subtitle || ""
  );
  const [slideDescription, setSlideDescription] = useState(
    initialData?.description || ""
  );
  const [slideDuration, setSlideDuration] = useState(
    initialData?.duration || 6000
  );
  const [slideOrder, setSlideOrder] = useState(initialData?.order_index || 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isPublished, setIsPublished] = useState(
    initialData?.is_published ?? false
  );
  const [isLocked, setIsLocked] = useState(initialData?.is_locked ?? false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<SlideTemplate | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [slideImages, setSlideImages] = useState<
    Array<{ id: string; url: string; alt: string; order: number }>
  >(initialData?.content?.images || []);
  const [slideVideos, setSlideVideos] = useState<
    Array<{
      id: string;
      url: string;
      alt: string;
      order: number;
      duration?: number;
    }>
  >(initialData?.content?.videos || []);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [styling, setStyling] = useState({
    backgroundColor: initialData?.styling?.backgroundColor || "#ffffff",
    textColor: initialData?.styling?.textColor || "#000000",
    fontFamily: initialData?.styling?.fontFamily || "Inter",
    fontSize: initialData?.styling?.fontSize || "24px",
    alignment: initialData?.styling?.alignment || "center",
    overlay: initialData?.styling?.overlay || false,
    overlayOpacity: initialData?.styling?.overlayOpacity || 0.5,
  });
  const [animation, setAnimation] = useState({
    type: initialData?.animation?.type || "fade",
    duration: initialData?.animation?.duration || 1000,
    delay: initialData?.animation?.delay || 0,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("slide_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    // For non-admin users, restaurant is required
    if (!isAdmin && !selectedRestaurant) {
      alert("Please select a restaurant first");
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        // Use a generic path for template slides, or restaurant-specific path
        const filePath = selectedRestaurant
          ? `slides/${selectedRestaurant}/${fileName}`
          : `slides/templates/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(filePath);

        uploadedImages.push({
          id: `temp-${Date.now()}-${i}`,
          url: publicUrl,
          alt: file.name,
          order: slideImages.length + i,
        });
      }

      setSlideImages([...slideImages, ...uploadedImages]);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (imageId: string) => {
    setSlideImages(slideImages.filter((img) => img.id !== imageId));
  };

  const handleVideoUpload = async (files: FileList) => {
    // For non-admin users, restaurant is required
    if (!isAdmin && !selectedRestaurant) {
      alert("Please select a restaurant first");
      return;
    }

    setUploadingVideos(true);
    try {
      const uploadedVideos = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        // Use a generic path for template slides, or restaurant-specific path
        const filePath = selectedRestaurant
          ? `slides/${selectedRestaurant}/${fileName}`
          : `slides/templates/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("media").getPublicUrl(filePath);

        uploadedVideos.push({
          id: `temp-${Date.now()}-${i}`,
          url: publicUrl,
          alt: file.name,
          order: slideVideos.length + i,
        });
      }

      setSlideVideos([...slideVideos, ...uploadedVideos]);
    } catch (error) {
      console.error("Error uploading videos:", error);
    } finally {
      setUploadingVideos(false);
    }
  };

  const removeVideo = (videoId: string) => {
    setSlideVideos(slideVideos.filter((video) => video.id !== videoId));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...slideImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Update order numbers
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      order: index,
    }));

    setSlideImages(updatedImages);
  };

  const reorderVideos = (fromIndex: number, toIndex: number) => {
    const newVideos = [...slideVideos];
    const [movedVideo] = newVideos.splice(fromIndex, 1);
    newVideos.splice(toIndex, 0, movedVideo);

    // Update order numbers
    const updatedVideos = newVideos.map((video, index) => ({
      ...video,
      order: index,
    }));

    setSlideVideos(updatedVideos);
  };

  const applyTemplate = (template: SlideTemplate) => {
    setSelectedTemplate(template);
    setSlideType(template.type);

    if (template.template_data) {
      const data = template.template_data;
      if (data.title) setSlideTitle(data.title);
      if (data.subtitle) setSlideSubtitle(data.subtitle);
      if (data.description) setSlideDescription(data.description);
      if (data.styling) setStyling(data.styling);
      if (data.animation) setAnimation(data.animation);
      if (data.duration) setSlideDuration(data.duration);
    }

    setShowTemplates(false);
  };

  const handleSave = async () => {
    if (!slideName || !slideTitle) {
      alert("Please fill in all required fields");
      return;
    }

    // For non-admin users, restaurant is required
    if (!isAdmin && !selectedRestaurant) {
      alert("Please select a restaurant");
      return;
    }

    setLoading(true);
    try {
      const slideContent = {
        images: slideImages,
        videos: slideVideos,
        text: {
          title: slideTitle,
          subtitle: slideSubtitle,
          description: slideDescription,
        },
        styling,
        animation,
      };

      const slideData = {
        restaurant_id: selectedRestaurant || null, // null for template slides
        template_id: selectedTemplate?.id || null,
        name: slideName,
        type: slideType,
        title: slideTitle,
        subtitle: slideSubtitle,
        content: slideContent,
        styling,
        duration: slideDuration,
        order_index: slideOrder,
        is_active: isActive,
        is_published: isPublished,
        is_locked: isLocked,
        published_at: isPublished ? new Date().toISOString() : null,
        created_by: user?.id,
      };

      onSave(slideData);
    } catch (error) {
      console.error("Error preparing slide data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSlideTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "menu":
        return <FileText className="h-5 w-5" />;
      case "promo":
        return <Star className="h-5 w-5" />;
      case "quote":
        return <Quote className="h-5 w-5" />;
      case "hours":
        return <Clock className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const slideTypes = [
    { value: "image", label: "Image Slide", icon: ImageIcon },
    { value: "video", label: "Video Slide", icon: Video },
    { value: "menu", label: "Menu Slide", icon: FileText },
    { value: "promo", label: "Promotion Slide", icon: Star },
    { value: "quote", label: "Quote Slide", icon: Quote },
    { value: "hours", label: "Hours Slide", icon: Clock },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {initialData ? "Edit Slide" : "Create New Slide"}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Slide"}
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Main Form */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isAdmin && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Restaurant
                        </label>
                        <select
                          value={selectedRestaurant}
                          onChange={(e) =>
                            setSelectedRestaurant(e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                        >
                          <option value="">All Restaurants (Optional)</option>
                          {restaurants.map((restaurant) => (
                            <option key={restaurant.id} value={restaurant.id}>
                              {restaurant.name}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          {isAdmin
                            ? "Leave empty to create a template slide available to all restaurants"
                            : "Select the restaurant for this slide"}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slide Name *
                      </label>
                      <input
                        type="text"
                        value={slideName}
                        onChange={(e) => setSlideName(e.target.value)}
                        placeholder="Enter slide name"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slide Type
                      </label>
                      <select
                        value={slideType}
                        onChange={(e) => setSlideType(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      >
                        {slideTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (ms)
                      </label>
                      <input
                        type="number"
                        value={slideDuration}
                        onChange={(e) =>
                          setSlideDuration(Number(e.target.value))
                        }
                        min="1000"
                        step="500"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={slideTitle}
                        onChange={(e) => setSlideTitle(e.target.value)}
                        placeholder="Enter slide title"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={slideSubtitle}
                        onChange={(e) => setSlideSubtitle(e.target.value)}
                        placeholder="Enter slide subtitle"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={slideDescription}
                        onChange={(e) => setSlideDescription(e.target.value)}
                        placeholder="Enter slide description"
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Images
                  </h2>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files && handleImageUpload(e.target.files)
                        }
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImages ? "Uploading..." : "Upload Images"}
                      </label>
                      <p className="mt-2 text-sm text-gray-500">
                        Drag and drop images here, or click to select files
                      </p>
                    </div>

                    {slideImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {slideImages.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(image.id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Videos
                  </h2>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={(e) =>
                          e.target.files && handleVideoUpload(e.target.files)
                        }
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingVideos ? "Uploading..." : "Upload Videos"}
                      </label>
                      <p className="mt-2 text-sm text-gray-500">
                        Drag and drop videos here, or click to select files
                      </p>
                    </div>

                    {slideVideos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {slideVideos.map((video, index) => (
                          <div key={video.id} className="relative group">
                            <video
                              src={video.url}
                              className="w-full h-32 object-cover rounded-lg"
                              controls
                            />
                            <button
                              onClick={() => removeVideo(video.id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Styling Options */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Styling Options
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={styling.backgroundColor}
                        onChange={(e) =>
                          setStyling({
                            ...styling,
                            backgroundColor: e.target.value,
                          })
                        }
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={styling.textColor}
                        onChange={(e) =>
                          setStyling({ ...styling, textColor: e.target.value })
                        }
                        className="w-full h-10 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Font Family
                      </label>
                      <select
                        value={styling.fontFamily}
                        onChange={(e) =>
                          setStyling({ ...styling, fontFamily: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Font Size
                      </label>
                      <select
                        value={styling.fontSize}
                        onChange={(e) =>
                          setStyling({ ...styling, fontSize: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      >
                        <option value="16px">Small (16px)</option>
                        <option value="20px">Medium (20px)</option>
                        <option value="24px">Large (24px)</option>
                        <option value="32px">Extra Large (32px)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Templates */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Templates
                  </h2>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Browse Templates
                  </button>
                </div>

                {/* Settings */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Settings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
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
                      <span className="text-sm font-medium text-gray-700">
                        Published
                      </span>
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                      />
                    </div>

                    {isAdmin && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Locked
                        </span>
                        <input
                          type="checkbox"
                          checked={isLocked}
                          onChange={(e) => setIsLocked(e.target.checked)}
                          className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Animation */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Animation
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Animation Type
                      </label>
                      <select
                        value={animation.type}
                        onChange={(e) =>
                          setAnimation({ ...animation, type: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      >
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="zoom">Zoom</option>
                        <option value="bounce">Bounce</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (ms)
                      </label>
                      <input
                        type="number"
                        value={animation.duration}
                        onChange={(e) =>
                          setAnimation({
                            ...animation,
                            duration: Number(e.target.value),
                          })
                        }
                        min="100"
                        max="3000"
                        step="100"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-96 bg-gray-100 border-l border-gray-200 p-4 overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Preview
              </h3>
              <div
                className="w-full h-64 bg-white rounded-lg shadow-lg overflow-hidden"
                style={{
                  backgroundColor: styling.backgroundColor,
                  color: styling.textColor,
                  fontFamily: styling.fontFamily,
                  fontSize: styling.fontSize,
                  textAlign: styling.alignment as any,
                }}
              >
                {slideImages.length > 0 && (
                  <div className="relative w-full h-full">
                    <img
                      src={slideImages[0].url}
                      alt={slideImages[0].alt}
                      className="w-full h-full object-cover"
                    />
                    {styling.overlay && (
                      <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: styling.overlayOpacity }}
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
                      <h2 className="text-2xl font-bold mb-2">{slideTitle}</h2>
                      {slideSubtitle && (
                        <p className="text-lg mb-2">{slideSubtitle}</p>
                      )}
                      {slideDescription && (
                        <p className="text-sm">{slideDescription}</p>
                      )}
                    </div>
                  </div>
                )}
                {slideVideos.length > 0 && slideImages.length === 0 && (
                  <div className="relative w-full h-full">
                    <video
                      src={slideVideos[0].url}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                    {styling.overlay && (
                      <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: styling.overlayOpacity }}
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
                      <h2 className="text-2xl font-bold mb-2">{slideTitle}</h2>
                      {slideSubtitle && (
                        <p className="text-lg mb-2">{slideSubtitle}</p>
                      )}
                      {slideDescription && (
                        <p className="text-sm">{slideDescription}</p>
                      )}
                    </div>
                  </div>
                )}
                {slideImages.length === 0 && slideVideos.length === 0 && (
                  <div className="w-full h-full flex flex-col justify-center items-center p-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">{slideTitle}</h2>
                      {slideSubtitle && (
                        <p className="text-lg mb-2">{slideSubtitle}</p>
                      )}
                      {slideDescription && (
                        <p className="text-sm">{slideDescription}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Choose Template
                </h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-afghan-green hover:shadow-md transition-all"
                    >
                      {template.thumbnail_url && (
                        <img
                          src={template.thumbnail_url}
                          alt={template.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h3 className="font-medium text-gray-900 mb-1">
                        {template.name}
                      </h3>
                      <div className="flex items-center mt-2">
                        {getSlideTypeIcon(template.type)}
                        <span className="text-xs text-gray-500 ml-1 capitalize">
                          {template.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

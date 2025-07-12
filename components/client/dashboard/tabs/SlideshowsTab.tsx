import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Image,
  Play,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Star,
  Link,
  QrCode,
  Check,
  Clock,
  Eye,
  Music,
  Palette,
  Calendar,
  Sparkles,
  Tv,
  Share2,
  Download,
  Settings,
  MoreHorizontal,
  Heart,
  Bookmark,
  Zap,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react";
import QRCode from "react-qr-code";
import { useSlideshowStore } from "../../../../stores/slideshowStore";
import { useAuth } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
import { BusinessType, canDeleteSlideshows } from "../../../../types/business";
import SuccessMessage from "../../../ui/SuccessMessage";
import ErrorMessage from "../../../ui/ErrorMessage";
import { MenuSVGGenerator } from "../../../slideshow-creator/menu/svg-generator";

interface Slideshow {
  id: string;
  title: string; // Changed from name to title to match database schema
  description?: string;
  business_id: string;
  business_type: BusinessType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  slug?: string;
  play_count?: number;
  last_played?: string;
  is_favorite?: boolean;
  settings?: any;
  content?: any;
  images?: any[];
}

interface UserRole {
  role: "owner" | "manager" | "staff";
  business_type: BusinessType;
}

interface SlideshowsTabProps {
  onRefresh?: () => void;
  business?: any;
  slideshows?: Slideshow[];
}

export function SlideshowsTab({
  onRefresh,
  business: propBusiness,
  slideshows: propSlideshows,
}: SlideshowsTabProps) {
  const { user } = useAuth();
  const {
    setShowSlideshowCreator,
    handlePlaySlideshow,
    handleEditSlideshow,
    handleDeleteSlideshow,
  } = useSlideshowStore();

  // Helper function to convert Slideshow to SavedSlideshow
  const convertToSavedSlideshow = (slideshow: Slideshow) => {
    // Process slides to handle menu items
    const processedSlides = (slideshow.content?.slides || []).map(
      (slide: any) => {
        if (slide.type === "menu" && slide.menuData) {
          // Generate SVG on-demand for menu items
          const svgDataUrl = MenuSVGGenerator.generateMenuSlide(
            slide.menuData.item,
            slide.menuData.theme,
            slide.menuData.layout
          );
          return {
            ...slide,
            url: svgDataUrl,
            file_path: svgDataUrl,
            type: "image",
          };
        }
        return slide;
      }
    );

    return {
      ...slideshow,
      name: slideshow.title, // Add name field for compatibility with store
      createdAt: new Date(slideshow.created_at),
      isActive: slideshow.is_active,
      playCount: slideshow.play_count || 0,
      images:
        processedSlides || slideshow.content?.images || slideshow.images || [],
    };
  };

  // Use props if provided, otherwise use local state
  const [slideshows, setSlideshows] = useState<Slideshow[]>(
    propSlideshows || []
  );
  const [loading, setLoading] = useState(!propSlideshows);
  const [business, setBusiness] = useState<any>(propBusiness);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (propSlideshows) {
      setSlideshows(propSlideshows);
      setLoading(false);
    }
    if (propBusiness) {
      setBusiness(propBusiness);
    }
  }, [propSlideshows, propBusiness]);

  // Fetch user's business, slideshows, and role
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Get user's business and role
        const { data: staffMember } = await supabase
          .from("business_staff")
          .select(
            `
            business:businesses!inner(
              id,
              name,
              slug,
              business_type,
              created_at
            ),
            role,
            business_type
          `
          )
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        let businessId: string | null = null;

        if (
          staffMember?.business &&
          Array.isArray(staffMember.business) &&
          staffMember.business.length > 0
        ) {
          businessId = staffMember.business[0].id;
          setBusiness(staffMember.business[0]);
          setUserRole({
            role: staffMember.role,
            business_type: staffMember.business_type,
          });
        } else {
          // Check if user created a business
          const { data: userBusiness } = await supabase
            .from("businesses")
            .select("id, name, slug, type, created_at")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .single();

          if (userBusiness) {
            businessId = userBusiness.id;
            setBusiness(userBusiness);
            setUserRole({
              role: "owner",
              business_type: userBusiness.type,
            });
          }
        }

        if (businessId) {
          // Fetch slideshows directly from database
          const { data: slideshowData, error } = await supabase
            .from("slideshows")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error fetching slideshows:", error);
            setSlideshows([]);
          } else {
            setSlideshows(slideshowData || []);
          }
        } else {
          console.log("No businessId found for user:", user.id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Helper for copying link
  const copyToClipboard = async (text: string, slideshowId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(slideshowId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Helper for toggling favorite
  const toggleFavorite = async (slideshow: Slideshow) => {
    try {
      const response = await fetch(`/api/slideshows/${slideshow.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_favorite: !slideshow.is_favorite,
        }),
      });

      if (response.ok) {
        const updatedSlideshows = slideshows.map((s) =>
          s.id === slideshow.id ? { ...s, is_favorite: !s.is_favorite } : s
        );
        setSlideshows(updatedSlideshows);
        onRefresh?.();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Helper for toggling active status
  const toggleActive = async (slideshow: Slideshow) => {
    try {
      const response = await fetch(`/api/slideshows/${slideshow.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !slideshow.is_active,
        }),
      });

      if (response.ok) {
        const updatedSlideshows = slideshows.map((s) =>
          s.id === slideshow.id ? { ...s, is_active: !s.is_active } : s
        );
        setSlideshows(updatedSlideshows);
        onRefresh?.();

        // Show success message
        const action = !slideshow.is_active ? "activated" : "paused";
        setSuccessMessage(`Slideshow ${action} successfully!`);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
      setErrorMessage("Failed to update slideshow status");
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  // Helper for generating QR code
  const generateQrCode = (slideshow: Slideshow) => {
    const publicUrl = `${window.location.origin}/slideshow/${slideshow.id}`;
    setShowQrCode(publicUrl);
  };

  // Helper for formatting date
  const formatDate = (date: string | undefined | null) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Check if user can delete slideshows
  const canDelete = userRole ? canDeleteSlideshows(userRole.role) : false;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading slideshows...</p>
        </div>
      </div>
    );
  }

  if (slideshows.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-3xl p-12 mb-8 border border-purple-100 shadow-xl"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Ready to Create Magic?
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Start building beautiful slideshows that will captivate your
              audience. From stunning images to AI-generated content, the
              possibilities are endless.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSlideshowCreator(true)}
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <Plus className="w-6 h-6 inline mr-3" />
              Create Your First Slideshow
            </motion.button>
          </motion.div>

          {/* Quick Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Image className="w-4 h-4 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">
                Image Slideshows
              </h4>
              <p className="text-sm text-gray-600">
                Upload and arrange your photos
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">AI Content</h4>
              <p className="text-sm text-gray-600">
                Generate facts and content automatically
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Monitor className="w-4 h-4 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">TV Display</h4>
              <p className="text-sm text-gray-600">Show on multiple screens</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Your Slideshows
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            Manage and organize your {slideshows.length} slideshow
            {slideshows.length !== 1 ? "s" : ""}
            {userRole && (
              <span className="text-sm text-blue-600 ml-2">
                ({userRole.role} access)
              </span>
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSlideshowCreator(true)}
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3"
        >
          <Plus className="w-6 h-6" />
          Create New Slideshow
        </motion.button>
      </motion.div>

      {/* Enhanced Slideshows Grid */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {slideshows.map((slideshow: Slideshow, index: number) => (
            <motion.div
              key={slideshow.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.2 },
              }}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group relative flex flex-col"
            >
              {/* Slideshow Preview Image */}
              <div className="relative w-full h-48 overflow-hidden rounded-t-3xl">
                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  {slideshow.is_active ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm"
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Live
                    </motion.span>
                  ) : (
                    <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                      <PowerOff className="w-3 h-3" />
                      Paused
                    </span>
                  )}
                </div>

                {/* Favorite Badge */}
                {slideshow.is_favorite && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-3 right-3 z-10"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <Heart className="w-4 h-4 text-white fill-current" />
                    </div>
                  </motion.div>
                )}

                {slideshow.content?.slides?.length > 0 ||
                slideshow.content?.images?.length > 0 ? (
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    src={(() => {
                      const firstSlide = slideshow.content?.slides?.[0];
                      if (firstSlide?.type === "menu" && firstSlide.menuData) {
                        return MenuSVGGenerator.generateMenuSlide(
                          firstSlide.menuData.item,
                          firstSlide.menuData.theme,
                          firstSlide.menuData.layout
                        );
                      }
                      return (
                        firstSlide?.file_path ||
                        firstSlide?.url ||
                        slideshow.content?.images?.[0]?.file_path ||
                        slideshow.content?.images?.[0]?.url
                      );
                    })()}
                    alt={slideshow.title || "Slideshow preview"}
                    className="w-full h-full object-cover rounded-t-3xl shadow-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-t-3xl">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm">No preview available</p>
                    </div>
                  </div>
                )}

                {/* Overlay with action buttons (show on hover) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      handlePlaySlideshow(convertToSavedSlideshow(slideshow))
                    }
                    className="bg-white text-gray-800 p-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
                    title="Preview"
                  >
                    <Play className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      handleEditSlideshow(convertToSavedSlideshow(slideshow))
                    }
                    className="bg-white text-gray-800 p-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      window.open(`/slideshow/${slideshow.id}`, "_blank")
                    }
                    className="bg-white text-gray-800 p-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
                    title="Open on TV"
                  >
                    <Monitor className="w-5 h-5" />
                  </motion.button>
                </motion.div>

                {/* Status/Stats Badges */}
                {slideshow.play_count && slideshow.play_count > 0 && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                    <Eye className="w-3 h-3 inline mr-1" />
                    {slideshow.play_count} plays
                  </div>
                )}
                {((slideshow.content?.slides &&
                  slideshow.content.slides.length > 1) ||
                  (slideshow.content?.images &&
                    slideshow.content.images.length > 1)) && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                    <Image className="w-3 h-3 inline mr-1" />
                    {(slideshow.content?.slides?.length ||
                      slideshow.content?.images?.length ||
                      0) + " items"}
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 truncate flex-1 mr-3">
                    {slideshow.title}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFavorite(slideshow)}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      slideshow.is_favorite
                        ? "text-red-500 bg-red-50 hover:bg-red-100"
                        : "text-gray-400 hover:text-red-500 hover:bg-gray-50"
                    }`}
                    title={
                      slideshow.is_favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        slideshow.is_favorite ? "fill-current" : ""
                      }`}
                    />
                  </motion.button>
                </div>

                {/* Enhanced Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      {slideshow.content?.slides?.[0]?.type === "video" ||
                      slideshow.content?.slides?.[0]?.url?.includes("video") ||
                      slideshow.content?.slides?.[0]?.file_path?.includes(
                        "video"
                      ) ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Image className="w-4 h-4" />
                      )}
                      {slideshow.content?.slides?.length ||
                        slideshow.content?.images?.length ||
                        0}{" "}
                      {slideshow.content?.slides?.[0]?.type === "video" ||
                      slideshow.content?.slides?.[0]?.url?.includes("video") ||
                      slideshow.content?.slides?.[0]?.file_path?.includes(
                        "video"
                      )
                        ? "videos"
                        : "items"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {(() => {
                        const slides = slideshow.content?.slides || [];
                        if (
                          slides[0]?.type === "video" ||
                          slides[0]?.url?.includes("video") ||
                          slides[0]?.file_path?.includes("video")
                        ) {
                          const totalMs = slides.reduce(
                            (sum: number, s: any) => sum + (s.duration || 0),
                            0
                          );
                          const totalSec = Math.round(totalMs / 1000);
                          const min = Math.floor(totalSec / 60);
                          const sec = totalSec % 60;
                          return `${min}:${sec.toString().padStart(2, "0")}`;
                        } else {
                          const count =
                            slides.length ||
                            slideshow.content?.images?.length ||
                            0;
                          const duration =
                            (slideshow.settings?.duration ?? 5000) * count;
                          const totalSec = Math.round(duration / 1000);
                          const min = Math.floor(totalSec / 60);
                          const sec = totalSec % 60;
                          return `${min}:${sec.toString().padStart(2, "0")}`;
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(slideshow.created_at).toLocaleDateString()}
                    </span>
                    {slideshow.last_played && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatDate(slideshow.last_played)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Enhanced Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {slideshow.content?.isTemplate && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Template
                    </span>
                  )}
                  {slideshow.settings?.transition && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Palette className="w-3 h-3 mr-1" />
                      {slideshow.settings.transition}
                    </span>
                  )}
                  {slideshow.settings?.backgroundMusic && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Music className="w-3 h-3 mr-1" />
                      Music
                    </span>
                  )}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleActive(slideshow)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      slideshow.is_active
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                    }`}
                  >
                    {slideshow.is_active ? (
                      <>
                        <PowerOff className="w-4 h-4 inline mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 inline mr-1" />
                        Activate
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}/slideshow/${slideshow.id}`,
                        slideshow.id
                      )
                    }
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                    title="Copy link"
                  >
                    {copiedLink === slideshow.id ? (
                      <>
                        <Check className="w-4 h-4 inline mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 inline mr-1" />
                        Share
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => generateQrCode(slideshow)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    title="QR Code"
                  >
                    <QrCode className="w-4 h-4 inline mr-1" />
                    QR
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      window.open(`/slideshow/${slideshow.id}`, "_blank")
                    }
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                    title="Open on TV"
                  >
                    <Monitor className="w-4 h-4 inline mr-1" />
                    TV
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleEditSlideshow(convertToSavedSlideshow(slideshow))
                    }
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleDeleteSlideshow(slideshow.id);
                    }}
                    disabled={!canDelete}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      canDelete
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    title={
                      canDelete
                        ? "Delete"
                        : "Only owners and managers can delete slideshows"
                    }
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Del
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Enhanced QR Code Modal */}
      {showQrCode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowQrCode(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">QR Code</h3>
              <p className="text-gray-600 mb-6">
                Scan to view slideshow on any device
              </p>

              <div className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-200">
                <div className="w-48 h-48 bg-white mx-auto rounded-xl border-2 border-gray-200 flex items-center justify-center shadow-inner p-4">
                  <QRCode
                    value={showQrCode}
                    size={180}
                    level="H"
                    fgColor="#1f2937"
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600 break-all bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {showQrCode}
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => copyToClipboard(showQrCode, "qr-code")}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium text-sm"
                  >
                    <Share2 className="w-4 h-4 inline mr-2" />
                    Copy Link
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const canvas = document.querySelector("canvas");
                      if (canvas) {
                        const link = document.createElement("a");
                        link.download = "slideshow-qr-code.png";
                        link.href = canvas.toDataURL();
                        link.click();
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium text-sm"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download
                  </motion.button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQrCode(null)}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success Message */}
      <SuccessMessage
        message={successMessage}
        isVisible={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        duration={3000}
      />

      {/* Error Message */}
      {showErrorMessage && (
        <div className="fixed top-4 left-4 z-50 max-w-sm">
          <ErrorMessage
            message={errorMessage}
            onClose={() => setShowErrorMessage(false)}
            type="error"
          />
        </div>
      )}
    </div>
  );
}

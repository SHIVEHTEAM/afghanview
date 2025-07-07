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
  Save,
  HelpCircle,
  Info,
  Wifi,
  WifiOff,
  Loader2,
  Settings,
} from "lucide-react";
import { ProtectedRoute } from "../../components/auth";
import ClientLayout from "./layout";
import { useAuth } from "../../lib/auth";
import { DeleteConfirmationModal } from "../../components/common";
import { TvManager, TvQrCode } from "../../components/tv";
import { ImageSlideshowEditor } from "../../components/editor";
import { SimpleImageViewer } from "../../components/slideshow";
import SlideshowCreator from "../../components/slideshow-creator/SlideshowCreator";
import ImageSlideshowWizard from "../../components/slideshow-creator/image/ImageSlideshowWizard";
import VideoSlideshowWizard from "../../components/slideshow-creator/video/VideoSlideshowWizard";
import AiFactsSlideshowWizard from "../../components/slideshow-creator/ai-facts/AiFactsSlideshowWizard";
import MenuSlideshowWizard from "../../components/slideshow-creator/menu/MenuSlideshowWizard";
import SlideshowWizard from "../../components/slideshow-creator/SlideshowWizard";
import DealsSlideshowWizard from "../../components/slideshow-creator/deals/DealsSlideshowWizard";
import TextSlideshowWizard from "../../components/slideshow-creator/text/TextSlideshowWizard";
import SuccessMessage from "../../components/ui/SuccessMessage";
import { useToast } from "../../components/ui/Toast";

import { SlideMedia, SlideshowSettings } from "../../components/slideshow";
import { supabase } from "../../lib/supabase";
import AiAllInOneWizard from "../../components/slideshow-creator/ai-all-in-one/AiAllInOneWizard";

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
  mediaType?: "image" | "video";
  slideshowType?:
    | "image"
    | "video"
    | "ai-facts"
    | "ai-all-in-one"
    | "menu"
    | "deals"
    | "text";
  originalData?: any;
}

interface TvDevice {
  id: string;
  name: string;
  location: string;
  status: string;
  lastSeen: Date | null;
  currentSlideshow: SavedSlideshow | null;
  ipAddress: string;
  notes: string;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
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
  const [showSlideshowPlayer, setShowSlideshowPlayer] = useState(false);
  const [selectedSlideshow, setSelectedSlideshow] = useState<any>(null);

  // New unified slideshow creation state
  const [showSlideshowCreator, setShowSlideshowCreator] = useState(false);
  const [showSlideshowWizard, setShowSlideshowWizard] = useState(false);
  const [wizardType, setWizardType] = useState("");
  const [wizardSteps, setWizardSteps] = useState<any[]>([]);

  // Success message state
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlideshow, setEditingSlideshow] =
    useState<SavedSlideshow | null>(null);
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [editWizardType, setEditWizardType] = useState<string>("");

  // Helper function to get authenticated headers with token refresh
  const getAuthHeaders = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        throw new Error("Authentication failed");
      }

      if (!session?.access_token) {
        throw new Error("No valid session");
      }

      // Check if token is about to expire (within 5 minutes)
      const tokenExpiry = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60;

      if (tokenExpiry && tokenExpiry - now < fiveMinutes) {
        console.log("Token expiring soon, refreshing...");
        const {
          data: { session: newSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !newSession?.access_token) {
          throw new Error("Token refresh failed");
        }

        return {
          Authorization: `Bearer ${newSession.access_token}`,
          "Content-Type": "application/json",
        };
      }

      return {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
    } catch (error) {
      console.error("Auth headers error:", error);
      // Redirect to login if authentication fails
      window.location.href = "/auth/signin";
      throw error;
    }
  };

  // Load saved slideshows from API
  useEffect(() => {
    const loadSlideshows = async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `/api/slideshows?restaurantId=e46a2c25-fe10-4fd2-a2bd-4c72969a898e&userId=${
            user?.id || "default-user"
          }`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const slideshows = await response.json();
        console.log("[Client] Loaded slideshows:", slideshows);

        // Debug: Check image types with safety checks
        slideshows.forEach((slideshow: any, index: number) => {
          console.log(
            `[Client] Slideshow ${index} (${slideshow.name}) images:`,
            slideshow.images
          );

          // Safety check for images array
          if (slideshow.images && Array.isArray(slideshow.images)) {
            slideshow.images.forEach((img: any, imgIndex: number) => {
              console.log(`[Client] Image ${imgIndex}:`, {
                name: img.name,
                type: img.type,
                file_path: img.file_path,
                url: img.url,
              });
            });
          } else {
            console.log(
              `[Client] Slideshow ${index} has no images array or invalid format`
            );
          }
        });

        // Convert date strings to Date objects with safety checks
        const slideshowsWithProperDates = slideshows.map((slideshow: any) => ({
          ...slideshow,
          createdAt: slideshow.createdAt
            ? new Date(slideshow.createdAt)
            : new Date(),
          lastPlayed: slideshow.lastPlayed
            ? new Date(slideshow.lastPlayed)
            : undefined,
          // Ensure images array exists
          images: slideshow.images || [],
        }));

        setSavedSlideshows(slideshowsWithProperDates);
      } catch (error) {
        console.error("Error loading slideshows:", error);
      }
    };

    loadSlideshows();
  }, [user?.id]);

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
      if (isEditing && editingSlideshow) {
        // Update existing slideshow
        const headers = await getAuthHeaders();
        const response = await fetch(`/api/slideshows/${editingSlideshow.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            name: editingSlideshow.name,
            images: media,
            settings: settings,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedSlideshow = await response.json();

        // Update local state
        const updatedSlideshows = savedSlideshows.map((s) =>
          s.id === editingSlideshow.id ? updatedSlideshow : s
        );
        setSavedSlideshows(updatedSlideshows);
        saveSlideshows(updatedSlideshows);

        // Reset edit mode
        setIsEditing(false);
        setEditingSlideshow(null);
        setShowEditor(false);

        // Show success message
        setSuccessMessage("Slideshow updated successfully!");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        return;
      }

      // Create new slideshow
      const slideshowName = `Client Slideshow ${savedSlideshows.length + 1}`;
      const slug = generateSlug(slideshowName);

      // Save slideshow via API
      const headers = await getAuthHeaders();
      const response = await fetch("/api/slideshows", {
        method: "POST",
        headers,
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
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/slideshows/${selectedSlideshowId}`, {
        method: "DELETE",
        headers,
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

  const handleToggleActive = async (slideshow: SavedSlideshow) => {
    try {
      // Update the database
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/slideshows/${slideshow.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          isActive: !slideshow.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update slideshow: ${response.statusText}`);
      }

      const result = await response.json();

      // Update local state with the response from the server
      const updatedSlideshows = savedSlideshows.map((s) =>
        s.id === slideshow.id ? { ...s, isActive: result.isActive } : s
      );
      setSavedSlideshows(updatedSlideshows);
      saveSlideshows(updatedSlideshows);

      // Force re-render by updating the state
      setSavedSlideshows([...updatedSlideshows]);

      // Show success message
      showSuccess(
        `Slideshow ${
          result.isActive ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      console.error("Error updating slideshow status:", error);
      showError("Failed to update slideshow status");
    }
  };

  const handleCopyLink = async (slideshow: SavedSlideshow) => {
    try {
      // Generate the proper TV display URL
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";
      const tvUrl = `${baseUrl}/tv/${slideshow.id}`;

      await navigator.clipboard.writeText(tvUrl);
      setCopiedLink(slideshow.id);

      // Show success toast
      showSuccess("TV display link copied to clipboard!");

      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      showError("Failed to copy link");
    }
  };

  const handleGenerateQrCode = (slideshow: SavedSlideshow) => {
    // Generate the proper TV display URL
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const tvUrl = `${baseUrl}/tv/${slideshow.id}`;

    // Show QR code modal with the correct URL
    setShowQrCode(slideshow.id);
  };

  const handleToggleFavorite = (slideshow: SavedSlideshow) => {
    const updatedSlideshows = savedSlideshows.map((s) =>
      s.id === slideshow.id ? { ...s, isFavorite: !s.isFavorite } : s
    );
    saveSlideshows(updatedSlideshows);
  };

  // Helper function to convert slideshow data to wizard-specific format
  const convertSlideshowDataForWizard = (
    slideshow: SavedSlideshow,
    wizardType: string
  ) => {
    const baseData = {
      name: slideshow.name || "",
      settings: slideshow.settings || {},
    };

    // If originalData exists, use it directly
    if (slideshow.originalData) {
      console.log(
        "📝 Using original data for editing:",
        slideshow.originalData
      );
      return {
        ...baseData,
        ...slideshow.originalData,
      };
    }

    // Fallback to the old method for backward compatibility
    console.log("📝 Using fallback method for editing (no original data)");

    switch (wizardType) {
      case "image":
        // Convert images to the format expected by ImageSlideshowWizard
        const convertedImages = (slideshow.images || []).map((img: any) => ({
          id: img.id || `img-${Date.now()}-${Math.random()}`,
          file: null, // We don't have the original file, so set to null
          url: img.url || img.file_path || "",
          name: img.name || "Image",
          type: img.type || "image",
          file_path: img.file_path || img.url || "",
        }));

        console.log("Converted images for editing:", convertedImages);

        return {
          ...baseData,
          images: convertedImages,
        };
      case "video":
        return {
          ...baseData,
          videos: slideshow.images || [],
        };
      case "ai-facts":
        return {
          ...baseData,
          facts: slideshow.images || [],
        };
      case "menu":
        return {
          ...baseData,
          menuItems: slideshow.images || [],
        };
      case "deals":
        return {
          ...baseData,
          deals: slideshow.images || [],
        };
      case "text":
        return {
          ...baseData,
          textSlides: slideshow.images || [],
        };
      default:
        return baseData;
    }
  };

  const handleEditSlideshow = (slideshow: SavedSlideshow) => {
    console.log("🔄 Starting edit for slideshow:", slideshow.name);
    console.log("Slideshow data:", slideshow);
    console.log("Slideshow settings:", slideshow.settings);

    // Determine slideshow type based on slideshow data or name
    let slideshowType = slideshow.slideshowType;

    // If slideshowType is not set, try to infer it from the data
    if (!slideshowType) {
      if (
        slideshow.name.toLowerCase().includes("ai") ||
        slideshow.name.toLowerCase().includes("fact")
      ) {
        slideshowType = "ai-facts";
      } else if (slideshow.name.toLowerCase().includes("menu")) {
        slideshowType = "menu";
      } else if (slideshow.name.toLowerCase().includes("deal")) {
        slideshowType = "deals";
      } else if (slideshow.name.toLowerCase().includes("text")) {
        slideshowType = "text";
      } else if (slideshow.mediaType === "video") {
        slideshowType = "video";
      } else {
        slideshowType = "image"; // default
      }
    }

    console.log("📝 Determined slideshow type:", slideshowType);

    // Convert images to SlideMedia format if needed
    const convertedImages =
      slideshow.images?.map((img: any) => ({
        id: img.id || `img-${Date.now()}-${Math.random()}`,
        file: img.file || null,
        url: img.url || img.file_path || "",
        name: img.name || "Image",
        type: img.type || "image",
        file_path: img.file_path || img.url || "",
      })) || [];

    console.log("Converted images:", convertedImages);

    // Ensure settings have all required properties
    const convertedSettings = {
      defaultDuration: slideshow.settings?.defaultDuration || 5000,
      duration: slideshow.settings?.duration || 5000,
      transition: slideshow.settings?.transition || "fade",
      transitionDuration: slideshow.settings?.transitionDuration || 1000,
      backgroundMusic: slideshow.settings?.backgroundMusic,
      musicVolume: slideshow.settings?.musicVolume || 50,
      musicLoop: slideshow.settings?.musicLoop || true,
      autoPlay: slideshow.settings?.autoPlay || true,
      showControls: slideshow.settings?.showControls || true,
      showProgress: slideshow.settings?.showProgress || true,
      loopSlideshow: slideshow.settings?.loopSlideshow || true,
      shuffleSlides: slideshow.settings?.shuffleSlides || false,
      aspectRatio: slideshow.settings?.aspectRatio || "16:9",
      quality: slideshow.settings?.quality || "high",
    };

    console.log("Converted settings:", convertedSettings);

    setEditingSlideshow({
      ...slideshow,
      images: convertedImages,
      settings: convertedSettings,
      slideshowType: slideshowType,
    });
    setEditWizardType(slideshowType);
    setIsEditing(true);
    setShowEditWizard(true);

    // Show confirmation that edit mode is activated
    console.log("✅ Edit mode activated for:", slideshow.name);
    console.log(
      "✅ Edit wizard should now be visible for type:",
      slideshowType
    );
  };

  const handleStartSlideshowCreation = (type: string) => {
    setWizardType(type);
    setShowSlideshowCreator(false);
    setShowSlideshowWizard(true);
  };

  const handleEditWizardComplete = async (data: any) => {
    try {
      console.log("[Client] Edit wizard completed with data:", data);

      // Update the existing slideshow with new data
      if (!editingSlideshow) {
        throw new Error("No slideshow being edited");
      }

      let slideshowName = data.name || editingSlideshow.name;
      let mediaItems: SlideMedia[] = [];
      let slideshowSettings: SlideshowSettings = {
        defaultDuration: 5000,
        duration: 5000,
        transition: "fade",
        transitionDuration: 1000,
        backgroundMusic: undefined,
        musicVolume: 50,
        musicLoop: true,
        autoPlay: true,
        showControls: true,
        showProgress: true,
        loopSlideshow: true,
        shuffleSlides: false,
        aspectRatio: "16:9",
        quality: "high",
      };

      // Extract original data from the wizard
      let originalData = data.originalData || null;

      // Handle different wizard types for editing
      if (editWizardType === "image") {
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Image data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((img: any, index: number) => ({
          id: img.id || `img-${Date.now()}-${index}`,
          file_path: img.url || img.file_path,
          name: img.name || `Image ${index + 1}`,
          type: "image",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 5000,
          duration: data.settings?.slideDuration || 5000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original image data
        originalData = {
          images: data.images || [],
        };
      } else if (editWizardType === "video") {
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Video data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((video: any, index: number) => ({
          id: video.id || `video-${Date.now()}-${index}`,
          file_path: video.file || video.file_path,
          name: video.name || `Video ${index + 1}`,
          type: "video",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 10000,
          duration: data.settings?.slideDuration || 10000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original video data
        originalData = {
          videos: data.videos || [],
        };
      } else if (editWizardType === "ai-facts") {
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("AI Facts data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => ({
          id: slide.id || `fact-${Date.now()}-${index}`,
          file_path: slide.file_path,
          name: slide.name || `Fact ${index + 1}`,
          type: "image",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 5000,
          duration: data.settings?.slideDuration || 5000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original facts data
        originalData = {
          facts: data.facts || [],
        };
      } else if (editWizardType === "menu") {
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Menu slides data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => ({
          id: slide.id || `menu-${Date.now()}-${index}`,
          file_path: slide.file_path || slide.url,
          name: slide.name || `Menu Item ${index + 1}`,
          type: "image",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 4000,
          duration: data.settings?.slideDuration || 4000,
          transition: data.settings?.transition || "slide",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original menu data
        originalData = {
          menuItems: data.menuItems || [],
          theme: data.theme || {},
          layout: data.layout || {},
        };
      } else if (editWizardType === "deals") {
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Deals data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => ({
          id: slide.id || `deal-${Date.now()}-${index}`,
          file_path: slide.file_path || slide.url,
          name: slide.name || `Deal ${index + 1}`,
          type: "image",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 5000,
          duration: data.settings?.slideDuration || 5000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original deals data
        originalData = {
          deals: data.deals || [],
        };
      } else if (editWizardType === "text") {
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Text slides data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => ({
          id: slide.id || `text-${Date.now()}-${index}`,
          file_path: slide.file_path || slide.url,
          name: slide.name || `Text Slide ${index + 1}`,
          type: "image",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 4000,
          duration: data.settings?.slideDuration || 4000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original text data
        originalData = {
          textSlides: data.textSlides || [],
        };
      }

      console.log("[Client] Saving edited slideshow with original data:", {
        slideshowName,
        mediaItemsCount: mediaItems.length,
        hasOriginalData: !!originalData,
        originalDataType: originalData ? Object.keys(originalData)[0] : null,
      });

      // Update the slideshow via API
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/slideshows/${editingSlideshow.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          name: slideshowName,
          images: mediaItems,
          settings: slideshowSettings,
          originalData: originalData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update slideshow: ${response.statusText}`);
      }

      const updatedSlideshow = await response.json();

      // Update local state
      const updatedSlideshows = savedSlideshows.map((s) =>
        s.id === editingSlideshow.id ? updatedSlideshow : s
      );
      setSavedSlideshows(updatedSlideshows);
      saveSlideshows(updatedSlideshows);

      // Reset edit mode
      setIsEditing(false);
      setEditingSlideshow(null);
      setShowEditWizard(false);
      setEditWizardType("");

      // Show success message
      setSuccessMessage("Slideshow updated successfully!");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      console.log("✅ Slideshow updated successfully with original data");
    } catch (error) {
      console.error("Error updating slideshow:", error);
      alert(`Error updating slideshow: ${(error as any).message || error}`);
    }
  };

  const handleWizardComplete = async (data: any) => {
    try {
      console.log("[Client] Wizard completed with data:", data);

      let slideshowName = data.name || "New Slideshow";
      let mediaItems: SlideMedia[] = [];
      let slideshowSettings: SlideshowSettings = {
        defaultDuration: 5000,
        duration: 5000,
        transition: "fade",
        transitionDuration: 1000,
        backgroundMusic: undefined,
        musicVolume: 50,
        musicLoop: true,
        autoPlay: true,
        showControls: true,
        showProgress: true,
        loopSlideshow: true,
        shuffleSlides: false,
        aspectRatio: "16:9",
        quality: "high",
      };

      // Extract original data from the wizard
      let originalData = data.originalData || null;

      // Handle different wizard types
      if (wizardType === "image") {
        // Image slideshow
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Image data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((img: any, index: number) => ({
          id: img.id || `img-${Date.now()}-${index}`,
          file_path: img.url || img.file_path,
          name: img.name || `Image ${index + 1}`,
          type: "image",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 5000,
          duration: data.settings?.slideDuration || 5000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original image data
        originalData = {
          images: data.images || [],
        };
      } else if (wizardType === "video") {
        // Video slideshow
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Video data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((video: any, index: number) => ({
          id: video.id || `video-${Date.now()}-${index}`,
          file_path: video.file || video.file_path,
          name: video.name || `Video ${index + 1}`,
          type: "video",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 10000,
          duration: data.settings?.slideDuration || 10000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original video data
        originalData = {
          videos: data.videos || [],
        };
      } else if (wizardType === "ai-facts") {
        // AI Facts slideshow - convert facts to slide images
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("AI Facts data is missing or invalid");
        }

        console.log("[Client] Processing AI Facts data:", {
          slidesCount: data.slides?.length,
          slides: data.slides,
          settings: data.settings,
          fullData: data,
        });

        mediaItems = (data.slides || []).map((slide: any, index: number) => {
          console.log(`[Client] Processing slide ${index}:`, {
            id: slide.id,
            file_path: slide.file_path,
            name: slide.name,
            type: slide.type,
            fullSlide: slide,
          });

          return {
            id: slide.id || `fact-${Date.now()}-${index}`,
            file_path: slide.file_path,
            name: slide.name || `Fact ${index + 1}`,
            type: "image",
          };
        });
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 5000,
          duration: data.settings?.slideDuration || 5000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original facts data
        originalData = {
          facts: data.facts || [],
        };
      } else if (wizardType === "ai-all-in-one") {
        // AI All-in-One wizard
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("AI All-in-One data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => ({
          id: slide.id || `ai-all-in-one-${Date.now()}-${index}`,
          file_path: slide.file_path,
          name: slide.name || `AI All-in-One ${index + 1}`,
          type: "image",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 5000,
          duration: data.settings?.slideDuration || 5000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original AI All-in-One data
        originalData = {
          aiAllInOne: data.aiAllInOne || [],
        };
      } else if (wizardType === "menu") {
        // Menu slideshow - use the improved MenuSVGGenerator
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Menu slides data is missing or invalid");
        }

        mediaItems = (data.slides || []).map((slide: any, index: number) => ({
          id: slide.id || `menu-${Date.now()}-${index}`,
          file_path: slide.file_path || slide.url,
          name: slide.name || `Menu Item ${index + 1}`,
          type: "image",
        }));

        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 4000,
          duration: data.settings?.slideDuration || 4000,
          transition: data.settings?.transition || "slide",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original menu data
        originalData = {
          menuItems: data.menuItems || [],
          theme: data.theme || {},
          layout: data.layout || {},
        };
      } else if (wizardType === "deals") {
        // Deals slideshow
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Deals slides data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => ({
          id: slide.id || `deal-${Date.now()}-${index}`,
          file_path: slide.file_path || slide.url,
          name: slide.name || `Deal ${index + 1}`,
          type: "image",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 5000,
          duration: data.settings?.slideDuration || 5000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original deals data
        originalData = {
          deals: data.deals || [],
        };
      } else if (wizardType === "text") {
        // Text slideshow
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Text slides data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => ({
          id: slide.id || `text-${Date.now()}-${index}`,
          file_path: slide.file_path || slide.url,
          name: slide.name || `Text Slide ${index + 1}`,
          type: "image",
        }));
        slideshowSettings = {
          defaultDuration: data.settings?.slideDuration || 4000,
          duration: data.settings?.slideDuration || 4000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic,
          musicVolume: data.settings?.musicVolume || 50,
          musicLoop: data.settings?.musicLoop || true,
          autoPlay: data.settings?.autoPlay || true,
          showControls: data.settings?.showControls || true,
          showProgress: data.settings?.showProgress || true,
          loopSlideshow: data.settings?.loopSlideshow || true,
          shuffleSlides: data.settings?.shuffleSlides || false,
          aspectRatio: data.settings?.aspectRatio || "16:9",
          quality: data.settings?.quality || "high",
        };
        // Save original text data
        originalData = {
          textSlides: data.textSlides || [],
        };
      }

      // Ensure mediaItems is always an array
      if (!Array.isArray(mediaItems)) {
        mediaItems = [];
      }

      // Video files are now uploaded separately, so no need for size validation here

      // Generate slug for public link
      const slug = generateSlug(slideshowName);

      console.log("[Client] Creating slideshow with original data:", {
        name: slideshowName,
        type: wizardType,
        mediaItemsCount: mediaItems.length,
        hasOriginalData: !!originalData,
        originalDataType: originalData ? Object.keys(originalData)[0] : null,
      });

      // Save slideshow via API
      console.log("[Client] Sending slideshow data to API:", {
        name: slideshowName,
        type: wizardType,
        mediaItemsCount: mediaItems.length,
        mediaItems: mediaItems.map((img) => ({
          id: img.id,
          name: img.name,
          type: img.type,
          hasFile: !!img.file,
          hasFilePath: !!img.file_path,
          hasUrl: !!img.url,
        })),
      });

      const requestBody = {
        name: slideshowName,
        images: mediaItems.map((img) => ({
          id: img.id,
          file_path: img.file_path || img.url,
          name: img.name,
          type: img.type,
        })),
        settings: {
          ...slideshowSettings,
          backgroundMusic:
            slideshowSettings.backgroundMusic instanceof File
              ? await fileToBase64(slideshowSettings.backgroundMusic)
              : slideshowSettings.backgroundMusic,
        },
        restaurantId: "e46a2c25-fe10-4fd2-a2bd-4c72969a898e", // Real restaurant ID from test data
        userId: user?.id || "default-user", // Get from auth context
        slug,
        type: wizardType,
        originalData: originalData,
      };

      console.log(
        "[Client] Request body size:",
        JSON.stringify(requestBody).length,
        "characters"
      );

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      try {
        const headers = await getAuthHeaders();
        const response = await fetch("/api/slideshows", {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[Client] API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            errorText,
          });
          throw new Error(
            `Failed to save slideshow: ${response.status} ${response.statusText} - ${errorText}`
          );
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

        const updatedSlideshows = [
          ...savedSlideshows,
          slideshowWithProperDates,
        ];
        setSavedSlideshows(updatedSlideshows);
        saveSlideshows(updatedSlideshows);
        setShowSlideshowWizard(false);

        // Show success message
        setSuccessMessage(`Slideshow "${slideshowName}" created successfully!`);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        console.log("✅ Slideshow created successfully with original data");
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          throw new Error(
            "Request timed out. Please try with smaller video files."
          );
        }
        throw fetchError;
      }
    } catch (error) {
      console.error("Error creating slideshow:", error);
      alert(`Error creating slideshow: ${(error as any).message || error}`);
    }
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

  // Advanced TV Management State
  const [tvDevices, setTvDevices] = useState<TvDevice[]>([
    {
      id: "tv-1",
      name: "Main Restaurant TV",
      location: "Dining Area",
      status: "offline",
      lastSeen: null,
      currentSlideshow: null,
      ipAddress: "",
      notes: "Primary display for customers",
    },
    {
      id: "tv-2",
      name: "Bar TV",
      location: "Bar Area",
      status: "offline",
      lastSeen: null,
      currentSlideshow: null,
      ipAddress: "",
      notes: "Secondary display for bar customers",
    },
  ]);
  const [showTvManager, setShowTvManager] = useState(false);
  const [editingTv, setEditingTv] = useState<TvDevice | null>(null);
  const [showAddTv, setShowAddTv] = useState(false);

  // TV Management Functions
  const handleAddTv = (tvData: Omit<TvDevice, "id">) => {
    const newTv: TvDevice = {
      ...tvData,
      id: `tv-${Date.now()}`,
      status: "offline",
      lastSeen: null,
      currentSlideshow: null,
    };
    setTvDevices([...tvDevices, newTv]);
    setShowAddTv(false);
  };

  const handleEditTv = (tv: TvDevice) => {
    setEditingTv(tv);
    setShowTvManager(true);
  };

  const handleUpdateTv = (updatedTv: TvDevice) => {
    setTvDevices(
      tvDevices.map((tv) => (tv.id === updatedTv.id ? updatedTv : tv))
    );
    setEditingTv(null);
    setShowTvManager(false);
  };

  const handleDeleteTv = (tvId: string) => {
    setTvDevices(tvDevices.filter((tv) => tv.id !== tvId));
  };

  const handleTvConnection = (tvId: string, slideshowId: string) => {
    const slideshow = savedSlideshows.find((s) => s.id === slideshowId);
    if (slideshow) {
      setTvDevices(
        tvDevices.map((tv) =>
          tv.id === tvId
            ? {
                ...tv,
                status: "online",
                lastSeen: new Date(),
                currentSlideshow: slideshow,
              }
            : tv
        )
      );
    }
  };

  const handleTvDisconnection = (tvId: string) => {
    setTvDevices(
      tvDevices.map((tv) =>
        tv.id === tvId
          ? {
              ...tv,
              status: "offline",
              currentSlideshow: null,
            }
          : tv
      )
    );
  };

  const getTvStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-100";
      case "offline":
        return "text-red-600 bg-red-100";
      case "connecting":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTvStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="w-4 h-4" />;
      case "offline":
        return <WifiOff className="w-4 h-4" />;
      case "connecting":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showQrCode) setShowQrCode(null);
        if (showDeleteConfirmation) setShowDeleteConfirmation(false);
        if (showSlideshowCreator) setShowSlideshowCreator(false);
        if (showSlideshowWizard) setShowSlideshowWizard(false);
        if (showViewer) setShowViewer(false);
        if (showEditor) setShowEditor(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [
    showQrCode,
    showDeleteConfirmation,
    showSlideshowCreator,
    showSlideshowWizard,
    showViewer,
    showEditor,
  ]);

  return (
    <ProtectedRoute requiredRole="restaurant_owner">
      <ClientLayout>
        <Head>
          <title>Dashboard - AfghanView</title>
          <meta name="description" content="Manage your slideshows" />
        </Head>

        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back, {user?.first_name || "User"}!
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Manage your slideshows and track performance
              </p>
            </div>
            <div className="flex gap-2 lg:gap-3">
              <button
                onClick={() => setShowSlideshowCreator(true)}
                className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Create Slideshow</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="text-xl lg:text-3xl font-bold text-gray-900 mb-1">
                {stats.total}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 font-medium">
                Total
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="text-xl lg:text-3xl font-bold text-green-600 mb-1">
                {stats.active}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 font-medium">
                Active
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="text-xl lg:text-3xl font-bold text-gray-600 mb-1">
                {stats.inactive}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 font-medium">
                Inactive
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 sm:col-span-2 lg:col-span-1"
            >
              <div className="text-xl lg:text-3xl font-bold text-blue-600 mb-1">
                {stats.totalPlays}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 font-medium">
                Total Plays
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 sm:col-span-2 lg:col-span-1"
            >
              <div className="text-xl lg:text-3xl font-bold text-yellow-600 mb-1">
                {stats.favorites}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 font-medium">
                Favorites
              </div>
            </motion.div>
          </div>

          {/* Active Slideshow Banner */}
          {activeSlideshow && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold mb-2">
                    🎬 Currently Playing: {activeSlideshow.name}
                  </h3>
                  <p className="text-green-100 text-sm lg:text-base">
                    {activeSlideshow.images.length}{" "}
                    {activeSlideshow.mediaType === "video"
                      ? "videos"
                      : "images"}{" "}
                    • {activeSlideshow.settings.duration / 1000}s duration
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                  <span className="flex items-center text-green-100 text-sm">
                    <Activity className="w-4 h-4 mr-2" />
                    {activeSlideshow.playCount} plays
                  </span>
                  <button
                    onClick={() => handleToggleActive(activeSlideshow)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
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
              className={`flex-1 py-2 px-2 lg:px-4 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base ${
                activeTab === "slideshows"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Image className="w-4 h-4 inline mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Slideshows</span>
              <span className="sm:hidden">Slides</span>
            </button>
            <button
              onClick={() => setActiveTab("tvs")}
              className={`flex-1 py-2 px-2 lg:px-4 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base ${
                activeTab === "tvs"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Tv className="w-4 h-4 inline mr-1 lg:mr-2" />
              <span className="hidden sm:inline">TV Displays</span>
              <span className="sm:hidden">TVs</span>
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
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Slideshow
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {savedSlideshows.map((slideshow, index) => (
                    <motion.div
                      key={slideshow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    >
                      {/* Image Preview */}
                      <div className="relative aspect-video bg-gray-100 overflow-hidden">
                        {slideshow.images && slideshow.images.length > 0 ? (
                          <img
                            src={
                              slideshow.images[0].url ||
                              slideshow.images[0].file_path ||
                              slideshow.images[0].base64
                            }
                            alt={slideshow.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Image className="w-12 h-12 text-gray-400" />
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-2 left-2 lg:top-3 lg:left-3">
                          {slideshow.isActive ? (
                            <div className="bg-green-500 text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-medium flex items-center gap-1 lg:gap-1.5 shadow-lg">
                              <Power className="w-3 h-3" />
                              <span className="hidden sm:inline">Active</span>
                            </div>
                          ) : (
                            <div className="bg-gray-500 text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-medium flex items-center gap-1 lg:gap-1.5 shadow-lg">
                              <PowerOff className="w-3 h-3" />
                              <span className="hidden sm:inline">Inactive</span>
                            </div>
                          )}
                        </div>

                        {/* Video Badge */}
                        {slideshow.mediaType === "video" && (
                          <div className="absolute top-2 right-2 lg:top-3 lg:right-3">
                            <div className="bg-purple-500 text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-medium flex items-center gap-1 lg:gap-1.5 shadow-lg">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                              </svg>
                              <span className="hidden sm:inline">Video</span>
                            </div>
                          </div>
                        )}

                        {/* Favorite Button */}
                        <button
                          onClick={() => handleToggleFavorite(slideshow)}
                          className={`absolute top-2 right-2 lg:top-3 lg:right-3 p-1 rounded-full transition-all duration-200 ${
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
                          <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 bg-black bg-opacity-75 backdrop-blur-sm text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-medium shadow-lg">
                            {slideshow.playCount} plays
                          </div>
                        )}

                        {/* Media Count Badge */}
                        {slideshow.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 lg:bottom-3 lg:right-3 bg-black bg-opacity-75 backdrop-blur-sm text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-medium shadow-lg">
                            {slideshow.images.length}{" "}
                            {slideshow.mediaType === "video"
                              ? "videos"
                              : "images"}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 lg:p-6">
                        <div className="flex items-start justify-between mb-2 lg:mb-3">
                          <h4 className="font-bold text-gray-900 text-sm lg:text-lg leading-tight flex-1">
                            {slideshow.name}
                          </h4>
                          <div className="flex items-center gap-1 lg:gap-2">
                            <span className="text-xs lg:text-sm text-gray-500">
                              {slideshow.images?.length || 0}{" "}
                              {slideshow.mediaType === "video"
                                ? "videos"
                                : "slides"}
                            </span>
                            <button
                              onClick={() => handleToggleFavorite(slideshow)}
                              className={`p-1 lg:p-2 rounded-xl transition-all duration-200 ${
                                slideshow.isFavorite
                                  ? "text-yellow-400 bg-yellow-50"
                                  : "text-gray-400 hover:text-yellow-400 hover:bg-gray-50"
                              }`}
                            >
                              <Star
                                className={`w-4 h-4 lg:w-5 lg:h-5 ${
                                  slideshow.isFavorite ? "fill-current" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                            {slideshow.images.length}{" "}
                            {slideshow.mediaType === "video"
                              ? "video"
                              : "image"}
                            {slideshow.images.length !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                            {slideshow.settings.duration / 1000}s
                          </span>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-1 lg:gap-2 mb-3 lg:mb-4">
                          {slideshow.isTemplate && (
                            <span className="inline-flex items-center px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Star className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Template</span>
                            </span>
                          )}
                          {slideshow.settings.transition && (
                            <span className="inline-flex items-center px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Palette className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">
                                {slideshow.settings.transition}
                              </span>
                            </span>
                          )}
                          {slideshow.settings.backgroundMusic && (
                            <span className="inline-flex items-center px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Music className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Music</span>
                            </span>
                          )}
                          {slideshow.lastPlayed && (
                            <span className="inline-flex items-center px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">
                                {formatDate(slideshow.lastPlayed)}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 lg:gap-2 mb-3 lg:mb-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePlaySlideshow(slideshow)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 lg:px-4 py-2 lg:py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center justify-center gap-1 lg:gap-2 shadow-sm hover:shadow-md text-xs lg:text-sm"
                          >
                            <Play className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">Play</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleActive(slideshow)}
                            className={`px-2 lg:px-4 py-2 lg:py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                              slideshow.isActive
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            title={
                              slideshow.isActive ? "Deactivate" : "Activate"
                            }
                          >
                            {slideshow.isActive ? (
                              <PowerOff className="w-3 h-3 lg:w-4 lg:h-4" />
                            ) : (
                              <Power className="w-3 h-3 lg:w-4 lg:h-4" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditSlideshow(slideshow)}
                            className="px-2 lg:px-4 py-2 lg:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteSlideshow(slideshow.id)}
                            className="px-2 lg:px-4 py-2 lg:py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCopyLink(slideshow)}
                            className="px-2 lg:px-4 py-2 lg:py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Copy Link"
                          >
                            {copiedLink === slideshow.id ? (
                              <Check className="w-3 h-3 lg:w-4 lg:h-4" />
                            ) : (
                              <Link className="w-3 h-3 lg:w-4 lg:h-4" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGenerateQrCode(slideshow)}
                            className="px-2 lg:px-4 py-2 lg:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Show QR Code"
                          >
                            <QrCode className="w-3 h-3 lg:w-4 lg:h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* TV Management Section */}
              <div className="space-y-6">
                {/* TV Management Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                      Advanced TV Display Management
                    </h2>
                    <p className="text-gray-600 text-sm lg:text-base">
                      Manage multiple TV displays, track connections, and
                      control slideshow playback
                    </p>
                  </div>
                  <div className="flex gap-2 lg:gap-3">
                    <button
                      onClick={() => setShowAddTv(true)}
                      className="inline-flex items-center px-3 lg:px-4 py-2 lg:py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Add TV Device</span>
                      <span className="sm:hidden">Add TV</span>
                    </button>
                    <button
                      onClick={() => setShowTvManager(true)}
                      className="inline-flex items-center px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm transition-all duration-200"
                    >
                      <Settings className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Manage TVs</span>
                      <span className="sm:hidden">Manage</span>
                    </button>
                    <button
                      onClick={() => window.open("/tv/guide", "_blank")}
                      className="inline-flex items-center px-3 lg:px-4 py-2 lg:py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                    >
                      <HelpCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Setup Guide</span>
                      <span className="sm:hidden">Guide</span>
                    </button>
                  </div>
                </div>

                {/* TV Status Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl lg:text-3xl font-bold mb-1">
                          {tvDevices.length}
                        </div>
                        <div className="text-sm lg:text-base font-medium">
                          Total TV Devices
                        </div>
                      </div>
                      <Tv className="w-8 h-8 lg:w-10 lg:h-10 opacity-80" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl lg:text-3xl font-bold mb-1">
                          {
                            tvDevices.filter((tv) => tv.status === "online")
                              .length
                          }
                        </div>
                        <div className="text-sm lg:text-base font-medium">
                          Online TVs
                        </div>
                      </div>
                      <Wifi className="w-8 h-8 lg:w-10 lg:h-10 opacity-80" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl lg:text-3xl font-bold mb-1">
                          {savedSlideshows.filter((s) => s.isActive).length}
                        </div>
                        <div className="text-sm lg:text-base font-medium">
                          Active Slideshows
                        </div>
                      </div>
                      <Play className="w-8 h-8 lg:w-10 lg:h-10 opacity-80" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl lg:text-3xl font-bold mb-1">
                          {savedSlideshows.reduce(
                            (sum, s) => sum + s.playCount,
                            0
                          )}
                        </div>
                        <div className="text-sm lg:text-base font-medium">
                          Total Plays
                        </div>
                      </div>
                      <Eye className="w-8 h-8 lg:w-10 lg:h-10 opacity-80" />
                    </div>
                  </motion.div>
                </div>

                {/* TV Devices List */}
                <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                      TV Devices ({tvDevices.length})
                    </h3>
                    <button
                      onClick={() => setShowAddTv(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add TV
                    </button>
                  </div>

                  {tvDevices.length === 0 ? (
                    <div className="text-center py-8">
                      <Tv className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No TV devices yet
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Add your first TV device to start managing displays
                      </p>
                      <button
                        onClick={() => setShowAddTv(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First TV
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {tvDevices.map((tv) => (
                        <motion.div
                          key={tv.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {tv.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {tv.location}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTvStatusColor(
                                    tv.status
                                  )}`}
                                >
                                  {getTvStatusIcon(tv.status)}
                                  <span className="ml-1 capitalize">
                                    {tv.status}
                                  </span>
                                </span>
                                {tv.lastSeen && (
                                  <span className="text-xs text-gray-500">
                                    Last seen: {formatDate(tv.lastSeen)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditTv(tv)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit TV"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTv(tv.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete TV"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {tv.currentSlideshow ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-green-800">
                                    Playing: {tv.currentSlideshow.name}
                                  </p>
                                  <p className="text-xs text-green-600">
                                    {tv.currentSlideshow.images.length}{" "}
                                    {tv.currentSlideshow.mediaType === "video"
                                      ? "videos"
                                      : "images"}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    if (tv.currentSlideshow) {
                                      handleGenerateQrCode(tv.currentSlideshow);
                                    }
                                  }}
                                  disabled={!tv.currentSlideshow}
                                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                  title="Show QR Code"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-600">
                                No slideshow playing
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {savedSlideshows.filter((s) => s.isActive).length >
                            0 ? (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleTvConnection(tv.id, e.target.value);
                                  } else {
                                    handleTvDisconnection(tv.id);
                                  }
                                }}
                                value={tv.currentSlideshow?.id || ""}
                                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select slideshow...</option>
                                {savedSlideshows
                                  .filter((s) => s.isActive)
                                  .map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.name}
                                    </option>
                                  ))}
                              </select>
                            ) : (
                              <button
                                disabled
                                className="flex-1 text-sm text-gray-500 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 cursor-not-allowed"
                              >
                                No active slideshows
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (tv.currentSlideshow) {
                                  handleGenerateQrCode(tv.currentSlideshow);
                                }
                              }}
                              disabled={!tv.currentSlideshow}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              title="Show QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          </div>

                          {tv.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              "{tv.notes}"
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <button
                      onClick={() => setShowSlideshowCreator(true)}
                      className="flex items-center justify-center gap-2 p-3 lg:p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium text-sm lg:text-base"
                    >
                      <Plus className="w-4 h-4 lg:w-5 lg:w-5" />
                      <span className="hidden sm:inline">Create Slideshow</span>
                      <span className="sm:hidden">Create</span>
                    </button>

                    <button
                      onClick={() => {
                        const activeSlideshow = savedSlideshows.find(
                          (s) => s.isActive
                        );
                        if (activeSlideshow) {
                          handlePlaySlideshow(activeSlideshow);
                        }
                      }}
                      disabled={!savedSlideshows.find((s) => s.isActive)}
                      className="flex items-center justify-center gap-2 p-3 lg:p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4 lg:w-5 lg:w-5" />
                      <span className="hidden sm:inline">Preview Active</span>
                      <span className="sm:hidden">Preview</span>
                    </button>

                    <button
                      onClick={() => setShowTvManager(true)}
                      className="flex items-center justify-center gap-2 p-3 lg:p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm lg:text-base"
                    >
                      <Settings className="w-4 h-4 lg:w-5 lg:w-5" />
                      <span className="hidden sm:inline">Manage TVs</span>
                      <span className="sm:hidden">Manage</span>
                    </button>

                    <button
                      onClick={() => window.open("/tv/guide", "_blank")}
                      className="flex items-center justify-center gap-2 p-3 lg:p-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium text-sm lg:text-base"
                    >
                      <HelpCircle className="w-4 h-4 lg:w-5 lg:w-5" />
                      <span className="hidden sm:inline">Setup Guide</span>
                      <span className="sm:hidden">Guide</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slideshow Viewer Modal */}
        {showViewer && currentSlideshow && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Preview: {currentSlideshow.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowViewer(false);
                      setCurrentSlideshow(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="aspect-video">
                <SimpleImageViewer
                  images={currentSlideshow.images}
                  settings={{
                    duration:
                      currentSlideshow.settings?.defaultDuration || 5000,
                    transition: currentSlideshow.settings?.transition || "fade",
                    autoPlay: currentSlideshow.settings?.autoPlay || true,
                    showControls: true,
                    tvMode: false,
                    backgroundMusic:
                      typeof currentSlideshow.settings?.backgroundMusic ===
                      "string"
                        ? currentSlideshow.settings.backgroundMusic
                        : undefined,
                    musicVolume: currentSlideshow.settings?.musicVolume || 50,
                    musicLoop: currentSlideshow.settings?.musicLoop || true,
                  }}
                  onClose={() => {
                    setShowViewer(false);
                    setCurrentSlideshow(null);
                  }}
                />
              </div>
            </div>
          </div>
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
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowQrCode(null);
              }
            }}
          >
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative">
              {/* Close Button - More Visible */}
              <button
                onClick={() => setShowQrCode(null)}
                className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 transition-all duration-200 rounded-full p-2 shadow-lg hover:shadow-xl"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Tv className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">TV Display Setup</h2>
                    <p className="text-blue-100 text-sm">
                      {savedSlideshows.find((s) => s.id === showQrCode)?.name ||
                        "Slideshow"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Quick Actions */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => {
                      const link = `${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "http://localhost:3000"
                      }/tv/${showQrCode}`;
                      navigator.clipboard.writeText(link);
                      showSuccess("Link copied to clipboard!");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      const link = `${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "http://localhost:3000"
                      }/tv/${showQrCode}`;
                      window.open(link, "_blank");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Tv className="w-4 h-4" />
                    Test Link
                  </button>
                </div>

                {/* Direct Link Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    Direct Link
                  </h3>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <input
                      type="text"
                      value={`${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "http://localhost:3000"
                      }/tv/${showQrCode}`}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-700 font-mono"
                    />
                    <button
                      onClick={() => {
                        const link = `${
                          typeof window !== "undefined"
                            ? window.location.origin
                            : "http://localhost:3000"
                        }/tv/${showQrCode}`;
                        navigator.clipboard.writeText(link);
                        showSuccess("Link copied!");
                      }}
                      className="text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-200 rounded"
                      title="Copy Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Copy this link and paste it in your TV's web browser
                  </p>
                </div>

                {/* QR Code Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    QR Code
                  </h3>
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 inline-block mb-4 shadow-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                          `${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : "http://localhost:3000"
                          }/tv/${showQrCode}`
                        )}`}
                        alt="TV Display QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Scan with your phone to get the link, then enter it on
                      your TV
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    How to Connect Your TV
                  </h4>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        1
                      </span>
                      <span>
                        Open web browser on your TV (Chrome, Firefox, Edge,
                        Safari)
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        2
                      </span>
                      <span>
                        Copy the link above or scan QR code with your phone
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        3
                      </span>
                      <span>
                        Paste the link in your TV's browser and press Enter
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        4
                      </span>
                      <span>Press F11 for fullscreen mode (optional)</span>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Make sure your TV and computer
                      are on the same WiFi network for the best performance.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Tip:</strong> Use the "Test Link" button above to
                      verify the slideshow works before setting up on TV.
                    </p>
                  </div>
                </div>

                {/* Close Button at Bottom */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowQrCode(null)}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slideshow Creator Modal */}
        {showSlideshowCreator && (
          <SlideshowCreator
            onClose={() => setShowSlideshowCreator(false)}
            onStartCreation={handleStartSlideshowCreation}
          />
        )}

        {/* Slideshow Wizard Modal */}
        {showSlideshowWizard && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold capitalize">
                      {wizardType.replace("-", " ")} Slideshow
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowSlideshowWizard(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {wizardType === "image" && (
                  <ImageSlideshowWizard
                    step={0}
                    formData={{}}
                    updateFormData={() => {}}
                    onComplete={handleWizardComplete}
                  />
                )}
                {wizardType === "video" && (
                  <VideoSlideshowWizard
                    step={0}
                    formData={{}}
                    updateFormData={() => {}}
                    onComplete={handleWizardComplete}
                  />
                )}
                {wizardType === "ai-facts" && (
                  <AiFactsSlideshowWizard
                    step={0}
                    formData={{}}
                    updateFormData={() => {}}
                    onComplete={handleWizardComplete}
                    onBack={() => setShowSlideshowWizard(false)}
                  />
                )}
                {wizardType === "ai-all-in-one" && (
                  <AiAllInOneWizard
                    onComplete={handleWizardComplete}
                    onBack={() => setShowSlideshowWizard(false)}
                  />
                )}
                {wizardType === "menu" && (
                  <MenuSlideshowWizard
                    step={0}
                    formData={{}}
                    updateFormData={() => {}}
                    onComplete={handleWizardComplete}
                  />
                )}
                {wizardType === "deals" && (
                  <DealsSlideshowWizard
                    step={0}
                    formData={{}}
                    updateFormData={() => {}}
                    onComplete={handleWizardComplete}
                  />
                )}
                {wizardType === "text" && (
                  <TextSlideshowWizard
                    step={0}
                    formData={{}}
                    updateFormData={() => {}}
                    onComplete={handleWizardComplete}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Wizard Modal */}
        {showEditWizard && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold capitalize">
                      Edit {editWizardType.replace("-", " ")} Slideshow
                    </h2>
                    <span className="text-sm opacity-90">
                      {editingSlideshow?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditWizard(false);
                      setIsEditing(false);
                      setEditingSlideshow(null);
                      setEditWizardType("");
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {editWizardType === "image" && editingSlideshow && (
                  <ImageSlideshowWizard
                    step={0}
                    formData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "image"
                    )}
                    updateFormData={() => {}}
                    onComplete={handleEditWizardComplete}
                    isEditing={true}
                    initialData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "image"
                    )}
                  />
                )}
                {editWizardType === "video" && editingSlideshow && (
                  <VideoSlideshowWizard
                    step={0}
                    formData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "video"
                    )}
                    updateFormData={() => {}}
                    onComplete={handleEditWizardComplete}
                    isEditing={true}
                    initialData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "video"
                    )}
                  />
                )}
                {editWizardType === "ai-facts" && editingSlideshow && (
                  <AiFactsSlideshowWizard
                    step={0}
                    formData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "ai-facts"
                    )}
                    updateFormData={() => {}}
                    onComplete={handleEditWizardComplete}
                    isEditing={true}
                    initialData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "ai-facts"
                    )}
                  />
                )}
                {editWizardType === "ai-all-in-one" && editingSlideshow && (
                  <AiAllInOneWizard
                    onComplete={handleEditWizardComplete}
                    onBack={() => {
                      setShowEditWizard(false);
                      setIsEditing(false);
                      setEditingSlideshow(null);
                      setEditWizardType("");
                    }}
                  />
                )}
                {editWizardType === "menu" && editingSlideshow && (
                  <MenuSlideshowWizard
                    step={0}
                    formData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "menu"
                    )}
                    updateFormData={() => {}}
                    onComplete={handleEditWizardComplete}
                    isEditing={true}
                    initialData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "menu"
                    )}
                  />
                )}
                {editWizardType === "deals" && editingSlideshow && (
                  <DealsSlideshowWizard
                    step={0}
                    formData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "deals"
                    )}
                    updateFormData={() => {}}
                    onComplete={handleEditWizardComplete}
                    isEditing={true}
                    initialData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "deals"
                    )}
                  />
                )}
                {editWizardType === "text" && editingSlideshow && (
                  <TextSlideshowWizard
                    step={0}
                    formData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "text"
                    )}
                    updateFormData={() => {}}
                    onComplete={handleEditWizardComplete}
                    isEditing={true}
                    initialData={convertSlideshowDataForWizard(
                      editingSlideshow,
                      "text"
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add TV Modal */}
        {showAddTv && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Add TV Device</h2>
                  <button
                    onClick={() => setShowAddTv(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleAddTv({
                      name: formData.get("name") as string,
                      location: formData.get("location") as string,
                      ipAddress: formData.get("ipAddress") as string,
                      notes: formData.get("notes") as string,
                      status: "offline",
                      lastSeen: null,
                      currentSlideshow: null,
                    });
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TV Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g., Main Restaurant TV"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        required
                        placeholder="e.g., Dining Area"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IP Address (Optional)
                      </label>
                      <input
                        type="text"
                        name="ipAddress"
                        placeholder="e.g., 192.168.1.100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        rows={3}
                        placeholder="Any additional notes about this TV..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddTv(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add TV
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TV Manager Modal */}
        {showTvManager && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">TV Device Manager</h2>
                  <button
                    onClick={() => {
                      setShowTvManager(false);
                      setEditingTv(null);
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {editingTv ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleUpdateTv({
                        ...editingTv,
                        name: formData.get("name") as string,
                        location: formData.get("location") as string,
                        ipAddress: formData.get("ipAddress") as string,
                        notes: formData.get("notes") as string,
                      });
                    }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          TV Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingTv.name}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          defaultValue={editingTv.location}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          IP Address
                        </label>
                        <input
                          type="text"
                          name="ipAddress"
                          defaultValue={editingTv.ipAddress}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          rows={3}
                          defaultValue={editingTv.notes}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Current Status
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTvStatusColor(
                              editingTv.status
                            )}`}
                          >
                            {getTvStatusIcon(editingTv.status)}
                            <span className="ml-1 capitalize">
                              {editingTv.status}
                            </span>
                          </span>
                          {editingTv.lastSeen && (
                            <span className="text-sm text-gray-600">
                              Last seen: {formatDate(editingTv.lastSeen)}
                            </span>
                          )}
                        </div>
                        {editingTv.currentSlideshow && (
                          <p className="text-sm text-gray-600">
                            Playing: {editingTv.currentSlideshow.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditingTv(null)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Update TV
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Manage TV Devices ({tvDevices.length})
                      </h3>
                      <button
                        onClick={() => setShowAddTv(true)}
                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New TV
                      </button>
                    </div>

                    {tvDevices.length === 0 ? (
                      <div className="text-center py-8">
                        <Tv className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          No TV devices yet
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Add your first TV device to start managing displays
                        </p>
                        <button
                          onClick={() => setShowAddTv(true)}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First TV
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tvDevices.map((tv) => (
                          <div
                            key={tv.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {tv.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {tv.location}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTvStatusColor(
                                      tv.status
                                    )}`}
                                  >
                                    {getTvStatusIcon(tv.status)}
                                    <span className="ml-1 capitalize">
                                      {tv.status}
                                    </span>
                                  </span>
                                  {tv.currentSlideshow && (
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                      Playing: {tv.currentSlideshow.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditTv(tv)}
                                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Edit TV"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTv(tv.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete TV"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        <SuccessMessage
          message={successMessage}
          isVisible={showSuccessMessage}
          onClose={() => setShowSuccessMessage(false)}
          duration={5000}
        />
      </ClientLayout>
    </ProtectedRoute>
  );
}

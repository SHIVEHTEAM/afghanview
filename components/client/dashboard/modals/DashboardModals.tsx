import React, { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useSlideshowStore } from "../../../../stores/slideshowStore";
import { DeleteConfirmationModal } from "../../../common";
import { SimpleImageViewer } from "../../../slideshow";
import SlideshowCreator from "../../../slideshow-creator/SlideshowCreator";
import ImageSlideshowWizard from "../../../slideshow-creator/image/ImageSlideshowWizard";
import VideoSlideshowWizard from "../../../slideshow-creator/video/VideoSlideshowWizard";
import AiFactsSlideshowWizard from "../../../slideshow-creator/ai-facts/AiFactsSlideshowWizard";
import MenuSlideshowWizard from "../../../slideshow-creator/menu/MenuSlideshowWizard";
import DealsSlideshowWizard from "../../../slideshow-creator/deals/DealsSlideshowWizard";
import TextSlideshowWizard from "../../../slideshow-creator/text/TextSlideshowWizard";
import AiAllInOneWizard from "../../../slideshow-creator/ai-all-in-one/AiAllInOneWizard";
import { QuickMusicSetup } from "../../../slideshow-creator/shared";
import SuccessMessage from "../../../ui/SuccessMessage";
import { useToast } from "../../../ui/Toast";

interface DashboardModalsProps {
  businessId?: string;
  onSlideshowCreated?: () => void;
}

export function DashboardModals({
  businessId,
  onSlideshowCreated,
}: DashboardModalsProps) {
  // Get modal states from store
  const {
    showSlideshowCreator,
    showSlideshowWizard,
    showEditWizard,
    showViewer,
    showDeleteConfirmation,
    currentSlideshow,
    editingSlideshow,
    selectedSlideshowId,
    editWizardType,
    wizardType,
    setShowSlideshowCreator,
    setShowSlideshowWizard,
    setShowEditWizard,
    setShowViewer,
    setShowDeleteConfirmation,
    setCurrentSlideshow,
    setEditingSlideshow,
    setSelectedSlideshowId,
    setEditWizardType,
    setWizardType,
    createSlideshow,
    updateSlideshow,
    deleteSlideshow,
  } = useSlideshowStore();

  // Local state for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Local state for post-creation music setup
  const [showMusicSetup, setShowMusicSetup] = useState(false);
  const [newlyCreatedSlideshow, setNewlyCreatedSlideshow] = useState<any>(null);

  const { showError, showSuccess } = useToast();

  // Handle start slideshow creation
  const handleStartSlideshowCreation = (type: string) => {
    setWizardType(type);
    setShowSlideshowCreator(false);
    setShowSlideshowWizard(true);
  };

  // Handle wizard completion
  const handleWizardComplete = async (data: any) => {
    try {
      console.log("[Client] Wizard completed with data:", data);
      console.log("[Client] Business ID available:", businessId);

      if (!businessId) {
        showError("No business found. Please refresh the page and try again.");
        return;
      }

      let slideshowName = data.name || "New Slideshow";
      let mediaItems: any[] = [];
      let slideshowSettings: any = {
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

      // Handle different wizard types
      if (wizardType === "image") {
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
      } else if (wizardType === "video") {
        console.log("Processing video slideshow data:", data);
        if (!data.slides || !Array.isArray(data.slides)) {
          console.error("Video data is missing or invalid:", data);
          throw new Error("Video data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((video: any, index: number) => {
          console.log(`Processing video ${index}:`, video);
          return {
            id: video.id || `video-${Date.now()}-${index}`,
            file_path: video.file_path || video.url,
            name: video.name || `Video ${index + 1}`,
            type: "video",
          };
        });
        console.log("Processed mediaItems:", mediaItems);
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
      } else if (wizardType === "ai-facts") {
        console.log("Processing AI facts slideshow data:", data);
        if (!data.slides || !Array.isArray(data.slides)) {
          console.error("AI Facts data is missing or invalid:", data);
          throw new Error("AI Facts data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => {
          console.log(`Processing AI fact slide ${index}:`, slide);
          return {
            id: slide.id || `fact-${Date.now()}-${index}`,
            file_path: slide.file_path,
            name: slide.name || `Fact ${index + 1}`,
            type: "image",
          };
        });
        console.log("Processed AI facts mediaItems:", mediaItems);
        slideshowSettings = {
          defaultDuration: data.settings?.duration || 5000,
          duration: data.settings?.duration || 5000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic || "",
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
      } else if (wizardType === "menu") {
        console.log("Processing menu slideshow data:", data);
        if (!data.slides || !Array.isArray(data.slides)) {
          console.error("Menu slides data is missing or invalid:", data);
          throw new Error("Menu slides data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => {
          console.log(`Processing menu slide ${index}:`, slide);
          return {
            id: slide.id || `menu-${Date.now()}-${index}`,
            file_path: slide.file_path || slide.url,
            name: slide.name || `Menu Item ${index + 1}`,
            type: "image",
          };
        });
        console.log("Processed menu mediaItems:", mediaItems);
        slideshowSettings = {
          defaultDuration: data.settings?.duration || 4000,
          duration: data.settings?.duration || 4000,
          transition: data.settings?.transition || "slide",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic || "",
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
      } else if (wizardType === "deals") {
        console.log("Processing deals slideshow data:", data);
        if (!data.slides || !Array.isArray(data.slides)) {
          console.error("Deals data is missing or invalid:", data);
          throw new Error("Deals data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => {
          console.log(`Processing deal slide ${index}:`, slide);
          return {
            id: slide.id || `deal-${Date.now()}-${index}`,
            file_path: slide.file_path || slide.url,
            name: slide.name || `Deal ${index + 1}`,
            type: "image",
          };
        });
        console.log("Processed deals mediaItems:", mediaItems);
        slideshowSettings = {
          defaultDuration: data.settings?.duration || 5000,
          duration: data.settings?.duration || 5000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic || "",
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
      } else if (wizardType === "text") {
        console.log("Processing text slideshow data:", data);
        if (!data.slides || !Array.isArray(data.slides)) {
          console.error("Text slides data is missing or invalid:", data);
          throw new Error("Text slides data is missing or invalid");
        }
        mediaItems = (data.slides || []).map((slide: any, index: number) => {
          console.log(`Processing text slide ${index}:`, slide);
          return {
            id: slide.id || `text-${Date.now()}-${index}`,
            file_path: slide.file_path || slide.url,
            name: slide.name || `Text Slide ${index + 1}`,
            type: "image",
          };
        });
        console.log("Processed text mediaItems:", mediaItems);
        slideshowSettings = {
          defaultDuration: data.settings?.duration || 4000,
          duration: data.settings?.duration || 4000,
          transition: data.settings?.transition || "fade",
          transitionDuration: data.settings?.transitionDuration || 1000,
          backgroundMusic: data.settings?.backgroundMusic || "",
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
      }

      // Generate slug for public link
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

      const slug = generateSlug(slideshowName);

      // Save slideshow via API
      const requestBody = {
        name: slideshowName,
        description: `${wizardType} slideshow created with ${mediaItems.length} items`,
        business_id: businessId,
        content: { slides: data.slides },
        settings: slideshowSettings,
      };

      console.log("Sending request body to API:", requestBody);
      console.log("Data.slides content:", data.slides);

      const response = await fetch("/api/slideshows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
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

      // setSavedSlideshows(updatedSlideshows); // This line was removed from the original file
      setShowSlideshowWizard(false);

      // Show success message
      setSuccessMessage(`Slideshow "${slideshowName}" created successfully!`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Show music setup modal
      setNewlyCreatedSlideshow(newSlideshow);
      setShowMusicSetup(true);

      // Trigger refresh of slideshows list
      if (onSlideshowCreated) {
        setTimeout(() => {
          onSlideshowCreated();
        }, 100); // Small delay to ensure the slideshow is saved
      }

      console.log("✅ Slideshow created successfully");
    } catch (error) {
      console.error("Error creating slideshow:", error);
      showError(`Error creating slideshow: ${(error as any).message || error}`);
    }
  };

  // Handle edit wizard completion
  const handleEditWizardComplete = async (data: any) => {
    try {
      console.log("[Client] Edit wizard completed with data:", data);

      if (!editingSlideshow) {
        throw new Error("No slideshow being edited");
      }

      let slideshowName = data.name || editingSlideshow.name;
      let mediaItems: any[] = [];
      let slideshowSettings: any = {
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
      }

      // Update the slideshow via API
      const response = await fetch(`/api/slideshows/${editingSlideshow.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: slideshowName,
          slides: mediaItems,
          settings: slideshowSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update slideshow: ${response.statusText}`);
      }

      const updatedSlideshow = await response.json();

      // Update local state
      // const updatedSlideshows = savedSlideshows.map((s: any) =>
      //   s.id === editingSlideshow.id ? updatedSlideshow : s
      // ); // This line was removed from the original file
      // setSavedSlideshows(updatedSlideshows); // This line was removed from the original file

      // Reset edit mode
      setEditingSlideshow(null);
      setShowEditWizard(false);
      setEditWizardType("");

      // Show success message
      setSuccessMessage("Slideshow updated successfully!");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      console.log("✅ Slideshow updated successfully");
    } catch (error) {
      console.error("Error updating slideshow:", error);
      showError(`Error updating slideshow: ${(error as any).message || error}`);
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!selectedSlideshowId) return;

    try {
      const response = await fetch(`/api/slideshows/${selectedSlideshowId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // const updatedSlideshows = savedSlideshows.filter( // This line was removed from the original file
        //   (slideshow: any) => slideshow.id !== selectedSlideshowId
        // ); // This line was removed from the original file
        // setSavedSlideshows(updatedSlideshows); // This line was removed from the original file
        showSuccess("Slideshow deleted successfully!");
      } else {
        console.error("Failed to delete slideshow");
        showError("Failed to delete slideshow");
      }
    } catch (error) {
      console.error("Error deleting slideshow:", error);
      showError("Error deleting slideshow");
    }

    setShowDeleteConfirmation(false);
    setSelectedSlideshowId(null);
  };

  // Handle play slideshow
  const handlePlaySlideshow = (slideshow: any) => {
    setCurrentSlideshow(slideshow);
    setShowViewer(true);
  };

  // Handle edit slideshow
  const handleEditSlideshow = (slideshow: any) => {
    console.log("🔄 Starting edit for slideshow:", slideshow.name);

    // Determine slideshow type
    let slideshowType = slideshow.slideshowType;
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
        slideshowType = "image";
      }
    }

    setEditingSlideshow(slideshow);
    setEditWizardType(slideshowType);
    setShowEditWizard(true);
  };

  // Handle delete slideshow
  const handleDeleteSlideshow = (id: string) => {
    setSelectedSlideshowId(id);
    setShowDeleteConfirmation(true);
  };

  return (
    <>
      {/* Slideshow Creator Modal */}
      {showSlideshowCreator && (
        <SlideshowCreator
          onClose={() => setShowSlideshowCreator(false)}
          onStartCreation={handleStartSlideshowCreation}
        />
      )}

      {/* Slideshow Wizard Modal */}
      {showSlideshowWizard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-3xl max-w-7xl w-full h-[90vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
          >
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-8 relative overflow-hidden flex-shrink-0">
              {/* Enhanced Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12 animate-pulse delay-1000"></div>
                <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10 animate-pulse delay-500"></div>
              </div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20">
                    <h2 className="text-2xl font-bold capitalize">
                      {wizardType.replace("-", " ")} Slideshow
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowSlideshowWizard(false)}
                  className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-white/90 text-lg font-medium relative z-10">
                Create your {wizardType.replace("-", " ")} slideshow step by
                step
              </p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
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
          </motion.div>
        </div>
      )}

      {/* Edit Wizard Modal */}
      {showEditWizard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
          >
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 text-white p-8 relative overflow-hidden flex-shrink-0">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
                <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10"></div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <h2 className="text-2xl font-bold capitalize">
                      Edit {editWizardType.replace("-", " ")} Slideshow
                    </h2>
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                    {editingSlideshow?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowEditWizard(false);
                    setEditingSlideshow(null);
                    setEditWizardType("");
                  }}
                  className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-white/80 text-lg">
                Update your {editWizardType.replace("-", " ")} slideshow
              </p>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {editWizardType === "image" && editingSlideshow && (
                <ImageSlideshowWizard
                  step={0}
                  formData={{
                    name: editingSlideshow.name,
                    images: editingSlideshow.images || [],
                    settings: editingSlideshow.settings || {},
                  }}
                  updateFormData={() => {}}
                  onComplete={handleEditWizardComplete}
                  isEditing={true}
                  initialData={{
                    name: editingSlideshow.name,
                    images: editingSlideshow.images || [],
                    settings: editingSlideshow.settings || {},
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}

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
                images={currentSlideshow.images || []}
                settings={{
                  duration: currentSlideshow.settings?.defaultDuration || 5000,
                  transition: currentSlideshow.settings?.transition || "fade",
                  autoPlay: currentSlideshow.settings?.autoPlay || true,
                  showControls: true,
                  tvMode: false,
                  // Add music settings from the new multi-track system
                  backgroundMusic: currentSlideshow.settings?.music_playlist_id
                    ? `playlist:${currentSlideshow.settings.music_playlist_id}`
                    : currentSlideshow.settings?.background_music ||
                      (typeof currentSlideshow.settings?.backgroundMusic ===
                      "string"
                        ? currentSlideshow.settings.backgroundMusic
                        : undefined),
                  musicVolume:
                    currentSlideshow.settings?.music_volume ||
                    currentSlideshow.settings?.musicVolume ||
                    50,
                  musicLoop:
                    currentSlideshow.settings?.music_loop ??
                    currentSlideshow.settings?.musicLoop ??
                    true,
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

      {/* Success Message */}
      <SuccessMessage
        message={successMessage}
        isVisible={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
        duration={5000}
      />

      {/* Post-Creation Music Setup */}
      {showMusicSetup && newlyCreatedSlideshow && (
        <QuickMusicSetup
          slideshowId={newlyCreatedSlideshow.id}
          slideshowName={
            newlyCreatedSlideshow.name || newlyCreatedSlideshow.title
          }
          onClose={() => {
            setShowMusicSetup(false);
            setNewlyCreatedSlideshow(null);
          }}
          onMusicAdded={() => {
            showSuccess("Music added to slideshow successfully!");
            // Refresh slideshows list to show updated music settings
            if (onSlideshowCreated) {
              onSlideshowCreated();
            }
          }}
        />
      )}

      {/* Add TV Modal - Keep placeholder for now */}
      {/* This modal was removed from the original file's state management, so it's removed here. */}
      {/* If it's still needed, it should be re-added to the state management. */}
      {/* For now, it's removed as per the original file's state management. */}
    </>
  );
}

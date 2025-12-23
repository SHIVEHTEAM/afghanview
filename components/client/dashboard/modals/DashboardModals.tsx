import React, { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../../../lib/supabase";
import { useSlideshowStore } from "../../../../stores/slideshowStore";
import { DeleteConfirmationModal } from "../../../common";
import { SimpleImageViewer, SlideshowPlayer } from "../../../slideshow";
import SlideshowCreator from "../../../slideshow-creator/SlideshowCreator";
import ImageSlideshowWizard from "../../../slideshow-creator/image/ImageSlideshowWizard";
import VideoSlideshowWizard from "../../../slideshow-creator/video/VideoSlideshowWizard";
import AiFactsSlideshowWizard from "../../../slideshow-creator/ai-facts/AiFactsSlideshowWizard";
import MenuSlideshowWizard from "../../../slideshow-creator/menu/MenuSlideshowWizard";
import DealsSlideshowWizard from "../../../slideshow-creator/deals/DealsSlideshowWizard";
import TextSlideshowWizard from "../../../slideshow-creator/text/TextSlideshowWizard";
import AiAllInOneWizard from "../../../slideshow-creator/ai-all-in-one/AiAllInOneWizard";
import { PropertyListingSlideshowWizard } from "../../../slideshow-creator/property-listing";
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
      } else if (wizardType === "property-listing") {
        console.log("Processing property slideshow data:", data);
        if (!data.slides || !Array.isArray(data.slides)) {
          throw new Error("Property slides data is missing");
        }
        mediaItems = data.slides;
        slideshowSettings = {
          defaultDuration: data.settings?.duration || 6000,
          duration: data.settings?.duration || 6000,
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

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch("/api/slideshows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
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
      } else if (editWizardType === "property-listing") {
        console.log("Processing property slideshow edit data:", data);
        mediaItems = data.slides || [];
        slideshowSettings = {
          defaultDuration: data.settings?.duration || 6000,
          duration: data.settings?.duration || 6000,
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

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Update the slideshow via API
      const response = await fetch(`/api/slideshows/${editingSlideshow.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          name: slideshowName,
          content: {
            slides: mediaItems,
            properties: data.properties,
            theme: data.theme,
            layout: data.layout,
            type: editWizardType
          },
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
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch(`/api/slideshows/${selectedSlideshowId}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
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
            className="bg-white rounded-[2.5rem] max-w-7xl w-full h-[90vh] overflow-hidden shadow-2xl shadow-black/10 border border-black/5 flex flex-col"
          >
            <div className="bg-white px-10 py-8 relative overflow-hidden flex-shrink-0 border-b border-black/5">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-bold capitalize tracking-tight text-black leading-tight">
                    {wizardType.replace("-", " ")} Creator
                  </h2>
                  <p className="text-black/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                    Template Configuration
                  </p>
                </div>
                <button
                  onClick={() => setShowSlideshowWizard(false)}
                  className="p-3 text-black/20 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>


            </div>

            <div className="flex-1 flex flex-col min-h-0">
              {wizardType === "image" && (
                <ImageSlideshowWizard
                  step={0}
                  formData={{}}
                  updateFormData={() => { }}
                  onComplete={handleWizardComplete}
                />
              )}
              {wizardType === "video" && (
                <VideoSlideshowWizard
                  step={0}
                  formData={{}}
                  updateFormData={() => { }}
                  onComplete={handleWizardComplete}
                />
              )}
              {wizardType === "ai-facts" && (
                <AiFactsSlideshowWizard
                  step={0}
                  formData={{}}
                  updateFormData={() => { }}
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
                  updateFormData={() => { }}
                  onComplete={handleWizardComplete}
                />
              )}
              {wizardType === "deals" && (
                <DealsSlideshowWizard
                  step={0}
                  formData={{}}
                  updateFormData={() => { }}
                  onComplete={handleWizardComplete}
                />
              )}
              {wizardType === "text" && (
                <TextSlideshowWizard
                  step={0}
                  formData={{}}
                  updateFormData={() => { }}
                  onComplete={handleWizardComplete}
                />
              )}
              {wizardType === "property-listing" && (
                <PropertyListingSlideshowWizard
                  step={0}
                  formData={{}}
                  updateFormData={() => { }}
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
            className="bg-white rounded-[2.5rem] max-w-7xl w-full h-[90vh] overflow-hidden shadow-2xl shadow-black/10 border border-black/5 flex flex-col"
          >
            <div className="bg-white px-10 py-8 relative overflow-hidden flex-shrink-0 border-b border-black/5">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-bold capitalize tracking-tight text-black leading-tight">
                    Edit {editWizardType.replace("-", " ")}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-black/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                      Editing Module
                    </p>
                    <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest border-l border-black/10 pl-3">
                      {editingSlideshow?.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditWizard(false);
                    setEditingSlideshow(null);
                    setEditWizardType("");
                  }}
                  className="p-3 text-black/20 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>


            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {editWizardType === "image" && editingSlideshow && (
                <ImageSlideshowWizard
                  step={0}
                  formData={{
                    name: editingSlideshow.name,
                    images: editingSlideshow.images || [],
                    settings: editingSlideshow.settings || {},
                  }}
                  updateFormData={() => { }}
                  onComplete={handleEditWizardComplete}
                  isEditing={true}
                  initialData={{
                    name: editingSlideshow.name,
                    images: editingSlideshow.images || [],
                    settings: editingSlideshow.settings || {},
                  }}
                />
              )}
              {editWizardType === "property-listing" && editingSlideshow && (
                <PropertyListingSlideshowWizard
                  step={0}
                  isEditing={true}
                  initialData={{
                    name: editingSlideshow.name,
                    settings: editingSlideshow.settings,
                    properties: editingSlideshow.content?.properties ||
                      (editingSlideshow.content?.slides || []).map((s: any) => s.content?.property).filter(Boolean) ||
                      [], // Fallback: reconstruct from slides
                    theme: editingSlideshow.content?.theme,
                    layout: editingSlideshow.content?.layout,
                  }}
                  formData={{
                    name: editingSlideshow.name,
                    settings: editingSlideshow.settings,
                    properties: editingSlideshow.content?.properties ||
                      (editingSlideshow.content?.slides || []).map((s: any) => s.content?.property).filter(Boolean) ||
                      [],
                  }}
                  updateFormData={() => { }}
                  onComplete={handleEditWizardComplete}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Slideshow Viewer Modal */}
      {showViewer && currentSlideshow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[3rem] max-w-5xl w-full overflow-hidden shadow-2xl shadow-black/20 border border-black/5"
          >
            <div className="px-10 py-8 border-b border-black/5 flex justify-between items-center bg-white">
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold tracking-tight text-black uppercase">
                  Preview Terminal
                </h3>
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1">
                  Active Feed // {currentSlideshow.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowViewer(false);
                    setCurrentSlideshow(null);
                  }}
                  className="p-3 text-black/20 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-300"
                  title="Terminate Session"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <div className="p-8">
              <div className="aspect-video rounded-[2rem] overflow-hidden bg-black border border-black/10 shadow-inner group relative">
                <SlideshowPlayer
                  slideshow={{
                    id: currentSlideshow.id,
                    name: currentSlideshow.name || "Untitled Slideshow",
                    images:
                      currentSlideshow.content?.slides &&
                        Array.isArray(currentSlideshow.content.slides) &&
                        currentSlideshow.content.slides.length > 0
                        ? currentSlideshow.content.slides
                        : currentSlideshow.images || [],
                    settings: currentSlideshow.settings as any,
                  }}
                  autoPlay={currentSlideshow.settings?.autoPlay ?? true}
                  showControls={true}
                />
              </div>
            </div>

            <div className="px-10 py-8 bg-gray-50/50 border-t border-black/5 flex justify-end items-center gap-4">
              <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest mr-auto">
                Signal status: optimal
              </span>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowViewer(false);
                  setCurrentSlideshow(null);
                }}
                className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all shadow-lg shadow-black/10"
              >
                Close Terminal
              </motion.button>
            </div>
          </motion.div>
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

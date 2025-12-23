import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { BusinessType } from "@/types/business";

export interface Slideshow {
  id: string;
  title: string; // Changed from name to title
  name?: string; // Add name for compatibility
  description?: string;
  business_id: string;
  business_type: BusinessType;
  is_active: boolean;
  is_favorite?: boolean;
  play_count?: number;
  last_played?: string;
  slug?: string;
  settings?: {
    duration?: number;
    transition?: string;
    background_music?: string;
    [key: string]: any;
  };
  content?: {
    slides?: any[];
    images?: any[];
    isTemplate?: boolean;
    [key: string]: any;
  };
  images?: any[]; // Add images for compatibility
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

interface SlideshowStore {
  slideshows: Slideshow[];
  loading: boolean;
  error: string | null;
  showSlideshowCreator: boolean;
  showSlideshowWizard: boolean;
  currentSlideshow: Slideshow | null;
  showViewer: boolean;
  editingSlideshow: Slideshow | null;
  showEditWizard: boolean;
  editWizardType: string;
  wizardType: string;
  selectedSlideshowId: string | null;
  showDeleteConfirmation: boolean;
  fetchSlideshows: (businessId: string) => Promise<void>;
  createSlideshow: (slideshow: Partial<Slideshow>) => Promise<Slideshow | null>;
  updateSlideshow: (id: string, updates: Partial<Slideshow>) => Promise<void>;
  deleteSlideshow: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setShowSlideshowCreator: (show: boolean) => void;
  setShowSlideshowWizard: (show: boolean) => void;
  setWizardType: (type: string) => void;
  handlePlaySlideshow: (slideshow: any) => void;
  handleEditSlideshow: (slideshow: any) => void;
  handleDeleteSlideshow: (id: string) => void;
  setCurrentSlideshow: (slideshow: Slideshow | null) => void;
  setShowViewer: (show: boolean) => void;
  setEditingSlideshow: (slideshow: Slideshow | null) => void;
  setShowEditWizard: (show: boolean) => void;
  setEditWizardType: (type: string) => void;
  setSelectedSlideshowId: (id: string | null) => void;
  setShowDeleteConfirmation: (show: boolean) => void;
}

export const useSlideshowStore = create<SlideshowStore>((set, get) => ({
  slideshows: [],
  loading: false,
  error: null,
  showSlideshowCreator: false,
  showSlideshowWizard: false,
  currentSlideshow: null,
  showViewer: false,
  editingSlideshow: null,
  showEditWizard: false,
  editWizardType: "",
  wizardType: "",
  selectedSlideshowId: null,
  showDeleteConfirmation: false,

  fetchSlideshows: async (businessId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("slideshows")
        .select("*")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ slideshows: data || [], loading: false });
    } catch (error) {
      console.error("Error fetching slideshows:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch slideshows",
        loading: false,
      });
    }
  },

  createSlideshow: async (slideshow: Partial<Slideshow>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("slideshows")
        .insert({
          title: slideshow.title, // Use title instead of name
          description: slideshow.description,
          business_id: slideshow.business_id,
          business_type: slideshow.business_type,
          is_active: true,
          settings: slideshow.settings || {},
          content: slideshow.content || {},
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        slideshows: [data, ...state.slideshows],
        loading: false,
      }));

      return data;
    } catch (error) {
      console.error("Error creating slideshow:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to create slideshow",
        loading: false,
      });
      return null;
    }
  },

  updateSlideshow: async (id: string, updates: Partial<Slideshow>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("slideshows")
        .update({
          title: updates.title, // Use title instead of name
          description: updates.description,
          settings: updates.settings,
          content: updates.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        slideshows: state.slideshows.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Error updating slideshow:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update slideshow",
        loading: false,
      });
    }
  },

  deleteSlideshow: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("slideshows")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        slideshows: state.slideshows.filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error("Error deleting slideshow:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete slideshow",
        loading: false,
      });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  setShowSlideshowCreator: (show: boolean) =>
    set({ showSlideshowCreator: show }),
  setShowSlideshowWizard: (show: boolean) => set({ showSlideshowWizard: show }),
  setWizardType: (type: string) => set({ wizardType: type }),

  // Handler functions
  handlePlaySlideshow: (slideshow: any) => {
    // Navigate to the preview page instead of opening a modal
    if (typeof window !== "undefined") {
      window.open(`/slideshow/preview/${slideshow.id}`, "_blank");
    }
  },

  handleEditSlideshow: (slideshow: any) => {
    // Determine slideshow type
    let slideshowType = slideshow.slideshowType;
    if (!slideshowType) {
      // Check if it's a video slideshow by checking the slides
      const hasVideoSlides = slideshow.content?.slides?.some((s: any) => s.type === "video") ||
        slideshow.images?.some((s: any) => s.type === "video");

      if (hasVideoSlides || slideshow.title?.toLowerCase().includes("video") || slideshow.mediaType === "video") {
        slideshowType = "video";
      } else if (
        slideshow.title?.toLowerCase().includes("ai") ||
        slideshow.title?.toLowerCase().includes("fact")
      ) {
        slideshowType = "ai-facts";
      } else if (slideshow.title?.toLowerCase().includes("menu")) {
        slideshowType = "menu";
      } else if (slideshow.title?.toLowerCase().includes("deal")) {
        slideshowType = "deals";
      } else if (slideshow.title?.toLowerCase().includes("text")) {
        slideshowType = "text";
      } else if (
        slideshow.content?.type === "property-listing" ||
        slideshow.type === "property-listing" ||
        slideshow.content?.slides?.some((s: any) => s.type === "property-listing")
      ) {
        slideshowType = "property-listing";
      } else {
        slideshowType = "image";
      }
    }

    set({
      editingSlideshow: slideshow,
      editWizardType: slideshowType,
      showEditWizard: true,
    });
  },

  handleDeleteSlideshow: (id: string) => {
    set({ selectedSlideshowId: id, showDeleteConfirmation: true });
  },

  // State setters
  setCurrentSlideshow: (slideshow: Slideshow | null) =>
    set({ currentSlideshow: slideshow }),
  setShowViewer: (show: boolean) => set({ showViewer: show }),
  setEditingSlideshow: (slideshow: Slideshow | null) =>
    set({ editingSlideshow: slideshow }),
  setShowEditWizard: (show: boolean) => set({ showEditWizard: show }),
  setEditWizardType: (type: string) => set({ editWizardType: type }),
  setSelectedSlideshowId: (id: string | null) =>
    set({ selectedSlideshowId: id }),
  setShowDeleteConfirmation: (show: boolean) =>
    set({ showDeleteConfirmation: show }),
}));

// Helper function to get slideshow type based on content
export const getSlideshowType = (slideshow: Slideshow): string => {
  if (slideshow.content?.isTemplate) {
    return "template";
  }

  // Check content for AI facts
  if (
    slideshow.title.toLowerCase().includes("ai") ||
    slideshow.title.toLowerCase().includes("fact")
  ) {
    return "ai-facts";
  } else if (slideshow.title.toLowerCase().includes("menu")) {
    return "menu";
  } else if (slideshow.title.toLowerCase().includes("deal")) {
    return "deals";
  } else if (slideshow.title.toLowerCase().includes("text")) {
    return "text";
  }

  // Check content structure
  if (slideshow.content?.slides) {
    const firstSlide = slideshow.content.slides[0];
    if (firstSlide?.type === "image") return "image";
    if (firstSlide?.type === "video") return "video";
    if (firstSlide?.type === "text") return "text";
  }

  return "image"; // Default
};

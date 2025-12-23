import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Image,
  Play,
  Edit,
  Trash2,
  QrCode,
  Music,
  Calendar,
  Sparkles,
  Heart,
  Link,
} from "lucide-react";
import QRCode from "react-qr-code";
import { useSlideshowStore } from "../../../../stores/slideshowStore";
import { useAuth } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
import { BusinessType, canDeleteSlideshows } from "../../../../types/business";
import SuccessMessage from "../../../ui/SuccessMessage";
import ErrorMessage from "../../../ui/ErrorMessage";
import { MenuSVGGenerator } from "../../../slideshow-creator/menu/svg-generator";
import MultiTrackMusicSelector from "../../../slideshow-creator/shared/MultiTrackMusicSelector";
import DeleteConfirmationModal from "../../../common/DeleteConfirmationModal";

interface Slideshow {
  id: string;
  title: string;
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
  background_music?: string;
  backgroundMusic?: string;
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
    handleEditSlideshow,
  } = useSlideshowStore();

  const convertToSavedSlideshow = (slideshow: Slideshow) => {
    const processedSlides = (slideshow.content?.slides || []).map((slide: any) => {
      if (slide.type === "menu" && slide.menuData) {
        const svgDataUrl = MenuSVGGenerator.generateMenuSlide(
          slide.menuData.item,
          slide.menuData.theme,
          slide.menuData.layout
        );
        return { ...slide, url: svgDataUrl, file_path: svgDataUrl, type: "image" };
      }
      return slide;
    });

    return {
      ...slideshow,
      name: slideshow.title,
      createdAt: new Date(slideshow.created_at),
      isActive: slideshow.is_active,
      playCount: slideshow.play_count || 0,
      images: processedSlides || slideshow.content?.images || slideshow.images || [],
    };
  };

  const [slideshows, setSlideshows] = useState<Slideshow[]>(propSlideshows || []);
  const [loading, setLoading] = useState(!propSlideshows);
  const [business, setBusiness] = useState<any>(propBusiness);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showQrCode, setShowQrCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [selectedSlideshowForMusic, setSelectedSlideshowForMusic] = useState<Slideshow | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slideshowToDelete, setSlideshowToDelete] = useState<Slideshow | null>(null);

  useEffect(() => {
    if (propSlideshows) {
      setSlideshows(propSlideshows);
      setLoading(false);
    }
    if (propBusiness) setBusiness(propBusiness);
  }, [propSlideshows, propBusiness]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || propSlideshows) return;
      try {
        setLoading(true);
        const { data: staffMember } = await supabase
          .from("business_staff")
          .select("business:businesses(id, name, slug, business_type, created_at), role, business_type")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        let businessId: string | null = null;
        if (staffMember?.business) {
          const b = Array.isArray(staffMember.business) ? staffMember.business[0] : staffMember.business;
          businessId = b.id;
          setBusiness(b);
          setUserRole({ role: staffMember.role, business_type: staffMember.business_type });
        } else {
          const { data: userBusiness } = await supabase
            .from("businesses")
            .select("id, name, slug, type, created_at")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .single();
          if (userBusiness) {
            businessId = userBusiness.id;
            setBusiness(userBusiness);
            setUserRole({ role: "owner", business_type: userBusiness.type });
          }
        }

        if (businessId) {
          const { data: slideshowData } = await supabase
            .from("slideshows")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false });
          setSlideshows(slideshowData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id, propSlideshows]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage("Link copied!");
      setShowSuccessMessage(true);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const toggleFavorite = async (slideshow: Slideshow) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/slideshows/${slideshow.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ is_favorite: !slideshow.is_favorite }),
      });
      if (response.ok) {
        setSlideshows(slideshows.map((s) => s.id === slideshow.id ? { ...s, is_favorite: !s.is_favorite } : s));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const generateQrCode = (slideshow: Slideshow) => {
    setShowQrCode(`${window.location.origin}/slideshow/${slideshow.id}`);
  };

  const getSlideshowType = (slideshow: Slideshow) => {
    if (slideshow.content?.slides?.some((s: any) => s.type === "video")) return "video";
    if (slideshow.content?.slides?.some((s: any) => s.type === "menu")) return "menu";
    return "image";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
        <p className="mt-6 text-sm font-medium text-black/40">Loading your modules...</p>
      </div>
    );
  }

  if (slideshows.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border border-black/5">
        <div className="max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-2">Create your first module</h3>
          <p className="text-sm text-black/50 mb-8">Get started by creating a slideshow or a digital menu.</p>
          <button
            onClick={() => setShowSlideshowCreator(true)}
            className="bg-black text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-black/90 flex items-center justify-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" /> Create Module
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-black">Active Modules</h2>
          <p className="text-sm text-black/40">{slideshows.length} modules available</p>
        </div>
        <button
          onClick={() => setShowSlideshowCreator(true)}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-black/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slideshows.map((slideshow) => (
          <div key={slideshow.id} className="bg-white border border-black/5 shadow-sm transition-all rounded-2xl overflow-hidden group flex flex-col">
            <div className="relative w-full h-48 sm:h-64 overflow-hidden flex items-center justify-center bg-gray-50 border-b border-black/5">
              <span className="absolute top-4 left-4 z-10 px-2 py-1 text-[9px] font-bold tracking-widest bg-black text-white rounded-md shadow-lg uppercase">
                {getSlideshowType(slideshow)}
              </span>
              {(() => {
                const firstSlide = slideshow.content?.slides?.[0];
                const isVideo = getSlideshowType(slideshow) === "video";

                if (isVideo && firstSlide) {
                  // For video slideshows, show thumbnail if available, otherwise show video preview
                  if (firstSlide.thumbnail) {
                    return (
                      <div className="relative w-full h-full">
                        <img
                          src={firstSlide.thumbnail}
                          alt={slideshow.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                            <Play className="w-8 h-8 text-black ml-1" />
                          </div>
                        </div>
                      </div>
                    );
                  } else if (firstSlide.url || firstSlide.file_path) {
                    // Show video preview
                    return (
                      <div className="relative w-full h-full">
                        <video
                          src={firstSlide.url || firstSlide.file_path}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                            <Play className="w-8 h-8 text-black ml-1" />
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Fallback to play icon
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Play className="w-8 h-8 text-black/20" />
                      </div>
                    );
                  }
                } else if (firstSlide?.type === "menu" && firstSlide.menuData) {
                  return (
                    <img
                      src={MenuSVGGenerator.generateMenuSlide(firstSlide.menuData.item, firstSlide.menuData.theme, firstSlide.menuData.layout)}
                      alt={slideshow.title}
                      className="w-full h-full object-cover"
                    />
                  );
                } else {
                  return (
                    <img
                      src={firstSlide?.thumbnail || firstSlide?.file_path || firstSlide?.url || "/no-image.png"}
                      alt={slideshow.title}
                      className="w-full h-full object-cover"
                    />
                  );
                }
              })()}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(slideshow); }}
                className={`absolute top-4 right-4 z-10 p-2 rounded-lg transition-all shadow-md ${slideshow.is_favorite ? "bg-black text-white" : "bg-white/80 text-black/20 hover:text-black hover:bg-white"}`}
              >
                <Heart className={`w-4 h-4 ${slideshow.is_favorite ? "fill-current" : ""}`} />
              </button>
            </div>
            <div className="p-6 flex-1 flex flex-col bg-white">
              <h3 className="text-lg font-bold text-black truncate mb-6">{slideshow.title}</h3>
              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => window.open(`/slideshow/${slideshow.id}`, "_blank")}
                  className="flex-1 bg-black text-white py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-black/90"
                >
                  <Play className="w-3 h-3 fill-current" /> Preview
                </button>
                <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg">
                  <button onClick={() => handleEditSlideshow(convertToSavedSlideshow(slideshow))} className="p-2 text-black/40 hover:text-black transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => generateQrCode(slideshow)} className="p-2 text-black/40 hover:text-black transition-all">
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setSlideshowToDelete(slideshow); setShowDeleteModal(true); }} className="p-2 text-black/40 hover:text-black transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showQrCode && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowQrCode(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-black/5" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4"><QrCode className="w-6 h-6 text-white" /></div>
                <h3 className="text-xl font-bold text-black mb-1">Share module</h3>
                <p className="text-sm text-black/40 mb-8">Scan this code to view on TV</p>
                <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-black/5 flex justify-center">
                  <div className="bg-white p-3 rounded-xl border border-black/5">
                    <QRCode value={showQrCode || ""} size={160} level="H" fgColor="#000000" bgColor="#ffffff" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => copyToClipboard(showQrCode || "")} className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold text-xs"><Link className="w-3.5 h-3.5" /> Copy</button>
                  <button onClick={() => setShowQrCode(null)} className="flex items-center justify-center gap-2 bg-gray-50 text-black py-3 rounded-xl font-bold text-xs border border-black/5">Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SuccessMessage message={successMessage} isVisible={showSuccessMessage} onClose={() => setShowSuccessMessage(false)} duration={3000} />
      {showErrorMessage && (
        <div className="fixed top-4 left-4 z-50 max-w-sm"><ErrorMessage message={errorMessage} onClose={() => setShowErrorMessage(false)} type="error" /></div>
      )}

      {showMusicModal && selectedSlideshowForMusic && (
        <MultiTrackMusicSelector
          isOpen={showMusicModal}
          onClose={() => { setShowMusicModal(false); setSelectedSlideshowForMusic(null); }}
          onMusicSelected={(settings) => {
            const updateSlideshowMusic = async () => {
              try {
                const { error } = await supabase.from("slideshows").update({ settings: { ...selectedSlideshowForMusic.settings, ...settings } }).eq("id", selectedSlideshowForMusic.id);
                if (error) throw error;
                setShowMusicModal(false);
                setSelectedSlideshowForMusic(null);
                onRefresh?.();
              } catch (error) { console.error("Error updating music:", error); }
            };
            updateSlideshowMusic();
          }}
          currentSettings={selectedSlideshowForMusic.settings}
          title="Choose Music"
          description="Select tracks for your slideshow"
        />
      )}

      {showDeleteModal && slideshowToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              const response = await fetch(`/api/slideshows/${slideshowToDelete.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}) },
              });
              if (!response.ok) throw new Error("Delete failed");
              setShowDeleteModal(false);
              setSlideshowToDelete(null);
              onRefresh?.();
            } catch (err) { setErrorMessage("Failed to delete slideshow"); setShowErrorMessage(true); setShowDeleteModal(false); }
          }}
          itemName={slideshowToDelete.title}
          title="Delete Slideshow"
          message="Are you sure you want to delete this module? This action cannot be undone."
          type="slideshow"
        />
      )}
    </div>
  );
}

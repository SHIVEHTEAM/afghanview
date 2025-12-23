import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Sparkles,
  Image,
  Video,
  FileText,
  Menu,
  Tag,
  Zap,
  Home,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  BusinessType,
  getAllowedSlideshowTypes,
} from "@/types/business";

interface SlideshowCreatorProps {
  onClose: () => void;
  onStartCreation: (type: string) => void;
}

const slideshowTypes = [
  { id: "image", name: "Image Slideshow", description: "Create beautiful displays with high-resolution imagery", icon: Image, available: true },
  { id: "video", name: "Video Slideshow", description: "Engage your audience with dynamic cinematic content", icon: Video, available: true },
  { id: "text", name: "Text Slideshow", description: "Deliver clean, informative messages and announcements", icon: FileText, available: true },
  { id: "menu", name: "Menu Display", description: "Professional digital menu boards for your restaurant", icon: Menu, available: true },
  { id: "deals", name: "Promotions", description: "Highlight special offers and time-limited deals", icon: Tag, available: true },
  { id: "ai-facts", name: "AI Insights", description: "Generate automated interesting content with AI", icon: Sparkles, available: true },
  { id: "ai-all-in-one", name: "AI Autopilot", description: "Complete automated content creation from scratch", icon: Zap, available: true },
  { id: "property-listing", name: "Real Estate", description: "Showcase premium property listings and details", icon: Home, available: true },
];

export default function SlideshowCreator({
  onClose,
  onStartCreation,
}: SlideshowCreatorProps) {
  const { user } = useAuth();
  const [userBusinessType, setUserBusinessType] = useState<BusinessType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessType = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        const { data: staffMember } = await supabase.from("business_staff").select(`business:businesses!inner(id, type)`).eq("user_id", user.id).eq("is_active", true).single();
        if (staffMember?.business) {
          const b = Array.isArray(staffMember.business) ? staffMember.business[0] : staffMember.business;
          setUserBusinessType(b.type as BusinessType);
        } else {
          const { data: userBusiness } = await supabase.from("businesses").select("type").eq("user_id", user.id).eq("is_active", true).single();
          setUserBusinessType(userBusiness ? userBusiness.type as BusinessType : BusinessType.RESTAURANT);
        }
      } catch (error) { setUserBusinessType(BusinessType.RESTAURANT); }
      finally { setLoading(false); }
    };
    fetchBusinessType();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[500]">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-black/40">Initializing creator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[500] p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-black/5 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-10 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Create New Module</h2>
            <p className="text-sm text-black/40">Select a template type to begin building your content</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-black/20 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slideshowTypes
              .filter(type => {
                if (!userBusinessType) return true;
                if (type.id === "image" || type.id === "video") return true;
                const allowed = getAllowedSlideshowTypes(userBusinessType);
                return allowed.includes(type.id);
              })
              .map((type, index) => (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartCreation(type.id)}
                  className="p-8 rounded-2xl border border-black/5 text-left bg-white transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300 border border-black/5">
                      <type.icon className="w-6 h-6 text-black/20 group-hover:text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-black text-lg mb-2 group-hover:text-black transition-colors">{type.name}</h3>
                  <p className="text-sm text-black/40 leading-relaxed group-hover:text-black/60 transition-colors">{type.description}</p>

                  <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/20 group-hover:text-black transition-all">
                    <span>Create Module</span>
                    <ChevronRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              ))}
          </div>
        </div>

        <div className="p-10 pt-0 flex justify-end">
          <div className="flex items-center gap-2 text-[10px] font-bold text-black/10 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-black/10"></div>
            <span>System Ready for Deployment</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

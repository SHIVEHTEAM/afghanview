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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { BusinessType } from "@/types/business";

interface SlideshowCreatorProps {
  onClose: () => void;
  onStartCreation: (type: string) => void;
}

const slideshowTypes = [
  {
    id: "image",
    name: "Image Slideshow",
    description: "Create beautiful slideshows with your images",
    icon: Image,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-100 to-cyan-100",
    available: true,
  },
  {
    id: "video",
    name: "Video Slideshow",
    description: "Create dynamic slideshows with videos",
    icon: Video,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-100 to-pink-100",
    available: true,
  },
  {
    id: "text",
    name: "Text Slideshow",
    description: "Create informative text-based slideshows",
    icon: FileText,
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-100 to-emerald-100",
    available: true,
  },
  {
    id: "menu",
    name: "Menu Slideshow",
    description: "Create professional menu displays",
    icon: Menu,
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-100 to-red-100",
    available: true,
  },
  {
    id: "deals",
    name: "Deals & Promotions",
    description: "Create promotional content and special offers",
    icon: Tag,
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-100 to-orange-100",
    available: true,
  },
  {
    id: "ai-facts",
    name: "AI Facts",
    description: "Generate interesting facts with AI",
    icon: Sparkles,
    color: "from-indigo-500 to-purple-500",
    bgColor: "from-indigo-100 to-purple-100",
    available: true,
  },
  {
    id: "ai-all-in-one",
    name: "AI All-in-One",
    description: "Let AI create everything for you",
    icon: Zap,
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-100 to-rose-100",
    available: true,
  },
];

export default function SlideshowCreator({
  onClose,
  onStartCreation,
}: SlideshowCreatorProps) {
  const { user } = useAuth();
  const [userBusinessType, setUserBusinessType] = useState<BusinessType | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Fetch user's business type
  useEffect(() => {
    const fetchBusinessType = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get user's business type
        const { data: staffMember } = await supabase
          .from("business_staff")
          .select(
            `
            business:businesses!inner(
              id,
              type
            )
          `
          )
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (
          staffMember?.business &&
          Array.isArray(staffMember.business) &&
          staffMember.business.length > 0
        ) {
          setUserBusinessType(staffMember.business[0].type as BusinessType);
        } else {
          // Check if user created a business
          const { data: userBusiness } = await supabase
            .from("businesses")
            .select("type")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .single();

          if (userBusiness) {
            setUserBusinessType(userBusiness.type as BusinessType);
          } else {
            // Default to restaurant if no business found
            setUserBusinessType(BusinessType.RESTAURANT);
          }
        }
      } catch (error) {
        console.error("Error fetching business type:", error);
        // Default to restaurant on error
        setUserBusinessType(BusinessType.RESTAURANT);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessType();
  }, [user?.id]);

  const handleTypeSelect = (type: string) => {
    onStartCreation(type);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading slideshow creator...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
        >
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-8 relative overflow-hidden">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12 animate-pulse delay-1000"></div>
              <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10 animate-pulse delay-500"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full -translate-x-8 -translate-y-8 animate-pulse delay-1500"></div>
            </div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20">
                  <h2 className="text-3xl font-bold">Create New Slideshow</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-white/90 text-xl font-medium relative z-10">
              Choose a slideshow type to get started
            </p>
          </div>

          {/* Enhanced Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slideshowTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTypeSelect(type.id)}
                    disabled={!type.available}
                    className={`p-6 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 text-left group ${
                      type.available
                        ? "hover:shadow-xl cursor-pointer bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
                        : "opacity-50 cursor-not-allowed bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-4 rounded-xl bg-gradient-to-br ${type.color} group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl`}
                      >
                        <Icon className={`w-8 h-8 text-white`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-gray-800 transition-colors">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

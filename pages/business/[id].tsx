import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Fullscreen, Minimize2 } from "lucide-react";
import { Slideshow } from "@/components/slideshow";
import { supabase } from "../../lib/supabase";

interface Business {
  id: string;
  name: string;
  description: string;
  address: any;
  contact_info: any;
  slides: any[];
}

export default function BusinessDisplay() {
  const router = useRouter();
  const { id } = router.query;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBusinessData();
    }
  }, [id]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);

      // Fetch business data
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (businessError) {
        console.error("Error fetching business:", businessError);
        return;
      }

      // Fetch slides for this business
      const { data: slidesData, error: slidesError } = await supabase
        .from("slides")
        .select("*")
        .eq("business_id", id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (slidesError) {
        console.error("Error fetching slides:", slidesError);
        return;
      }

      setBusiness({
        ...businessData,
        slides: slidesData || [],
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-400 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-400 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-2">
            Business Not Found
          </h1>
          <p className="text-white">
            The business you're looking for doesn't exist or is inactive.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{business.name} - AfghanView</title>
        <meta name="description" content={business.description} />
      </Head>

      <div className="relative min-h-screen bg-black">
        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-75 transition-all duration-200"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Fullscreen size={20} />}
        </button>

        {/* Business Info Overlay */}
        <div className="absolute top-4 left-4 z-40 bg-black bg-opacity-50 text-white p-4 rounded-lg max-w-sm">
          <h1 className="text-xl font-bold mb-2">{business.name}</h1>
          <p className="text-sm opacity-90 mb-2">{business.description}</p>
          {business.contact_info?.phone && (
            <p className="text-sm opacity-75">
              📞 {business.contact_info.phone}
            </p>
          )}
          {business.address && (
            <p className="text-sm opacity-75">
              📍 {business.address.street}, {business.address.city}
            </p>
          )}
        </div>

        {/* Slideshow */}
        {business.slides && business.slides.length > 0 ? (
          <Slideshow slides={business.slides} currentSlide={currentSlide} />
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">No Slides Available</h2>
              <p className="text-lg opacity-75">
                This business hasn't set up any slides yet.
              </p>
            </div>
          </div>
        )}

        {/* Slide Counter */}
        {business.slides && business.slides.length > 0 && (
          <div className="absolute bottom-4 right-4 z-40 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentSlide + 1} / {business.slides.length}
          </div>
        )}
      </div>
    </>
  );
}

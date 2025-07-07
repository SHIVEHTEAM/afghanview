import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Fullscreen, Minimize2 } from "lucide-react";
import { Slideshow } from "@/components/slideshow";
import { RestaurantInfo } from "@/components/restaurant";
import { Slide } from "../../lib/supabase";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  slides: Slide[];
}

export default function RestaurantDisplay() {
  const router = useRouter();
  const { id } = router.query;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock restaurant data - in real app, this would come from API/database
  const mockRestaurants: { [key: string]: Restaurant } = {
    "afghan-palace": {
      id: "afghan-palace",
      name: "Afghan Palace",
      description: "Authentic Afghan Cuisine",
      address: "123 Main Street, City, State",
      phone: "(555) 123-4567",
      website: "www.afghanpalace.com",
      slides: [
        {
          id: "slide-1",
          restaurant_id: "afghan-palace",
          name: "Welcome Slide",
          type: "image",
          title: "Welcome to Afghan Palace",
          subtitle: "Authentic Afghan Cuisine & Culture",
          content: JSON.stringify({
            src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          }),
          order_index: 1,
          sort_order: 1,
          is_locked: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: 6000,
        },
        {
          id: "slide-2",
          restaurant_id: "afghan-palace",
          name: "Today's Specials",
          type: "menu",
          title: "Today's Specials",
          subtitle: "Fresh & Authentic",
          content: JSON.stringify({
            items: [
              "🍚 Kabuli Pulao - $22.99",
              "🥟 Mantu Dumplings - $18.99",
              "🍖 Qorma-e-Gosht - $24.99",
              "🥖 Naan-e-Afghan - $3.99",
            ],
          }),
          order_index: 2,
          sort_order: 2,
          is_locked: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: 8000,
        },
        {
          id: "slide-3",
          restaurant_id: "afghan-palace",
          name: "Traditional Afghan Hospitality",
          type: "image",
          title: "Traditional Afghan Hospitality",
          subtitle: "Experience the warmth of Afghan culture",
          content: JSON.stringify({
            src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          }),
          order_index: 3,
          sort_order: 3,
          is_locked: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: 6000,
        },
        {
          id: "slide-4",
          restaurant_id: "afghan-palace",
          name: "Weekend Special",
          type: "promo",
          title: "Weekend Special",
          subtitle: "Family Feast Package",
          content: JSON.stringify({ promo: "Get 20% off on orders over $50" }),
          order_index: 4,
          sort_order: 4,
          is_locked: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: 7000,
        },
        {
          id: "slide-5",
          restaurant_id: "afghan-palace",
          name: "Quote",
          type: "quote",
          title: "The best way to experience a culture is through its food.",
          subtitle: "Afghan Proverb",
          content: JSON.stringify({
            quote: "The best way to experience a culture is through its food.",
            author: "Afghan Proverb",
          }),
          order_index: 5,
          sort_order: 5,
          is_locked: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: 6000,
        },
        {
          id: "slide-6",
          restaurant_id: "afghan-palace",
          name: "Restaurant Hours",
          type: "hours",
          title: "Restaurant Hours",
          content: JSON.stringify({
            hours: [
              "Monday - Friday: 11:00 AM - 10:00 PM",
              "Saturday - Sunday: 12:00 PM - 11:00 PM",
            ],
          }),
          order_index: 6,
          sort_order: 6,
          is_locked: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: 6000,
        },
      ],
    },
    "kabul-kitchen": {
      id: "kabul-kitchen",
      name: "Kabul Kitchen",
      description: "Traditional Afghan Flavors",
      address: "456 Oak Avenue, City, State",
      phone: "(555) 987-6543",
      website: "www.kabulkitchen.com",
      slides: [
        {
          id: "slide-1",
          restaurant_id: "kabul-kitchen",
          name: "Welcome Slide",
          type: "image",
          title: "Welcome to Kabul Kitchen",
          subtitle: "Traditional Afghan Flavors",
          content: JSON.stringify({
            src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          }),
          order_index: 1,
          sort_order: 1,
          is_locked: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: 6000,
        },
        {
          id: "slide-2",
          restaurant_id: "kabul-kitchen",
          name: "Chef's Special",
          type: "menu",
          title: "Chef's Special",
          subtitle: "Handcrafted with Love",
          content: JSON.stringify({
            items: [
              "🍖 Lamb Karahi - $28.99",
              "🥘 Chicken Biryani - $24.99",
              "🥟 Aushak - $16.99",
              "🍚 Qabuli Pulao - $22.99",
            ],
          }),
          order_index: 2,
          sort_order: 2,
          is_locked: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: 8000,
        },
      ],
    },
  };

  useEffect(() => {
    if (id && typeof id === "string") {
      const foundRestaurant = mockRestaurants[id];
      if (foundRestaurant) {
        setRestaurant(foundRestaurant);
      } else {
        // Restaurant not found - could redirect to 404
        console.error("Restaurant not found:", id);
      }
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (restaurant?.slides) {
      const interval = setInterval(() => {
        setCurrentSlide(
          (prev: number) => (prev + 1) % restaurant.slides.length
        );
      }, restaurant.slides[currentSlide]?.duration || 6000);

      return () => clearInterval(interval);
    }
  }, [currentSlide, restaurant]);

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Restaurant not found</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{restaurant.name} - ShivehView Display</title>
        <meta
          name="description"
          content={`${restaurant.name} - ${restaurant.description}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-black relative overflow-hidden">
        {/* Fullscreen button */}
        <motion.button
          onClick={toggleFullscreen}
          className="fixed top-6 right-6 z-50 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 mr-2 inline" />
          ) : (
            <Fullscreen className="w-5 h-5 mr-2 inline" />
          )}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </motion.button>

        {/* Restaurant Info Overlay */}
        <div className="fixed top-6 left-6 z-40">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 text-shadow-lg">
                {restaurant.name}
              </h2>
              <p className="text-lg opacity-90 font-medium">
                {restaurant.description}
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-3 rounded-full"></div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-afghan-green rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm">{restaurant.address}</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-afghan-red rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <span className="text-sm">{restaurant.phone}</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <span className="text-sm">{restaurant.website}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slideshow */}
        <AnimatePresence mode="wait">
          <Slideshow
            key={currentSlide}
            slides={restaurant.slides}
            currentSlide={currentSlide}
          />
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="fixed bottom-0 left-0 right-0 h-2 bg-black/50">
          <motion.div
            className="h-full bg-gradient-to-r from-afghan-green via-afghan-red to-afghan-gold"
            initial={{ width: 0 }}
            animate={{
              width: `${
                ((currentSlide + 1) / restaurant.slides.length) * 100
              }%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Slide Counter */}
        <motion.div
          className="fixed bottom-6 left-6 text-white/80 text-lg font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {currentSlide + 1} / {restaurant.slides.length}
        </motion.div>

        {/* Afghan Flag Colors Accent */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-afghan-green via-afghan-red to-afghan-gold"></div>
      </main>
    </>
  );
}

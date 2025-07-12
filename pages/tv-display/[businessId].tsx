import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

interface Slideshow {
  id: string;
  title: string;
  is_active: boolean;
  content?: {
    slides?: any[];
    images?: any[];
  };
  settings?: any;
}

interface Business {
  id: string;
  name: string;
  title: string;
  type: string;
}

export default function TvDisplayPage() {
  const router = useRouter();
  const { businessId } = router.query;

  const [business, setBusiness] = useState<Business | null>(null);
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [currentSlideshow, setCurrentSlideshow] = useState<Slideshow | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [deviceType, setDeviceType] = useState<string>("");
  const [connectionCode, setConnectionCode] = useState<string>("");

  // Generate a unique connection code for this TV
  useEffect(() => {
    if (!connectionCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setConnectionCode(code);
    }
  }, [connectionCode]);

  // Detect device type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (
      userAgent.includes("smart-tv") ||
      userAgent.includes("tizen") ||
      userAgent.includes("webos")
    ) {
      setDeviceType("tv");
    } else if (userAgent.includes("tablet")) {
      setDeviceType("tablet");
    } else if (userAgent.includes("mobile")) {
      setDeviceType("phone");
    } else {
      setDeviceType("monitor");
    }
  }, []);

  // Fetch business and slideshows
  useEffect(() => {
    if (!businessId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch business
        const businessRes = await fetch(`/api/business/${businessId}`);
        if (!businessRes.ok) throw new Error("Business not found");
        const businessData = await businessRes.json();
        setBusiness(businessData);

        // Fetch slideshows
        const slideshowsRes = await fetch(
          `/api/slideshows?business_id=${businessId}&is_active=true`
        );
        if (!slideshowsRes.ok) throw new Error("Failed to fetch slideshows");
        const slideshowsData = await slideshowsRes.json();
        setSlideshows(slideshowsData);

        // Auto-select first slideshow
        if (slideshowsData.length > 0) {
          setCurrentSlideshow(slideshowsData[0]);
        }

        setIsConnected(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId]);

  // Auto-hide setup after 10 seconds
  useEffect(() => {
    if (isConnected && showSetup) {
      const timer = setTimeout(() => setShowSetup(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, showSetup]);

  const handleStartSlideshow = () => {
    if (currentSlideshow) {
      router.push(`/tv/${currentSlideshow.id}`);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>TV Display - Shivehview</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">
              Connecting to Shivehview
            </h2>
            <p className="text-blue-200">Setting up your display...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Connection Error - Shivehview</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-800 flex items-center justify-center">
          <div className="text-center text-white max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-white text-red-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{business?.name || business?.title} - TV Display</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tv className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {business?.name || business?.title}
              </h1>
              <p className="text-blue-200">TV Display Ready</p>
            </div>

            {/* Connection Status */}
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-green-200 font-medium">Connected</span>
                <span className="text-green-300 text-sm">•</span>
                <span className="text-green-200 text-sm capitalize">
                  {deviceType}
                </span>
              </div>
            </div>

            {/* Connection Code */}
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className="text-blue-200 text-sm mb-2">Connection Code</p>
                <div className="bg-white/20 rounded-lg p-3">
                  <span className="text-3xl font-mono font-bold text-white tracking-wider">
                    {connectionCode}
                  </span>
                </div>
                <p className="text-blue-200 text-xs mt-2">
                  Use this code in your dashboard to control this display
                </p>
              </div>
            </div>

            {/* Slideshow Selection */}
            {slideshows.length > 0 && (
              <div className="mb-6">
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Select Slideshow
                </label>
                <select
                  value={currentSlideshow?.id || ""}
                  onChange={(e) => {
                    const selected = slideshows.find(
                      (s) => s.id === e.target.value
                    );
                    setCurrentSlideshow(selected || null);
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {slideshows.map((slideshow) => (
                    <option
                      key={slideshow.id}
                      value={slideshow.id}
                      className="bg-gray-800 text-white"
                    >
                      {slideshow.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleStartSlideshow}
                disabled={!currentSlideshow}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Start Slideshow</span>
              </button>

              <button
                onClick={handleRefresh}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Connection</span>
              </button>
            </div>

            {/* Device Info */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-blue-200 text-xs">Device Type</p>
                  <p className="text-white font-medium capitalize">
                    {deviceType}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs">Available Slideshows</p>
                  <p className="text-white font-medium">{slideshows.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Instructions Overlay */}
        <AnimatePresence>
          {showSetup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tv className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Welcome to Shivehview TV Display
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your display is now connected and ready to show beautiful
                    slideshows.
                  </p>

                  <div className="space-y-3 text-left">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Automatic Connection
                        </p>
                        <p className="text-xs text-gray-500">
                          Your TV is now connected to your business dashboard
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Play className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Remote Control
                        </p>
                        <p className="text-xs text-gray-500">
                          Control slideshows from your dashboard
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Settings className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Auto-Update
                        </p>
                        <p className="text-xs text-gray-500">
                          Content updates automatically
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSetup(false)}
                    className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

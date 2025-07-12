import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import ClientLayout from "../../components/client/ClientLayout";
import { motion } from "framer-motion";
import {
  Tv,
  Monitor,
  Tablet,
  Phone,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  AlertCircle,
  Settings,
  Trash2,
  Plus,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Power,
  Sun,
  Volume1,
  RotateCcw,
  MapPin,
  FileText,
  Calendar,
  MoreVertical,
  Edit,
  Eye,
  Download,
  Upload,
  Zap,
  Shield,
  Activity,
  Clock,
  Users,
  BarChart3,
  Grid,
  List,
  Search,
  Filter,
  Sliders,
  Target,
  Globe,
  Smartphone,
  MonitorSmartphone,
  Tv2,
  Laptop,
  Smartphone as PhoneIcon,
  ExternalLink,
  Link,
  Share2,
  Smartphone as PhoneIcon2,
  Monitor as MonitorIcon,
  Tablet as TabletIcon,
} from "lucide-react";

interface Slideshow {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  play_count?: number;
  last_played?: string;
  content?: {
    slides?: any[];
    images?: any[];
  };
  created_at: string;
}

interface TVDevice {
  id: string;
  name: string;
  type: "tv" | "monitor" | "tablet" | "phone";
  location: string;
  connectionCode: string;
  status: "online" | "offline" | "playing" | "paused";
  currentSlideshow?: string;
  lastSeen: Date;
  business_id: string;
}

export default function TvManagementPage() {
  const { user } = useAuth();
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [tvDevices, setTvDevices] = useState<TVDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTv, setShowAddTv] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch slideshows and business data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get user's business
      const { data: businessData } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!businessData) throw new Error("Business not found");
      setBusiness(businessData);

      // Fetch slideshows
      const { data: slideshowsData, error: slideshowsError } = await supabase
        .from("slideshows")
        .select("*")
        .eq("business_id", businessData.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (slideshowsError) throw slideshowsError;
      setSlideshows(slideshowsData || []);

      // Load TV devices from localStorage (in a real app, this would be from database)
      const savedTvs = localStorage.getItem(`tv-devices-${businessData.id}`);
      if (savedTvs) {
        const parsedTvs = JSON.parse(savedTvs).map((tv: any) => ({
          ...tv,
          lastSeen: new Date(tv.lastSeen),
        }));
        setTvDevices(parsedTvs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const generateConnectionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const addTvDevice = (
    tvData: Omit<TVDevice, "id" | "lastSeen" | "connectionCode" | "business_id">
  ) => {
    const newTv: TVDevice = {
      ...tvData,
      id: `tv-${Date.now()}-${Math.random()}`,
      connectionCode: generateConnectionCode(),
      lastSeen: new Date(),
      business_id: business.id,
    };

    const updatedTvs = [...tvDevices, newTv];
    setTvDevices(updatedTvs);
    localStorage.setItem(
      `tv-devices-${business.id}`,
      JSON.stringify(updatedTvs)
    );
    setShowAddTv(false);
  };

  const removeTvDevice = (tvId: string) => {
    if (confirm("Are you sure you want to remove this TV device?")) {
      const updatedTvs = tvDevices.filter((tv) => tv.id !== tvId);
      setTvDevices(updatedTvs);
      localStorage.setItem(
        `tv-devices-${business.id}`,
        JSON.stringify(updatedTvs)
      );
    }
  };

  const copyConnectionCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const getTvDisplayUrl = (businessId: string) => {
    return `${window.location.origin}/tv-display/${businessId}`;
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>TV Management - Shivehview</title>
          <meta
            name="description"
            content="Manage your TV displays and devices"
          />
        </Head>
        <ClientLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading TV management...</p>
            </div>
          </div>
        </ClientLayout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>TV Management - Shivehview</title>
          <meta
            name="description"
            content="Manage your TV displays and devices"
          />
        </Head>
        <ClientLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tv className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error loading TV management
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </ClientLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>TV Management - Shivehview</title>
        <meta
          name="description"
          content="Manage your TV displays and devices"
        />
      </Head>

      <ClientLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  TV Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Connect and manage your display devices
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchData}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowAddTv(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add TV</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Connected TVs
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {tvDevices.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Tv className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Available Slideshows
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {slideshows.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Play className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Business
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {business?.name || business?.title || "Active"}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Wifi className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Connection Status
                    </p>
                    <p className="text-3xl font-bold text-gray-900">Ready</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <QrCode className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Setup Guide */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tv className="w-5 h-5 text-blue-600" />
                Quick Setup Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Add TV Device</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click "Add TV" to create a new TV device with a unique
                    connection code.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Open on TV</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    On your TV, open a web browser and go to the TV display URL.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Enter Code</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Enter the connection code shown on your TV to link it to
                    your dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* TV Display URL */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                TV Display URL
              </h3>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                <input
                  type="text"
                  value={getTvDisplayUrl(business.id)}
                  readOnly
                  className="flex-1 bg-transparent text-gray-700 font-mono text-sm"
                />
                <button
                  onClick={() =>
                    copyConnectionCode(getTvDisplayUrl(business.id))
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  {copiedCode === getTvDisplayUrl(business.id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Share this URL with your TV devices to connect them to your
                dashboard.
              </p>
            </div>

            {/* TV Devices */}
            {tvDevices.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-100 text-center">
                <Tv className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No TV devices connected yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your first TV device to start managing displays
                  automatically.
                </p>
                <button
                  onClick={() => setShowAddTv(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Add Your First TV
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tvDevices.map((tv) => (
                  <motion.div
                    key={tv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {tv.type === "tv" && (
                              <Tv className="w-5 h-5 text-blue-600" />
                            )}
                            {tv.type === "monitor" && (
                              <MonitorIcon className="w-5 h-5 text-blue-600" />
                            )}
                            {tv.type === "tablet" && (
                              <TabletIcon className="w-5 h-5 text-blue-600" />
                            )}
                            {tv.type === "phone" && (
                              <PhoneIcon2 className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {tv.name}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize">
                              {tv.type}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                            tv.status === "online"
                              ? "bg-green-500"
                              : tv.status === "playing"
                              ? "bg-blue-500"
                              : tv.status === "paused"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }`}
                        >
                          {tv.status}
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Location:</span>
                          <span className="text-gray-900">{tv.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Connection Code:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-900">
                              {tv.connectionCode}
                            </span>
                            <button
                              onClick={() =>
                                copyConnectionCode(tv.connectionCode)
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {copiedCode === tv.connectionCode ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last seen:</span>
                          <span className="text-gray-900">
                            {tv.lastSeen.toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            window.open(getTvDisplayUrl(business.id), "_blank")
                          }
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                        >
                          Open Display
                        </button>
                        <button
                          onClick={() => removeTvDevice(tv.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                          title="Remove TV"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add TV Modal */}
            {showAddTv && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl p-6 max-w-md w-full"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Add New TV Device
                  </h3>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      addTvDevice({
                        name: formData.get("name") as string,
                        type: formData.get("type") as
                          | "tv"
                          | "monitor"
                          | "tablet"
                          | "phone",
                        location: formData.get("location") as string,
                        status: "offline",
                      });
                    }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          TV Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g., Main Dining TV"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Device Type
                        </label>
                        <select
                          name="type"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="tv">Smart TV</option>
                          <option value="monitor">Monitor</option>
                          <option value="tablet">Tablet</option>
                          <option value="phone">Phone</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          required
                          placeholder="e.g., Main Dining Area"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-6">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                      >
                        Add TV Device
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddTv(false)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </ClientLayout>
    </>
  );
}

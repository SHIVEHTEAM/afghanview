import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

import ClientLayout from "../../components/client/ClientLayout";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface Slideshow {
  id: string;
  name: string;
  description?: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  slug?: string;
  play_count?: number;
  last_played?: string;
  is_favorite?: boolean;
}

export default function SlideshowsPage() {
  const { user } = useAuth();
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch user's business and slideshows
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Get user's business
        const { data: staffMember } = await supabase
          .from("business_staff")
          .select(
            `
            business:businesses!inner(
              id,
              name,
              slug
            )
          `
          )
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        let businessId: string | null = null;

        if (
          staffMember?.business &&
          Array.isArray(staffMember.business) &&
          staffMember.business.length > 0
        ) {
          businessId = staffMember.business[0].id;
        } else {
          // Check if user created a business
          const { data: userBusiness } = await supabase
            .from("businesses")
            .select("id, name, slug")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .single();

          if (userBusiness) {
            businessId = userBusiness.id;
          }
        }

        if (businessId) {
          setBusinessId(businessId);

          // Fetch slideshows
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
  }, [user?.id]);

  // Filter slideshows
  const filteredSlideshows = slideshows.filter((slideshow) => {
    const matchesSearch = slideshow.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && slideshow.is_active) ||
      (filterStatus === "inactive" && !slideshow.is_active);

    return matchesSearch && matchesFilter;
  });

  const handleToggleActive = async (slideshow: Slideshow) => {
    try {
      const { error } = await supabase
        .from("slideshows")
        .update({ is_active: !slideshow.is_active })
        .eq("id", slideshow.id);

      if (!error) {
        setSlideshows((prev) =>
          prev.map((s) =>
            s.id === slideshow.id ? { ...s, is_active: !s.is_active } : s
          )
        );
      }
    } catch (error) {
      console.error("Error toggling slideshow status:", error);
    }
  };

  const handleDeleteSlideshow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slideshow?")) return;

    try {
      const { error } = await supabase.from("slideshows").delete().eq("id", id);

      if (!error) {
        setSlideshows((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Error deleting slideshow:", error);
    }
  };

  const handleRefresh = async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      const { data: slideshowData } = await supabase
        .from("slideshows")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      setSlideshows(slideshowData || []);
    } catch (error) {
      console.error("Error refreshing slideshows:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading slideshows...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Slideshows - AfghanView</title>
        <meta name="description" content="Manage your slideshows" />
      </Head>

      <ClientLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Slideshows
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage your slideshow content
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link
                href="/slideshow-creator"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Slideshow</span>
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search slideshows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Slideshows Grid/List */}
          {slideshows.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No slideshows yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first slideshow to get started
              </p>
              <Link
                href="/slideshow-creator"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Create Your First Slideshow
              </Link>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredSlideshows.map((slideshow) => (
                <motion.div
                  key={slideshow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${
                    viewMode === "list" ? "flex items-center p-6" : "p-6"
                  }`}
                >
                  {viewMode === "list" ? (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {slideshow.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {slideshow.description || "No description"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              Created:{" "}
                              {new Date(
                                slideshow.created_at
                              ).toLocaleDateString()}
                            </span>
                            <span>{slideshow.play_count || 0} plays</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                slideshow.is_active
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {slideshow.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(slideshow)}
                          className={`p-2 rounded-lg transition-colors ${
                            slideshow.is_active
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {slideshow.is_active ? (
                            <Power className="w-4 h-4" />
                          ) : (
                            <PowerOff className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/slideshow/${slideshow.slug || slideshow.id}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                        >
                          <Play className="w-4 h-4 inline mr-2" />
                          Play
                        </Link>
                        <Link
                          href={`/slideshow-creator?edit=${slideshow.id}`}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteSlideshow(slideshow.id)}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {slideshow.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {slideshow.description || "No description"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(slideshow)}
                            className={`p-2 rounded-lg transition-colors ${
                              slideshow.is_active
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {slideshow.is_active ? (
                              <Power className="w-4 h-4" />
                            ) : (
                              <PowerOff className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>
                          Created:{" "}
                          {new Date(slideshow.created_at).toLocaleDateString()}
                        </span>
                        <span>{slideshow.play_count || 0} plays</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/slideshow/${slideshow.slug || slideshow.id}`}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium text-center"
                        >
                          <Play className="w-4 h-4 inline mr-2" />
                          Play
                        </Link>
                        <Link
                          href={`/slideshow-creator?edit=${slideshow.id}`}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteSlideshow(slideshow.id)}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {filteredSlideshows.length === 0 && slideshows.length > 0 && (
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No slideshows found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </ClientLayout>
    </>
  );
}

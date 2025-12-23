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
  Calendar,
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
        <div className="flex flex-col items-center justify-center py-40 px-8">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-black/5 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-black rounded-full animate-spin"></div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black animate-pulse">
              Accessing Module Registry
            </p>
            <p className="text-[8px] font-bold text-black/20 uppercase tracking-[0.3em] mt-4">
              Synchronising Content Nodes // Archive Active
            </p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Module Archive - Shivehview</title>
      </Head>

      <ClientLayout>
        <div className="max-w-7xl mx-auto px-10 py-16">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-black/[0.04] pb-12 mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-black/10">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                System Content Hub
              </div>
              <h1 className="text-6xl font-black text-black mb-4 tracking-tighter uppercase">
                Module Archive
              </h1>
              <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.4em]">
                System // Content Registry // {slideshows.length} Units Registered
              </p>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-5 bg-white rounded-2xl border border-black/[0.04] shadow-2xl shadow-black/[0.02] text-black hover:bg-black hover:text-white transition-all group"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              </motion.button>
              <Link href="/slideshow-creator">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-5 bg-black text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-black/20 text-[10px] flex items-center gap-4 group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Initialise New</span>
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-black/[0.05] shadow-2xl shadow-black/[0.02] mb-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-1 items-center gap-6 w-full">
                <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-black/20 w-4 h-4 group-focus-within:text-black transition-colors" />
                  <input
                    type="text"
                    placeholder="Search Unit Registry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 rounded-2xl border border-black/[0.04] font-black text-[11px] uppercase tracking-tight focus:bg-white focus:border-black/10 outline-none transition-all placeholder:text-black/10"
                  />
                </div>

                <div className="relative group">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="pl-8 pr-12 py-5 bg-gray-50/50 rounded-2xl border border-black/[0.04] font-black text-[10px] uppercase tracking-widest focus:bg-white focus:border-black/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">Status: Global</option>
                    <option value="active">Status: Online</option>
                    <option value="inactive">Status: Offline</option>
                  </select>
                  <Filter className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 text-black/20 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-black/[0.03]">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-4 rounded-xl transition-all ${viewMode === "grid" ? "bg-white text-black shadow-lg" : "text-black/20 hover:text-black"
                    }`}
                >
                  <Grid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("list")}
                  className={`p-4 rounded-xl transition-all ${viewMode === "list" ? "bg-white text-black shadow-lg" : "text-black/20 hover:text-black"
                    }`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Content Grid/List */}
          {slideshows.length === 0 ? (
            <div className="bg-white rounded-[3rem] border border-black/5 shadow-2xl shadow-black/[0.02] p-32 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner group">
                <Plus className="w-10 h-10 text-black/10 group-hover:text-black transition-all duration-500" />
              </div>
              <h3 className="text-3xl font-black text-black mb-4 uppercase tracking-tighter">
                Registry Depleted
              </h3>
              <p className="text-[11px] font-bold text-black/30 mb-12 uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
                No content modules detected within the system perimeter. Initialize a primary unit to begin.
              </p>
              <Link href="/slideshow-creator">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-12 py-6 bg-black text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-black/20 text-[10px]"
                >
                  Create Primary Unit
                </motion.button>
              </Link>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                  : "space-y-6"
              }
            >
              {filteredSlideshows.map((slideshow, i) => (
                <motion.div
                  key={slideshow.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-[2.5rem] border border-black/5 shadow-2xl shadow-black/[0.02] hover:shadow-black/[0.06] transition-all duration-500 group overflow-hidden ${viewMode === "list" ? "flex flex-col md:flex-row md:items-center p-10 gap-10" : "p-10"
                    }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm ${slideshow.is_active
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black/30 border-black/5'
                        }`}>
                        {slideshow.is_active ? 'Status: Optimal' : 'Status: Offline'}
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/5"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-black/5"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-black/5"></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <h3 className="text-2xl font-black text-black uppercase tracking-tighter leading-none group-hover:text-black/70 transition-colors">
                        {slideshow.name}
                      </h3>
                      <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.1em] leading-relaxed line-clamp-2 min-h-[3em]">
                        {slideshow.description || "System metadata entry pending..."}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 mt-10 pt-8 border-t border-black/[0.03]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black text-black/10 uppercase tracking-widest">Initialised</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-tight">
                          <Calendar className="w-3 h-3 text-black/20" />
                          <span>{new Date(slideshow.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 pl-6 border-l border-black/[0.03]">
                        <span className="text-[7px] font-black text-black/10 uppercase tracking-widest">Broadcasts</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-tight">
                          <Play className="w-3 h-3 text-black/20" />
                          <span>{slideshow.play_count || 0}_Cycles</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-2 md:grid-cols-4 min-w-[440px]' : 'grid-cols-2 mt-10'}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleActive(slideshow)}
                      className={`p-5 rounded-2xl border transition-all flex items-center justify-center shadow-lg ${slideshow.is_active
                        ? "bg-black text-white border-black shadow-black/20"
                        : "bg-white text-black/20 border-black/5 hover:border-black/20 shadow-none"
                        }`}
                      title={slideshow.is_active ? "Terminate Feed" : "Activate Feed"}
                    >
                      {slideshow.is_active ? (
                        <Power className="w-5 h-5" />
                      ) : (
                        <PowerOff className="w-5 h-5" />
                      )}
                    </motion.button>
                    <Link href={`/slideshow/${slideshow.slug || slideshow.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-5 w-full bg-white text-black border border-black/5 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-xl shadow-black/[0.02] hover:shadow-black/20"
                      >
                        <Play className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    <Link href={`/slideshow-creator?edit=${slideshow.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-5 w-full bg-white text-black border border-black/5 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-xl shadow-black/[0.02] hover:shadow-black/20"
                      >
                        <Edit className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: '#000', color: '#fff' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteSlideshow(slideshow.id)}
                      className="p-5 bg-white text-black/20 border border-black/5 rounded-2xl flex items-center justify-center hover:border-black/20 transition-all shadow-xl shadow-black/[0.02]"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredSlideshows.length === 0 && slideshows.length > 0 && (
            <div className="bg-white rounded-[3rem] border border-black/5 p-32 text-center mt-12 shadow-2xl shadow-black/[0.02]">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Search className="w-10 h-10 text-black/10" />
              </div>
              <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-tighter">
                Query Zero Results
              </h3>
              <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                Adjust search parameters or status filters to locate the desired unit node.
              </p>
            </div>
          )}
        </div>
      </ClientLayout>
    </>
  );
}

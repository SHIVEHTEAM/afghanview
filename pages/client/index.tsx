import { useEffect, useState } from "react";
import Head from "next/head";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { BusinessType } from "@/types/business";
import ClientLayout from "@/components/client/ClientLayout";
import { SlideshowsTab } from "@/components/client/dashboard/tabs/SlideshowsTab";
import { DashboardModals } from "@/components/client/dashboard/modals/DashboardModals";
import { FileText, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Business {
  id: string;
  name: string;
  type: BusinessType;
  description?: string;
  created_at: string;
  user_id?: string;
}

interface Slideshow {
  id: string;
  title: string;
  description?: string;
  business_id: string;
  business_type: BusinessType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  content?: {
    slides?: any[];
    images?: any[];
    [key: string]: any;
  };
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data: staffMember } = await supabase
        .from("business_staff")
        .select(`
          business:businesses!inner(
            id,
            name,
            type,
            description,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      let foundBusiness = null;
      if (staffMember?.business) {
        foundBusiness = Array.isArray(staffMember.business)
          ? staffMember.business[0]
          : staffMember.business;
      }

      if (!foundBusiness) {
        const { data: userBusiness } = await supabase
          .from("businesses")
          .select("id, name, type, description, created_at, user_id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: true })
          .maybeSingle();
        if (userBusiness) {
          foundBusiness = userBusiness;
        }
      }

      let businessId: string | null = null;
      if (!foundBusiness) {
        const { data: newBusiness, error: createError } = await supabase
          .from("businesses")
          .insert({
            name: `${user.first_name || "User"}'s Business`,
            user_id: user.id,
            type: "restaurant",
            description: `${user.first_name || "User"}'s Business - restaurant`,
          })
          .select()
          .single();
        if (createError) {
          console.error("❌ Error creating business:", createError);
        } else if (newBusiness) {
          foundBusiness = newBusiness;
        }
      }

      if (foundBusiness) {
        setBusiness(foundBusiness);
        businessId = foundBusiness.id;
      } else {
        setBusiness(null);
        businessId = null;
      }

      if (businessId) {
        const { data: slideshowData, error } = await supabase
          .from("slideshows")
          .select("*")
          .eq("business_id", businessId)
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        if (error) {
          console.error("Error fetching slideshows:", error);
          setSlideshows([]);
        } else {
          const slideshowsWithBusinessType = (slideshowData || []).map(
            (slideshow) => ({
              ...slideshow,
              business_type:
                (foundBusiness?.type as BusinessType) ||
                BusinessType.RESTAURANT,
            })
          );
          setSlideshows(slideshowsWithBusinessType);
        }
      } else {
        setSlideshows([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <ClientLayout>
        <Head>
          <title>Loading... // Shivehview</title>
        </Head>
        <div className="flex flex-col items-center justify-center py-48 min-h-[70vh]">
          <div className="w-12 h-12 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
          <p className="mt-8 text-sm font-medium text-black/40">
            Loading your dashboard...
          </p>
        </div>
      </ClientLayout>
    );
  }

  if (!business) {
    return (
      <ClientLayout>
        <Head>
          <title>Business Set Up Required // Shivehview</title>
        </Head>
        <div className="flex items-center justify-center py-48 min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md p-12 bg-white rounded-3xl shadow-xl border border-black/5"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-8 h-8 text-black/20" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">
              Business Required
            </h2>
            <p className="text-sm text-black/50 mb-8 leading-relaxed">
              We couldn't find a business associated with your account. Please refresh or contact support if this persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-black text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-black/90"
            >
              Refresh Dashboard
            </button>
          </motion.div>
        </div>
      </ClientLayout>
    );
  }

  const formattedSlideshows = slideshows.map((slideshow) => ({
    ...slideshow,
    name: slideshow.title,
    images: slideshow.content?.images || slideshow.content?.slides || [],
  }));

  return (
    <ClientLayout>
      <Head>
        <title>Dashboard // Shivehview</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">
              Welcome, {user?.first_name || "User"}
            </h1>
            <p className="text-sm text-black/40 mt-1">
              Manage your content and active TV units across your business.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-black/5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-black"></div>
              <span className="text-xs font-bold text-black uppercase tracking-wider">System Active</span>
            </div>
            <button
              onClick={fetchData}
              className="p-3 bg-white border border-black/5 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-black/40 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
            <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-2">Total Modules</p>
            <p className="text-4xl font-bold text-black">{formattedSlideshows.length}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
            <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-2">Active Displays</p>
            <p className="text-4xl font-bold text-black">--</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
            <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-2">Network Health</p>
            <p className="text-4xl font-bold text-black">100%</p>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-black">Modules</h2>
          </div>
          <SlideshowsTab
            slideshows={formattedSlideshows}
            business={business}
            onRefresh={fetchData}
          />
        </div>
      </div>

      <DashboardModals
        businessId={business?.id}
        onSlideshowCreated={fetchData}
      />
    </ClientLayout>
  );
}

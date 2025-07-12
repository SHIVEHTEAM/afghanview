import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { BusinessType } from "@/types/business";
import ClientLayout from "@/components/client/ClientLayout";
import { SlideshowsTab } from "@/components/client/dashboard/tabs/SlideshowsTab";
import { DashboardModals } from "@/components/client/dashboard/modals/DashboardModals";
import { FileText } from "lucide-react";

interface Business {
  id: string;
  name: string;
  type: BusinessType;
  description?: string;
  created_at: string;
  user_id?: string; // Add user_id field for business ownership
}

interface Slideshow {
  id: string;
  title: string; // Changed from name to title
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

      // 1. Try to find business where user is staff
      const { data: staffMember, error: staffError } = await supabase
        .from("business_staff")
        .select(
          `
          business:businesses!inner(
            id,
            name,
            type,
            description,
            created_at
          )
        `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      let foundBusiness = null;
      if (staffMember?.business) {
        // Handle both array and object
        foundBusiness = Array.isArray(staffMember.business)
          ? staffMember.business[0]
          : staffMember.business;
      }

      // 2. If not found as staff, try as owner
      if (!foundBusiness) {
        const { data: userBusiness, error: businessError } = await supabase
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

      // 3. Only create if business is truly not found
      let businessId: string | null = null;
      if (!foundBusiness) {
        const { data: newBusiness, error: createError } = await supabase
          .from("businesses")
          .insert({
            name: `${user.first_name || "User"}'s Business`,
            user_id: user.id,
            type: "restaurant", // default type
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

      // Set business state
      if (foundBusiness) {
        setBusiness(foundBusiness);
        businessId = foundBusiness.id;
      } else {
        setBusiness(null);
        businessId = null;
      }

      // Fetch slideshows if business exists
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
          // Add business_type to each slideshow
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

  // Fetch user's business and slideshows
  useEffect(() => {
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (!business) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Business Found
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have access to any business yet.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  // Convert slideshows to the format expected by SlideshowsTab
  const formattedSlideshows = slideshows.map((slideshow) => ({
    ...slideshow,
    name: slideshow.title, // SlideshowsTab expects 'name' instead of 'title'
    images: slideshow.content?.images || slideshow.content?.slides || [],
  }));

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || "User"}!
          </h1>
          <p className="text-gray-600">
            Manage your slideshows and business content
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <SlideshowsTab
            slideshows={formattedSlideshows}
            business={business}
            onRefresh={fetchData}
          />
        </div>
      </div>

      {/* Dashboard Modals - Handles slideshow creation and wizards */}
      <DashboardModals
        businessId={business?.id}
        onSlideshowCreated={fetchData}
      />
    </ClientLayout>
  );
}

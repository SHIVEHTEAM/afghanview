import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import ClientLayout from "../../components/client/ClientLayout";
import { ContentCalendar } from "../../components/client/ContentCalendar";

export default function CalendarPage() {
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user?.id) return;

      try {
        const { data: businessData } = await supabase
          .from("businesses")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (businessData) {
          setBusinessId(businessData.id);
        }
      } catch (error) {
        console.error("Error fetching business:", error);
      }
    };

    fetchBusiness();
  }, [user?.id]);

  if (!businessId) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <ContentCalendar businessId={businessId} />
    </ClientLayout>
  );
}

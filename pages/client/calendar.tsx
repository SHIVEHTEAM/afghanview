import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import ClientLayout from "../../components/client/ClientLayout";
import ContentCalendar from "../../components/client/ContentCalendar";

export default function CalendarPage() {
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user?.id) return;
      try {
        const { data: businessData } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
        if (businessData) setBusinessId(businessData.id);
      } catch (error) { console.error("Error fetching business:", error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from("businesses").select("id").eq("user_id", user.id).single();
    if (data) setBusinessId(data.id);
    setLoading(false);
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
          <p className="mt-6 text-sm font-medium text-black/40">Loading calendar...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Head>
        <title>Calendar - Shivehview</title>
        <meta name="description" content="Schedule your content across your TV network." />
      </Head>
      <ContentCalendar businessId={businessId || ""} />
    </ClientLayout>
  );
}

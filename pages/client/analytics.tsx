import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Play,
  Download,
  RefreshCw,
  Filter,
} from "lucide-react";

import ClientLayout from "../../components/client/ClientLayout";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface AnalyticsData {
  totalSlideshows: number;
  totalPlays: number;
  totalViews: number;
  activeSlideshows: number;
  monthlyActivity: {
    month: string;
    plays: number;
    views: number;
  }[];
  topSlideshows: {
    id: string;
    name: string;
    plays: number;
    views: number;
  }[];
  recentActivity: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user?.id) return;
      try {
        const { data: staffMember } = await supabase.from("business_staff").select("business:businesses(id, name, slug)").eq("user_id", user.id).eq("is_active", true).single();
        let bId = null;
        if (staffMember?.business) {
          bId = Array.isArray(staffMember.business) ? staffMember.business[0].id : staffMember.business.id;
        } else {
          const { data: userBusiness } = await supabase.from("businesses").select("id, name, slug").eq("user_id", user.id).eq("is_active", true).single();
          if (userBusiness) bId = userBusiness.id;
        }
        setBusinessId(bId);
      } catch (error) { console.error("Error fetching business:", error); }
    };
    fetchBusiness();
  }, [user?.id]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!businessId) return;
      try {
        setLoading(true);
        setError(null);

        const { data: slideshows } = await supabase.from("slideshows").select("*").eq("business_id", businessId);
        const { data: slideViews } = await supabase.from("slide_views").select("*").in("slide_id", slideshows?.map((s) => s.id) || []);
        const { data: playEvents } = await supabase.from("analytics_events").select("*").eq("business_id", businessId).eq("event_type", "slideshow_play");

        const totalSlideshows = slideshows?.length || 0;
        const activeSlideshows = slideshows?.filter((s) => s.is_active).length || 0;
        const totalPlays = playEvents?.length || 0;
        const totalViews = slideViews?.length || 0;

        const monthlyActivity: any[] = [];
        const topSlideshows: any[] = [];
        const recentActivity: any[] = [];

        setAnalytics({
          totalSlideshows,
          totalPlays,
          totalViews,
          activeSlideshows,
          monthlyActivity: [
            { month: "Jan", plays: 120, views: 450 },
            { month: "Feb", plays: 150, views: 520 },
            { month: "Mar", plays: 180, views: 610 },
          ],
          topSlideshows: (slideshows || []).slice(0, 5).map(s => ({ id: s.id, name: s.title, plays: Math.floor(Math.random() * 100), views: Math.floor(Math.random() * 500) })),
          recentActivity: [
            { id: "1", type: "play", description: "Main Lobby Slideshow played", timestamp: new Date().toISOString() },
            { id: "2", type: "create", description: "New Menu created", timestamp: new Date().toISOString() },
          ],
        });
      } catch (err) { setError("Failed to fetch analytics"); } finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [businessId, dateRange]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
          <p className="mt-6 text-sm font-medium text-black/40">Loading analytics...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Head>
        <title>Analytics - Shivehview</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-black">Analytics Overview</h1>
            <p className="text-sm text-black/40 mt-1">Track your content performance</p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white rounded-xl border border-black/5 text-sm font-bold outline-none cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button onClick={() => fetchData()} className="p-2.5 bg-white rounded-xl border border-black/5 text-black hover:bg-gray-50 transition-all">
              <RefreshCw className="w-5 h-5 text-black/40" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Modules", val: analytics?.totalSlideshows, icon: BarChart3 },
            { label: "Active Feeds", val: analytics?.activeSlideshows, icon: Play },
            { label: "Total Plays", val: analytics?.totalPlays, icon: Play },
            { label: "Total Views", val: analytics?.totalViews, icon: Eye },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-black/40" />
                </div>
                <p className="text-xs font-bold text-black/40 uppercase tracking-widest">{stat.label}</p>
              </div>
              <p className="text-3xl font-bold text-black">{stat.val}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-black mb-6">Performance Trend</h3>
            <div className="space-y-6">
              {analytics?.monthlyActivity.map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{m.month}</span>
                    <span className="text-black/40">{m.plays} plays</span>
                  </div>
                  <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full" style={{ width: `${(m.plays / 200) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-black mb-6">Top Modules</h3>
            <div className="space-y-6">
              {analytics?.topSlideshows.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-black/20">{i + 1}</div>
                    <span className="text-sm font-bold truncate max-w-[150px]">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{s.views}</p>
                    <p className="text-[10px] text-black/30 uppercase">Views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-black mb-6">Recent Activity</h3>
          <div className="divide-y divide-black/5">
            {analytics?.recentActivity.map((a, i) => (
              <div key={i} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                  <p className="text-sm font-medium">{a.description}</p>
                </div>
                <p className="text-xs text-black/30">{new Date(a.timestamp).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

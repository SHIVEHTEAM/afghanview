import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Play,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Calendar as CalendarIcon,
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

  // Fetch user's business
  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user?.id) return;

      try {
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
          const { data: userBusiness } = await supabase
            .from("businesses")
            .select("id, name, slug")
            .eq("created_by", user.id)
            .eq("is_active", true)
            .single();

          if (userBusiness) {
            businessId = userBusiness.id;
          }
        }

        setBusinessId(businessId);
      } catch (error) {
        console.error("Error fetching business:", error);
      }
    };

    fetchBusiness();
  }, [user?.id]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!businessId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch slideshows for this business
        const { data: slideshows, error: slideshowsError } = await supabase
          .from("slideshows")
          .select("*")
          .eq("business_id", businessId);

        if (slideshowsError) {
          throw new Error("Failed to fetch slideshows");
        }

        // Get real view data from slide_views table
        const { data: slideViews, error: viewsError } = await supabase
          .from("slide_views")
          .select("*")
          .in("slide_id", slideshows?.map((s) => s.id) || []);

        // Get real play data from analytics_events table
        const { data: playEvents, error: playError } = await supabase
          .from("analytics_events")
          .select("*")
          .eq("business_id", businessId)
          .eq("event_type", "slideshow_play");

        // Calculate basic stats from real data
        const totalSlideshows = slideshows?.length || 0;
        const activeSlideshows =
          slideshows?.filter((s) => s.is_active).length || 0;
        const totalPlays = playEvents?.length || 0;
        const totalViews = slideViews?.length || 0;

        // Get real monthly activity from analytics_events table
        const { data: analyticsEvents, error: analyticsError } = await supabase
          .from("analytics_events")
          .select("*")
          .eq("business_id", businessId)
          .gte(
            "occurred_at",
            new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
          ); // Last 6 months

        // Process monthly activity from real data
        const monthlyActivity: {
          month: string;
          plays: number;
          views: number;
        }[] = [];
        const monthlyData: { [key: string]: { plays: number; views: number } } =
          {};

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          monthlyData[monthKey] = { plays: 0, views: 0 };
        }

        // Process real analytics events
        if (analyticsEvents) {
          analyticsEvents.forEach((event) => {
            const eventDate = new Date(event.occurred_at);
            const monthKey = eventDate.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });

            if (monthlyData[monthKey]) {
              if (event.event_type === "slideshow_play") {
                monthlyData[monthKey].plays++;
              } else if (event.event_type === "slide_view") {
                monthlyData[monthKey].views++;
              }
            }
          });
        }

        // Convert to array format
        Object.entries(monthlyData).forEach(([month, data]) => {
          monthlyActivity.push({
            month,
            plays: data.plays,
            views: data.views,
          });
        });

        // Get real slideshow performance data
        const slideshowStats = await Promise.all(
          (slideshows || []).map(async (slideshow) => {
            // Get plays for this slideshow
            const { data: slideshowPlays } = await supabase
              .from("analytics_events")
              .select("*")
              .eq("business_id", businessId)
              .eq("event_type", "slideshow_play")
              .contains("event_data", { slideshow_id: slideshow.id });

            // Get views for this slideshow's slides
            const { data: slideshowViews } = await supabase
              .from("slide_views")
              .select("*")
              .in(
                "slide_id",
                slideshow.slides?.map((slide: any) => slide.id) || []
              );

            return {
              id: slideshow.id,
              name: slideshow.name || slideshow.title,
              plays: slideshowPlays?.length || 0,
              views: slideshowViews?.length || 0,
            };
          })
        );

        // Top slideshows by plays
        const topSlideshows = slideshowStats
          .sort((a, b) => b.plays - a.plays)
          .slice(0, 5);

        // Get real recent activity from analytics_events table
        const { data: recentEvents, error: eventsError } = await supabase
          .from("analytics_events")
          .select("*")
          .eq("business_id", businessId)
          .order("occurred_at", { ascending: false })
          .limit(10);

        // Process recent activity from real events
        const recentActivity = (recentEvents || []).map((event) => {
          let description = "";
          let type = event.event_type;

          switch (event.event_type) {
            case "slideshow_play":
              description = `Slideshow played`;
              break;
            case "slide_view":
              description = `Slide viewed`;
              break;
            case "slideshow_created":
              description = `New slideshow created`;
              break;
            case "slideshow_updated":
              description = `Slideshow updated`;
              break;
            default:
              description = `${event.event_type} event`;
          }

          return {
            id: event.id,
            type,
            description,
            timestamp: event.occurred_at,
          };
        });

        setAnalytics({
          totalSlideshows,
          totalPlays,
          totalViews,
          activeSlideshows,
          monthlyActivity,
          topSlideshows,
          recentActivity,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [businessId, dateRange]);

  const handleRefresh = () => {
    if (businessId) {
      setLoading(true);
      // Re-fetch data by triggering the useEffect
      const fetchAnalytics = async () => {
        try {
          setError(null);

          // Fetch slideshows for this business
          const { data: slideshows, error: slideshowsError } = await supabase
            .from("slideshows")
            .select("*")
            .eq("business_id", businessId);

          if (slideshowsError) {
            throw new Error("Failed to fetch slideshows");
          }

          // Get real view data from slide_views table
          const { data: slideViews, error: viewsError } = await supabase
            .from("slide_views")
            .select("*")
            .in("slide_id", slideshows?.map((s) => s.id) || []);

          // Get real play data from analytics_events table
          const { data: playEvents, error: playError } = await supabase
            .from("analytics_events")
            .select("*")
            .eq("business_id", businessId)
            .eq("event_type", "slideshow_play");

          // Calculate basic stats from real data
          const totalSlideshows = slideshows?.length || 0;
          const activeSlideshows =
            slideshows?.filter((s) => s.is_active).length || 0;
          const totalPlays = playEvents?.length || 0;
          const totalViews = slideViews?.length || 0;

          // Get real monthly activity from analytics_events table
          const { data: analyticsEvents, error: analyticsError } =
            await supabase
              .from("analytics_events")
              .select("*")
              .eq("business_id", businessId)
              .gte(
                "occurred_at",
                new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
              ); // Last 6 months

          // Process monthly activity from real data
          const monthlyActivity: {
            month: string;
            plays: number;
            views: number;
          }[] = [];
          const monthlyData: {
            [key: string]: { plays: number; views: number };
          } = {};

          // Initialize last 6 months
          for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
            monthlyData[monthKey] = { plays: 0, views: 0 };
          }

          // Process real analytics events
          if (analyticsEvents) {
            analyticsEvents.forEach((event) => {
              const eventDate = new Date(event.occurred_at);
              const monthKey = eventDate.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              });

              if (monthlyData[monthKey]) {
                if (event.event_type === "slideshow_play") {
                  monthlyData[monthKey].plays++;
                } else if (event.event_type === "slide_view") {
                  monthlyData[monthKey].views++;
                }
              }
            });
          }

          // Convert to array format
          Object.entries(monthlyData).forEach(([month, data]) => {
            monthlyActivity.push({
              month,
              plays: data.plays,
              views: data.views,
            });
          });

          // Get real slideshow performance data
          const slideshowStats = await Promise.all(
            (slideshows || []).map(async (slideshow) => {
              // Get plays for this slideshow
              const { data: slideshowPlays } = await supabase
                .from("analytics_events")
                .select("*")
                .eq("business_id", businessId)
                .eq("event_type", "slideshow_play")
                .contains("event_data", { slideshow_id: slideshow.id });

              // Get views for this slideshow's slides
              const { data: slideshowViews } = await supabase
                .from("slide_views")
                .select("*")
                .in(
                  "slide_id",
                  slideshow.slides?.map((slide: any) => slide.id) || []
                );

              return {
                id: slideshow.id,
                name: slideshow.name || slideshow.title,
                plays: slideshowPlays?.length || 0,
                views: slideshowViews?.length || 0,
              };
            })
          );

          // Top slideshows by plays
          const topSlideshows = slideshowStats
            .sort((a, b) => b.plays - a.plays)
            .slice(0, 5);

          // Get real recent activity from analytics_events table
          const { data: recentEvents, error: eventsError } = await supabase
            .from("analytics_events")
            .select("*")
            .eq("business_id", businessId)
            .order("occurred_at", { ascending: false })
            .limit(10);

          // Process recent activity from real events
          const recentActivity = (recentEvents || []).map((event) => {
            let description = "";
            let type = event.event_type;

            switch (event.event_type) {
              case "slideshow_play":
                description = `Slideshow played`;
                break;
              case "slide_view":
                description = `Slide viewed`;
                break;
              case "slideshow_created":
                description = `New slideshow created`;
                break;
              case "slideshow_updated":
                description = `Slideshow updated`;
                break;
              default:
                description = `${event.event_type} event`;
            }

            return {
              id: event.id,
              type,
              description,
              timestamp: event.occurred_at,
            };
          });

          setAnalytics({
            totalSlideshows,
            totalPlays,
            totalViews,
            activeSlideshows,
            monthlyActivity,
            topSlideshows,
            recentActivity,
          });
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch analytics"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchAnalytics();
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading analytics
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (!analytics) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No analytics data
            </h3>
            <p className="text-gray-600">
              Create some slideshows to see analytics
            </p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics - AfghanView</title>
        <meta
          name="description"
          content="View your slideshow analytics and performance"
        />
      </Head>

      <ClientLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Track your slideshow performance and engagement
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Slideshows
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.totalSlideshows}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Slideshows
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.activeSlideshows}
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
                    Total Plays
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.totalPlays}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.totalViews}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Activity Chart */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Activity
              </h3>
              <div className="space-y-4">
                {analytics.monthlyActivity.map((month, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">{month.month}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {month.plays} plays
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {month.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Slideshows */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Performing Slideshows
              </h3>
              <div className="space-y-4">
                {analytics.topSlideshows.map((slideshow, index) => (
                  <div
                    key={slideshow.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {slideshow.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {slideshow.plays} plays
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {slideshow.views}
                      </p>
                      <p className="text-xs text-gray-600">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    </>
  );
}

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import AdminLayout from "../layout";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Image as ImageIcon,
  Eye,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Filter,
  RefreshCw,
  Star,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

interface AnalyticsData {
  totalRestaurants: number;
  activeRestaurants: number;
  totalSlides: number;
  totalViews: number;
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  topRestaurants: Array<{
    id: string;
    name: string;
    views: number;
    slides: number;
    revenue: number;
  }>;
  viewsByDevice: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  viewsByLocation: Array<{
    city: string;
    state: string;
    views: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    restaurant: {
      name: string;
    };
  }>;
}

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, refreshKey]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch basic stats
      const [restaurantsResult, slidesResult, viewsResult, revenueResult] =
        await Promise.all([
          supabase.from("restaurants").select("id, is_active"),
          supabase.from("slides").select("id, restaurant_id"),
          supabase.from("slide_views").select("id, session_id, viewed_at"),
          supabase.from("billing_history").select("amount, status, created_at"),
        ]);

      // Calculate basic metrics
      const totalRestaurants = restaurantsResult.data?.length || 0;
      const activeRestaurants =
        restaurantsResult.data?.filter((r) => r.is_active).length || 0;
      const totalSlides = slidesResult.data?.length || 0;
      const totalViews = viewsResult.data?.length || 0;

      // Calculate revenue
      const totalRevenue =
        revenueResult.data?.reduce(
          (sum, item) => (item.status === "paid" ? sum + item.amount : sum),
          0
        ) || 0;

      // Get monthly revenue
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyRevenue =
        revenueResult.data
          ?.filter(
            (item) =>
              new Date(item.created_at) >= thirtyDaysAgo &&
              item.status === "paid"
          )
          .reduce((sum, item) => sum + item.amount, 0) || 0;

      // Get top restaurants
      const restaurantViews: { [key: string]: number } = {};
      viewsResult.data?.forEach((view) => {
        if (restaurantViews[view.session_id]) {
          restaurantViews[view.session_id]++;
        } else {
          restaurantViews[view.session_id] = 1;
        }
      });

      const topRestaurants = Object.entries(restaurantViews)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([restaurantId, views]) => ({
          id: restaurantId,
          name: `Restaurant ${restaurantId.slice(0, 8)}`,
          views: views as number,
          slides:
            slidesResult.data?.filter((s) => s.restaurant_id === restaurantId)
              .length || 0,
          revenue: Math.floor(Math.random() * 1000) + 100, // Mock revenue data
        }));

      // Mock device data
      const viewsByDevice = {
        desktop: Math.floor(totalViews * 0.4),
        mobile: Math.floor(totalViews * 0.5),
        tablet: Math.floor(totalViews * 0.1),
      };

      // Mock location data
      const viewsByLocation = [
        { city: "New York", state: "NY", views: Math.floor(totalViews * 0.3) },
        {
          city: "Los Angeles",
          state: "CA",
          views: Math.floor(totalViews * 0.25),
        },
        { city: "Chicago", state: "IL", views: Math.floor(totalViews * 0.2) },
        { city: "Houston", state: "TX", views: Math.floor(totalViews * 0.15) },
        { city: "Phoenix", state: "AZ", views: Math.floor(totalViews * 0.1) },
      ];

      // Mock recent activity
      const recentActivity = [
        {
          id: "1",
          type: "restaurant_added",
          description: "New restaurant registered",
          timestamp: new Date().toISOString(),
          restaurant: { name: "Afghan Palace" },
        },
        {
          id: "2",
          type: "slide_created",
          description: "New slide created",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          restaurant: { name: "Kabul Kitchen" },
        },
        {
          id: "3",
          type: "subscription_upgraded",
          description: "Subscription upgraded to Premium",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          restaurant: { name: "Afghan Delight" },
        },
      ];

      setAnalytics({
        totalRestaurants,
        activeRestaurants,
        totalSlides,
        totalViews,
        totalRevenue,
        monthlyRevenue,
        revenueGrowth: 12.5, // Mock growth
        topRestaurants,
        viewsByDevice,
        viewsByLocation,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "restaurant_added":
        return <Building className="h-4 w-4 text-green-500" />;
      case "slide_created":
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case "subscription_upgraded":
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading || !analytics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-afghan-green"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Head>
          <title>Analytics - Admin Dashboard</title>
          <meta name="description" content="Analytics dashboard" />
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                System-wide performance metrics and insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-afghan-green focus:border-afghan-green"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Restaurants
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalRestaurants}
                  </p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {analytics.activeRestaurants} active
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ImageIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Slides
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalSlides}
                  </p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15% this month
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8.2% this month
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analytics.monthlyRevenue.toLocaleString()}
                  </p>
                  <p
                    className={`text-sm flex items-center ${
                      analytics.revenueGrowth >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {analytics.revenueGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(analytics.revenueGrowth)}% vs last month
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performing Restaurants */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Top Performing Restaurants
              </h2>
              <div className="space-y-4">
                {analytics.topRestaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-afghan-green flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {restaurant.slides} slides
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {restaurant.views.toLocaleString()} views
                      </p>
                      <p className="text-sm text-gray-500">
                        ${restaurant.revenue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Analytics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Views by Device
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Desktop</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.viewsByDevice.desktop.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Mobile</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.viewsByDevice.mobile.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tablet className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700">Tablet</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.viewsByDevice.tablet.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Analytics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Views by Location
              </h2>
              <div className="space-y-3">
                {analytics.viewsByLocation.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {location.city}, {location.state}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {location.views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.restaurant.name} •{" "}
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Revenue Trends
            </h2>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">
                  Revenue chart will be displayed here
                </p>
                <p className="text-sm text-gray-400">
                  Integration with charting library needed
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

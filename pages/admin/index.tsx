import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye,
  Clock,
  TrendingUp,
  Users,
  Plus,
  Image,
  Settings,
  ArrowUpRight,
  Calendar,
  BarChart3,
  Building,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import AdminLayout from "./layout";
import { db, Restaurant, Slide } from "@/lib/supabase";
import { useAuth } from "../../lib/auth";
import { ProtectedRoute } from "../../components/auth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalSlides: 0,
    activeSlides: 0,
    lockedSlides: 0,
  });
  const [totalSlides, setTotalSlides] = useState(0);
  const [recentSlides, setRecentSlides] = useState<Slide[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch restaurants
      const restaurantsData = await db.getRestaurants();
      setRestaurants(restaurantsData);

      // Fetch all slides
      const allSlides: Slide[] = [];
      for (const restaurant of restaurantsData) {
        try {
          const restaurantSlides = await db.getSlides(restaurant.id);
          allSlides.push(...restaurantSlides);
        } catch (error) {
          console.error(
            `Error fetching slides for restaurant ${restaurant.id}:`,
            error
          );
        }
      }
      setSlides(allSlides);

      // Calculate stats
      const activeRestaurants = restaurantsData.filter(
        (r) => r.is_active
      ).length;
      const activeSlides = allSlides.filter((s) => s.is_active).length;
      const lockedSlides = allSlides.filter((s) => s.is_locked).length;

      setStats({
        totalRestaurants: restaurantsData.length,
        activeRestaurants,
        totalSlides: allSlides.length,
        activeSlides,
        lockedSlides,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleToggleRestaurantStatus = async (restaurantId: string) => {
    try {
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      if (!restaurant) return;

      await db.updateRestaurant(restaurantId, {
        is_active: !restaurant.is_active,
      });

      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error("Error toggling restaurant status:", error);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this restaurant? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await db.deleteRestaurant(restaurantId);
      await fetchDashboardData();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case "starter":
        return "bg-blue-100 text-blue-800";
      case "professional":
        return "bg-green-100 text-green-800";
      case "unlimited":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSlideUsage = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    const restaurantSlides = slides.filter(
      (s) => s.restaurant_id === restaurantId
    );

    if (!restaurant) return { used: 0, limit: 0, percentage: 0 };

    const used = restaurantSlides.length;
    const limit = restaurant.slide_limit;
    const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;

    return { used, limit, percentage };
  };

  const dashboardStats = [
    {
      name: "Total Restaurants",
      value: stats.totalRestaurants.toString(),
      change: `+${stats.totalRestaurants}`,
      changeType: "positive" as const,
      icon: Building,
    },
    {
      name: "Active Restaurants",
      value: stats.activeRestaurants.toString(),
      change: `${stats.activeRestaurants}/${stats.totalRestaurants}`,
      changeType: "positive" as const,
      icon: CheckCircle,
    },
    {
      name: "Total Slides",
      value: stats.totalSlides.toString(),
      change: `+${stats.totalSlides}`,
      changeType: "positive" as const,
      icon: Image,
    },
    {
      name: "Active Slides",
      value: stats.activeSlides.toString(),
      change: `${stats.activeSlides}/${stats.totalSlides}`,
      changeType: "positive" as const,
      icon: Eye,
    },
  ];

  const handleViewAnalytics = () => {
    window.open("/admin/analytics", "_blank");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-afghan-green"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Head>
          <title>Admin Dashboard - ShivehView</title>
          <meta name="description" content="Admin dashboard for ShivehView" />
        </Head>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.email || "Admin"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <Link
                href="/admin/restaurants/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-8 w-8 text-afghan-green" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Restaurants Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Restaurants
                </h2>
                <Link
                  href="/admin/restaurants"
                  className="text-afghan-green hover:text-afghan-green-dark text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slides
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {restaurants.slice(0, 5).map((restaurant) => {
                    const slideUsage = getSlideUsage(restaurant.id);
                    return (
                      <tr key={restaurant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {restaurant.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {restaurant.address}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPackageColor(
                              restaurant.package_type
                            )}`}
                          >
                            {restaurant.package_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {slideUsage.used}/{slideUsage.limit}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${
                                slideUsage.percentage > 80
                                  ? "bg-red-500"
                                  : slideUsage.percentage > 60
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  slideUsage.percentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {restaurant.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/admin/restaurants/${restaurant.id}`}
                              className="text-afghan-green hover:text-afghan-green-dark"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() =>
                                handleToggleRestaurantStatus(restaurant.id)
                              }
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {restaurant.is_active ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteRestaurant(restaurant.id)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Slides */}
          <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Slides
                </h2>
                <Link
                  href="/admin/slides"
                  className="text-afghan-green hover:text-afghan-green-dark text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slide
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slides.slice(0, 5).map((slide) => {
                    const restaurant = restaurants.find(
                      (r) => r.id === slide.restaurant_id
                    );
                    return (
                      <tr key={slide.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {slide.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {slide.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {restaurant?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {slide.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {slide.is_active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </span>
                            )}
                            {slide.is_locked && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Locked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(slide.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

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
} from "lucide-react";
import AdminLayout from "./layout";
import { db, Restaurant, Slide } from "@/lib/supabase";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [slides, setSlides] = useState<{ [key: string]: Slide[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  // Mock data for now - replace with actual API calls
  const mockRestaurants: Restaurant[] = [
    {
      id: "1",
      name: "Afghan Palace",
      description: "Authentic Afghan Cuisine",
      address: "123 Main Street, New York",
      phone: "(555) 123-4567",
      website: "www.afghanpalace.com",
      owner_email: "owner@afghanpalace.com",
      package_type: "professional",
      slide_limit: 3,
      is_active: true,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "Kabul Kitchen",
      description: "Traditional Afghan Flavors",
      address: "456 Oak Avenue, Los Angeles",
      phone: "(555) 987-6543",
      website: "www.kabulkitchen.com",
      owner_email: "owner@kabulkitchen.com",
      package_type: "starter",
      slide_limit: 1,
      is_active: true,
      created_at: "2024-01-10T10:00:00Z",
      updated_at: "2024-01-10T10:00:00Z",
    },
    {
      id: "3",
      name: "Afghan Delight",
      description: "Modern Afghan Dining",
      address: "789 Pine Street, Chicago",
      phone: "(555) 456-7890",
      website: "www.afghandelight.com",
      owner_email: "owner@afghandelight.com",
      package_type: "unlimited",
      slide_limit: 999,
      is_active: false,
      created_at: "2024-01-05T10:00:00Z",
      updated_at: "2024-01-05T10:00:00Z",
    },
  ];

  const mockSlides: { [key: string]: Slide[] } = {
    "1": [
      {
        id: "1",
        restaurant_id: "1",
        type: "image",
        title: "Welcome to Afghan Palace",
        subtitle: "Authentic Afghan Cuisine & Culture",
        image_url:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        duration: 6000,
        order_index: 1,
        is_active: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        restaurant_id: "1",
        type: "menu",
        title: "Today's Specials",
        subtitle: "Fresh & Authentic",
        content: "🍚 Kabuli Pulao - $22.99\n🥟 Mantu Dumplings - $18.99",
        duration: 8000,
        order_index: 2,
        is_active: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      },
      {
        id: "3",
        restaurant_id: "1",
        type: "promo",
        title: "Weekend Special",
        subtitle: "Family Feast Package",
        content: "Get 20% off on orders over $50",
        duration: 7000,
        order_index: 3,
        is_active: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      },
    ],
    "2": [
      {
        id: "4",
        restaurant_id: "2",
        type: "image",
        title: "Welcome to Kabul Kitchen",
        subtitle: "Traditional Afghan Flavors",
        image_url:
          "https://images.unsplash.com/photo-1542810634-71277d95dcbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        duration: 6000,
        order_index: 1,
        is_active: true,
        created_at: "2024-01-10T10:00:00Z",
        updated_at: "2024-01-10T10:00:00Z",
      },
    ],
    "3": [],
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRestaurants(mockRestaurants);
      setSlides(mockSlides);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    {
      name: "Total Restaurants",
      value: restaurants.length.toString(),
      change: "+2",
      changeType: "positive",
      icon: Building,
    },
    {
      name: "Active Restaurants",
      value: restaurants.filter((r) => r.is_active).length.toString(),
      change: "+1",
      changeType: "positive",
      icon: CheckCircle,
    },
    {
      name: "Total Slides",
      value: Object.values(slides).flat().length.toString(),
      change: "+5",
      changeType: "positive",
      icon: Image,
    },
    {
      name: "Revenue This Month",
      value: "$2,847",
      change: "+12%",
      changeType: "positive",
      icon: TrendingUp,
    },
  ];

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
    const restaurantSlides = slides[restaurantId] || [];
    const activeSlides = restaurantSlides.filter((s) => s.is_active);

    return {
      total: restaurantSlides.length,
      active: activeSlides.length,
      limit: restaurant?.slide_limit || 0,
      usage: restaurant
        ? Math.round((restaurantSlides.length / restaurant.slide_limit) * 100)
        : 0,
    };
  };

  const handleToggleRestaurantStatus = (restaurantId: string) => {
    setRestaurants(
      restaurants.map((r) =>
        r.id === restaurantId ? { ...r, is_active: !r.is_active } : r
      )
    );
  };

  const handleDeleteRestaurant = (restaurantId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this restaurant? This action cannot be undone."
      )
    ) {
      setRestaurants(restaurants.filter((r) => r.id !== restaurantId));
      const newSlides = { ...slides };
      delete newSlides[restaurantId];
      setSlides(newSlides);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <>
        <Head>
          <title>Admin Dashboard - AfghanView</title>
          <meta
            name="description"
            content="Admin dashboard for managing all restaurants"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <AdminLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Manage all restaurants and their slideshow content.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.name}
                    className="bg-white overflow-hidden shadow rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Icon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {stat.name}
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">
                                {stat.value}
                              </div>
                              <div
                                className={`ml-2 flex items-baseline text-sm font-semibold ${
                                  stat.changeType === "positive"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4" />
                                <span className="sr-only">
                                  {stat.changeType === "positive"
                                    ? "Increased"
                                    : "Decreased"}{" "}
                                  by
                                </span>
                                {stat.change}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Restaurants Table */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    All Restaurants
                  </h3>
                  <motion.button
                    className="bg-afghan-green text-white px-4 py-2 rounded-lg hover:bg-afghan-green/90 transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Restaurant
                  </motion.button>
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
                          Slides Usage
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
                      {restaurants.map((restaurant, index) => {
                        const usage = getSlideUsage(restaurant.id);
                        return (
                          <motion.tr
                            key={restaurant.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-afghan-green flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                      {restaurant.name.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {restaurant.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {restaurant.owner_email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPackageColor(
                                  restaurant.package_type
                                )}`}
                              >
                                {restaurant.package_type
                                  .charAt(0)
                                  .toUpperCase() +
                                  restaurant.package_type.slice(1)}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {restaurant.slide_limit} slides
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 mr-2">
                                  <div className="text-sm text-gray-900">
                                    {usage.active}/{usage.limit} active
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        usage.usage > 100
                                          ? "bg-red-500"
                                          : usage.usage > 80
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                      }`}
                                      style={{
                                        width: `${Math.min(usage.usage, 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                {usage.usage > 100 && (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  restaurant.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {restaurant.is_active ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {restaurant.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Link
                                  href={`/admin/restaurants/${restaurant.id}`}
                                  className="text-afghan-green hover:text-afghan-green/80"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/restaurant/${restaurant.id}`}
                                  target="_blank"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() =>
                                    handleToggleRestaurantStatus(restaurant.id)
                                  }
                                  className={`${
                                    restaurant.is_active
                                      ? "text-red-600 hover:text-red-800"
                                      : "text-green-600 hover:text-green-800"
                                  }`}
                                >
                                  {restaurant.is_active ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteRestaurant(restaurant.id)
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </>
    </ProtectedRoute>
  );
}

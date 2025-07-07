import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import AdminLayout from "../layout";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Star,
  Settings,
  Building,
  Users,
  Calendar,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Package,
  CreditCard,
  Activity,
  Grid,
  List,
  Download,
  Upload,
  Lock,
  Unlock,
  Share2,
  ExternalLink,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisine_type: string;
  address: any;
  contact_info: any;
  business_hours: any;
  social_media: any;
  branding: any;
  settings: any;
  is_active: boolean;
  is_verified: boolean;
  verified_at: string;
  created_at: string;
  updated_at: string;
  organization: {
    id: string;
    name: string;
  };
  created_by_user: {
    first_name: string;
    last_name: string;
  };
  subscription: {
    id: string;
    status: string;
    plan: {
      name: string;
    };
  };
  slides_count: number;
  views_count: number;
}

export default function AdminRestaurants() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select(
          `
          *,
          organization:organizations(id, name),
          created_by_user:users!restaurants_created_by_fkey(first_name, last_name),
          subscription:restaurant_subscriptions(
            id,
            status,
            plan:subscription_plans(name)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get additional stats for each restaurant
      const restaurantsWithStats = await Promise.all(
        (data || []).map(async (restaurant) => {
          const [slidesResult, viewsResult] = await Promise.all([
            supabase
              .from("slides")
              .select("id", { count: "exact" })
              .eq("restaurant_id", restaurant.id),
            supabase
              .from("slide_views")
              .select("id", { count: "exact" })
              .eq("session_id", restaurant.id), // This would need to be adjusted based on your schema
          ]);

          return {
            ...restaurant,
            slides_count: slidesResult.count || 0,
            views_count: viewsResult.count || 0,
          };
        })
      );

      setRestaurants(restaurantsWithStats);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine =
      selectedCuisine === "all" || restaurant.cuisine_type === selectedCuisine;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && restaurant.is_active) ||
      (selectedStatus === "verified" && restaurant.is_verified);
    const matchesSubscription =
      selectedSubscription === "all" ||
      (selectedSubscription === "active" &&
        restaurant.subscription?.status === "active") ||
      (selectedSubscription === "trial" &&
        restaurant.subscription?.status === "trial");

    return (
      matchesSearch && matchesCuisine && matchesStatus && matchesSubscription
    );
  });

  const handleBulkAction = async () => {
    if (!selectedRestaurants.length || !bulkAction) return;

    try {
      switch (bulkAction) {
        case "activate":
          await supabase
            .from("restaurants")
            .update({ is_active: true })
            .in("id", selectedRestaurants);
          break;
        case "deactivate":
          await supabase
            .from("restaurants")
            .update({ is_active: false })
            .in("id", selectedRestaurants);
          break;
        case "verify":
          await supabase
            .from("restaurants")
            .update({
              is_verified: true,
              verified_at: new Date().toISOString(),
            })
            .in("id", selectedRestaurants);
          break;
        case "delete":
          await supabase
            .from("restaurants")
            .delete()
            .in("id", selectedRestaurants);
          break;
      }

      setSelectedRestaurants([]);
      setBulkAction("");
      fetchRestaurants();
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const getStatusColor = (restaurant: Restaurant) => {
    if (!restaurant.is_active) return "bg-red-100 text-red-800";
    if (!restaurant.is_verified) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusIcon = (restaurant: Restaurant) => {
    if (!restaurant.is_active) return <XCircle className="h-4 w-4" />;
    if (!restaurant.is_verified) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = (restaurant: Restaurant) => {
    if (!restaurant.is_active) return "Inactive";
    if (!restaurant.is_verified) return "Pending";
    return "Active";
  };

  if (loading) {
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
          <title>Restaurants Management - ShivehView Admin</title>
          <meta
            name="description"
            content="Manage all restaurants in the system"
          />
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Restaurants Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all restaurants and their subscriptions
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin/restaurants/add"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Link>
              <Link
                href="/admin/restaurants/packages"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
              >
                <Package className="h-4 w-4 mr-2" />
                Packages
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    {restaurants.length}
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
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {restaurants.filter((r) => r.is_active).length}
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
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {restaurants.filter((r) => r.is_verified).length}
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
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {restaurants
                      .reduce((sum, r) => sum + r.views_count, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search restaurants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-afghan-green focus:border-afghan-green"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-afghan-green text-white"
                        : "text-gray-500"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-afghan-green text-white"
                        : "text-gray-500"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuisine Type
                    </label>
                    <select
                      value={selectedCuisine}
                      onChange={(e) => setSelectedCuisine(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    >
                      <option value="all">All Cuisines</option>
                      <option value="afghan">Afghan</option>
                      <option value="middle-eastern">Middle Eastern</option>
                      <option value="mediterranean">Mediterranean</option>
                      <option value="indian">Indian</option>
                      <option value="pakistani">Pakistani</option>
                      <option value="turkish">Turkish</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription
                    </label>
                    <select
                      value={selectedSubscription}
                      onChange={(e) => setSelectedSubscription(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    >
                      <option value="all">All Subscriptions</option>
                      <option value="active">Active</option>
                      <option value="trial">Trial</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedRestaurants.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  {selectedRestaurants.length} restaurant(s) selected
                </p>
                <div className="flex items-center space-x-3">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="">Select Action</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
                    <option value="verify">Verify</option>
                    <option value="delete">Delete</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setSelectedRestaurants([])}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Restaurants Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            restaurant
                          )}`}
                        >
                          {getStatusIcon(restaurant)}
                          <span className="ml-1">
                            {getStatusText(restaurant)}
                          </span>
                        </span>
                        {restaurant.subscription?.status === "trial" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Trial
                          </span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedRestaurants.includes(restaurant.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRestaurants([
                              ...selectedRestaurants,
                              restaurant.id,
                            ]);
                          } else {
                            setSelectedRestaurants(
                              selectedRestaurants.filter(
                                (id) => id !== restaurant.id
                              )
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                      />
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {restaurant.name}
                    </h3>

                    {restaurant.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {restaurant.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">
                          {restaurant.address?.city},{" "}
                          {restaurant.address?.state}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Building className="h-4 w-4 mr-2" />
                        <span>
                          {restaurant.cuisine_type || "Not specified"}
                        </span>
                      </div>
                      {restaurant.contact_info?.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{restaurant.contact_info.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{restaurant.slides_count} slides</span>
                      <span>
                        {restaurant.views_count.toLocaleString()} views
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {restaurant.subscription?.plan && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Package className="h-3 w-3 mr-1" />
                            {restaurant.subscription.plan.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/admin/restaurants/${restaurant.id}`}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/restaurants/${restaurant.id}/edit`}
                          className="p-1 text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/restaurants/${restaurant.id}/slides`}
                          className="p-1 text-green-600 hover:text-green-900"
                        >
                          <Settings className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/display/${restaurant.slug}`}
                          target="_blank"
                          className="p-1 text-purple-600 hover:text-purple-900"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={
                            selectedRestaurants.length ===
                              filteredRestaurants.length &&
                            filteredRestaurants.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRestaurants(
                                filteredRestaurants.map((r) => r.id)
                              );
                            } else {
                              setSelectedRestaurants([]);
                            }
                          }}
                          className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Restaurant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRestaurants.map((restaurant) => (
                      <motion.tr
                        key={restaurant.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRestaurants.includes(
                              restaurant.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRestaurants([
                                  ...selectedRestaurants,
                                  restaurant.id,
                                ]);
                              } else {
                                setSelectedRestaurants(
                                  selectedRestaurants.filter(
                                    (id) => id !== restaurant.id
                                  )
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Building className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {restaurant.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {restaurant.cuisine_type || "Not specified"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {restaurant.address?.city},{" "}
                            {restaurant.address?.state}
                          </div>
                          <div className="text-sm text-gray-500">
                            {restaurant.contact_info?.phone || "No phone"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              restaurant
                            )}`}
                          >
                            {getStatusIcon(restaurant)}
                            <span className="ml-1">
                              {getStatusText(restaurant)}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {restaurant.subscription?.plan?.name || "No plan"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {restaurant.subscription?.status ||
                              "No subscription"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{restaurant.slides_count} slides</div>
                          <div>
                            {restaurant.views_count.toLocaleString()} views
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(restaurant.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/admin/restaurants/${restaurant.id}`}
                              className="text-afghan-green hover:text-afghan-green-dark"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/restaurants/${restaurant.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/restaurants/${restaurant.id}/slides`}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Settings className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/display/${restaurant.slug}`}
                              target="_blank"
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No restaurants found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ||
                selectedCuisine !== "all" ||
                selectedStatus !== "all" ||
                selectedSubscription !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Get started by adding a new restaurant."}
              </p>
              {!searchTerm &&
                selectedCuisine === "all" &&
                selectedStatus === "all" &&
                selectedSubscription === "all" && (
                  <div className="mt-6">
                    <Link
                      href="/admin/restaurants/add"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Restaurant
                    </Link>
                  </div>
                )}
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

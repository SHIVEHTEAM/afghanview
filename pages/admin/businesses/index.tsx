import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Building,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import AdminLayout from "../layout";

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  created_at: string;
  is_active: boolean;
  is_verified: boolean;
  subscription?: {
    id: string;
    status: string;
    plan: {
      name: string;
      slug: string;
    };
    current_period_end: string;
  };
  staff_count: number;
  slideshow_count: number;
  created_by: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default function AdminBusinesses() {
  const router = useRouter();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [user, filter, sortBy, sortOrder]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      console.log("Fetching businesses...");

      let query = supabase
        .from("businesses")
        .select(
          `
          id,
          name,
          slug,
          description,
          created_at,
          is_active,
          is_verified,
          category:business_categories(id, name, slug),
          subscription:business_subscriptions(
            id,
            status,
            current_period_end,
            plan:subscription_plans(name, slug)
          ),
          created_by:users!businesses_created_by_fkey(id, email, first_name, last_name)
        `
        )
        .order(sortBy, { ascending: sortOrder === "asc" });

      // Apply filters
      if (filter === "active") {
        query = query.eq("is_active", true);
      } else if (filter === "inactive") {
        query = query.eq("is_active", false);
      } else if (filter === "verified") {
        query = query.eq("is_verified", true);
      } else if (filter === "unverified") {
        query = query.eq("is_verified", false);
      }

      console.log("Executing businesses query...");
      const { data, error } = await query;

      if (error) {
        console.error("Businesses query error:", error);
        throw error;
      }

      console.log("Businesses query result:", data);

      // Get additional counts
      const businessesWithCounts = await Promise.all(
        (data || []).map(async (business) => {
          console.log("Processing business:", business.id);
          const [staffCount, slideshowCount] = await Promise.all([
            supabase
              .from("business_staff")
              .select("*", { count: "exact", head: true })
              .eq("business_id", business.id),
            supabase
              .from("slideshows")
              .select("*", { count: "exact", head: true })
              .eq("business_id", business.id),
          ]);

          return {
            ...business,
            // Fix the data structure - extract first item from arrays
            category: business.category?.[0] || { id: "", name: "", slug: "" },
            subscription: business.subscription?.[0] || null,
            created_by: business.created_by?.[0] || {
              id: "",
              email: "",
              first_name: "",
              last_name: "",
            },
            staff_count: staffCount.count || 0,
            slideshow_count: slideshowCount.count || 0,
          };
        })
      );

      console.log("Final businesses data:", businessesWithCounts);
      setBusinesses(businessesWithCounts as any);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!selectedBusiness) return;

    try {
      // Delete related records first
      await Promise.all([
        supabase
          .from("business_staff")
          .delete()
          .eq("business_id", selectedBusiness.id),
        supabase
          .from("slideshows")
          .delete()
          .eq("business_id", selectedBusiness.id),
        supabase.from("slides").delete().eq("business_id", selectedBusiness.id),
        supabase
          .from("business_subscriptions")
          .delete()
          .eq("business_id", selectedBusiness.id),
      ]);

      // Delete the business
      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", selectedBusiness.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setSelectedBusiness(null);
      fetchBusinesses();
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  const handleToggleStatus = async (businessId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ is_active: !isActive })
        .eq("id", businessId);

      if (error) throw error;
      fetchBusinesses();
    } catch (error) {
      console.error("Error updating business status:", error);
    }
  };

  const handleToggleVerification = async (
    businessId: string,
    isVerified: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          is_verified: !isVerified,
          verified_at: !isVerified ? new Date().toISOString() : null,
        })
        .eq("id", businessId);

      if (error) throw error;
      fetchBusinesses();
    } catch (error) {
      console.error("Error updating business verification:", error);
    }
  };

  const filteredBusinesses = businesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "expired":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Business Management - Admin Dashboard</title>
        <meta name="description" content="Manage businesses in AfghanView" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Business Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all businesses in the system
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchBusinesses}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/admin/businesses/new")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Business</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Businesses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Created Date</option>
                <option value="name">Name</option>
                <option value="is_active">Status</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {sortOrder === "asc" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Businesses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading businesses...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {business.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {business.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {business.category?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              business.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {business.is_active ? "Active" : "Inactive"}
                          </span>
                          {business.is_verified && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {business.subscription ? (
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                business.subscription.status
                              )}`}
                            >
                              {business.subscription.plan?.name ||
                                "Unknown Plan"}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {business.subscription.current_period_end
                                ? formatDate(
                                    business.subscription.current_period_end
                                  )
                                : "No end date"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No subscription
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{business.staff_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{business.slideshow_count}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(business.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/businesses/${business.id}`)
                            }
                            className="p-1 text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/businesses/${business.id}/edit`
                              )
                            }
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                business.id,
                                business.is_active
                              )
                            }
                            className={`p-1 ${
                              business.is_active
                                ? "text-red-600 hover:text-red-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                          >
                            {business.is_active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBusiness(business);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedBusiness && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Business
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete "
                          {selectedBusiness.name}"? This action cannot be undone
                          and will remove all associated data including staff,
                          slideshows, and subscriptions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleDeleteBusiness}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedBusiness(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

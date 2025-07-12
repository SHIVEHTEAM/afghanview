import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Users,
  Building,
  BarChart3,
  Settings,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Shield,
  Database,
  Server,
  Globe,
  Bell,
  Search,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import AdminLayout from "./layout";

interface DashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  totalSlideshows: number;
  totalSlides: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  systemHealth: string;
  recentActivity: any[];
}

interface Business {
  id: string;
  name: string;
  category: { name: string; slug: string };
  created_at: string;
  is_active: boolean;
  subscription?: {
    status: string;
    plan: { name: string };
  };
  staff_count: number;
  slideshow_count: number;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  is_active: boolean;
  business_count: number;
  last_login_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBusinesses: 0,
    totalSlideshows: 0,
    totalSlides: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    systemHealth: "Healthy",
    recentActivity: [],
  });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all stats
      const [
        { count: userCount },
        { count: businessCount },
        { count: slideshowCount },
        { count: slideCount },
        { count: subscriptionCount },
        { data: recentActivity },
        { data: businessData },
        { data: userData },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("*", { count: "exact", head: true }),
        supabase.from("slideshows").select("*", { count: "exact", head: true }),
        supabase.from("slides").select("*", { count: "exact", head: true }),
        supabase
          .from("business_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("analytics_events")
          .select("*")
          .order("occurred_at", { ascending: false })
          .limit(10),
        supabase
          .from("businesses")
          .select(
            `
            id,
            name,
            created_at,
            is_active,
            category:business_categories(name, slug),
            subscription:business_subscriptions(
              status,
              plan:subscription_plans(name)
            )
          `
          )
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Calculate monthly revenue (mock data for now)
      const monthlyRevenue = subscriptionCount * 29.99;

      setStats({
        totalUsers: userCount || 0,
        totalBusinesses: businessCount || 0,
        totalSlideshows: slideshowCount || 0,
        totalSlides: slideCount || 0,
        activeSubscriptions: subscriptionCount || 0,
        monthlyRevenue,
        systemHealth: "Healthy",
        recentActivity: recentActivity || [],
      });

      setBusinesses(businessData || []);
      setUsers(userData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const getSystemHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - AfghanView</title>
        <meta name="description" content="Admin dashboard for AfghanView" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          {/* Total Businesses */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Businesses
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalBusinesses.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Subscriptions
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeSubscriptions.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+15%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+23%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>

        {/* System Health & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* System Health */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                System Health
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getSystemHealthColor(
                  stats.systemHealth
                )}`}
              >
                {stats.systemHealth}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-sm font-medium text-green-600">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <span className="text-sm font-medium text-green-600">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage</span>
                <span className="text-sm font-medium text-green-600">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <span className="text-sm font-medium text-green-600">
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/admin/businesses")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Manage Businesses
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => router.push("/admin/users")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Manage Users
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => router.push("/admin/analytics")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">
                    View Analytics
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => router.push("/admin/settings")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    System Settings
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {activity.event_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(activity.occurred_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Businesses & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Businesses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Businesses
                </h3>
                <button
                  onClick={() => router.push("/admin/businesses")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {business.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {business.category?.name || "Business"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {formatDate(business.created_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {business.subscription?.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Users
                </h3>
                <button
                  onClick={() => router.push("/admin/users")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

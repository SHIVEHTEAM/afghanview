import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  BarChart3,
  TrendingUp,
  Users,
  Building,
  DollarSign,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  BarChart,
} from "lucide-react";

import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import AdminLayout from "../layout";

interface AnalyticsData {
  totalUsers: number;
  totalBusinesses: number;
  totalSlideshows: number;
  totalSlides: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  userGrowth: number;
  businessGrowth: number;
  revenueGrowth: number;
  topCategories: Array<{ name: string; count: number }>;
  recentActivity: Array<{ type: string; count: number; date: string }>;
  subscriptionStats: Array<{ plan: string; count: number; revenue: number }>;
}

export default function AdminAnalytics() {
  const router = useRouter();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalBusinesses: 0,
    totalSlideshows: 0,
    totalSlides: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    userGrowth: 0,
    businessGrowth: 0,
    revenueGrowth: 0,
    topCategories: [],
    recentActivity: [],
    subscriptionStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Fetch basic counts
      const [
        { count: userCount },
        { count: businessCount },
        { count: slideshowCount },
        { count: slideCount },
        { count: subscriptionCount },
        { data: categoryData },
        { data: activityData },
        { data: subscriptionData },
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
          .from("businesses")
          .select("category:business_categories(name)")
          .not("category", "is", null),
        supabase
          .from("analytics_events")
          .select("*")
          .gte("occurred_at", startDate.toISOString())
          .order("occurred_at", { ascending: false }),
        supabase
          .from("business_subscriptions")
          .select(
            `
            status,
            plan:subscription_plans(name, pricing)
          `
          )
          .eq("status", "active"),
      ]);

      // Process category data
      const categoryCounts = (categoryData || []).reduce((acc: any, item) => {
        const categoryName = (item as any).category?.name || "Unknown";
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {});

      const topCategories = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process activity data
      const activityCounts = (activityData || []).reduce((acc: any, item) => {
        const date = new Date(item.occurred_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, count: 0 };
        }
        acc[date].count += 1;
        return acc;
      }, {});

      const recentActivity = Object.values(activityCounts)
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .slice(0, 7);

      // Process subscription data
      const subscriptionCounts = (subscriptionData || []).reduce(
        (acc: any, item) => {
          const planName = (item as any).plan?.name || "Unknown";
          if (!acc[planName]) {
            acc[planName] = { plan: planName, count: 0, revenue: 0 };
          }
          acc[planName].count += 1;
          // Mock revenue calculation
          acc[planName].revenue += 29.99;
          return acc;
        },
        {}
      );

      const subscriptionStats = Object.values(subscriptionCounts);

      // Calculate growth rates (mock data for now)
      const userGrowth = 12.5;
      const businessGrowth = 8.3;
      const revenueGrowth = 23.1;

      // Calculate monthly revenue
      const monthlyRevenue = (subscriptionCount || 0) * 29.99;

      setAnalytics({
        totalUsers: userCount || 0,
        totalBusinesses: businessCount || 0,
        totalSlideshows: slideshowCount || 0,
        totalSlides: slideCount || 0,
        activeSubscriptions: subscriptionCount || 0,
        monthlyRevenue,
        userGrowth,
        businessGrowth,
        revenueGrowth,
        topCategories,
        recentActivity: recentActivity as any,
        subscriptionStats: subscriptionStats as any,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Analytics - Admin Dashboard</title>
        <meta
          name="description"
          content="Analytics and insights for Shivehview"
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive insights and metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(analytics.totalUsers)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600">
                    +{analytics.userGrowth}%
                  </span>
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
                      {formatNumber(analytics.totalBusinesses)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600">
                    +{analytics.businessGrowth}%
                  </span>
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
                      {formatNumber(analytics.activeSubscriptions)}
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
                      {formatCurrency(analytics.monthlyRevenue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600">
                    +{analytics.revenueGrowth}%
                  </span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Business Categories */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Business Categories
                  </h3>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {analytics.topCategories.map((category, index) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? "bg-blue-500"
                              : index === 1
                              ? "bg-green-500"
                              : index === 2
                              ? "bg-yellow-500"
                              : index === 3
                              ? "bg-purple-500"
                              : "bg-gray-500"
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {category.count} businesses
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscription Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Subscription Distribution
                  </h3>
                  <BarChart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {analytics.subscriptionStats.map((stat, index) => (
                    <div
                      key={stat.plan}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? "bg-blue-500"
                              : index === 1
                              ? "bg-green-500"
                              : index === 2
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {stat.plan}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {stat.count} users
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(stat.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
                <LineChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analytics.recentActivity.map((activity, index) => {
                  const maxCount = Math.max(
                    ...analytics.recentActivity.map((a) => a.count)
                  );
                  const height =
                    maxCount > 0 ? (activity.count / maxCount) * 100 : 0;

                  return (
                    <div
                      key={activity.date}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className="text-xs text-gray-500 mb-2">
                        {activity.count}
                      </div>
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(activity.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Play,
  Clock,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
} from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoute";
import ClientLayout from "./layout";

interface SlideImage {
  id: string;
  file: File;
  url: string;
  name: string;
}

interface SlideshowSettings {
  duration: number;
  transition: "fade" | "slide" | "zoom" | "flip" | "bounce";
  backgroundMusic?: File | string;
  musicVolume: number;
  musicLoop: boolean;
  autoPlay: boolean;
  showControls: boolean;
}

interface SavedSlideshow {
  id: string;
  images: SlideImage[];
  settings: SlideshowSettings;
  createdAt: Date;
  name: string;
  isActive: boolean;
  playCount: number;
  lastPlayed?: Date;
  isFavorite?: boolean;
  tags?: string[];
}

export default function AnalyticsPage() {
  const [savedSlideshows, setSavedSlideshows] = useState<SavedSlideshow[]>([]);

  // Load saved slideshows from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("client-slideshows");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedSlideshows(
          parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            lastPlayed: item.lastPlayed ? new Date(item.lastPlayed) : undefined,
            isFavorite: item.isFavorite || false,
            tags: item.tags || [],
          }))
        );
      } catch (error) {
        console.error("Error loading saved slideshows:", error);
      }
    }
  }, []);

  // Calculate analytics
  const totalSlideshows = savedSlideshows.length;
  const activeSlideshows = savedSlideshows.filter((s) => s.isActive).length;
  const totalImages = savedSlideshows.reduce(
    (acc, s) => acc + s.images.length,
    0
  );
  const totalPlays = savedSlideshows.reduce((acc, s) => acc + s.playCount, 0);
  const totalDuration = savedSlideshows.reduce(
    (acc, s) => acc + s.settings.duration,
    0
  );
  const averagePlaysPerSlideshow =
    totalSlideshows > 0 ? (totalPlays / totalSlideshows).toFixed(1) : "0";

  // Most popular slideshow
  const mostPopularSlideshow =
    savedSlideshows.length > 0
      ? savedSlideshows.reduce((prev, current) =>
          prev.playCount > current.playCount ? prev : current
        )
      : null;

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentActivity = savedSlideshows.filter(
    (s) => s.lastPlayed && s.lastPlayed > sevenDaysAgo
  ).length;

  // Transition usage
  const transitionStats =
    savedSlideshows.length > 0
      ? savedSlideshows.reduce((acc, s) => {
          acc[s.settings.transition] = (acc[s.settings.transition] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {};

  // Monthly activity (mock data for now)
  const monthlyData = [
    { month: "Jan", plays: 45, slideshows: 3 },
    { month: "Feb", plays: 67, slideshows: 4 },
    { month: "Mar", plays: 89, slideshows: 5 },
    { month: "Apr", plays: 123, slideshows: 6 },
    { month: "May", plays: 156, slideshows: 7 },
    { month: "Jun", plays: 189, slideshows: 8 },
  ];

  const stats = [
    {
      name: "Total Slideshows",
      value: totalSlideshows.toString(),
      change: "+2",
      changeType: "positive",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      name: "Active Slideshows",
      value: activeSlideshows.toString(),
      change: "+1",
      changeType: "positive",
      icon: Activity,
      color: "text-green-600",
    },
    {
      name: "Total Images",
      value: totalImages.toString(),
      change: "+15",
      changeType: "positive",
      icon: Eye,
      color: "text-purple-600",
    },
    {
      name: "Total Plays",
      value: totalPlays.toString(),
      change: "+8",
      changeType: "positive",
      icon: Play,
      color: "text-orange-600",
    },
    {
      name: "Avg Plays/Slideshow",
      value: averagePlaysPerSlideshow,
      change: "+12%",
      changeType: "positive",
      icon: Target,
      color: "text-indigo-600",
    },
    {
      name: "Recent Activity",
      value: recentActivity.toString(),
      change: "+3",
      changeType: "positive",
      icon: Calendar,
      color: "text-pink-600",
    },
  ];

  const topSlideshows =
    savedSlideshows.length > 0
      ? savedSlideshows.sort((a, b) => b.playCount - a.playCount).slice(0, 5)
      : [];

  return (
    <ProtectedRoute requiredRole="restaurant_owner">
      <ClientLayout>
        <Head>
          <title>Analytics - ShivehView</title>
          <meta name="description" content="View your slideshow analytics" />
        </Head>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track your slideshow performance and engagement
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {stats.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {item.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {item.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {item.changeType === "positive" ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        item.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gray-50 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Activity Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Monthly Activity
            </h3>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center">
                  <div className="w-12 text-sm text-gray-500">{data.month}</div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Plays: {data.plays}</span>
                      <span>Slideshows: {data.slideshows}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(data.plays / 200) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transition Usage */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Transition Usage
            </h3>
            <div className="space-y-3">
              {Object.entries(transitionStats).map(([transition, count]) => (
                <div
                  key={transition}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {transition}
                  </span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(count / totalSlideshows) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Slideshows */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Top Performing Slideshows
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {topSlideshows.length > 0 ? (
              topSlideshows.map((slideshow, index) => (
                <div key={slideshow.id} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {slideshow.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {slideshow.images.length} images •{" "}
                            {slideshow.settings.duration / 1000}s duration
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {slideshow.playCount} plays
                            </p>
                            <p className="text-sm text-gray-500">
                              {slideshow.lastPlayed
                                ? new Date(
                                    slideshow.lastPlayed
                                  ).toLocaleDateString()
                                : "Never played"}
                            </p>
                          </div>
                          {index === 0 && (
                            <Award className="h-5 w-5 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No data available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create some slideshows to see analytics here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8" />
              <div className="ml-4">
                <p className="text-sm font-medium">Total Duration</p>
                <p className="text-2xl font-bold">
                  {(totalDuration / 1000 / 60).toFixed(1)} min
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8" />
              <div className="ml-4">
                <p className="text-sm font-medium">Engagement Rate</p>
                <p className="text-2xl font-bold">
                  {totalSlideshows > 0
                    ? ((activeSlideshows / totalSlideshows) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8" />
              <div className="ml-4">
                <p className="text-sm font-medium">Avg. Performance</p>
                <p className="text-2xl font-bold">{averagePlaysPerSlideshow}</p>
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    </ProtectedRoute>
  );
}

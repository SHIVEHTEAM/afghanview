import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Play,
  Clock,
  Activity,
  Target,
  Star,
  Image,
  RefreshCw,
  Plus,
  Edit,
  Wifi,
} from "lucide-react";

interface StatCard {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  format: "number" | "currency" | "percentage" | "time";
  description?: string;
  target?: number;
  progress?: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatCard[]>([
    {
      id: "total-slideshows",
      title: "Total Slideshows",
      value: 24,
      change: 12.5,
      changeType: "increase",
      icon: <Image className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-100 to-pink-100",
      format: "number",
      description: "Created this month",
    },
    {
      id: "active-slideshows",
      title: "Active Slideshows",
      value: 8,
      change: 25.0,
      changeType: "increase",
      icon: <Play className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-100 to-emerald-100",
      format: "number",
      description: "Currently playing",
    },
    {
      id: "total-views",
      title: "Total Views",
      value: 15420,
      change: 8.3,
      changeType: "increase",
      icon: <Eye className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-100 to-cyan-100",
      format: "number",
      description: "This month",
    },
    {
      id: "connected-devices",
      title: "Connected Devices",
      value: 5,
      change: 0,
      changeType: "neutral",
      icon: <Activity className="w-6 h-6" />,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-100 to-red-100",
      format: "number",
      description: "All online",
    },
    {
      id: "customer-satisfaction",
      title: "Customer Satisfaction",
      value: 4.8,
      change: 2.1,
      changeType: "increase",
      icon: <Star className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-100 to-orange-100",
      format: "number",
      description: "Out of 5 stars",
      target: 5,
      progress: 96,
    },
    {
      id: "monthly-revenue",
      title: "Monthly Revenue",
      value: 2840,
      change: 15.7,
      changeType: "increase",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-100 to-teal-100",
      format: "currency",
      description: "This month",
    },
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [isLoading, setIsLoading] = useState(false);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case "percentage":
        return `${value}%`;
      case "time":
        return `${value}h`;
      default:
        if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
        if (value >= 1000) return (value / 1000).toFixed(1) + "K";
        return value.toString();
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return "text-green-600";
      case "decrease":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="w-4 h-4" />;
      case "decrease":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Here you would typically fetch new data based on the selected period
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Performance Overview
          </h2>
          <p className="text-gray-600 mt-1">
            Track your slideshow performance and business metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-2xl p-1">
            {[
              { id: "week", label: "Week" },
              { id: "month", label: "Month" },
              { id: "quarter", label: "Quarter" },
              { id: "year", label: "Year" },
            ].map((period) => (
              <motion.button
                key={period.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePeriodChange(period.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === period.id
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {period.label}
              </motion.button>
            ))}
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <div className={`text-${stat.color.split("-")[1]}-600`}>
                  {stat.icon}
                </div>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeColor(
                  stat.changeType
                )}`}
              >
                {getChangeIcon(stat.changeType)}
                <span>
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}%
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {stat.title}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {formatValue(stat.value, stat.format)}
                  </span>
                  {stat.target && (
                    <span className="text-sm text-gray-500">
                      / {stat.target}
                    </span>
                  )}
                </div>
                {stat.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {stat.description}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {stat.progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-800">
                      {stat.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                    />
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  View Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  <BarChart3 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Performance Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Performance Trend
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Views</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Engagement</span>
            </div>
          </div>
          <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-500">Interactive chart coming soon</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              {
                action: "New slideshow created",
                time: "2 minutes ago",
                icon: <Plus className="w-4 h-4" />,
                color: "text-green-600",
              },
              {
                action: "Device connected",
                time: "5 minutes ago",
                icon: <Wifi className="w-4 h-4" />,
                color: "text-blue-600",
              },
              {
                action: "Content updated",
                time: "1 hour ago",
                icon: <Edit className="w-4 h-4" />,
                color: "text-purple-600",
              },
              {
                action: "Analytics report generated",
                time: "2 hours ago",
                icon: <BarChart3 className="w-4 h-4" />,
                color: "text-orange-600",
              },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div
                  className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center ${activity.color}`}
                >
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {activity.action}
                  </p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Goals & Targets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Monthly Goals</h3>
            <p className="text-purple-100">
              Track your progress towards business objectives
            </p>
          </div>
          <Target className="w-12 h-12 text-white opacity-80" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              goal: "Create 30 slideshows",
              current: 24,
              target: 30,
              color: "from-green-400 to-emerald-400",
            },
            {
              goal: "Reach 20K views",
              current: 15420,
              target: 20000,
              color: "from-blue-400 to-cyan-400",
            },
            {
              goal: "Maintain 4.5+ rating",
              current: 4.8,
              target: 4.5,
              color: "from-yellow-400 to-orange-400",
            },
          ].map((goal, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4"
            >
              <h4 className="font-semibold mb-2">{goal.goal}</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{goal.current}</span>
                <span className="text-purple-200">/ {goal.target}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (goal.current / goal.target) * 100,
                      100
                    )}%`,
                  }}
                  transition={{ delay: 1 + index * 0.1, duration: 1 }}
                  className={`h-full bg-gradient-to-r ${goal.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

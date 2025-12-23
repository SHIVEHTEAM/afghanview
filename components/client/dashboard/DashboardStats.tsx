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
      title: "Content Collection",
      value: 24,
      change: 12.5,
      changeType: "increase",
      icon: <Image className="w-5 h-5" />,
      color: "text-black",
      bgColor: "bg-gray-50",
      format: "number",
      description: "ASSETS INITIALIZED",
    },
    {
      id: "active-slideshows",
      title: "Active Nodes",
      value: 8,
      change: 25.0,
      changeType: "increase",
      icon: <Play className="w-5 h-5" />,
      color: "text-black",
      bgColor: "bg-gray-50",
      format: "number",
      description: "LIVE BROADCASTS",
    },
    {
      id: "total-views",
      title: "Interaction Log",
      value: 15420,
      change: 8.3,
      changeType: "increase",
      icon: <Eye className="w-5 h-5" />,
      color: "text-black",
      bgColor: "bg-gray-50",
      format: "number",
      description: "QUARTERLY REACH",
    },
    {
      id: "connected-devices",
      title: "Network Status",
      value: 5,
      change: 0,
      changeType: "neutral",
      icon: <Activity className="w-5 h-5" />,
      color: "text-black",
      bgColor: "bg-gray-50",
      format: "number",
      description: "CONNECTED PORTS",
    },
    {
      id: "customer-satisfaction",
      title: "User Validation",
      value: 4.8,
      change: 2.1,
      changeType: "increase",
      icon: <Star className="w-5 h-5" />,
      color: "text-black",
      bgColor: "bg-gray-50",
      format: "number",
      description: "AGGREGATE RATING",
      target: 5,
      progress: 96,
    },
    {
      id: "monthly-revenue",
      title: "Ledger Delta",
      value: 2840,
      change: 15.7,
      changeType: "increase",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-black",
      bgColor: "bg-gray-50",
      format: "currency",
      description: "NET THROUGHPUT",
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

  const getChangeBadge = (changeType: string, change: number) => {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-black rounded-full font-bold">
        {changeType === "increase" ? (
          <TrendingUp className="w-3 h-3 text-white" />
        ) : changeType === "decrease" ? (
          <TrendingDown className="w-3 h-3 text-white" />
        ) : (
          <Activity className="w-3 h-3 text-white" />
        )}
        <span className="text-[10px] text-white">
          {change > 0 ? "+" : ""}
          {change}%
        </span>
      </div>
    );
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div>
          <h2 className="text-3xl font-bold text-black tracking-tight uppercase">
            Performance Vector
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mt-2">
            Real-time analytics and system monitoring
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Period Selector */}
          <div className="flex bg-gray-100/50 p-1.5 rounded-[1.5rem] border border-black/5">
            {[
              { id: "week", label: "W" },
              { id: "month", label: "M" },
              { id: "quarter", label: "Q" },
              { id: "year", label: "Y" },
            ].map((period) => (
              <motion.button
                key={period.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePeriodChange(period.id)}
                className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${selectedPeriod === period.id
                  ? "bg-white text-black shadow-sm"
                  : "text-black/40 hover:text-black"
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
            className="p-3.5 bg-black text-white rounded-full hover:bg-black/90 transition-all duration-300 shadow-xl shadow-black/10 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-black/[0.03] border border-black/5 group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                {stat.icon}
              </div>
              {getChangeBadge(stat.changeType, stat.change)}
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-black/40 mb-2">
                  {stat.title}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-black tracking-tighter">
                    {formatValue(stat.value, stat.format)}
                  </span>
                  {stat.target && (
                    <span className="text-xs font-bold text-black/20">
                      / {stat.target}
                    </span>
                  )}
                </div>
                {stat.description && (
                  <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mt-3">
                    {stat.description}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {stat.progress && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-black/40">Efficiency</span>
                    <span className="text-black">{stat.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1.5 }}
                      className="h-full bg-black rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t border-black/5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gray-50 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white rounded-xl transition-all duration-300"
                >
                  Protocol Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 bg-gray-50 text-black hover:bg-black hover:text-white rounded-xl transition-all duration-300"
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Performance Chart */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-black">
              System Overview
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                  Data Flow
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                  Nodes
                </span>
              </div>
            </div>
          </div>
          <div className="h-64 bg-gray-50/50 rounded-[2rem] border border-black/5 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            <div className="text-center relative z-10">
              <BarChart3 className="w-12 h-12 text-black/10 mx-auto mb-4 group-hover:scale-110 transition-transform duration-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
                Visualizing Active Protocols
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-black mb-10">
            Activity Log
          </h3>
          <div className="space-y-6">
            {[
              {
                action: "MODAL_INITIALIZED",
                time: "2 minutes ago",
                icon: <Plus className="w-4 h-4" />,
              },
              {
                action: "ENDPOINT_CONNECTED",
                time: "5 minutes ago",
                icon: <Wifi className="w-4 h-4" />,
              },
              {
                action: "RESOURCE_SYNCED",
                time: "1 hour ago",
                icon: <Edit className="w-4 h-4" />,
              },
              {
                action: "REPORT_GENERATED",
                time: "2 hours ago",
                icon: <BarChart3 className="w-4 h-4" />,
              },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-5 p-5 bg-gray-50 rounded-[1.5rem] hover:bg-black hover:group transition-all duration-500 group"
              >
                <div className="w-10 h-10 bg-white border border-black/5 rounded-xl flex items-center justify-center text-black group-hover:bg-white group-hover:scale-110 transition-all duration-500">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-black group-hover:text-white transition-colors">
                    {activity.action}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mt-1 group-hover:text-white/40 transition-colors">
                    {activity.time}
                  </p>
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
        className="bg-black rounded-[3rem] p-12 text-white shadow-2xl shadow-black/20 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tighter mb-2">
                Operational Objectives
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Quarterly roadmap and performance goals
              </p>
            </div>
            <Target className="w-12 h-12 text-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                goal: "RESOURCE_VOLUME",
                current: 24,
                target: 30,
              },
              {
                goal: "INTERACTION_QUOTA",
                current: 15420,
                target: 20000,
              },
              {
                goal: "TRUST_METRIC",
                current: 4.8,
                target: 4.5,
              },
            ].map((goal, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10"
              >
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
                  {goal.goal}
                </h4>
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-3xl font-bold tracking-tight">
                    {goal.current}
                  </span>
                  <span className="text-xs font-bold text-white/20">
                    / {goal.target}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        (goal.current / goal.target) * 100,
                        100
                      )}%`,
                    }}
                    transition={{ delay: 1 + index * 0.1, duration: 1.5 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

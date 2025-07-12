import React from "react";
import { motion } from "framer-motion";
import {
  Image,
  Tv,
  Crown,
  Building2,
  Activity,
  TrendingUp,
  Settings,
  Plus,
} from "lucide-react";

interface DashboardTabsProps {
  activeTab: "slideshows" | "tvs" | "premium" | "business";
  onTabChange: (tab: "slideshows" | "tvs" | "premium" | "business") => void;
}

const tabs = [
  {
    id: "slideshows" as const,
    label: "Slideshows",
    icon: <Image className="w-5 h-5" />,
    description: "Manage your content",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-100 to-pink-100",
    count: 24,
    badge: "New",
  },
  {
    id: "tvs" as const,
    label: "TV Management",
    icon: <Tv className="w-5 h-5" />,
    description: "Control your displays",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-100 to-cyan-100",
    count: 5,
    status: "online",
  },
  {
    id: "premium" as const,
    label: "Premium",
    icon: <Crown className="w-5 h-5" />,
    description: "Upgrade features",
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-100 to-orange-100",
    badge: "Pro",
  },
  {
    id: "business" as const,
    label: "Business",
    icon: <Building2 className="w-5 h-5" />,
    description: "Analytics & settings",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-100 to-emerald-100",
    count: 3,
  },
];

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-lg border border-gray-100 p-2"
    >
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              scale: 1.02,
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 group ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-xl"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white bg-opacity-20"
                  : `bg-gradient-to-br ${tab.bgColor} group-hover:scale-110`
              }`}
            >
              <div
                className={
                  activeTab === tab.id
                    ? "text-white"
                    : `text-${tab.color.split("-")[1]}-600`
                }
              >
                {tab.icon}
              </div>
            </div>

            {/* Content */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{tab.label}</span>
                {tab.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      tab.badge === "New"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                    }`}
                  >
                    {tab.badge}
                  </motion.span>
                )}
                {tab.count && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === tab.id
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.status && (
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      tab.status
                    )}`}
                  />
                )}
              </div>
              <p
                className={`text-xs ${
                  activeTab === tab.id ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {tab.description}
              </p>
            </div>

            {/* Active Indicator */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* Hover Effect */}
            {activeTab !== tab.id && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                initial={false}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 pt-4 border-t border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All systems operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span>5 devices connected</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>+23% this week</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Quick Actions"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

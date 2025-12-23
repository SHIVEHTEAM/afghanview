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
    label: "COLLECTION",
    icon: <Image className="w-5 h-5" />,
    description: "Media Assets",
    count: 24,
    badge: "NEW",
  },
  {
    id: "tvs" as const,
    label: "NETWORK",
    icon: <Tv className="w-5 h-5" />,
    description: "Display Nodes",
    count: 5,
    status: "online",
  },
  {
    id: "premium" as const,
    label: "PROTOCOLS",
    icon: <Crown className="w-5 h-5" />,
    description: "System Upgrades",
    badge: "PRO",
  },
  {
    id: "business" as const,
    label: "ANALYTICS",
    icon: <Building2 className="w-5 h-5" />,
    description: "Data Streams",
    count: 3,
  },
];

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-black";
      default:
        return "bg-black/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-black/5 p-3"
    >
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-4 px-8 py-5 rounded-[1.5rem] font-bold transition-all duration-500 group ${activeTab === tab.id
              ? "text-white shadow-2xl shadow-black/10"
              : "text-black/40 hover:text-black hover:bg-gray-50/50"
              }`}
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${activeTab === tab.id
                ? "bg-white/10"
                : "bg-gray-50 group-hover:bg-black group-hover:text-white"
                }`}
            >
              {tab.icon}
            </div>

            {/* Content */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.2em]">
                  {tab.label}
                </span>
                {tab.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${activeTab === tab.id
                      ? "bg-white text-black"
                      : "bg-black text-white"
                      }`}
                  >
                    {tab.badge}
                  </motion.span>
                )}
                {tab.count && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] font-black ${activeTab === tab.id
                      ? "bg-white/10 text-white"
                      : "bg-gray-100 text-black/40"
                      }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.status && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${activeTab === tab.id ? "bg-white" : getStatusColor(tab.status)
                      }`}
                  />
                )}
              </div>
              <p
                className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${activeTab === tab.id ? "text-white/40" : "text-black/20"
                  }`}
              >
                {tab.description}
              </p>
            </div>

            {/* Active Indicator */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-black rounded-[1.5rem] -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
        className="mt-6 pt-6 border-t border-black/5"
      >
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                Network Synchronized
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-black/20" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                5 Nodes Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 text-black/20 hover:text-black hover:bg-gray-50 rounded-full transition-all duration-300"
              title="System Protocol"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 text-black/20 hover:text-black hover:bg-gray-50 rounded-full transition-all duration-300"
              title="Core Settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

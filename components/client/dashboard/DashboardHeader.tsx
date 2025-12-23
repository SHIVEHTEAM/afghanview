import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../../lib/auth";

interface DashboardHeaderProps {
  user: any;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Slideshow Published",
      message: "Your 'Daily Specials' slideshow is now live",
      time: "2m ago",
      read: false,
    },
    {
      id: 2,
      title: "New Feature",
      message: "AI generation is now available",
      time: "1h ago",
      read: false,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-black">
              Welcome, {user?.first_name || "User"}
            </h1>
            <p className="text-xs text-black/40 mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="hidden lg:flex relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-black/5 rounded-lg text-sm focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-gray-50 text-black rounded-lg hover:bg-gray-100 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-black/5 mx-2" />

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pr-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-black/5"
            >
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center text-white text-xs font-bold">
                {(user?.first_name || user?.name || "U").charAt(0)}
              </div>
              <span className="text-xs font-bold text-black hidden sm:inline">
                Account
              </span>
              <ChevronDown className="w-3 h-3 text-black/40" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-black/5 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-black/5">
                    <p className="text-xs font-bold text-black">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.name || "User"}
                    </p>
                    <p className="text-[10px] text-black/40 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-black/60 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-black/60 hover:text-black hover:bg-gray-50 rounded-lg transition-all">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>
                  <div className="p-2 bg-gray-50/50">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-black/40 hover:text-black transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

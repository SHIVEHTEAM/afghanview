import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Settings,
  Plus,
  UserPlus,
  Search,
  Filter,
  Image,
  Play,
  Eye,
  Tv,
  Edit,
  Trash2,
} from "lucide-react";

interface BusinessStats {
  totalSlideshows: number;
  activeSlideshows: number;
  totalViews: number;
  totalDevices: number;
  monthlyGrowth: number;
  customerSatisfaction: number;
  revenue: number;
  expenses: number;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastActive: Date;
  permissions: string[];
  avatar: string;
}

export function BusinessTab() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [businessStats, setBusinessStats] = useState<BusinessStats>({
    totalSlideshows: 24,
    activeSlideshows: 8,
    totalViews: 15420,
    totalDevices: 5,
    monthlyGrowth: 23.5,
    customerSatisfaction: 4.8,
    revenue: 2840,
    expenses: 1200,
  });

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Ahmad Karimi",
      email: "ahmad@business.com",
      role: "Manager",
      status: "active",
      lastActive: new Date(),
      permissions: ["create", "edit", "delete", "manage_staff"],
      avatar: "AK",
    },
    {
      id: "2",
      name: "Fatima Zahra",
      email: "fatima@business.com",
      role: "Content Creator",
      status: "active",
      lastActive: new Date(Date.now() - 3600000),
      permissions: ["create", "edit"],
      avatar: "FZ",
    },
    {
      id: "3",
      name: "Hassan Ali",
      email: "hassan@business.com",
      role: "Viewer",
      status: "inactive",
      lastActive: new Date(Date.now() - 86400000),
      permissions: ["view"],
      avatar: "HA",
    },
  ]);

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "inactive":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        {[
          {
            id: "overview",
            label: "Overview",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: "analytics",
            label: "Analytics",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          { id: "staff", label: "Staff", icon: <Users className="w-4 h-4" /> },
          {
            id: "settings",
            label: "Settings",
            icon: <Settings className="w-4 h-4" />,
          },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              activeSection === tab.id
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Overview Section */}
      {activeSection === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Slideshows
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {businessStats.totalSlideshows}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Active Slideshows
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {businessStats.activeSlideshows}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatNumber(businessStats.totalViews)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Connected Devices
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {businessStats.totalDevices}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <Tv className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Growth and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Monthly Growth
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex items-center gap-1 ${getGrowthColor(
                    businessStats.monthlyGrowth
                  )}`}
                >
                  {getGrowthIcon(businessStats.monthlyGrowth)}
                  <span className="text-2xl font-bold">
                    {businessStats.monthlyGrowth}%
                  </span>
                </div>
                <span className="text-gray-600">vs last month</span>
              </div>
              <div className="h-32 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl flex items-center justify-center">
                <span className="text-gray-500">Chart placeholder</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Financial Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(businessStats.revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expenses</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(businessStats.expenses)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">
                      Net Profit
                    </span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(
                        businessStats.revenue - businessStats.expenses
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-3xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-2xl hover:bg-opacity-30 transition-all duration-300"
              >
                <Plus className="w-8 h-8 mb-2" />
                <p className="font-semibold">Create Slideshow</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-2xl hover:bg-opacity-30 transition-all duration-300"
              >
                <UserPlus className="w-8 h-8 mb-2" />
                <p className="font-semibold">Add Staff Member</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-2xl hover:bg-opacity-30 transition-all duration-300"
              >
                <BarChart3 className="w-8 h-8 mb-2" />
                <p className="font-semibold">View Analytics</p>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Analytics Section */}
      {activeSection === "analytics" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Analytics Dashboard
            </h2>
            <p className="text-gray-600">
              Track your slideshow performance and audience engagement
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Views Over Time
              </h3>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center">
                <span className="text-gray-500">Chart placeholder</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Popular Content
              </h3>
              <div className="space-y-4">
                {[
                  { name: "Menu Specials", views: 5420, growth: 12.5 },
                  { name: "Daily Specials", views: 3890, growth: 8.2 },
                  { name: "About Us", views: 2340, growth: -2.1 },
                  { name: "Contact Info", views: 1870, growth: 15.7 },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatNumber(item.views)} views
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${getGrowthColor(
                        item.growth
                      )}`}
                    >
                      {getGrowthIcon(item.growth)}
                      <span className="text-sm font-medium">
                        {item.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Staff Section */}
      {activeSection === "staff" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Staff Management
              </h2>
              <p className="text-gray-600">
                Manage your team members and their permissions
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddStaff(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
            >
              <UserPlus className="w-5 h-5" />
              Add Staff Member
            </motion.button>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  Team Members ({staffMembers.length})
                </h3>
                <div className="flex gap-2">
                  <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200">
                    <Search className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {staffMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {member.name}
                        </h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          member.status
                        )}`}
                      >
                        {getStatusIcon(member.status)}
                        {member.status.charAt(0).toUpperCase() +
                          member.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatLastActive(member.lastActive)}
                      </span>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedStaff(member)}
                          className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Section */}
      {activeSection === "settings" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Business Settings
            </h2>
            <p className="text-gray-600">
              Configure your business preferences and integrations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Business Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Afghan Business"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="contact@afghanbusiness.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    defaultValue="123 Main Street, City, State 12345"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive updates about your slideshows
                    </p>
                  </div>
                  <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Auto-save</p>
                    <p className="text-sm text-gray-600">
                      Automatically save your work
                    </p>
                  </div>
                  <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      Analytics Tracking
                    </p>
                    <p className="text-sm text-gray-600">
                      Track slideshow performance
                    </p>
                  </div>
                  <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAddStaff(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Add Staff Member
              </h3>
              <p className="text-gray-600 mt-2">
                Invite a new team member to collaborate
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select a role</option>
                  <option value="manager">Manager</option>
                  <option value="content_creator">Content Creator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddStaff(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddStaff(false)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium"
              >
                Send Invitation
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

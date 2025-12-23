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
    return growth >= 0 ? "text-black" : "text-black/40";
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
        return "bg-black text-white";
      case "inactive":
        return "bg-gray-100 text-black/40";
      case "pending":
        return "bg-gray-100 text-black/60";
      default:
        return "bg-gray-100 text-black";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "inactive":
        return <XCircle className="w-3.5 h-3.5" />;
      case "pending":
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return <XCircle className="w-3.5 h-3.5" />;
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
        className="flex flex-wrap gap-3 p-1.5 bg-gray-100/50 rounded-[2rem] border border-black/5 w-fit"
      >
        {[
          {
            id: "overview",
            label: "Overview",
            icon: BarChart3,
          },
          {
            id: "analytics",
            label: "Analytics",
            icon: TrendingUp,
          },
          { id: "staff", label: "Staff", icon: Users },
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
          },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-[1.5rem] text-[13px] font-bold transition-all duration-300 ${activeSection === tab.id
              ? "bg-black text-white shadow-xl shadow-black/10"
              : "text-black/40 hover:text-black"
              }`}
          >
            <tab.icon className="w-4 h-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Asset Volume", value: businessStats.totalSlideshows, icon: Image, prefix: "", suffix: " Units" },
              { label: "Active Nodes", value: businessStats.activeSlideshows, icon: Play, prefix: "", suffix: " Ready" },
              { label: "Interaction Log", value: formatNumber(businessStats.totalViews), icon: Eye, prefix: "", suffix: " Total" },
              { label: "Connected Ports", value: businessStats.totalDevices, icon: Tv, prefix: "", suffix: " Active" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
                className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-black/[0.03] border border-black/5"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-black/5">
                    <stat.icon className="w-5 h-5 text-black" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-black tracking-tight">
                    {stat.prefix}{stat.value}
                    <span className="text-xs font-bold text-black/20 ml-1 uppercase tracking-widest">{stat.suffix}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Growth and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5"
            >
              <h3 className="text-xl font-bold text-black mb-10 tracking-tight">
                Growth Vector
              </h3>
              <div className="flex items-center gap-4 mb-10">
                <div
                  className="flex items-center gap-2 text-black"
                >
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                    {getGrowthIcon(businessStats.monthlyGrowth)}
                  </div>
                  <span className="text-4xl font-bold tracking-tighter">
                    {businessStats.monthlyGrowth}%
                  </span>
                </div>
                <span className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">Cycle Increase</span>
              </div>
              <div className="h-40 bg-gray-50 rounded-[2rem] border border-black/5 border-dashed flex items-center justify-center">
                <span className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em]">Visualizing Telemetry...</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5"
            >
              <h3 className="text-xl font-bold text-black mb-10 tracking-tight">
                Ledger Delta
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Gross Revenue</span>
                  <span className="text-lg font-bold text-black">
                    {formatCurrency(businessStats.revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Operational Expenses</span>
                  <span className="text-lg font-bold text-black/20">
                    ({formatCurrency(businessStats.expenses)})
                  </span>
                </div>
                <div className="border-t border-black/5 pt-8 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-black uppercase tracking-widest">
                      Net Capital
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-bold text-black tracking-tight">
                        {formatCurrency(
                          businessStats.revenue - businessStats.expenses
                        )}
                      </span>
                      <span className="text-[9px] font-bold text-black/20 uppercase tracking-widest mt-1">Ready for withdrawal</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-black rounded-[3rem] p-12 text-white shadow-2xl shadow-black/20 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-10 tracking-tight">Power Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Initialize Asset", icon: Plus, desc: "New Slideshow" },
                  { label: "Onboard Staff", icon: UserPlus, desc: "Invite Team" },
                  { label: "Deep Analytics", icon: BarChart3, desc: "View Data" }
                ].map((action, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] hover:bg-white/20 transition-all border border-white/5 text-left group"
                  >
                    <div className="w-12 h-12 bg-white rounded-[1.2rem] flex items-center justify-center mb-6 shadow-xl shadow-black/10 group-hover:scale-110 transition-transform">
                      <action.icon className="w-6 h-6 text-black" />
                    </div>
                    <p className="font-bold text-lg mb-1">{action.label}</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{action.desc}</p>
                  </motion.button>
                ))}
              </div>
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
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5">
              <h3 className="text-xl font-bold text-black mb-8 tracking-tight">
                Engagement Overview
              </h3>
              <div className="h-64 bg-gray-50 rounded-[2rem] border border-black/5 border-dashed flex items-center justify-center">
                <span className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em]">Synthesizing Data...</span>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5">
              <h3 className="text-xl font-bold text-black mb-8 tracking-tight">
                Priority Assets
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
                    className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-black/[0.02] transition-all border border-black/5 group"
                  >
                    <div>
                      <p className="font-bold text-black">{item.name}</p>
                      <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest mt-1">
                        {formatNumber(item.views)} Logs
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-2 p-2 bg-white rounded-xl border border-black/5 group-hover:scale-110 transition-transform"
                    >
                      {getGrowthIcon(item.growth)}
                      <span className="text-[10px] font-bold text-black">
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-black tracking-tight">
                Personnel
              </h2>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mt-2">
                Unified Team Control
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddStaff(true)}
              className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-black/90 transition-all shadow-xl shadow-black/10 flex items-center gap-3"
            >
              <UserPlus className="w-5 h-5" />
              Onboard Member
            </motion.button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-black/5 overflow-hidden">
            <div className="p-10 border-b border-black/5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-black tracking-tight">
                  Active Directory ({staffMembers.length})
                </h3>
                <div className="flex gap-3">
                  <button className="p-3 rounded-xl text-black/20 hover:text-black bg-gray-50 border border-black/5 transition-all">
                    <Search className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-xl text-black/20 hover:text-black bg-gray-50 border border-black/5 transition-all">
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
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-black rounded-[1.2rem] flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-black text-lg tracking-tight">
                          {member.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{member.email}</p>
                          <span className="w-1 h-1 bg-black/10 rounded-full"></span>
                          <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest">{member.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${getStatusColor(
                          member.status
                        )} shadow-lg shadow-black/5`}
                      >
                        {getStatusIcon(member.status)}
                        {member.status}
                      </span>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-black/20 uppercase tracking-widest mb-0.5">Last Sync</p>
                        <p className="text-[10px] font-bold text-black">
                          {formatLastActive(member.lastActive)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedStaff(member)}
                          className="p-3 rounded-xl text-black/20 hover:text-black hover:bg-gray-50 border border-transparent hover:border-black/5 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 rounded-xl text-black/20 hover:text-black hover:bg-gray-50 border border-transparent hover:border-black/5 transition-all"
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
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5">
              <h3 className="text-xl font-bold text-black mb-8 tracking-tight">
                Profile Configuration
              </h3>
              <div className="space-y-6">
                {[
                  { label: "Identity Label", val: "Afghan Business" },
                  { label: "Core Email", val: "contact@shivehview.com" },
                  { label: "Direct Line", val: "+1 (555) 123-4567" }
                ].map((input, i) => (
                  <div key={i}>
                    <label className="block text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mb-2">
                      {input.label}
                    </label>
                    <input
                      type="text"
                      defaultValue={input.val}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-black/5 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none text-sm font-bold"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mb-2">
                    Operational Address
                  </label>
                  <textarea
                    defaultValue="123 Main Street, City, State 12345"
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-black/5 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none text-sm font-bold resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5">
              <h3 className="text-xl font-bold text-black mb-8 tracking-tight">
                Preferences
              </h3>
              <div className="space-y-6">
                {[
                  { label: "Protocol Alerts", desc: "System status updates", active: true },
                  { label: "Auto-Synchronization", desc: "Live asset updates", active: true },
                  { label: "Telemetry Tracking", desc: "Advanced usage logs", active: false }
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-black/5">
                    <div>
                      <p className="font-bold text-black text-sm tracking-tight">{pref.label}</p>
                      <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest mt-1">
                        {pref.desc}
                      </p>
                    </div>
                    <button className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${pref.active ? "bg-black" : "bg-black/10"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${pref.active ? "right-1" : "left-1"}`}></div>
                    </button>
                  </div>
                ))}
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-2xl shadow-black/20 border border-black/5 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] rounded-full -mr-16 -mt-16 blur-2xl"></div>

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-black tracking-tight">Onboard Member</h3>
              <p className="text-[10px] font-bold text-black/40 mt-3 uppercase tracking-widest">
                Granting Access Privileges
              </p>
            </div>

            <div className="space-y-6">
              {[
                { label: "Personnel Identity", placeholder: "Full legal name" },
                { label: "Sync Channel", placeholder: "Primary email address" }
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mb-2">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-black/5 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none text-sm font-bold placeholder:text-black/10"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mb-2">
                  Privilege Tier
                </label>
                <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-black/5 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black transition-all outline-none text-sm font-bold appearance-none cursor-pointer">
                  <option value="">Select Protocol</option>
                  <option value="manager">Lead Protocol</option>
                  <option value="content_creator">Creative Asset Unit</option>
                  <option value="viewer">Read Only Sync</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddStaff(false)}
                className="flex-1 bg-gray-50 text-black/40 py-5 rounded-2xl hover:bg-black/5 transition-all text-sm font-bold"
              >
                Abort
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddStaff(false)}
                className="flex-2 bg-black text-white py-5 px-10 rounded-2xl hover:bg-black/90 transition-all text-sm font-bold shadow-xl shadow-black/10"
              >
                Finalize Onboarding
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

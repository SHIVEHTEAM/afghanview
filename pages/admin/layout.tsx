import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "../../lib/auth";
import {
  LayoutDashboard,
  Building,
  Image,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Globe,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: router.pathname === "/admin",
    },
    {
      name: "Restaurants",
      href: "/admin/restaurants",
      icon: Building,
      current: router.pathname.startsWith("/admin/restaurants"),
      children: [
        { name: "All Restaurants", href: "/admin/restaurants" },
        { name: "Add Restaurant", href: "/admin/restaurants/add" },
        { name: "Package Management", href: "/admin/restaurants/packages" },
      ],
    },
    {
      name: "Slides Management",
      href: "/admin/slides",
      icon: Image,
      current: router.pathname.startsWith("/admin/slides"),
      children: [
        { name: "All Slides", href: "/admin/slides" },
        { name: "Templates", href: "/admin/slides/templates" },
        { name: "Bulk Upload", href: "/admin/slides/bulk" },
      ],
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: router.pathname.startsWith("/admin/analytics"),
      children: [
        { name: "Overview", href: "/admin/analytics" },
        { name: "Restaurant Stats", href: "/admin/analytics/restaurants" },
        { name: "Revenue", href: "/admin/analytics/revenue" },
      ],
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      current: router.pathname.startsWith("/admin/users"),
      children: [
        { name: "All Users", href: "/admin/users" },
        { name: "Admins", href: "/admin/users/admins" },
        { name: "Restaurant Owners", href: "/admin/users/owners" },
      ],
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: router.pathname.startsWith("/admin/settings"),
      children: [
        { name: "General", href: "/admin/settings" },
        { name: "Billing", href: "/admin/settings/billing" },
        { name: "Integrations", href: "/admin/settings/integrations" },
      ],
    },
  ];

  const stats = [
    {
      name: "Total Restaurants",
      value: "24",
      change: "+2",
      changeType: "positive",
      icon: Building,
    },
    {
      name: "Active Slides",
      value: "156",
      change: "+12",
      changeType: "positive",
      icon: Image,
    },
    {
      name: "Monthly Revenue",
      value: "$12,847",
      change: "+8.2%",
      changeType: "positive",
      icon: TrendingUp,
    },
    {
      name: "Active Users",
      value: "89",
      change: "+5",
      changeType: "positive",
      icon: Users,
    },
  ];

  const toggleDropdown = (name: string) => {
    setDropdownOpen(dropdownOpen === name ? null : name);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Mobile sidebar content */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-2xl font-bold text-gradient">
                AfghanView Admin
              </h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      item.current
                        ? "bg-afghan-green text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                  {item.children && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                          onClick={() => setSidebarOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-gradient">
                AfghanView Admin
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() =>
                      item.children ? toggleDropdown(item.name) : null
                    }
                    className={`group w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                      item.current
                        ? "bg-afghan-green text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    {item.children && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          dropdownOpen === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                  {item.children && dropdownOpen === item.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 mt-2 space-y-1"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Admin profile */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-afghan-green flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.first_name?.charAt(0) || "A"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user ? `${user.first_name} ${user.last_name}` : "Admin User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "admin@afghanview.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-afghan-green lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                {navigation.find((item) => item.current)?.name || "Dashboard"}
              </h2>
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Quick stats */}
              <div className="hidden md:flex items-center space-x-4">
                {stats.slice(0, 2).map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.name}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Icon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">
                        {stat.value}
                      </span>
                      <span
                        className={`text-xs ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/"
                className="text-gray-400 hover:text-gray-500"
                title="Go to website"
              >
                <Globe className="h-6 w-6" />
              </Link>

              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-gray-500"
                title="Sign out"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

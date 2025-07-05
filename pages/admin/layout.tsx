import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import {
  Menu,
  X,
  Home,
  Image as ImageIcon,
  Building,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Eye,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalSlides: 0,
    totalViews: 0,
  });

  useEffect(() => {
    fetchStats();
    fetchNotifications();
  }, []);

  const fetchStats = async () => {
    try {
      const [restaurantsResult, slidesResult, viewsResult] = await Promise.all([
        supabase.from("restaurants").select("id, is_active"),
        supabase.from("slides").select("id"),
        supabase.from("slide_views").select("id"),
      ]);

      const totalRestaurants = restaurantsResult.data?.length || 0;
      const activeRestaurants =
        restaurantsResult.data?.filter((r) => r.is_active).length || 0;
      const totalSlides = slidesResult.data?.length || 0;
      const totalViews = viewsResult.data?.length || 0;

      setStats({
        totalRestaurants,
        activeRestaurants,
        totalSlides,
        totalViews,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchNotifications = async () => {
    // Mock notifications - in real app, fetch from API
    setNotifications([
      {
        id: "1",
        type: "restaurant_added",
        message: "New restaurant 'Afghan Palace' registered",
        time: "2 minutes ago",
        read: false,
      },
      {
        id: "2",
        type: "subscription_upgraded",
        message: "Kabul Kitchen upgraded to Premium plan",
        time: "1 hour ago",
        read: false,
      },
      {
        id: "3",
        type: "system_alert",
        message: "System backup completed successfully",
        time: "3 hours ago",
        read: true,
      },
    ]);
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      current: router.pathname === "/admin",
    },
    {
      name: "Slides",
      href: "/admin/slides",
      icon: ImageIcon,
      current: router.pathname.startsWith("/admin/slides"),
      children: [
        { name: "All Slides", href: "/admin/slides" },
        { name: "Create Slide", href: "/admin/slides/create" },
        { name: "Templates", href: "/admin/slides/templates" },
      ],
    },
    {
      name: "Restaurants",
      href: "/admin/restaurants",
      icon: Building,
      current: router.pathname.startsWith("/admin/restaurants"),
      children: [
        { name: "All Restaurants", href: "/admin/restaurants" },
        { name: "Add Restaurant", href: "/admin/restaurants/add" },
        { name: "Packages", href: "/admin/restaurants/packages" },
      ],
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      current: router.pathname.startsWith("/admin/users"),
      children: [
        { name: "All Users", href: "/admin/users" },
        { name: "Add User", href: "/admin/users/add" },
        { name: "Roles", href: "/admin/users/roles" },
      ],
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: router.pathname.startsWith("/admin/analytics"),
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: router.pathname.startsWith("/admin/settings"),
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
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
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-afghan-green">
              ShivehView Admin
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? "bg-afghan-green text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
                {item.children && item.current && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`block px-2 py-1 text-sm rounded-md ${
                          router.pathname === child.href
                            ? "text-afghan-green font-medium"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
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

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-afghan-green">
              ShivehView Admin
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? "bg-afghan-green text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
                {item.children && item.current && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`block px-2 py-1 text-sm rounded-md ${
                          router.pathname === child.href
                            ? "text-afghan-green font-medium"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-afghan-green flex items-center justify-center text-white font-semibold">
                  {user?.first_name?.charAt(0)}
                  {user?.last_name?.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>{stats.totalRestaurants}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ImageIcon className="h-4 w-4" />
                <span>{stats.totalSlides}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{stats.totalViews.toLocaleString()}</span>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900">
                <div className="h-8 w-8 rounded-full bg-afghan-green flex items-center justify-center text-white font-semibold">
                  {user?.first_name?.charAt(0)}
                  {user?.last_name?.charAt(0)}
                </div>
                <span className="hidden lg:block">
                  {user?.first_name} {user?.last_name}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

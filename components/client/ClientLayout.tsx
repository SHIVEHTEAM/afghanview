import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "../../lib/auth";
import { useSlideshowStore } from "../../stores/slideshowStore";
import { SlideshowCreator } from "../slideshow-creator";
import { supabase } from "../../lib/supabase";
import {
  LayoutDashboard,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Users,
  Eye,
  Tv,
  Crown,
  ChevronDown,
  Zap,
  Sparkles,
  Gift,
  Rocket,
} from "lucide-react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

interface UserPlan {
  name: string;
  credits: number;
  usedCredits: number;
  features: string[];
  upgradeUrl: string;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upgradeDropdownOpen, setUpgradeDropdownOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan>({
    name: "Free",
    credits: 10,
    usedCredits: 0,
    features: ["1 slideshow", "Basic templates", "Email support"],
    upgradeUrl: "/pricing",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showSlideshowCreator, setShowSlideshowCreator } = useSlideshowStore();

  useEffect(() => {
    if (user) {
      fetchUserPlanData();
    }
  }, [user]);

  const fetchUserPlanData = async () => {
    try {
      if (!user) return;

      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      // Get business data
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (businessError && businessError.code !== "PGRST116") {
        console.error("Error fetching business:", businessError);
      }

      // Get business subscription data
      let subscriptionPlan = "Free";
      let aiCredits = 10;
      let aiCreditsUsed = 0;

      if (businessData) {
        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("business_subscriptions")
            .select(
              `
              *,
              plan:subscription_plans(name, slug, features, limits)
            `
            )
            .eq("business_id", businessData.id)
            .eq("status", "active")
            .single();

        if (subscriptionData && !subscriptionError) {
          subscriptionPlan = subscriptionData.plan?.name || "Free";
          aiCredits = businessData.ai_credits || 10;
          aiCreditsUsed = businessData.ai_credits_used || 0;
        }
      } else if (profileData) {
        subscriptionPlan = profileData.subscription_plan || "Free";
        aiCredits = profileData.ai_credits || 10;
        aiCreditsUsed = profileData.ai_credits_used || 0;
      }

      // Get plan features based on subscription
      const planFeatures = getPlanFeatures(subscriptionPlan, businessData);

      setUserPlan({
        name: subscriptionPlan,
        credits: aiCredits,
        usedCredits: aiCreditsUsed,
        features: planFeatures,
        upgradeUrl: "/pricing",
      });
    } catch (error) {
      console.error("Error fetching user plan data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanFeatures = (plan: string, business: any) => {
    const features = {
      Free: [
        `${business?.max_slideshows || 1} slideshow${
          business?.max_slideshows !== 1 ? "s" : ""
        }`,
        "Basic templates",
        "Email support",
        "1 TV display",
      ],
      Starter: [
        "5 slideshows",
        "Premium templates",
        "Priority support",
        "5 TV displays",
        "Basic analytics",
      ],
      Professional: [
        "20 slideshows",
        "All templates",
        "Priority support",
        "Unlimited TV displays",
        "Advanced analytics",
        "Team management",
        "Custom branding",
      ],
      Unlimited: [
        "Unlimited slideshows",
        "All templates",
        "Priority support",
        "Unlimited TV displays",
        "Enterprise analytics",
        "Unlimited team members",
        "Custom branding",
        "API access",
        "White-label solution",
      ],
    };
    return features[plan as keyof typeof features] || features.Free;
  };

  const upgradePlans = [
    {
      name: "Starter",
      price: "$39",
      period: "per month",
      features: ["5 slideshows", "100 AI credits", "HD quality"],
      icon: Rocket,
      color: "from-blue-500 to-purple-600",
      href: "/pricing?plan=starter",
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      features: ["20 slideshows", "500 AI credits", "4K quality"],
      icon: Crown,
      color: "from-purple-500 to-pink-600",
      href: "/pricing?plan=professional",
    },
    {
      name: "Unlimited",
      price: "$249",
      period: "per month",
      features: ["Unlimited slideshows", "Unlimited AI credits", "8K quality"],
      icon: Sparkles,
      color: "from-yellow-500 to-orange-600",
      href: "/pricing?plan=unlimited",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".upgrade-dropdown")) {
        setUpgradeDropdownOpen(false);
      }
    };

    if (upgradeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [upgradeDropdownOpen]);

  const navigation = [
    {
      name: "Dashboard",
      href: "/client",
      icon: LayoutDashboard,
      current: router.pathname === "/client",
    },
    {
      name: "TV Management",
      href: "/client/tv",
      icon: Tv,
      current: router.pathname.startsWith("/client/tv"),
    },
    {
      name: "Premium",
      href: "/client/premium",
      icon: Crown,
      current: router.pathname.startsWith("/client/premium"),
    },

    {
      name: "Analytics",
      href: "/client/analytics",
      icon: BarChart3,
      current: router.pathname.startsWith("/client/analytics"),
    },
    {
      name: "Staff",
      href: "/client/staff",
      icon: Users,
      current: router.pathname.startsWith("/client/staff"),
    },
    {
      name: "Settings",
      href: "/client/settings",
      icon: Settings,
      current: router.pathname.startsWith("/client/settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Slideshow Creator Modal - Disabled */}
      {false && (
        <SlideshowCreator
          onClose={() => setShowSlideshowCreator(false)}
          onStartCreation={(type) => {
            // Handle slideshow creation start
            console.log("Starting slideshow creation:", type);
            setShowSlideshowCreator(false);
            // You can add navigation logic here if needed
          }}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Shivehview</h1>
              </div>
            </div>
            <nav className="mt-8 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                    item.current
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile sidebar footer */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center mb-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">
                      {user?.first_name?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.first_name ||
                        user?.email?.split("@")[0] ||
                        "User"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 font-medium">
                    Online
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-200 text-xs font-medium"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Shivehview</h1>
              </div>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    item.current
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop sidebar footer */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center mb-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">
                      {user?.first_name?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.first_name ||
                        user?.email?.split("@")[0] ||
                        "User"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 font-medium">
                    Online
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-200 text-xs font-medium"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <h1 className="text-2xl font-bold text-gray-900 my-auto">
                {navigation.find((item) => item.current)?.name || "Dashboard"}
              </h1>
            </div>

            {/* Upgrade Dropdown */}
            <div className="flex items-center space-x-4">
              {/* AI Credits Display */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  {userPlan.usedCredits}/{userPlan.credits} AI Credits
                </span>
              </div>

              {/* Plan & Upgrade Dropdown */}
              <div className="relative upgrade-dropdown">
                <button
                  onClick={() => setUpgradeDropdownOpen(!upgradeDropdownOpen)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                >
                  <Crown className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    {userPlan.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-purple-600" />
                </button>

                {/* Dropdown Menu */}
                {upgradeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-4 z-50">
                    {/* Current Plan */}
                    <div className="px-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Current Plan
                        </h3>
                        <span className="text-xs text-gray-500">
                          {userPlan.name}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {userPlan.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-xs text-gray-600"
                          >
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upgrade Options */}
                    <div className="px-4 pt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Upgrade Options
                      </h3>
                      <div className="space-y-3">
                        {upgradePlans.map((plan) => {
                          const Icon = plan.icon;
                          return (
                            <Link
                              key={plan.name}
                              href={plan.href}
                              onClick={() => setUpgradeDropdownOpen(false)}
                              className="block p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-8 h-8 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center`}
                                  >
                                    <Icon className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900">
                                      {plan.name}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {plan.price}/{plan.period}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {plan.features.map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center text-xs text-gray-600"
                                  >
                                    <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* View All Plans */}
                    <div className="px-4 pt-4 border-t border-gray-100">
                      <Link
                        href="/pricing"
                        onClick={() => setUpgradeDropdownOpen(false)}
                        className="block w-full text-center py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                      >
                        View All Plans
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

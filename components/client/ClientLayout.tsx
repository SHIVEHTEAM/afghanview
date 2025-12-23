import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth, getUserRole } from "../../lib/auth";
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showSlideshowCreator, setShowSlideshowCreator } = useSlideshowStore();

  useEffect(() => {
    if (user) {
      fetchUserPlanData();
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user?.id) return;
    try {
      const role = await getUserRole(user.id);
      setUserRole(role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

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

      // First, check if user is a staff member and get their business
      const { data: staffMember, error: staffError } = await supabase
        .from("business_staff")
        .select(
          `
          business:businesses!inner(
            id,
            name,
            subscription_plan,
            ai_credits,
            ai_credits_used,
            max_slideshows,
            max_staff_members
          )
        `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      let businessData = null;
      if (staffMember?.business) {
        // Handle both array and object
        businessData = Array.isArray(staffMember.business)
          ? staffMember.business[0]
          : staffMember.business;
        console.log(
          "🔍 Debug: User is staff member, using business:",
          businessData.name
        );
      }

      // If not found as staff, try as owner
      if (!businessData) {
        const { data: userBusiness, error: businessError } = await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (businessError && businessError.code !== "PGRST116") {
          console.error("Error fetching business:", businessError);
        } else if (userBusiness) {
          businessData = userBusiness;
          console.log(
            "🔍 Debug: User is business owner, using own business:",
            businessData.name
          );
        }
      }

      // Get business subscription data - check business table first, then business_subscriptions
      let subscriptionPlan = "Free";
      let aiCredits = 10;
      let aiCreditsUsed = 0;

      if (businessData) {
        // First check if business has a direct subscription plan
        if (
          businessData.subscription_plan &&
          businessData.subscription_plan !== "free"
        ) {
          subscriptionPlan =
            businessData.subscription_plan.charAt(0).toUpperCase() +
            businessData.subscription_plan.slice(1); // Capitalize first letter
          aiCredits = businessData.ai_credits || 10;
          aiCreditsUsed = businessData.ai_credits_used || 0;
        } else {
          // Check business_subscriptions table
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
    return features[plan as keyof typeof features] || features.Starter;
  };

  const upgradePlans = [
    {
      name: "Starter",
      price: "$39",
      period: "per month",
      features: ["5 slideshows", "100 AI credits", "HD quality"],
      icon: Rocket,
      color: "bg-black/10",
      href: "/pricing?plan=starter",
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      features: ["20 slideshows", "500 AI credits", "4K quality"],
      icon: Crown,
      color: "bg-black/40",
      href: "/pricing?plan=professional",
    },
    {
      name: "Unlimited",
      price: "$249",
      period: "per month",
      features: ["Unlimited slideshows", "Unlimited AI credits", "8K quality"],
      icon: Sparkles,
      color: "bg-black",
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
      roles: ["owner", "manager", "staff"],
    },
    {
      name: "TV Management",
      href: "/client/tv",
      icon: Tv,
      current: router.pathname.startsWith("/client/tv"),
      roles: ["owner", "manager", "staff"],
    },
    {
      name: "Premium",
      href: "/client/premium",
      icon: Crown,
      current: router.pathname.startsWith("/client/premium"),
      roles: ["owner"],
    },
    {
      name: "Analytics",
      href: "/client/analytics",
      icon: BarChart3,
      current: router.pathname.startsWith("/client/analytics"),
      roles: ["owner", "manager"],
    },
    {
      name: "Staff",
      href: "/client/staff",
      icon: Users,
      current: router.pathname.startsWith("/client/staff"),
      roles: ["owner"],
    },
    {
      name: "Settings",
      href: "/client/settings",
      icon: Settings,
      current: router.pathname.startsWith("/client/settings"),
      roles: ["owner", "manager"],
    },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(userRole || "")
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"
          }`}
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl border-r border-black/10">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 border border-white/20 rounded-full focus:outline-none backdrop-blur-md"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Mobile sidebar content */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-black">Shivehview</h1>
              </div>
            </div>
            <nav className="mt-8 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border ${item.current
                    ? "bg-black text-white border-black shadow-lg shadow-black/5"
                    : "text-black/70 border-transparent hover:bg-gray-50 hover:text-black"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-4 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile sidebar footer */}
          <div className="flex-shrink-0 border-t border-black/5 p-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-black/5">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-black/5 flex items-center justify-center">
                  <span className="text-black text-lg font-bold">
                    {user?.first_name?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-black truncate">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.first_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </p>
                  <p className="text-xs text-black/40 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-black/20"></div>
                  <span className="text-[10px] text-black/60 font-medium uppercase tracking-widest">Online</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-black/80 transition-all duration-200 text-xs font-bold"
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
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-black/[0.04]">
          <div className="flex-1 flex flex-col pt-12 pb-6 overflow-y-auto px-6">
            {/* Logo Area */}
            <div className="flex items-center flex-shrink-0 px-4 mb-14">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold tracking-tight text-black">
                    Shivehview
                  </h1>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              <div className="px-4 mb-4">
                <p className="text-xs font-semibold text-black/40 uppercase tracking-wider">
                  Main Menu
                </p>
              </div>
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-3 rounded-xl transition-all ${item.current
                    ? "bg-black text-white shadow-md"
                    : "text-black/60 hover:text-black hover:bg-gray-50"
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${item.current ? "text-white" : "text-black/30 group-hover:text-black"
                      }`}
                  />
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop sidebar footer - User Profile */}
          <div className="flex-shrink-0 p-6 border-t border-black/5">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">
                  {user?.first_name?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </span>
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-bold text-black truncate">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.first_name || "User"}
                </p>
                <p className="text-xs text-black/40 truncate">
                  {userPlan.name} Plan
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-black/40 hover:text-black transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex-shrink-0 flex h-24 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
          <button
            type="button"
            className="px-8 border-r border-black/[0.04] text-black lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-10 flex justify-between">
            <div className="flex items-center">
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-black text-black tracking-tighter uppercase"
              >
                {filteredNavigation.find((item) => item.current)?.name ||
                  "Dashboard"}
              </motion.h1>
            </div>

            {/* Upgrade Dropdown */}
            <div className="flex items-center space-x-6">
              {/* AI Credits Display */}
              <div className="hidden md:flex items-center gap-3 bg-gray-50 border border-black/[0.03] px-6 py-3 rounded-2xl shadow-inner group cursor-help">
                <Zap className="w-3.5 h-3.5 text-black/20 group-hover:text-black transition-colors" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-black uppercase tracking-tight leading-none">
                    {userPlan.usedCredits}/{userPlan.credits}
                  </span>
                  <span className="text-[8px] font-bold text-black/20 uppercase tracking-widest mt-0.5">
                    Credits
                  </span>
                </div>
              </div>

              {/* Plan & Upgrade Dropdown */}
              <div className="relative upgrade-dropdown">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUpgradeDropdownOpen(!upgradeDropdownOpen)}
                  className="flex items-center space-x-4 bg-black px-6 py-3.5 rounded-2xl text-white transition-all duration-500 shadow-2xl shadow-black/10 hover:bg-black/90"
                >
                  <Crown className="w-4 h-4 text-white/60" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {userPlan.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 transition-transform duration-500 ${upgradeDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </motion.button>

                {/* Dropdown Menu */}
                {upgradeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 mt-4 w-80 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-black/5 rounded-[2.5rem] p-4 z-50 overflow-hidden"
                  >
                    {/* Current Plan */}
                    <div className="px-6 py-6 bg-gray-50/50 rounded-[2rem] mb-4 border border-black/[0.03]">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">
                          Active Tier
                        </span>
                        <span className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                          {userPlan.name}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {userPlan.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 text-[9px] font-bold text-black uppercase tracking-tight"
                          >
                            <div className="w-1.5 h-1.5 bg-black/10 rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upgrade Options */}
                    <div className="px-4 pb-4">
                      <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em] mb-4 px-2">
                        System Upgrades
                      </p>
                      <div className="space-y-2">
                        {upgradePlans.map((plan) => {
                          const Icon = plan.icon;
                          if (plan.name === userPlan.name) return null;
                          return (
                            <Link
                              key={plan.name}
                              href={plan.href}
                              onClick={() => setUpgradeDropdownOpen(false)}
                              className="group block p-4 bg-white border border-black/[0.04] rounded-[1.5rem] hover:border-black/10 hover:bg-gray-50/50 transition-all duration-300 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <Icon className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-black text-black uppercase tracking-tight">
                                      {plan.name}
                                    </h4>
                                    <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-0.5">
                                      {plan.price}/{plan.period}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* View All Plans */}
                    <div className="px-4 pb-2">
                      <Link
                        href="/pricing"
                        onClick={() => setUpgradeDropdownOpen(false)}
                        className="block w-full text-center py-5 text-[10px] font-black bg-black text-white rounded-[1.5rem] hover:bg-black/90 transition-all duration-300 uppercase tracking-[0.2em] shadow-lg shadow-black/10"
                      >
                        TV Display View
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-white">{children}</main>
      </div>
    </div>
  );
}

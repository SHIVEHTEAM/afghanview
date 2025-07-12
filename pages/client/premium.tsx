import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import ClientLayout from "../../components/client/ClientLayout";
import { motion } from "framer-motion";
import {
  Crown,
  Star,
  Zap,
  Shield,
  Users,
  BarChart3,
  Check,
  CreditCard,
  Calendar,
  FileText,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  plan: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface UserProfile {
  subscription_plan: string;
  subscription_status: string;
  subscription_expires_at: string;
  ai_credits: number;
  ai_credits_used: number;
}

export default function PremiumPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
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
      } else {
        setUserProfile(profileData);
      }

      // Get business data
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (businessError && businessError.code !== "PGRST116") {
        console.error("Error fetching business:", businessError);
      } else if (businessData) {
        setBusiness(businessData);
      }

      // Get business subscription data - check business table first, then business_subscriptions
      if (businessData) {
        // First check if business has a direct subscription plan
        if (
          businessData.subscription_plan &&
          businessData.subscription_plan !== "free"
        ) {
          setSubscription({
            id: "business",
            status: "active",
            plan:
              businessData.subscription_plan.charAt(0).toUpperCase() +
              businessData.subscription_plan.slice(1), // Capitalize first letter
            current_period_end: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ).toISOString(), // Default to 1 year
            cancel_at_period_end: false,
          });
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

          if (subscriptionError && subscriptionError.code !== "PGRST116") {
            console.error("Error fetching subscription:", subscriptionError);
          }

          if (subscriptionData) {
            setSubscription({
              id: subscriptionData.id,
              status: subscriptionData.status,
              plan: subscriptionData.plan?.name || "Free",
              current_period_end: subscriptionData.current_period_end,
              cancel_at_period_end: false,
            });
          }
        }
      }

      // If no business subscription, use profile subscription
      if (!subscription && profileData) {
        setSubscription({
          id: "profile",
          status: profileData.subscription_status || "active",
          plan: profileData.subscription_plan || "Free",
          current_period_end:
            profileData.subscription_expires_at ||
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
        });
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanFeatures = (plan: string) => {
    const features = {
      Free: [
        `${business?.max_slideshows || 1} slideshow${
          business?.max_slideshows !== 1 ? "s" : ""
        }`,
        "Basic templates",
        "Email support",
        "1 TV display",
        `${business?.ai_credits || userProfile?.ai_credits || 10} AI credits`,
      ],
      Starter: [
        "5 slideshows",
        "Premium templates",
        "Priority support",
        "5 TV displays",
        "Basic analytics",
        "100 AI credits",
      ],
      Professional: [
        "20 slideshows",
        "All templates",
        "Priority support",
        "Unlimited TV displays",
        "Advanced analytics",
        "Team management",
        "Custom branding",
        "500 AI credits",
      ],
      Unlimited: [
        "Unlimited slideshows",
        "All templates",
        "Priority support",
        "Unlimited TV displays",
        "Enterprise analytics",
        "Unlimited team members",
        "Custom branding",
        "Unlimited AI credits",
        "API access",
        "White-label solution",
      ],
    };
    return features[plan as keyof typeof features] || features.Free;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Professional":
        return "from-purple-500 to-pink-500";
      case "Starter":
        return "from-blue-500 to-cyan-500";
      case "Unlimited":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getCurrentPlanName = () => {
    return subscription?.plan || userProfile?.subscription_plan || "Free";
  };

  const getCurrentAICredits = () => {
    return business?.ai_credits || userProfile?.ai_credits || 10;
  };

  const getCurrentMaxSlideshows = () => {
    return business?.max_slideshows || 1;
  };

  const getCurrentMaxStaffMembers = () => {
    return business?.max_staff_members || 1;
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Premium Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your subscription and premium features
          </p>
        </div>

        {/* Current Plan Card */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${getPlanColor(
                    subscription.plan
                  )} rounded-full flex items-center justify-center`}
                >
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {subscription.plan} Plan
                  </h2>
                  <p className="text-gray-600">Active subscription</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Next billing</div>
                <div className="font-semibold text-gray-900">
                  {new Date(
                    subscription.current_period_end
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Plan
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getCurrentPlanName()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Credits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getCurrentAICredits()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Max Slideshows
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getCurrentMaxSlideshows()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Staff Members
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getCurrentMaxStaffMembers()}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Your Plan Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getPlanFeatures(getCurrentPlanName()).map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Future Features */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Coming Soon
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900">
                  Billing & Invoices
                </h4>
              </div>
              <p className="text-sm text-gray-600">
                View invoices, payment history, and manage billing information
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900">
                  Transaction History
                </h4>
              </div>
              <p className="text-sm text-gray-600">
                Detailed transaction logs and payment tracking
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900">Usage Analytics</h4>
              </div>
              <p className="text-sm text-gray-600">
                Track feature usage and performance metrics
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

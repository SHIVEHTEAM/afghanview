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

export default function PremiumPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      if (!user) return;

      // Get business
      const { data: businessData } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (businessData) {
        setBusiness(businessData);
      }

      // Get real subscription data
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("business_subscriptions")
          .select("*")
          .eq("business_id", businessData?.id)
          .eq("status", "active")
          .single();

      if (subscriptionError && subscriptionError.code !== "PGRST116") {
        console.error("Error fetching subscription:", subscriptionError);
      }

      if (subscriptionData) {
        // Get plan details
        const { data: planData } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", subscriptionData.plan_id)
          .single();

        setSubscription({
          id: subscriptionData.id,
          status: subscriptionData.status,
          plan: planData?.name || "Free",
          current_period_end: subscriptionData.current_period_end,
          cancel_at_period_end: false, // Add this field to your schema if needed
        });
      } else {
        // No active subscription, show free plan
        setSubscription({
          id: "free",
          status: "active",
          plan: "Free",
          current_period_end: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
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
        `${business?.ai_credits || 0} AI credits`,
      ],
      Starter: [
        "25 slideshows",
        "Premium templates",
        "Priority support",
        "5 TV displays",
        "Basic analytics",
        "10 AI credits",
      ],
      Pro: [
        "Unlimited slideshows",
        "All templates",
        "Priority support",
        "Unlimited TV displays",
        "Advanced analytics",
        "Team management",
        "Custom branding",
        "50 AI credits",
      ],
      Enterprise: [
        "Everything in Pro",
        "Dedicated support",
        "Custom integrations",
        "White-label solution",
        "API access",
        "Unlimited AI credits",
      ],
    };
    return features[plan as keyof typeof features] || features.Free;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Pro":
        return "from-purple-500 to-pink-500";
      case "Starter":
        return "from-blue-500 to-cyan-500";
      case "Enterprise":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-gray-500 to-gray-600";
    }
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
                  {subscription?.plan || "Free"}
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
                  {business?.ai_credits || 0}
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
                  {business?.max_slideshows || 1}
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
                  {business?.max_staff_members || 1}
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
            {getPlanFeatures(subscription?.plan || "Free").map(
              (feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              )
            )}
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

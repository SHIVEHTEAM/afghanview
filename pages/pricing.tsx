import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Check,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Shield,
  Zap,
  Users,
  Calendar,
  Globe,
  Headphones,
  MessageCircle,
  FileText,
  Settings,
  BarChart3,
  TrendingUp,
  Award,
  Gift,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Search,
  Filter,
  Grid,
  List,
  Copy,
  Edit,
  Trash,
  Save,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume,
  VolumeX,
  Volume1,
  Volume2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Image,
  File,
  Folder,
  FolderOpen,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryCharging,
  Power,
  PowerOff,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  Leaf,
  Trees,
  Flower,
  Bug,
  Bird,
  Fish,
  Cat,
  Dog,
  Rabbit,
  Mouse,
  Turtle,
  Apple,
} from "lucide-react";
import { STRIPE_PLANS } from "../lib/stripe";
import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "Free Forever",
    price: 0,
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1 slideshow",
      "Basic templates",
      "10 AI credits",
      "Email support",
      "Standard quality",
      "Community forum",
    ],
    limitations: [
      "No staff members",
      "No advanced features",
      "No priority support",
      "No custom branding",
    ],
    popular: false,
    recommended: false,
    color: "from-gray-500 to-gray-700",
    icon: Gift,
  },
  {
    id: "starter",
    name: "Starter",
    price: 39,
    period: "month",
    description: "Great for small businesses",
    features: [
      "5 slideshows",
      "Premium templates",
      "100 AI credits",
      "Email & chat support",
      "HD quality",
      "Basic analytics",
      "2 staff members",
      "Custom branding",
    ],
    limitations: [
      "Limited AI credits",
      "No priority support",
      "No advanced analytics",
    ],
    popular: false,
    recommended: true,
    color: "from-blue-500 to-purple-600",
    icon: ArrowRight,
  },
  {
    id: "professional",
    name: "Professional",
    price: 99,
    period: "month",
    description: "For growing businesses",
    features: [
      "20 slideshows",
      "All templates",
      "500 AI credits",
      "Priority support",
      "4K quality",
      "Advanced analytics",
      "5 staff members",
      "Custom branding",
      "API access",
      "White-label options",
    ],
    limitations: ["No unlimited features", "No 24/7 support"],
    popular: true,
    recommended: false,
    color: "from-purple-500 to-pink-600",
    icon: Shield,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 249,
    period: "month",
    description: "For enterprise businesses",
    features: [
      "Unlimited slideshows",
      "All templates",
      "Unlimited AI credits",
      "24/7 phone support",
      "8K quality",
      "Enterprise analytics",
      "Unlimited staff",
      "Custom branding",
      "API access",
      "White-label options",
      "Custom integrations",
      "Dedicated account manager",
    ],
    limitations: [],
    popular: false,
    recommended: false,
    color: "from-yellow-500 to-orange-600",
    icon: Zap,
  },
];

const features = [
  {
    name: "AI-Powered Content",
    description: "Generate slideshows with AI assistance",
    icon: ArrowRight,
    plans: {
      free: "10 credits",
      starter: "100 credits",
      professional: "500 credits",
      unlimited: "Unlimited",
    },
  },
  {
    name: "Staff Management",
    description: "Add team members with role-based permissions",
    icon: Users,
    plans: {
      free: "Not included",
      starter: "2 members",
      professional: "5 members",
      unlimited: "Unlimited",
    },
  },
  {
    name: "High-Quality Templates",
    description: "Professional templates for every industry",
    icon: Image,
    plans: {
      free: "Basic",
      starter: "Premium",
      professional: "All",
      unlimited: "All + Custom",
    },
  },
  {
    name: "Analytics & Insights",
    description: "Track performance and engagement",
    icon: BarChart3,
    plans: {
      free: "Basic",
      starter: "Standard",
      professional: "Advanced",
      unlimited: "Enterprise",
    },
  },
  {
    name: "Customer Support",
    description: "Get help when you need it",
    icon: Headphones,
    plans: {
      free: "Email",
      starter: "Email & Chat",
      professional: "Priority",
      unlimited: "24/7 Phone",
    },
  },
  {
    name: "Custom Branding",
    description: "Add your logo and colors",
    icon: Settings,
    plans: {
      free: "Not included",
      starter: "Basic",
      professional: "Advanced",
      unlimited: "Full Control",
    },
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getYearlyDiscount = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.2); // 20% discount
  };

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // Redirect to checkout or signup
    if (planId === "free") {
      window.location.href = "/auth/signup?plan=free";
    } else {
      window.location.href = `/onboarding/payment?plan=${planId}&period=${billingPeriod}`;
    }
  };

  const handleManageSubscription = () => {
    window.location.href = "/client/premium";
  };

  return (
    <>
      <Head>
        <title>
          Pricing - Shivehview | AI-Powered Business Display Platform
        </title>
        <meta
          name="description"
          content="Choose the perfect Shivehview plan for your business. From free forever to enterprise solutions with AI-powered content creation, digital signage, and analytics."
        />
        <meta
          name="keywords"
          content="business digital signage, AI content creation, business technology, digital display, TV management, Shivehview pricing"
        />
        <meta
          property="og:title"
          content="Pricing - Shivehview | AI-Powered Business Display Platform"
        />
        <meta
          property="og:description"
          content="Choose the perfect Shivehview plan for your business. From free forever to enterprise solutions with AI-powered content creation."
        />
        <meta
          property="og:image"
          content="https://shivehview.com/Shivehview%20Transparent%20Logo.png"
        />
        <meta property="og:url" content="https://shivehview.com/pricing" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Pricing - Shivehview | AI-Powered Business Display Platform"
        />
        <meta
          name="twitter:description"
          content="Choose the perfect Shivehview plan for your business. From free forever to enterprise solutions."
        />
        <link rel="canonical" href="https://shivehview.com/pricing" />
        <link rel="icon" href="/Shivehview Transparent Logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/Shivehview Transparent Logo.png"
                  alt="Shivehview Logo"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold tracking-tight">
                  Shivehview
                </span>
              </div>
              <nav className="flex space-x-6">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  About
                </Link>
                <Link href="/pricing" className="text-purple-600 font-medium">
                  Pricing
                </Link>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Blog
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                <a
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </a>
                <button
                  onClick={handleManageSubscription}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage Subscription
                </button>
                <a
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Choose Your Perfect Plan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Start free and scale as you grow. All plans include our core
              features with no hidden fees.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center space-x-4 mb-8"
            >
              <span
                className={`text-sm font-medium ${
                  billingPeriod === "month" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingPeriod(billingPeriod === "month" ? "year" : "month")
                }
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === "year" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${
                  billingPeriod === "year" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Yearly
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Save 20%
                </span>
              </span>
            </motion.div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const price =
                plan.price === 0
                  ? 0
                  : billingPeriod === "year"
                  ? getYearlyPrice(plan.price)
                  : plan.price;
              const originalPrice =
                plan.price === 0
                  ? 0
                  : billingPeriod === "year"
                  ? plan.price * 12
                  : plan.price;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? "border-purple-500" : "border-gray-200"
                  } ${plan.recommended ? "ring-2 ring-blue-500" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Recommended
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="text-center mb-6">
                      <div
                        className={`w-16 h-16 ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>

                      <div className="mb-6">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900">
                            ${price}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-gray-500 ml-1">
                              /{billingPeriod === "year" ? "year" : "month"}
                            </span>
                          )}
                        </div>
                        {billingPeriod === "year" && plan.price > 0 && (
                          <div className="flex items-center justify-center mt-2">
                            <span className="text-sm text-gray-500 line-through">
                              ${originalPrice}
                            </span>
                            <span className="text-sm text-green-600 ml-2">
                              Save ${getYearlyDiscount(plan.price)}
                            </span>
                          </div>
                        )}
                        {plan.price === 0 && (
                          <span className="text-sm text-gray-500">
                            No credit card required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        What's included:
                      </h4>
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <div
                          key={limitationIndex}
                          className="flex items-center"
                        >
                          <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-500">
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : plan.recommended
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {plan.price === 0
                        ? "Get Started Free"
                        : `Start ${plan.name}`}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Features Comparison */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Compare Features
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Feature
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">
                      Free
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">
                      Starter
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">
                      Professional
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">
                      Unlimited
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 text-gray-500 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {feature.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {feature.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-4 px-6">
                          <span className="text-sm text-gray-700">
                            {feature.plans.free}
                          </span>
                        </td>
                        <td className="text-center py-4 px-6">
                          <span className="text-sm text-gray-700">
                            {feature.plans.starter}
                          </span>
                        </td>
                        <td className="text-center py-4 px-6">
                          <span className="text-sm text-gray-700">
                            {feature.plans.professional}
                          </span>
                        </td>
                        <td className="text-center py-4 px-6">
                          <span className="text-sm text-gray-700">
                            {feature.plans.unlimited}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I change plans anytime?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes take effect immediately.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-gray-600">
                  Yes, all paid plans come with a 14-day free trial. No credit
                  card required to start.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards, debit cards, and PayPal. All
                  payments are processed securely.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll
                  continue to have access until the end of your billing period.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of businesses using Shivehview to create amazing
                slideshows.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/signup"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Start Free Trial
                </a>
                <a
                  href="/demo"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Watch Demo
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>
              &copy; 2024 Shivehview. All rights reserved. Built & Maintained by{" "}
              <a
                href="https://shivehagency.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-pink-400 font-semibold"
              >
                SHIVEH
              </a>
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-white text-sm"
              >
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="hover:text-white text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

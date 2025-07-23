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
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 39,
    yearlyPrice: 390,
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
    yearlyPrice: 990,
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
    yearlyPrice: 2490,
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
      starter: "Basic",
      professional: "Advanced",
      unlimited: "Full Control",
    },
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getYearlyDiscount = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.2); // 20% discount
  };

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount
  };

  const handlePlanSelect = async (planId: string) => {
    // Call backend to create Stripe Checkout session for selected plan and interval
    const res = await fetch("/api/subscription/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planSlug: planId,
        interval: billingPeriod,
        successUrl: window.location.origin + "/payment-success",
        cancelUrl: window.location.href,
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Failed to start checkout session");
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
      <Header onManageSubscription={handleManageSubscription} />
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50 flex flex-col">
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto text-center py-10 md:py-20 px-4 md:px-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-gradient bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4 md:mb-8"
          >
            Choose Your Perfect Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-gray-700 mb-8 md:mb-12 max-w-2xl mx-auto"
          >
            Start with the plan that fits your business. All features, no hidden
            fees, beautiful results.
          </motion.p>
          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-4 mb-4 md:mb-8"
          >
            <span
              className={`text-base font-medium ${
                billingPeriod === "month" ? "text-purple-700" : "text-gray-400"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingPeriod(billingPeriod === "month" ? "year" : "month")
              }
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-gradient-to-r from-purple-200 to-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  billingPeriod === "year" ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-base font-medium ${
                billingPeriod === "year" ? "text-purple-700" : "text-gray-400"
              }`}
            >
              Yearly
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                Save 20%
              </span>
            </span>
          </motion.div>
        </section>
        {/* Plans Grid - modern, spacious, design system colors */}
        <section className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 md:gap-10 justify-center items-stretch mb-16 px-4 md:px-0">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`w-full md:flex-1 bg-white rounded-3xl shadow-2xl p-8 md:p-10 flex flex-col items-center border-4 ${
                plan.popular ? "border-purple-500" : "border-gray-100"
              } relative transition-transform duration-200 hover:scale-105`}
              style={{ marginBottom: idx < plans.length - 1 ? 32 : 0 }}
            >
              {plan.popular && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-gray-900">
                {plan.name}
              </h2>
              <p className="text-gray-500 mb-5 text-base md:text-lg">
                {plan.description}
              </p>
              <div className="mb-6 flex items-end gap-2">
                <span className="text-4xl md:text-5xl font-extrabold text-purple-700">
                  {billingPeriod === "month"
                    ? "$" + plan.price
                    : "$" + plan.yearlyPrice}
                </span>
                <span className="text-lg text-gray-500 font-medium">
                  / {billingPeriod === "month" ? "month" : "year"}
                </span>
                {billingPeriod === "year" && (
                  <span className="text-green-600 text-xs font-semibold ml-2">
                    7 days free
                  </span>
                )}
              </div>
              <ul className="mb-8 space-y-3 text-gray-700 text-base w-full">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="inline-block w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-400 rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-4 text-lg rounded-xl font-bold transition-all duration-200 shadow-md ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular ? "Get Started" : "Choose Plan"}
              </button>
            </div>
          ))}
        </section>
        {/* Features Comparison */}
        <section className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-700 text-center mb-8 md:mb-12 mt-4 md:mt-8">
            Compare Features
          </h2>
          <div className="overflow-x-auto relative">
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none block md:hidden" />
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Feature
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
        </section>
        {/* FAQ Section */}
        <section className="w-full max-w-3xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow p-6 md:p-10 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-left mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div className="text-left mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                No, all plans are paid. You can cancel anytime.
              </p>
            </div>
            <div className="text-left mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and PayPal. All
                payments are processed securely.
              </p>
            </div>
            <div className="text-left mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll
                continue to have access until the end of your billing period.
              </p>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-4 md:mx-auto bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-8 md:p-12 text-white mb-16 text-center shadow-2xl mt-8 mb-8 px-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Join thousands of businesses using Shivehview to create amazing
            slideshows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-bold hover:bg-purple-50 transition-colors text-lg shadow"
            >
              Start Free Trial
            </a>
            <a
              href="/demo"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-purple-700 transition-colors text-lg shadow"
            >
              Watch Demo
            </a>
          </div>
        </motion.section>
        <Footer />
      </div>
    </>
  );
}

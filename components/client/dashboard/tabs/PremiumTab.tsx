import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Star,
  Zap,
  Sparkles,
  Infinity,
  Shield,
  Users,
  BarChart3,
  Palette,
  Music,
  Download,
  Upload,
  Globe,
  Clock,
  Check,
  X,
  ArrowRight,
  Gift,
  TrendingUp,
  Award,
  Target,
  Rocket,
  Diamond,
  Heart,
  Eye,
  Lock,
  Unlock,
  Settings,
  Bell,
  Calendar,
  FileText,
  Image,
  Video,
  Layers,
  Grid,
  List,
  Maximize,
  Minimize,
  RotateCcw,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Share,
  Link,
  QrCode,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
} from "lucide-react";

export function PremiumTab() {
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Content Generation",
      description: "Unlimited AI-generated facts, quotes, and content",
      premium: true,
    },
    {
      icon: <Infinity className="w-6 h-6" />,
      title: "Unlimited Slideshows",
      description: "Create as many slideshows as you want",
      premium: true,
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Invite team members and collaborate in real-time",
      premium: true,
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Detailed insights into slideshow performance",
      premium: true,
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Premium Themes",
      description: "Access to exclusive design themes and templates",
      premium: true,
    },
    {
      icon: <Music className="w-6 h-6" />,
      title: "Background Music",
      description: "Add custom music to your slideshows",
      premium: true,
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "High-Quality Export",
      description: "Export slideshows in HD quality",
      premium: true,
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Language Support",
      description: "Display content in multiple languages",
      premium: true,
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Priority Support",
      description: "24/7 priority customer support",
      premium: true,
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Scheduled Playback",
      description: "Schedule slideshows to play at specific times",
      premium: true,
    },
    {
      icon: <Grid className="w-6 h-6" />,
      title: "Advanced Layouts",
      description: "Custom grid layouts and arrangements",
      premium: true,
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Layer Management",
      description: "Advanced layering and composition tools",
      premium: true,
    },
  ];

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      features: [
        "3 slideshows",
        "Basic themes",
        "Standard support",
        "720p export",
        "5 AI generations/month",
      ],
      limitations: [
        "No team collaboration",
        "No advanced analytics",
        "No background music",
        "No scheduled playback",
        "No priority support",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: { monthly: 29, yearly: 290 },
      features: [
        "Unlimited slideshows",
        "Premium themes",
        "AI content generation",
        "Background music",
        "HD export",
        "Team collaboration",
        "Advanced analytics",
        "Priority support",
        "Scheduled playback",
        "Multi-language support",
        "Custom layouts",
        "Layer management",
      ],
      limitations: [],
      popular: true,
    },
    {
      name: "Enterprise",
      price: { monthly: 99, yearly: 990 },
      features: [
        "Everything in Pro",
        "White-label solution",
        "Custom integrations",
        "Dedicated account manager",
        "API access",
        "Custom branding",
        "Advanced security",
        "Multi-location support",
        "Custom training",
        "SLA guarantee",
      ],
      limitations: [],
      popular: false,
    },
  ];

  const benefits = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "10x Faster Creation",
      description:
        "AI-powered tools help you create stunning slideshows in minutes, not hours.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Boost Engagement",
      description:
        "Interactive content and advanced features increase customer engagement by 300%.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Professional Quality",
      description:
        "Access to premium themes and tools that make your content look professional.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Targeted Content",
      description:
        "Create personalized content for different audiences and locations.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const testimonials = [
    {
      name: "Ahmad Karimi",
      role: "Restaurant Owner",
      content:
        "AfghanView Premium transformed our restaurant's digital signage. The AI content generation saves us hours every week!",
      rating: 5,
      avatar: "AK",
    },
    {
      name: "Fatima Zahra",
      role: "Marketing Manager",
      content:
        "The team collaboration features are incredible. We can now work together seamlessly across multiple locations.",
      rating: 5,
      avatar: "FZ",
    },
    {
      name: "Hassan Ali",
      role: "Business Owner",
      content:
        "The analytics help us understand what content performs best. Our customer engagement has increased dramatically.",
      rating: 5,
      avatar: "HA",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
        >
          <Crown className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-4">
          Unlock Premium Features
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Take your slideshows to the next level with AI-powered content
          generation, unlimited creations, team collaboration, and advanced
          analytics.
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 text-center"
          >
            <div
              className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
            >
              {benefit.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {benefit.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {benefit.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Pricing Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-gray-600 mb-8">
            Start free and upgrade when you're ready
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span
              className={`text-sm font-medium ${
                selectedPlan === "monthly" ? "text-gray-800" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <motion.button
              onClick={() =>
                setSelectedPlan(
                  selectedPlan === "monthly" ? "yearly" : "monthly"
                )
              }
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                selectedPlan === "yearly"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500"
                  : "bg-gray-300"
              }`}
            >
              <motion.div
                layout
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: selectedPlan === "yearly" ? 32 : 4 }}
              />
            </motion.button>
            <span
              className={`text-sm font-medium ${
                selectedPlan === "yearly" ? "text-gray-800" : "text-gray-500"
              }`}
            >
              Yearly
              <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                plan.popular
                  ? "border-purple-500 shadow-purple-100"
                  : "border-gray-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  {plan.price[selectedPlan as keyof typeof plan.price] === 0 ? (
                    <span className="text-4xl font-bold text-gray-800">
                      Free
                    </span>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-gray-800">
                        ${plan.price[selectedPlan as keyof typeof plan.price]}
                      </span>
                      <span className="text-gray-600 ml-2">
                        /{selectedPlan === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  {plan.name === "Free"
                    ? "Perfect for getting started"
                    : plan.name === "Pro"
                    ? "Perfect for growing businesses"
                    : "Perfect for large organizations"}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold text-gray-800 mb-3">
                  What's included:
                </h4>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitationIndex) => (
                  <div
                    key={limitationIndex}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3 text-red-600" />
                    </div>
                    <span className="text-sm text-gray-500">{limitation}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (plan.name !== "Free") {
                    setShowUpgradeModal(true);
                  }
                }}
                className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                    : plan.name === "Free"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800"
                }`}
              >
                {plan.name === "Free" ? "Current Plan" : "Get Started"}
                {plan.name !== "Free" && (
                  <ArrowRight className="w-4 h-4 inline ml-2" />
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Feature Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Premium Features
          </h2>
          <p className="text-gray-600">
            Discover what makes AfghanView Premium special
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
              {feature.premium && (
                <div className="mt-4 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-600">
                    Premium Feature
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-600">Join thousands of satisfied customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-3xl p-8 lg:p-12 text-center text-white"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2 }}
          className="w-20 h-20 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <Rocket className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Join thousands of businesses that have already upgraded to AfghanView
          Premium and are seeing incredible results.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpgradeModal(true)}
            className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Free Trial
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300"
          >
            View Demo
          </motion.button>
        </div>
      </motion.div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Upgrade to Premium
              </h3>
              <p className="text-gray-600 mb-8">
                You'll be redirected to our secure payment processor to complete
                your upgrade.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Redirect to payment page
                    window.location.href = "/pricing";
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

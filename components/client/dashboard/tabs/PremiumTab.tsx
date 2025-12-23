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
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Boost Engagement",
      description:
        "Interactive content and advanced features increase customer engagement by 300%.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Professional Quality",
      description:
        "Access to premium themes and tools that make your content look professional.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Targeted Content",
      description:
        "Create personalized content for different audiences and locations.",
    },
  ];

  const testimonials = [
    {
      name: "Ahmad Karimi",
      role: "Restaurant Owner",
      content:
        "Shivehview Premium transformed our restaurant's digital signage. The AI content generation saves us hours every week!",
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
        className="text-center pt-10"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-black/20"
        >
          <Crown className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-5xl lg:text-7xl font-bold text-black mb-6 tracking-tighter">
          Elevate Your Brand
        </h1>
        <p className="text-xl text-black/40 max-w-2xl mx-auto leading-relaxed font-medium">
          Scale your content strategy with limitless assets, intelligent automation, and deep telemetry.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5 text-center group"
          >
            <div
              className="w-20 h-20 bg-gray-50 rounded-[1.8rem] flex items-center justify-center mx-auto mb-8 border border-black/5 group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-sm"
            >
              {React.cloneElement(benefit.icon as React.ReactElement, { className: "w-8 h-8" })}
            </div>
            <h3 className="text-xl font-bold text-black mb-3 tracking-tight">
              {benefit.title}
            </h3>
            <p className="text-black/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
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
          <h2 className="text-3xl font-bold text-black tracking-tight mb-4">
            Network Scalability
          </h2>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] mb-12">
            Select Your Computational Tier
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-6 mb-16">
            <span
              className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${selectedPlan === "monthly" ? "text-black" : "text-black/20"
                }`}
            >
              Interval Single
            </span>
            <button
              onClick={() =>
                setSelectedPlan(
                  selectedPlan === "monthly" ? "yearly" : "monthly"
                )
              }
              className={`relative w-16 h-8 rounded-full transition-all duration-500 p-1 ${selectedPlan === "yearly"
                ? "bg-black"
                : "bg-black/10"
                }`}
            >
              <motion.div
                layout
                className="w-6 h-6 bg-white rounded-full shadow-lg"
                animate={{ x: selectedPlan === "yearly" ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${selectedPlan === "yearly" ? "text-black" : "text-black/20"
                  }`}
              >
                Interval Annual
              </span>
              <span className="bg-black text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest">
                -20%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4 }}
              className={`relative bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/[0.03] border transition-all duration-300 ${plan.popular
                ? "border-black border-2"
                : "border-black/5"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-10">
                  <span className="bg-black text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl">
                    Optimized Tier
                  </span>
                </div>
              )}

              <div className="flex items-end justify-between mb-12">
                <div>
                  <h3 className="text-3xl font-bold text-black mb-2 tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                    {plan.name === "Pro" ? "Scaling Operations" : "Full Core Integration"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end">
                    <span className="text-4xl font-bold text-black tracking-tighter">
                      ${plan.price[selectedPlan as keyof typeof plan.price]}
                    </span>
                    <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest ml-2">
                      /{selectedPlan === "monthly" ? "MO" : "YR"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 mb-12">
                <p className="text-[10px] font-bold text-black uppercase tracking-[0.2em] mb-6">Capabilities Overview</p>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/10">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-black/60 uppercase tracking-wide">{feature}</span>
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
                className={`w-full py-5 px-8 rounded-2xl font-bold transition-all duration-300 text-xs uppercase tracking-widest shadow-xl ${plan.popular
                  ? "bg-black text-white hover:bg-black/90 shadow-black/20"
                  : "bg-gray-100 text-black hover:bg-gray-200"
                  }`}
              >
                Initialize {plan.name} Tier
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
        <div className="text-center pt-20">
          <h2 className="text-3xl font-bold text-black tracking-tight mb-4">
            Advanced Protocols
          </h2>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em]">
            Deep Level Functional Extensions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-black/[0.03] border border-black/5 hover:bg-gray-50/50 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-black/5 group-hover:bg-black group-hover:text-white transition-all">
                {React.cloneElement(feature.icon as React.ReactElement, { className: "w-6 h-6" })}
              </div>
              <h3 className="text-lg font-bold text-black mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-black/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                {feature.description}
              </p>
              {feature.premium && (
                <div className="mt-6 pt-6 border-t border-black/5 flex items-center gap-2">
                  <div className="p-1 bg-black rounded-md">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[9px] font-bold text-black uppercase tracking-widest">
                    Enterprise Protocol
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
        <div className="text-center pt-20">
          <h2 className="text-3xl font-bold text-black tracking-tight mb-4">
            User Validation
          </h2>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.3em]">Verified Network Sentiments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-black/5"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-black fill-current"
                  />
                ))}
              </div>
              <p className="text-black/60 font-medium italic mb-10 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-black/5">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-black/20">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-black tracking-tight">
                    {testimonial.name}
                  </p>
                  <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black rounded-[4rem] p-16 lg:p-24 text-center text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

        <div className="relative z-10">
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-black/20"
          >
            <Rocket className="w-10 h-10 text-black" />
          </motion.div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tighter">
            Initialize Full Stack Growth
          </h2>
          <p className="text-xl text-white/40 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Join the elite network of businesses leveraging our core AI architecture for high-performance visual communication.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUpgradeModal(true)}
              className="bg-white text-black px-12 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all shadow-2xl shadow-black/20"
            >
              Start Core Trial
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="border border-white/20 text-white px-12 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              View Architecture
            </motion.button>
          </div>
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-2xl shadow-black/20 border border-black/5 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] rounded-full -mr-16 -mt-16 blur-2xl"></div>

            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-black/20">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-black tracking-tight mb-4">
                Access Tier Protocol
              </h3>
              <p className="text-black/40 text-[11px] font-bold uppercase tracking-widest mb-12 max-w-xs mx-auto">
                Initiating payment gateway for secure account verification.
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-gray-50 text-black/40 py-5 rounded-2xl hover:bg-black/5 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  Abort
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.location.href = "/pricing";
                  }}
                  className="flex-2 bg-black text-white py-5 px-10 rounded-2xl hover:bg-black/90 transition-all text-xs font-bold uppercase tracking-widest shadow-xl shadow-black/10"
                >
                  Confirm Sync
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

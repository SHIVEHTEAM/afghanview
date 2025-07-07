import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Globe,
  Smartphone,
  Tv,
  BarChart3,
  Settings,
  Image as ImageIcon,
  Crown,
  Sparkles,
  Brain,
  Wand2,
  Lightbulb,
  Target,
  FileText,
  Video,
  Palette,
  Eye,
} from "lucide-react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small restaurants getting started",
      monthlyPrice: 39,
      yearlyPrice: 390,
      slides: "Up to 10 Slides",
      aiCredits: "25 AI Credits",
      features: [
        "Up to 10 slides",
        "Basic templates",
        "TV display",
        "Mobile app access",
        "Email support",
        "1 restaurant location",
        "25 AI credits/month",
        "Basic analytics",
        "QR code generation",
        "Background music (limited)",
        "1 custom slide built by our designers",
      ],
      popular: false,
      color: "border-gray-200",
      icon: <Tv className="w-8 h-8" />,
      aiFeatures: ["Basic AI Content", "Simple Templates"],
    },
    {
      name: "Pro",
      description: "Best for growing restaurants with multiple locations",
      monthlyPrice: 99,
      yearlyPrice: 990,
      slides: "Unlimited Slides",
      aiCredits: "100 AI Credits",
      features: [
        "Unlimited slides",
        "Premium templates",
        "Multiple TV displays",
        "Analytics dashboard",
        "QR code integration",
        "Background music",
        "Priority support",
        "Up to 3 locations",
        "AI content generation (100 credits/month)",
        "Scheduled content",
        "Menu management",
        "Custom branding",
        "25GB storage",
        "Advanced analytics",
        "3 custom slides built by our designers",
      ],
      popular: true,
      color: "border-purple-500",
      icon: <Crown className="w-8 h-8" />,
      aiFeatures: [
        "Advanced AI Content",
        "Menu Optimization",
        "Fact Generation",
      ],
    },
    {
      name: "Business",
      description: "For restaurant chains and franchises",
      monthlyPrice: 249,
      yearlyPrice: 2490,
      slides: "Unlimited Slides",
      aiCredits: "500 AI Credits",
      features: [
        "Everything in Pro",
        "Unlimited locations",
        "Team collaboration",
        "Advanced analytics",
        "Custom branding",
        "API access",
        "White-label options",
        "Dedicated support",
        "AI content generation (500 credits/month)",
        "Multi-language support",
        "Advanced scheduling",
        "Custom integrations",
        "100GB storage",
        "24/7 phone support",
        "10 custom slides built by our designers",
      ],
      popular: false,
      color: "border-gray-200",
      icon: <Sparkles className="w-8 h-8" />,
      aiFeatures: ["Unlimited AI", "Custom Training", "Multi-language"],
    },
  ];

  const aiFeatures = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Content Generation",
      description: "Automatically create engaging cultural content and facts",
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: "Menu Optimization",
      description: "AI suggests optimal layouts and descriptions for your menu",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Cultural Facts",
      description:
        "Generate interesting facts about Afghanistan's culture and history",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Recommendations",
      description: "AI recommends content based on your restaurant's theme",
    },
  ];

  const faqs = [
    {
      question: "What's included in the free plan?",
      answer:
        "The free plan includes up to 10 slides, basic templates, TV display, mobile app access, email support, and 10 AI credits per month. Perfect for small restaurants getting started.",
    },
    {
      question: "How many slides do I need?",
      answer:
        "Start with 10 slides for basic needs (welcome, menu, hours, specials). Most restaurants use 15-25 slides for variety. Pro and Business plans offer unlimited slides.",
    },
    {
      question: "Can I upgrade my plan later?",
      answer:
        "Yes, you can upgrade anytime. We'll prorate the difference and you'll get immediate access to more features, slides, and AI credits.",
    },
    {
      question: "What if I need more AI credits?",
      answer:
        "You can purchase additional AI credits for $0.10 each, or upgrade to a higher plan for better value and more credits included.",
    },
    {
      question: "Do you offer discounts for multiple locations?",
      answer:
        "Yes! Contact us for custom pricing when you have multiple restaurant locations. Business plans include unlimited locations.",
    },
    {
      question: "Is there a setup fee?",
      answer:
        "No setup fees! All plans include a 14-day free trial and we'll help you get started at no additional cost.",
    },
  ];

  return (
    <>
      <Head>
        <title>Pricing - ShivehView</title>
        <meta
          name="description"
          content="Choose the perfect AI-powered plan for your restaurant"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <Eye className="h-8 w-8 text-purple-600" />
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  ShivehView
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  About
                </Link>
                <Link
                  href="/demo"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Demo
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-purple-700 hover:to-pink-700"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30">
                  <Brain className="w-4 h-4 mr-2" />
                  AI-Powered Pricing
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Simple, Transparent
                <br />
                <span className="text-afghan-gold drop-shadow-lg">
                  AI-Powered Pricing
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Choose the plan that fits your restaurant's needs. All plans
                include AI credits and a 14-day free trial.
              </motion.p>

              {/* Billing Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex items-center justify-center space-x-4 mb-8"
              >
                <span className="text-white">Monthly</span>
                <button
                  onClick={() =>
                    setBillingCycle(
                      billingCycle === "monthly" ? "yearly" : "monthly"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    billingCycle === "yearly" ? "bg-afghan-gold" : "bg-white/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === "yearly"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-white">Yearly</span>
                <span className="bg-afghan-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Save 20%
                </span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                AI-Powered Features Included
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Every plan includes our advanced AI technology to enhance your
                restaurant experience
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  className={`relative bg-white p-8 rounded-2xl shadow-lg border-2 ${
                    plan.popular ? "border-afghan-green scale-105" : plan.color
                  } hover:shadow-xl transition-all duration-300`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-afghan-green text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-afghan-green to-purple-600 text-white mb-4">
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        $
                        {billingCycle === "monthly"
                          ? plan.monthlyPrice
                          : plan.yearlyPrice}
                      </span>
                      <span className="text-gray-600">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="text-afghan-green font-semibold text-lg">
                        {plan.slides}
                      </div>
                      <div className="text-purple-600 font-semibold text-sm">
                        {plan.aiCredits}
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-afghan-green mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.aiFeatures && (
                    <div className="mb-8 p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Features
                      </h4>
                      <ul className="space-y-1">
                        {plan.aiFeatures.map((aiFeature, aiIndex) => (
                          <li
                            key={aiIndex}
                            className="text-purple-700 text-sm flex items-center"
                          >
                            <Sparkles className="w-3 h-3 mr-2" />
                            {aiFeature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link
                    href="/auth/signup"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                      plan.popular
                        ? "bg-afghan-green text-white hover:bg-afghan-green/90"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    Get Started
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Everything you need to know about our AI-powered pricing
              </motion.p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-afghan-green to-afghan-red">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              className="text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your Restaurant?
            </motion.h2>
            <motion.p
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Start your 14-day free trial today and experience the power of
              AI-powered cultural displays.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-afghan-green bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-afghan-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform hover:scale-105"
                >
                  View Live Demo
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">ShivehView</h3>
                <p className="text-gray-400">
                  AI-powered platform transforming restaurants into cultural
                  experiences through beautiful digital displays.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-white transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="hover:text-white transition-colors"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/demo"
                      className="hover:text-white transition-colors"
                    >
                      Live Demo
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-white transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <a
                      href="mailto:contact@shivehview.com"
                      className="hover:text-white transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:support@shivehview.com"
                      className="hover:text-white transition-colors"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>
                &copy; 2024 ShivehView. All rights reserved. Built & Maintained
                by{" "}
                <a
                  href="https://shivehagency.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-afghan-green hover:text-afghan-gold transition-colors font-semibold"
                >
                  SHIVEH
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

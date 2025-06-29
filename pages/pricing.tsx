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
} from "lucide-react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small restaurants just getting started",
      monthlyPrice: 29,
      yearlyPrice: 290,
      slides: "3 Slides",
      features: [
        "3 Slides Included",
        "1 Restaurant Location",
        "Basic Templates",
        "5GB Storage",
        "Email Support",
        "Mobile Management",
        "QR Code Generation",
        "Basic Analytics",
      ],
      popular: false,
      color: "border-gray-200",
      icon: <Tv className="w-8 h-8" />,
    },
    {
      name: "Professional",
      description: "Ideal for growing restaurants with multiple locations",
      monthlyPrice: 79,
      yearlyPrice: 790,
      slides: "10 Slides",
      features: [
        "10 Slides Included",
        "Up to 3 Locations",
        "Custom Branding",
        "25GB Storage",
        "Priority Support",
        "Advanced Analytics",
        "Menu Management",
        "Social Media Integration",
        "Custom Templates",
        "Bulk Upload",
      ],
      popular: true,
      color: "border-afghan-green",
      icon: <Crown className="w-8 h-8" />,
    },
    {
      name: "Enterprise",
      description: "For restaurant chains and large operations",
      monthlyPrice: 199,
      yearlyPrice: 1990,
      slides: "Unlimited Slides",
      features: [
        "Unlimited Slides",
        "Unlimited Locations",
        "Custom Development",
        "100GB Storage",
        "24/7 Phone Support",
        "Advanced Analytics",
        "API Access",
        "White-label Options",
        "Dedicated Manager",
        "Custom Integrations",
      ],
      popular: false,
      color: "border-gray-200",
      icon: <Sparkles className="w-8 h-8" />,
    },
  ];

  const features = [
    {
      icon: <Tv className="w-6 h-6" />,
      title: "Smart TV Display",
      description: "Transform any Smart TV into a cultural showcase",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Management",
      description: "Update content from anywhere using our mobile app",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Cloud Sync",
      description: "All content syncs automatically across locations",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics",
      description: "Track engagement and performance metrics",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and 99.9% uptime",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Easy Setup",
      description: "Get started in minutes with our simple setup",
    },
  ];

  const faqs = [
    {
      question: "How many slides do I need?",
      answer:
        "Start with 3 slides for basic needs (welcome, menu, hours). Most restaurants use 5-10 slides for variety. Enterprise plans offer unlimited slides.",
    },
    {
      question: "Can I upgrade my plan later?",
      answer:
        "Yes, you can upgrade anytime. We'll prorate the difference and you'll get immediate access to more slides and features.",
    },
    {
      question: "What if I need more slides?",
      answer:
        "You can purchase additional slides for $5/month each, or upgrade to a higher plan for better value.",
    },
    {
      question: "Do you offer discounts for multiple locations?",
      answer:
        "Yes! Contact us for custom pricing when you have multiple restaurant locations.",
    },
  ];

  return (
    <>
      <Head>
        <title>Pricing - AfghanView</title>
        <meta
          name="description"
          content="Choose the perfect plan for your restaurant"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-gradient">
                AfghanView
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-afghan-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/demo"
                  className="text-gray-700 hover:text-afghan-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  Demo
                </Link>
                <Link
                  href="/client"
                  className="text-gray-700 hover:text-afghan-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  Client Dashboard
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-afghan-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-afghan-green text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-afghan-green/90"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-afghan-green via-afghan-red to-afghan-gold">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Choose the plan that fits your restaurant's needs. All plans
              include a 14-day free trial.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              className="flex items-center justify-center space-x-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span
                className={`text-white ${
                  billingCycle === "monthly" ? "opacity-100" : "opacity-60"
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly"
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === "yearly" ? "bg-white" : "bg-white/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-afghan-green transition-transform ${
                    billingCycle === "yearly"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-white ${
                  billingCycle === "yearly" ? "opacity-100" : "opacity-60"
                }`}
              >
                Yearly
                <span className="ml-2 bg-white text-afghan-green px-2 py-1 rounded-full text-xs font-semibold">
                  Save 20%
                </span>
              </span>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  className={`relative bg-white p-8 rounded-2xl shadow-lg border-2 ${
                    plan.color
                  } ${
                    plan.popular ? "scale-105" : ""
                  } hover:shadow-xl transition-all duration-300`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-afghan-green text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-afghan-green mb-4 flex justify-center">
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    {/* Slide Count */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center mb-2">
                        <ImageIcon className="w-6 h-6 text-afghan-green mr-2" />
                        <span className="text-2xl font-bold text-afghan-green">
                          {plan.slides}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">included</p>
                    </div>

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

                    <Link
                      href="/auth/signup"
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                        plan.popular
                          ? "bg-afghan-green text-white hover:bg-afghan-green/90"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2 inline" />
                    </Link>
                  </div>

                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                AfghanView provides all the tools you need to create an engaging
                restaurant experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <div className="text-afghan-green mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-afghan-green to-afghan-red">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              className="text-3xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Ready to Transform Your Restaurant?
            </motion.h2>
            <motion.p
              className="text-xl text-white/90 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Start your 14-day free trial today. No credit card required.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="/auth/signup"
                className="bg-white text-afghan-green px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: 39,
    yearlyPrice: 390,
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
    popular: false,
    cta: "Start with Starter",
    href: "/pricing?plan=starter",
  },
  {
    name: "Professional",
    price: 99,
    yearlyPrice: 990,
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
    popular: true,
    cta: "Start with Professional",
    href: "/pricing?plan=professional",
  },
  {
    name: "Unlimited",
    price: 249,
    yearlyPrice: 2490,
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
    popular: false,
    cta: "Start with Unlimited",
    href: "/pricing?plan=unlimited",
  },
];

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");

  // Handle plan selection: navigate to the plan's href
  const handlePlanSelect = (href: string) => {
    window.location.href = href;
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your restaurant's needs. All plans include
            our core features with no hidden fees.
          </p>
        </motion.div>

        {/* Billing period toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                billingPeriod === "month"
                  ? "bg-purple-600 text-white"
                  : "text-gray-700"
              }`}
              onClick={() => setBillingPeriod("month")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                billingPeriod === "year"
                  ? "bg-purple-600 text-white"
                  : "text-gray-700"
              }`}
              onClick={() => setBillingPeriod("year")}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Add a modern, visually appealing pricing section */}
        <div className="py-20 bg-gradient-to-b from-white to-gray-50">
          <h2 className="text-4xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-lg text-gray-600 mb-10">
            Choose the plan that fits your business. No hidden fees. Cancel
            anytime.
          </p>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mb-12">
            {plans.map((plan, idx) => (
              <div
                key={plan.name}
                className={`flex-1 bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border-2 transition-all duration-200 ${
                  plan.popular
                    ? "border-purple-600 scale-105 z-10"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <span className="px-3 py-1 mb-2 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-end mb-2">
                  <span className="text-4xl font-extrabold">
                    {billingPeriod === "year" ? plan.yearlyPrice : plan.price}
                  </span>
                  <span className="text-lg text-gray-500 ml-1">
                    / {billingPeriod === "year" ? "year" : "month"}
                  </span>
                </div>
                {billingPeriod === "year" && (
                  <span className="text-green-600 text-sm mb-2">
                    2 months free
                  </span>
                )}
                <p className="text-gray-600 mb-4 text-center">
                  {plan.description}
                </p>
                <ul className="mb-6 space-y-2 text-gray-700 text-sm w-full">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                    plan.popular
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-800 hover:bg-gray-900"
                  }`}
                  onClick={() => handlePlanSelect(plan.href)}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <a
              href="/pricing"
              className="text-purple-600 underline font-medium text-lg"
            >
              See detailed plan comparison
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Restaurant?
            </h3>
            <p className="text-lg opacity-90 mb-6">
              Join thousands of restaurants already using our platform to create
              engaging digital displays that drive sales and enhance customer
              experience.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Start Your Free Trial
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

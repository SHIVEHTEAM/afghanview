import React from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$39",
    period: "per month",
    description: "Perfect for small restaurants getting started",
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
    cta: "Start with Starter",
    href: "/auth/signup",
  },
  {
    name: "Pro",
    price: "$99",
    period: "per month",
    description: "Best for growing restaurants with multiple locations",
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
    cta: "Start with Pro",
    href: "/auth/signup",
  },
  {
    name: "Business",
    price: "$249",
    period: "per month",
    description: "For restaurant chains and franchises",
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
    cta: "Contact Sales",
    href: "/contact",
  },
];

export default function PricingSection() {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-purple-500 shadow-purple-100 scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-1">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
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
              href="/auth/signup"
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

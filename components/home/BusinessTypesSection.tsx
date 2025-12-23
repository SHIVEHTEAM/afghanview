import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Utensils,
  Store,
  Building,
  Heart,
  Music,
  GraduationCap,
  Home,
  Briefcase,
} from "lucide-react";

const businessTypes = [
  {
    id: "restaurant",
    name: "Restaurants",
    description: "Showcase menus, daily specials, and create engaging dining experiences",
    icon: Utensils,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    features: ["Menu Display", "Daily Specials", "QR Codes", "Reservations"],
  },
  {
    id: "real_estate",
    name: "Real Estate",
    description: "Display property listings, agent profiles, and open house events",
    icon: Home,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    features: ["Property Listings", "Agent Profiles", "Open Houses", "Virtual Tours"],
  },
  {
    id: "retail",
    name: "Retail Stores",
    description: "Showcase products, promotions, and create engaging shopping experiences",
    icon: Store,
    color: "from-green-500 to-teal-600",
    bgColor: "bg-green-50",
    features: ["Product Catalog", "Promotions", "New Arrivals", "Sales"],
  },
  {
    id: "service",
    name: "Service Businesses",
    description: "Display services, team profiles, and professional information",
    icon: Briefcase,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    features: ["Service Overview", "Team Profiles", "Contact Info", "Company News"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Showcase medical services, doctor profiles, and health information",
    icon: Heart,
    color: "from-red-500 to-pink-600",
    bgColor: "bg-red-50",
    features: ["Service List", "Doctor Profiles", "Appointments", "Health Tips"],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    description: "Promote events, shows, and create engaging entertainment displays",
    icon: Music,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    features: ["Event Calendar", "Show Schedules", "Promotions", "Venue Info"],
  },
  {
    id: "education",
    name: "Education",
    description: "Display courses, faculty profiles, and educational content",
    icon: GraduationCap,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50",
    features: ["Course Catalog", "Faculty Profiles", "Events", "Achievements"],
  },
  {
    id: "other",
    name: "Other Businesses",
    description: "Customizable displays for any type of business or organization",
    icon: Building,
    color: "from-gray-500 to-slate-600",
    bgColor: "bg-gray-50",
    features: ["Custom Content", "Flexible Templates", "Multi-Purpose", "Scalable"],
  },
];

export default function BusinessTypesSection() {
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
            Perfect for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {" "}
              Every Business Type
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you run a restaurant, real estate agency, retail store, or any
            other business, our platform adapts to your needs with specialized
            features and templates.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${type.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>

              <div
                className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${type.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <type.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {type.name}
              </h3>

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {type.description}
              </p>

              <div className="space-y-2">
                {type.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center text-xs text-gray-500"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${type.color} mr-2`}
                    ></div>
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  href="/auth/signup"
                  className={`text-sm font-medium bg-gradient-to-r ${type.color} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                >
                  Get Started →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">
            Don't see your business type? Our platform is flexible and can be
            customized for any industry.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Your Free Trial
          </Link>
        </motion.div>
      </div>
    </section>
  );
}


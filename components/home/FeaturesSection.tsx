import React from "react";
import { motion } from "framer-motion";
import {
  Tv,
  Smartphone,
  Palette,
  BarChart3,
  Zap,
  Globe,
  QrCode,
  Music,
  Clock,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Tv,
    title: "TV Display",
    description:
      "Show your slideshows on any TV or monitor with our easy-to-use display system.",
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: Smartphone,
    title: "Mobile Management",
    description:
      "Create and manage your slideshows from anywhere using your smartphone or tablet.",
    color: "from-green-500 to-teal-600",
  },
  {
    icon: Palette,
    title: "Beautiful Templates",
    description:
      "Choose from hundreds of professionally designed templates for restaurants.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Track engagement, view counts, and understand what content performs best.",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Zap,
    title: "AI-Powered Content",
    description:
      "Generate cultural facts, menu descriptions, and promotional content with AI.",
    color: "from-purple-500 to-indigo-600",
  },
  {
    icon: QrCode,
    title: "QR Code Integration",
    description:
      "Let customers scan QR codes to view your full menu or place orders.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Music,
    title: "Background Music",
    description:
      "Add ambient music to create the perfect atmosphere for your restaurant.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Clock,
    title: "Scheduled Content",
    description:
      "Set different content for different times of day automatically.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Display content in multiple languages including Persian, Pashto, and English.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite staff members to help create and manage your content.",
    color: "from-violet-500 to-purple-600",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {" "}
              Digital Restaurant Displays
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From creating stunning slideshows to managing multiple displays, we
            provide all the tools you need to transform your restaurant's
            digital presence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
            <button className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300">
              Start Your Free Trial
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

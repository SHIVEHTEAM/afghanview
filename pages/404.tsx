import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Home,
  ArrowLeft,
  Search,
  MapPin,
  Users,
  Tv,
  Crown,
  Sparkles,
} from "lucide-react";

export default function Custom404() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const quickLinks = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      description: "Return to homepage",
    },
    {
      name: "Client Dashboard",
      href: "/client",
      icon: Users,
      description: "Manage your business",
    },
    {
      name: "TV Management",
      href: "/client/tv",
      icon: Tv,
      description: "Connect your displays",
    },
    {
      name: "Premium Features",
      href: "/client/premium",
      icon: Crown,
      description: "View your plan",
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: Sparkles,
      description: "See our plans",
    },
  ];

  return (
    <>
      <Head>
        <title>Page Not Found - Shivehview</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            {/* 404 Number */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
            >
              404
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              Oops! Page Not Found
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              The page you're looking for seems to have wandered off like a lost
              traveler in the mountains of Afghanistan. Let's get you back on
              track!
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <button
                onClick={goBack}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Popular Pages
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                >
                  <Link
                    href={link.href}
                    className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-colors duration-200">
                        <link.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {link.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="relative"
          >
            {/* Afghan-inspired decorative pattern */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-blue-200 rounded-full opacity-20"></div>
              <div className="absolute w-48 h-48 border-2 border-purple-200 rounded-full opacity-20"></div>
              <div className="absolute w-32 h-32 border-2 border-pink-200 rounded-full opacity-20"></div>
            </div>

            {/* Contact Info */}
            <div className="relative z-10 text-center">
              <p className="text-gray-500 mb-2">
                Need help? Contact our support team
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <a
                  href="mailto:contact@shivehview.com"
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  contact@shivehview.com
                </a>
                <span>•</span>
                <a
                  href="https://instagram.com/shivehview.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  @shivehview.tv
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

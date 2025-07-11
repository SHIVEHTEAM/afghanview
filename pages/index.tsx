import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, Eye } from "lucide-react";
import {
  HeroSection,
  FeaturesSection,
  PricingSection,
} from "../components/home";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>
          Shivehview - AI-Powered Business Display Platform | Digital Signage
        </title>
        <meta
          name="description"
          content="Transform your business with Shivehview - The AI-powered display platform for Afghan businesses with auto-generated cultural content, digital displays, and TV management."
        />
        <meta
          name="keywords"
          content="business digital signage, AI content creation, Afghan business technology, digital display, TV management, slideshow creator, Shivehview"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Shivehview - AI-Powered Business Display Platform"
        />
        <meta
          property="og:description"
          content="Transform your business with AI-powered digital signage, cultural content, and digital displays."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shivehview.com" />
        <meta
          property="og:image"
          content="https://shivehview.com/Shivehview%20Transparent%20Logo.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Shivehview - AI-Powered Business Display Platform"
        />
        <meta
          name="twitter:description"
          content="Transform your business with AI-powered digital signage and cultural content."
        />
        <meta
          name="twitter:image"
          content="https://shivehview.com/Shivehview%20Transparent%20Logo.png"
        />
        <link rel="canonical" href="https://shivehview.com" />
        <link rel="icon" href="/Shivehview Transparent Logo.png" />
        <link rel="apple-touch-icon" href="/Shivehview Transparent Logo.png" />
      </Head>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <img
                  src="/Shivehview Transparent Logo.png"
                  alt="Shivehview Logo"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  Shivehview
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="#features"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pricing
                </a>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  About
                </Link>
                <Link
                  href="/blog"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Blog
                </Link>
                <Link
                  href="/client"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Client Dashboard
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

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-600"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Pricing
              </a>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                About
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Blog
              </Link>
              <Link
                href="/client"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Client Dashboard
              </Link>
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:from-purple-700 hover:to-pink-700"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/Shivehview Transparent Logo.png"
                  alt="Shivehview Logo"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold tracking-tight">
                  Shivehview
                </span>
              </div>
              <p className="text-gray-400">
                AI-powered business display platform for creating engaging
                cultural experiences and digital content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-white">
                    Live Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:contact@shivehview.com"
                    className="hover:text-white"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy-policy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
              <p>
                &copy; 2024 Shivehview. All rights reserved. Built & Maintained
                by{" "}
                <a
                  href="https://shivehagency.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-pink-400 font-semibold"
                >
                  SHIVEH
                </a>
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link
                  href="/privacy-policy"
                  className="hover:text-white text-sm"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="hover:text-white text-sm"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookie-policy"
                  className="hover:text-white text-sm"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

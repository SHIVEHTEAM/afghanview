import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Globe,
  Users,
  Award,
  Star,
  Sparkles,
  Brain,
  Target,
  Shield,
  Zap,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
} from "lucide-react";

export default function About() {
  const team = [
    {
      name: "Ahmad Seyar Hasir",
      role: "Founder & CEO",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      bio: "Passionate about preserving and sharing Afghan culture through technology.",
    },
    {
      name: "Development Team",
      role: "SHIVEH Agency",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      bio: "Dedicated to building innovative solutions that connect cultures.",
    },
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Cultural Preservation",
      description:
        "We believe in preserving and celebrating Afghanistan's rich cultural heritage through modern technology.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Connection",
      description:
        "Connecting Afghan communities worldwide through shared cultural experiences and authentic cuisine.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community First",
      description:
        "Supporting Afghan restaurant owners and helping them succeed in the competitive food industry.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Innovation",
      description:
        "Leveraging AI and cutting-edge technology to create unique, engaging experiences for customers.",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: "Platform Launch",
      description:
        "ShivehView officially launched with AI-powered cultural content generation.",
    },
    {
      year: "2024",
      title: "500+ Restaurants",
      description:
        "Reached 500+ Afghan restaurants using our platform across the globe.",
    },
    {
      year: "2024",
      title: "AI Integration",
      description:
        "Introduced advanced AI features for automatic content generation and cultural facts.",
    },
    {
      year: "2024",
      title: "Global Expansion",
      description:
        "Expanded to serve Afghan restaurants in over 20 countries worldwide.",
    },
  ];

  return (
    <>
      <Head>
        <title>About Us - ShivehView</title>
        <meta
          name="description"
          content="Learn about ShivehView's mission to preserve Afghan culture and support restaurant owners worldwide"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <img
                  src="/Shivehview Transparent Logo.png"
                  alt="ShivehView Logo"
                  style={{ height: 40 }}
                />
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-afghan-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pricing
                </Link>
                <Link
                  href="/demo"
                  className="text-gray-700 hover:text-afghan-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  Demo
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
        <section className="pt-20 pb-16 bg-gradient-to-br from-afghan-green via-pink-600 to-yellow-400 relative overflow-hidden">
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
                  <Heart className="w-4 h-4 mr-2" />
                  Our Story
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Preserving Afghan Culture
                <br />
                <span className="text-afghan-gold drop-shadow-lg">
                  Through Technology
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                ShivehView was born from a deep love for Afghan culture and a
                vision to help Afghan restaurants worldwide share their heritage
                with customers through beautiful, AI-powered digital displays.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  We're on a mission to preserve and celebrate Afghanistan's
                  rich cultural heritage while helping Afghan restaurant owners
                  succeed in the competitive food industry. Through our
                  AI-powered platform, we create authentic cultural experiences
                  that connect customers with the beauty of Afghan traditions.
                </p>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Every slideshow, every fact, every cultural element is
                  designed to educate, inspire, and create meaningful
                  connections between people and Afghan culture.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                  <span className="text-gray-600">
                    Trusted by 500+ restaurants
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-afghan-green to-pink-600 rounded-2xl p-8 text-white">
                  <div className="text-center">
                    <Brain className="w-16 h-16 mx-auto mb-6 text-white" />
                    <h3 className="text-2xl font-bold mb-4">
                      AI-Powered Innovation
                    </h3>
                    <p className="text-white/90 leading-relaxed">
                      Our advanced AI technology automatically generates
                      engaging cultural content, facts, and beautiful displays
                      that showcase the authentic beauty of Afghanistan.
                    </p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-afghan-red text-white px-4 py-2 rounded-full text-sm font-semibold">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  AI-Powered
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                Our Core Values
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                These principles guide everything we do at ShivehView
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${value.color} text-white mb-6`}
                  >
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                Meet Our Team
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Passionate individuals dedicated to preserving Afghan culture
                through technology
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 p-8 rounded-2xl text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-afghan-green font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                Our Journey
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Key milestones in our mission to preserve Afghan culture
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-lg text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl font-bold text-afghan-green mb-2">
                    {milestone.year}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {milestone.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                Get in Touch
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Have questions? We'd love to hear from you
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Mail className="w-8 h-8 text-afghan-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email
                </h3>
                <p className="text-gray-600">contact@shivehview.com</p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Phone className="w-8 h-8 text-afghan-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Phone
                </h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <MapPin className="w-8 h-8 text-afghan-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Location
                </h3>
                <p className="text-gray-600">
                  Global - Serving Afghan restaurants worldwide
                </p>
              </motion.div>
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
              Join Our Mission
            </motion.h2>
            <motion.p
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Be part of preserving Afghan culture while growing your restaurant
              business
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-afghan-green bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
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

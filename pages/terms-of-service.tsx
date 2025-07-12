import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Eye,
  Scale,
  AlertTriangle,
  CheckCircle,
  Users,
} from "lucide-react";

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - Shivehview</title>
        <meta
          name="description"
          content="Shivehview Terms of Service - Read our terms and conditions"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-900 hover:text-purple-600 transition-colors"
              >
                <Eye className="h-8 w-8 text-purple-600" />
                <span className="text-xl font-bold">Shivehview</span>
              </Link>
              <nav className="flex space-x-6">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/blog"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Blog
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Please read these terms carefully before using Shivehview
                services.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
              {/* Agreement */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-purple-600 mr-3" />
                  Agreement to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using Shivehview's AI-powered restaurant
                  display platform and services, you agree to be bound by these
                  Terms of Service ("Terms"). If you disagree with any part of
                  these terms, you may not access our services.
                </p>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-6 h-6 text-purple-600 mr-3" />
                  Description of Services
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Shivehview provides a comprehensive platform for creating,
                  managing, and displaying digital content for restaurants and
                  businesses, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>AI-powered slideshow creation and management</li>
                  <li>Digital menu and content display systems</li>
                  <li>TV and digital signage integration</li>
                  <li>Analytics and performance tracking</li>
                  <li>Team collaboration and staff management</li>
                  <li>Content templates and customization tools</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 text-purple-600 mr-3" />
                  User Accounts and Registration
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    To access certain features of our services, you must create
                    an account. You agree to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and update your account information</li>
                    <li>
                      Keep your account credentials secure and confidential
                    </li>
                    <li>
                      Accept responsibility for all activities under your
                      account
                    </li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    You must be at least 18 years old to create an account and
                    use our services.
                  </p>
                </div>
              </section>

              {/* Acceptable Use */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Scale className="w-6 h-6 text-purple-600 mr-3" />
                  Acceptable Use Policy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree to use our services only for lawful purposes and in
                  accordance with these Terms. You agree not to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    Use the service for any illegal or unauthorized purpose
                  </li>
                  <li>
                    Upload, create, or display content that is harmful,
                    offensive, or inappropriate
                  </li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>
                    Use the service to spam or send unsolicited communications
                  </li>
                  <li>Share account credentials with unauthorized users</li>
                </ul>
              </section>

              {/* Content and Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Content and Intellectual Property
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your Content
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      You retain ownership of content you upload or create using
                      our services. By using our services, you grant us a
                      limited license to host, display, and process your content
                      solely for the purpose of providing our services to you.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Our Content
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our platform, software, and original content are protected
                      by intellectual property laws. You may not copy, modify,
                      or distribute our proprietary content without permission.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      AI-Generated Content
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      AI-generated content created through our platform is
                      provided "as is" and may not be accurate or suitable for
                      all purposes. You are responsible for reviewing and
                      verifying such content before use.
                    </p>
                  </div>
                </div>
              </section>

              {/* Subscription and Payment */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Subscription and Payment Terms
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    We offer various subscription plans with different features
                    and pricing. By subscribing, you agree to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Pay all fees associated with your chosen plan</li>
                    <li>Provide accurate billing information</li>
                    <li>
                      Authorize recurring payments for subscription renewals
                    </li>
                    <li>Notify us of any billing disputes within 30 days</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    Subscription fees are non-refundable except as required by
                    law. We may change our pricing with 30 days' notice.
                  </p>
                </div>
              </section>

              {/* Service Availability */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Service Availability and Support
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We strive to provide reliable service but cannot guarantee
                  uninterrupted availability. We may:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    Perform maintenance that may temporarily affect service
                  </li>
                  <li>Update or modify features with reasonable notice</li>
                  <li>Suspend service for violations of these Terms</li>
                  <li>Discontinue features or services with advance notice</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Support is available through our help center and customer
                  service channels during business hours.
                </p>
              </section>

              {/* Privacy and Data */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Privacy and Data Protection
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your privacy is important to us. Our collection and use of
                  your information is governed by our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-purple-600 hover:text-purple-700 underline"
                  >
                    Privacy Policy
                  </Link>
                  , which is incorporated into these Terms.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for ensuring that your use of our services
                  complies with applicable data protection laws and regulations.
                </p>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 text-purple-600 mr-3" />
                  Disclaimers and Limitations
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Our services are provided "as is" and "as available" without
                    warranties of any kind. We disclaim all warranties, express
                    or implied, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      Warranties of merchantability or fitness for a particular
                      purpose
                    </li>
                    <li>
                      Warranties that the service will be uninterrupted or
                      error-free
                    </li>
                    <li>
                      Warranties regarding the accuracy of AI-generated content
                    </li>
                    <li>Warranties that defects will be corrected</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    In no event shall Shivehview be liable for indirect,
                    incidental, special, consequential, or punitive damages.
                  </p>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Termination
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may cancel your account at any time through your account
                  settings. We may terminate or suspend your access immediately
                  if:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>You breach these Terms</li>
                  <li>You fail to pay subscription fees</li>
                  <li>We discontinue the service</li>
                  <li>Required by law or regulation</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, your right to use the service ceases
                  immediately, and we may delete your account and data in
                  accordance with our data retention policies.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Governing Law and Disputes
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms are governed by the laws of Afghanistan. Any
                  disputes arising from these Terms or your use of our services
                  shall be resolved through:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Good faith negotiations between the parties</li>
                  <li>Mediation if negotiations fail</li>
                  <li>Arbitration or court proceedings as a last resort</li>
                </ul>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms from time to time. We will notify
                  you of material changes by posting the new Terms on our
                  website and updating the "Last updated" date. Your continued
                  use of our services after such changes constitutes acceptance
                  of the updated Terms.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Email:</strong>{" "}
                      <a
                        href="mailto:legal@shivehview.com"
                        className="text-purple-600 hover:text-purple-700"
                      >
                        legal@shivehview.com
                      </a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Phone:</strong> +93 70 123 4567
                    </p>
                    <p className="text-gray-700">
                      <strong>Address:</strong> Kabul, Afghanistan
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

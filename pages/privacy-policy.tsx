import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, Users, Database, Globe } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Shivehview</title>
        <meta
          name="description"
          content="Shivehview Privacy Policy - Learn how we protect your data and privacy"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />

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
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we
                collect, use, and protect your information.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-6 h-6 text-purple-600 mr-3" />
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Shivehview ("we," "our," or "us") is committed to protecting
                  your privacy. This Privacy Policy explains how we collect,
                  use, disclose, and safeguard your information when you use our
                  AI-powered restaurant display platform and related services.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Database className="w-6 h-6 text-purple-600 mr-3" />
                  Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Personal Information
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>
                        Name and contact information (email, phone number)
                      </li>
                      <li>
                        Business information (business name, type, location)
                      </li>
                      <li>Account credentials and profile information</li>
                      <li>Payment and billing information</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Usage Information
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Slideshow creation and management activities</li>
                      <li>TV display usage and analytics</li>
                      <li>Platform interactions and feature usage</li>
                      <li>Device information and browser data</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Content Information
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Images, videos, and media files you upload</li>
                      <li>AI-generated content and facts</li>
                      <li>Menu items and business content</li>
                      <li>Custom templates and designs</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 text-purple-600 mr-3" />
                  How We Use Your Information
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Provide and maintain our services</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Generate AI-powered content and facts</li>
                  <li>Display content on TV screens and digital displays</li>
                  <li>Analyze usage patterns and improve our platform</li>
                  <li>Send important updates and notifications</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 text-purple-600 mr-3" />
                  Information Sharing and Disclosure
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information in the following
                  circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Service Providers:</strong> With trusted third-party
                    services that help us operate our platform (payment
                    processors, cloud storage, analytics)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or
                    to protect our rights and safety
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a
                    merger, acquisition, or sale of assets
                  </li>
                  <li>
                    <strong>Consent:</strong> With your explicit consent for
                    specific purposes
                  </li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-6 h-6 text-purple-600 mr-3" />
                  Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures
                  to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>
                    Secure cloud infrastructure with industry-standard security
                  </li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Data Retention
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your information for as long as necessary to provide
                  our services and comply with legal obligations. You may
                  request deletion of your account and associated data at any
                  time through your account settings or by contacting us
                  directly.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Your Rights
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the following rights regarding your personal
                  information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal
                    information
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate
                    information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    information
                  </li>
                  <li>
                    <strong>Portability:</strong> Request transfer of your data
                    to another service
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to certain processing
                    activities
                  </li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Cookies and Tracking
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your
                  experience, analyze usage, and provide personalized content.
                  You can control cookie settings through your browser
                  preferences.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  For detailed information about our use of cookies, please see
                  our{" "}
                  <Link
                    href="/cookie-policy"
                    className="text-purple-600 hover:text-purple-700 underline"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Children's Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13. If you believe we have collected
                  information from a child under 13, please contact us
                  immediately.
                </p>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  International Data Transfers
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure appropriate
                  safeguards are in place to protect your information in
                  accordance with this Privacy Policy.
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Changes to This Privacy Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new policy
                  on our website and updating the "Last updated" date. Your
                  continued use of our services after such changes constitutes
                  acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Email:</strong>{" "}
                      <a
                        href="mailto:privacy@shivehview.com"
                        className="text-purple-600 hover:text-purple-700"
                      >
                        privacy@shivehview.com
                      </a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Phone:</strong> +1 (703) 991-9655
                    </p>
                    <p className="text-gray-700">
                      <strong>Address:</strong> 440 Monticello Ave Ste 1802
                      #619992 Norfolk VA 23510
                    </p>
                    <p className="text-gray-700">
                      <strong>Contact:</strong> contact@shivehagency.com
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    </>
  );
}

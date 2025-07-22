import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cookie, Eye, Settings, Shield, Info, Clock } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function CookiePolicy() {
  return (
    <>
      <Head>
        <title>Cookie Policy - Shivehview</title>
        <meta
          name="description"
          content="Shivehview Cookie Policy - Learn about our use of cookies and tracking technologies"
        />
      </Head>

      <Header />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                <Cookie className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Cookie Policy
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Learn how we use cookies and similar technologies to enhance
                your experience on Shivehview.
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
                  <Info className="w-6 h-6 text-purple-600 mr-3" />
                  What Are Cookies?
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Cookies are small text files that are stored on your device
                  when you visit our website. They help us provide you with a
                  better experience by remembering your preferences, analyzing
                  how you use our site, and personalizing content.
                </p>
              </section>

              {/* How We Use Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-6 h-6 text-purple-600 mr-3" />
                  How We Use Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies for the following purposes:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Settings className="w-5 h-5 text-purple-600 mr-2" />
                      Essential Cookies
                    </h3>
                    <p className="text-gray-700 text-sm">
                      These cookies are necessary for the website to function
                      properly. They enable basic functions like page
                      navigation, access to secure areas, and user
                      authentication.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Shield className="w-5 h-5 text-purple-600 mr-2" />
                      Security Cookies
                    </h3>
                    <p className="text-gray-700 text-sm">
                      These cookies help us maintain the security of our
                      platform by detecting and preventing fraud, abuse, and
                      unauthorized access.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Clock className="w-5 h-5 text-purple-600 mr-2" />
                      Performance Cookies
                    </h3>
                    <p className="text-gray-700 text-sm">
                      These cookies help us understand how visitors interact
                      with our website by collecting and reporting information
                      anonymously.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Cookie className="w-5 h-5 text-purple-600 mr-2" />
                      Preference Cookies
                    </h3>
                    <p className="text-gray-700 text-sm">
                      These cookies remember your choices and preferences to
                      provide you with a more personalized experience.
                    </p>
                  </div>
                </div>
              </section>

              {/* Types of Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Types of Cookies We Use
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Session Cookies
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      These cookies are temporary and are deleted when you close
                      your browser. They help us maintain your session and
                      remember your actions during your visit.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Persistent Cookies
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      These cookies remain on your device for a set period or
                      until you delete them. They help us remember your
                      preferences and provide personalized features.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Third-Party Cookies
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      These cookies are set by third-party services that we use,
                      such as analytics providers, payment processors, and
                      advertising networks.
                    </p>
                  </div>
                </div>
              </section>

              {/* Specific Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Specific Cookies We Use
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cookie Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          auth_token
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          Maintains your login session
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          Session
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          user_preferences
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          Stores your UI preferences and settings
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          1 year
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          analytics_id
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          Tracks usage patterns and performance
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          2 years
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          csrf_token
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          Protects against cross-site request forgery
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          Session
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          language
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          Remembers your language preference
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          1 year
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Third-Party Services
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the following third-party services that may set
                  cookies:
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Google Analytics
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Helps us understand how visitors use our website and
                      improve our services. Google Analytics cookies collect
                      information anonymously.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Stripe</h3>
                    <p className="text-gray-700 text-sm">
                      Our payment processor uses cookies to process payments
                      securely and prevent fraud.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Supabase</h3>
                    <p className="text-gray-700 text-sm">
                      Our database and authentication provider uses cookies to
                      manage user sessions and security.
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookie Management */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Managing Your Cookie Preferences
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    You have several options for managing cookies:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Browser Settings
                      </h3>
                      <p className="text-gray-700 text-sm mb-4">
                        Most browsers allow you to control cookies through their
                        settings. You can:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                        <li>Block all cookies</li>
                        <li>Block third-party cookies</li>
                        <li>Delete existing cookies</li>
                        <li>Set cookie preferences</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Our Cookie Banner
                      </h3>
                      <p className="text-gray-700 text-sm mb-4">
                        When you first visit our website, you'll see a cookie
                        banner that allows you to:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                        <li>Accept all cookies</li>
                        <li>Reject non-essential cookies</li>
                        <li>Customize your preferences</li>
                        <li>Learn more about our cookie policy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Impact of Disabling Cookies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Impact of Disabling Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  While you can disable cookies, doing so may affect your
                  experience on our website:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>You may need to log in repeatedly</li>
                  <li>Some features may not work properly</li>
                  <li>Your preferences may not be saved</li>
                  <li>Performance may be affected</li>
                  <li>Security features may be limited</li>
                </ul>
              </section>

              {/* Updates to Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Updates to This Cookie Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect
                  changes in our practices or for legal reasons. We will notify
                  you of any material changes by posting the updated policy on
                  our website and updating the "Last updated" date.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about our use of cookies or this
                  Cookie Policy, please contact us:
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
                      <strong>Phone:</strong> +93 70 123 4567
                    </p>
                    <p className="text-gray-700">
                      <strong>Address:</strong> Kabul, Afghanistan
                    </p>
                  </div>
                </div>
              </section>

              {/* Related Policies */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Related Policies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For more information about how we handle your data, please
                  see:
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/privacy-policy"
                    className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms-of-service"
                    className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Terms of Service
                  </Link>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}

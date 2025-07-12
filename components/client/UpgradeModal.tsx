import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Star, Zap, Shield, Users, TrendingUp } from "lucide-react";
import { subscriptionPlans } from "../../lib/premium-features";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planSlug: selectedPlan,
        }),
      });

      if (response.ok) {
        // Redirect to payment or show success
        window.location.reload();
      } else {
        throw new Error("Upgrade failed");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planSlug: string) => {
    switch (planSlug) {
      case "professional":
        return <Zap className="w-6 h-6" />;
      case "unlimited":
        return <Star className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planSlug: string) => {
    switch (planSlug) {
      case "professional":
        return "from-blue-500 to-purple-600";
      case "unlimited":
        return "from-purple-600 to-pink-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Upgrade Your Plan
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Choose the perfect plan for your business needs
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {subscriptionPlans.slice(1).map((plan) => (
                  <div
                    key={plan.slug}
                    className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedPlan === plan.slug
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPlan(plan.slug)}
                  >
                    {plan.slug === "professional" && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${getPlanColor(
                          plan.slug
                        )} text-white mb-4`}
                      >
                        {getPlanIcon(plan.slug)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500">/month</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-700">
                          {plan.limits.aiCredits} AI Credits/month
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-700">
                          {plan.limits.slides === -1
                            ? "Unlimited"
                            : plan.limits.slides}{" "}
                          Slides
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-700">
                          {plan.limits.staffMembers === -1
                            ? "Unlimited"
                            : plan.limits.staffMembers}{" "}
                          Staff Members
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-700">
                          {plan.limits.storageGB}GB Storage
                        </span>
                      </div>
                      {plan.features.staffManagement && (
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-sm text-gray-700">
                            Staff Management
                          </span>
                        </div>
                      )}
                      {plan.features.advancedAnalytics && (
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-sm text-gray-700">
                            Advanced Analytics
                          </span>
                        </div>
                      )}
                      {plan.features.customBranding && (
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-sm text-gray-700">
                            Custom Branding
                          </span>
                        </div>
                      )}
                      {plan.features.prioritySupport && (
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-sm text-gray-700">
                            Priority Support
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Feature Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Feature</th>
                        <th className="text-center py-2">Starter</th>
                        <th className="text-center py-2">Professional</th>
                        <th className="text-center py-2">Unlimited</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">AI Credits</td>
                        <td className="text-center py-2">0</td>
                        <td className="text-center py-2">100</td>
                        <td className="text-center py-2">1000</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Slides</td>
                        <td className="text-center py-2">5</td>
                        <td className="text-center py-2">Unlimited</td>
                        <td className="text-center py-2">Unlimited</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Staff Members</td>
                        <td className="text-center py-2">1</td>
                        <td className="text-center py-2">10</td>
                        <td className="text-center py-2">Unlimited</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Storage</td>
                        <td className="text-center py-2">1GB</td>
                        <td className="text-center py-2">10GB</td>
                        <td className="text-center py-2">100GB</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Staff Management</td>
                        <td className="text-center py-2">❌</td>
                        <td className="text-center py-2">✅</td>
                        <td className="text-center py-2">✅</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Advanced Analytics</td>
                        <td className="text-center py-2">❌</td>
                        <td className="text-center py-2">✅</td>
                        <td className="text-center py-2">✅</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">API Access</td>
                        <td className="text-center py-2">❌</td>
                        <td className="text-center py-2">❌</td>
                        <td className="text-center py-2">✅</td>
                      </tr>
                      <tr>
                        <td className="py-2">White Label</td>
                        <td className="text-center py-2">❌</td>
                        <td className="text-center py-2">❌</td>
                        <td className="text-center py-2">✅</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Upgrade to ${
                      subscriptionPlans.find((p) => p.slug === selectedPlan)
                        ?.name
                    }`
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

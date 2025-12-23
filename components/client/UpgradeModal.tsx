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
        return "bg-black";
      case "unlimited":
        return "bg-black shadow-lg shadow-black/20";
      default:
        return "bg-black/10";
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-4xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-black/5"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-black">
                    Upgrade Your Plan
                  </h2>
                  <p className="text-black/40 mt-1 font-medium">
                    Choose the perfect plan for your business needs
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 text-black/20 hover:text-black transition-colors bg-gray-50 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {subscriptionPlans.slice(1).map((plan) => (
                  <div
                    key={plan.slug}
                    className={`relative p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${selectedPlan === plan.slug
                      ? "border-black bg-gray-50 shadow-xl shadow-black/5"
                      : "border-black/5 hover:border-black/20 hover:bg-gray-50/50"
                      }`}
                    onClick={() => setSelectedPlan(plan.slug)}
                  >
                    {plan.slug === "professional" && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${getPlanColor(
                          plan.slug
                        )} text-white mb-6`}
                      >
                        {getPlanIcon(plan.slug)}
                      </div>
                      <h3 className="text-xl font-bold text-black uppercase tracking-tight">
                        {plan.name}
                      </h3>
                      <div className="mt-2">
                        <span className="text-4xl font-bold text-black tracking-tighter">
                          ${plan.price}
                        </span>
                        <span className="text-black/40 font-medium tracking-tight">/mo</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-black mr-3" />
                        <span className="text-sm font-medium text-black/70">
                          {plan.limits.aiCredits} AI Credits/month
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-black mr-3" />
                        <span className="text-sm font-medium text-black/70">
                          {plan.limits.slides === -1
                            ? "Unlimited"
                            : plan.limits.slides}{" "}
                          Slides
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-black mr-3" />
                        <span className="text-sm font-medium text-black/70">
                          {plan.limits.staffMembers === -1
                            ? "Unlimited"
                            : plan.limits.staffMembers}{" "}
                          Staff Members
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-black mr-3" />
                        <span className="text-sm font-medium text-black/70">
                          {plan.limits.storageGB}GB Storage
                        </span>
                      </div>
                      {plan.features.staffManagement && (
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-black mr-3" />
                          <span className="text-sm font-medium text-black/70">
                            Staff Management
                          </span>
                        </div>
                      )}
                      {plan.features.advancedAnalytics && (
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-black mr-3" />
                          <span className="text-sm font-medium text-black/70">
                            Advanced Analytics
                          </span>
                        </div>
                      )}
                      {plan.features.customBranding && (
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-black mr-3" />
                          <span className="text-sm font-medium text-black/70">
                            Custom Branding
                          </span>
                        </div>
                      )}
                      {plan.features.prioritySupport && (
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-black mr-3" />
                          <span className="text-sm font-medium text-black/70">
                            Priority Support
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              <div className="bg-gray-50 rounded-2xl p-8 mb-8 border border-black/5">
                <h3 className="text-lg font-bold text-black uppercase tracking-tight mb-6">
                  Feature Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/10">
                        <th className="text-left py-4 text-black font-bold uppercase tracking-wider text-[10px]">Feature</th>
                        <th className="text-center py-4 text-black font-bold uppercase tracking-wider text-[10px]">Starter</th>
                        <th className="text-center py-4 text-black font-bold uppercase tracking-wider text-[10px]">Professional</th>
                        <th className="text-center py-4 text-black font-bold uppercase tracking-wider text-[10px]">Unlimited</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      <tr>
                        <td className="py-4 text-black/60 font-medium">AI Credits</td>
                        <td className="text-center py-4 font-bold text-black">0</td>
                        <td className="text-center py-4 font-bold text-black">100</td>
                        <td className="text-center py-4 font-bold text-black">1000</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-black/60 font-medium">Slides</td>
                        <td className="text-center py-4 font-bold text-black">5</td>
                        <td className="text-center py-4 font-bold text-black">Unlimited</td>
                        <td className="text-center py-4 font-bold text-black">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-black/60 font-medium">Staff Members</td>
                        <td className="text-center py-4 font-bold text-black">1</td>
                        <td className="text-center py-4 font-bold text-black">10</td>
                        <td className="text-center py-4 font-bold text-black">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-black/60 font-medium">Storage</td>
                        <td className="text-center py-4 font-bold text-black">1GB</td>
                        <td className="text-center py-4 font-bold text-black">10GB</td>
                        <td className="text-center py-4 font-bold text-black">100GB</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-black/60 font-medium">Staff Management</td>
                        <td className="text-center py-4">❌</td>
                        <td className="text-center py-4">✅</td>
                        <td className="text-center py-4">✅</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-black/60 font-medium">Advanced Analytics</td>
                        <td className="text-center py-4">❌</td>
                        <td className="text-center py-4">✅</td>
                        <td className="text-center py-4">✅</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-black/60 font-medium">API Access</td>
                        <td className="text-center py-4">❌</td>
                        <td className="text-center py-4">❌</td>
                        <td className="text-center py-4">✅</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-black/60 font-medium">White Label</td>
                        <td className="text-center py-4">❌</td>
                        <td className="text-center py-4">❌</td>
                        <td className="text-center py-4">✅</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-8 py-4 text-black font-bold border border-black/10 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="px-12 py-4 bg-black text-white font-bold rounded-2xl hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-black/20"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    `Upgrade to ${subscriptionPlans.find((p) => p.slug === selectedPlan)
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

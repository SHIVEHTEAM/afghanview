import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  User,
  Mail,
  Lock,
  Building,
  Store,
  Coffee,
  Utensils,
  Car,
  Heart,
  Music,
  GraduationCap,
  Check,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { AnimatePresence } from "framer-motion";

interface OnboardingForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  businessType: string;
}

const businessTypes = [
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Restaurants and food services",
    icon: Utensils,
    color: "bg-orange-500",
  },
  {
    id: "cafe",
    name: "Cafe",
    description: "Cafes and coffee shops",
    icon: Coffee,
    color: "bg-brown-500",
  },
  {
    id: "retail",
    name: "Retail Store",
    description: "Retail stores and shops",
    icon: Store,
    color: "bg-blue-500",
  },
  {
    id: "service",
    name: "Service Business",
    description: "Service and professional businesses",
    icon: Building,
    color: "bg-purple-500",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Healthcare and medical services",
    icon: Heart,
    color: "bg-red-500",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    description: "Entertainment and recreation",
    icon: Music,
    color: "bg-pink-500",
  },
  {
    id: "education",
    name: "Education",
    description: "Educational institutions",
    icon: GraduationCap,
    color: "bg-green-500",
  },
  {
    id: "other",
    name: "Other",
    description: "Other business types",
    icon: Building,
    color: "bg-gray-500",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);
  const [form, setForm] = useState<OnboardingForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "",
  });

  useEffect(() => {
    checkUserSubscription();
  }, []);

  const checkUserSubscription = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // No user logged in, redirect to pricing
        router.push("/pricing");
        return;
      }

      // Check if user has an active subscription by looking for their business
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!business) {
        console.log("No business found for user, redirecting to pricing");
        router.push("/pricing");
        return;
      }

      // Check if business has an active subscription
      const { data: subscription } = await supabase
        .from("business_subscriptions")
        .select("status")
        .eq("business_id", business.id)
        .in("status", ["active", "trial"])
        .single();

      if (subscription) {
        setHasValidSubscription(true);
      } else {
        // No valid subscription, redirect to pricing
        console.log("No valid subscription found, redirecting to pricing");
        router.push("/pricing");
        return;
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      router.push("/pricing");
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OnboardingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessTypeSelect = (type: string) => {
    setForm((prev) => ({ ...prev, businessType: type }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please sign in to continue");
        return;
      }

      // Update user profile
      await supabase
        .from("profiles")
        .update({
          first_name: form.firstName,
          last_name: form.lastName,
        })
        .eq("id", user.id);

      // Update business
      await supabase
        .from("businesses")
        .update({
          name: form.businessName,
          type: form.businessType,
        })
        .eq("user_id", user.id);

      // Redirect to dashboard
      router.push("/client");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      alert("Error completing onboarding. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!hasValidSubscription) {
    return null; // Will redirect to pricing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <Head>
        <title>Complete Your Setup - Shivehview</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Complete Your Setup
            </h1>
            <span className="text-sm text-gray-500">
              Step {currentStep} of 3
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Personal Information
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!form.firstName || !form.lastName || !form.email}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                  <ArrowRight className="inline ml-2 h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Business Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Business Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {businessTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleBusinessTypeSelect(type.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          form.businessType === type.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <type.icon
                          className={`h-8 w-8 mx-auto mb-2 ${type.color} text-white p-1 rounded`}
                        />
                        <h3 className="font-semibold text-gray-900">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {type.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!form.businessName || !form.businessType}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                  <ArrowRight className="inline ml-2 h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Review & Complete
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Your Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {form.firstName} {form.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{form.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Name:</span>
                    <span className="font-medium">{form.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Type:</span>
                    <span className="font-medium">
                      {
                        businessTypes.find((t) => t.id === form.businessType)
                          ?.name
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Your subscription is active! You're all set to start
                    creating amazing slideshows.
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-600 transition-all"
                >
                  Complete Setup
                  <Check className="inline ml-2 h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

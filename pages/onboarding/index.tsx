import React, { useState } from "react";
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
  const [formData, setFormData] = useState<OnboardingForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    businessName: "",
    businessType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const updateFormData = (field: keyof OnboardingForm, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError(""); // Clear error when user types
  };

  const handleNext = () => {
    if (step === 1) {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password
      ) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }
    if (step === 2) {
      if (!formData.businessName || !formData.businessType) {
        setError("Please fill in all fields");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.businessName ||
      !formData.businessType
    ) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // 2. Create or update user profile (use upsert to handle existing users)
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          roles: ["business_owner"],
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) {
        throw profileError;
      }

      // 3. Create business
      const businessData = {
        name: formData.businessName,
        slug: formData.businessName.toLowerCase().replace(/\s+/g, "-"),
        business_type: "restaurant",
        user_id: authData.user.id,
        is_active: true,
        created_by: authData.user.id,
        updated_by: authData.user.id,
      };

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert(businessData)
        .select()
        .single();

      if (businessError) {
        // Check if it's a unique constraint violation
        if (businessError.code === "23505") {
          // Business name already exists, try with a number
          const fallbackBusinessData = {
            ...businessData,
            name: `${formData.businessName} ${Math.floor(
              Math.random() * 1000
            )}`,
            slug: `${formData.businessName
              .toLowerCase()
              .replace(/\s+/g, "-")}-${Math.floor(Math.random() * 1000)}`,
          };

          const { data: fallbackBusiness, error: fallbackError } =
            await supabase
              .from("businesses")
              .insert(fallbackBusinessData)
              .select()
              .single();

          if (fallbackError) {
            throw fallbackError;
          }

          // Verify the business was created
          const { data: verifyBusiness, error: verifyError } = await supabase
            .from("businesses")
            .select("*")
            .eq("id", fallbackBusiness.id)
            .single();

          if (verifyError || !verifyBusiness) {
            throw new Error("Failed to verify business creation");
          }

          router.push("/client");
          return;
        }
        throw businessError;
      }

      // Verify the business was created
      const { data: verifyBusiness, error: verifyError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", business.id)
        .single();

      if (verifyError || !verifyBusiness) {
        throw new Error("Failed to verify business creation");
      }

      router.push("/client");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.password &&
          formData.password.length >= 6
        );
      case 2:
        return formData.businessName && formData.businessType;
      default:
        return true;
    }
  };

  return (
    <>
      <Head>
        <title>Welcome to AfghanView - Get Started</title>
        <meta
          name="description"
          content="Create your AfghanView account and business"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome to AfghanView</h1>
            <p className="text-white/80">
              Create your account and business in minutes
            </p>
          </div>

          {/* Progress Steps */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      stepNumber <= step
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber < step ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 rounded ${
                        stepNumber < step ? "bg-purple-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Step {step} of 3:{" "}
                {step === 1
                  ? "Account Details"
                  : step === 2
                  ? "Business Info"
                  : "Complete"}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Create Your Account
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            updateFormData("firstName", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your first name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            updateFormData("lastName", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            updateFormData("email", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            updateFormData("password", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Create a password (min 6 characters)"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Tell Us About Your Business
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) =>
                            updateFormData("businessName", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your business name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {businessTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <motion.button
                              key={type.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                updateFormData("businessType", type.id)
                              }
                              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                formData.businessType === type.id
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2 rounded-lg ${type.color} text-white`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">
                                    {type.name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {type.description}
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Review & Complete
                  </h2>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business:</span>
                      <span className="font-medium">
                        {formData.businessName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">
                        {formData.businessType}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>What happens next?</strong>
                      <br />
                      • Your account and business will be created
                      <br />
                      • You'll be redirected to your dashboard
                      <br />• A welcome slideshow will be created for you
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Back
                </motion.button>
              )}

              {step < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="ml-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={loading || !canProceed()}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Store,
  Utensils,
  Scissors,
  Stethoscope,
  Dumbbell,
  Hotel,
  GraduationCap,
  Briefcase,
} from "lucide-react";

interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  features: any;
}

const businessCategories: BusinessCategory[] = [
  {
    id: "restaurant",
    name: "Restaurant",
    slug: "restaurant",
    description: "Food and dining establishments",
    icon: "🍽️",
    color: "#FF6B6B",
    features: { slides: true, menu: true, analytics: true },
  },
  {
    id: "store",
    name: "Store",
    slug: "store",
    description: "Retail stores and shops",
    icon: "🛍️",
    color: "#4ECDC4",
    features: { slides: true, products: true, analytics: true },
  },
  {
    id: "salon",
    name: "Salon",
    slug: "salon",
    description: "Beauty and hair salons",
    icon: "💇‍♀️",
    color: "#45B7D1",
    features: { slides: true, services: true, appointments: true },
  },
  {
    id: "clinic",
    name: "Clinic",
    slug: "clinic",
    description: "Medical and health clinics",
    icon: "🏥",
    color: "#96CEB4",
    features: { slides: true, services: true, appointments: true },
  },
  {
    id: "gym",
    name: "Gym",
    slug: "gym",
    description: "Fitness centers and gyms",
    icon: "💪",
    color: "#FFEAA7",
    features: { slides: true, classes: true, memberships: true },
  },
  {
    id: "hotel",
    name: "Hotel",
    slug: "hotel",
    description: "Hotels and accommodations",
    icon: "🏨",
    color: "#DDA0DD",
    features: { slides: true, rooms: true, amenities: true },
  },
  {
    id: "school",
    name: "School",
    slug: "school",
    description: "Educational institutions",
    icon: "🎓",
    color: "#98D8C8",
    features: { slides: true, courses: true, events: true },
  },
  {
    id: "office",
    name: "Office",
    slug: "office",
    description: "Business offices and companies",
    icon: "🏢",
    color: "#F7DC6F",
    features: { slides: true, services: true, contact: true },
  },
];

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case "restaurant":
      return Utensils;
    case "store":
      return Store;
    case "salon":
      return Scissors;
    case "clinic":
      return Stethoscope;
    case "gym":
      return Dumbbell;
    case "hotel":
      return Hotel;
    case "school":
      return GraduationCap;
    case "office":
      return Briefcase;
    default:
      return Building;
  }
};

export default function SignupWithCategory() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    businessName: "",
    businessCategory: "",
    businessSlug: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.businessCategory) {
      newErrors.businessCategory = "Please select a business category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
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

      // Create business
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          user_id: authData.user.id,
          name: formData.businessName,
          type: formData.businessCategory,
          description: `${formData.businessName} - ${formData.businessCategory}`,
        })
        .select()
        .single();

      if (businessError) {
        console.error("Business creation error:", businessError);
        throw businessError;
      }

      // Business staff relationship is handled by user_id in businesses table

      // 5. Redirect to dashboard
      router.push("/onboarding");
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrors({ submit: error.message || "Failed to create account" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Choose Your Business Type</title>
        <meta
          name="description"
          content="Create your account and choose your business category"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 1
                ? "Step 1: Your Information"
                : "Step 2: Your Business"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.firstName
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.lastName ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.password ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  Next Step
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) =>
                        handleInputChange("businessName", e.target.value)
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.businessName
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Your Business Name"
                    />
                  </div>
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                {/* Business Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {businessCategories.map((category) => {
                      const IconComponent = getCategoryIcon(category.slug);
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            handleInputChange("businessCategory", category.id)
                          }
                          className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                            formData.businessCategory === category.id
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                              style={{ backgroundColor: category.color + "20" }}
                            >
                              {category.icon}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {category.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {category.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.businessCategory && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.businessCategory}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                      <p className="text-red-800">{errors.submit}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Create Account
                        <CheckCircle className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

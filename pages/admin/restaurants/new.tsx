import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "../layout";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import {
  ArrowLeft,
  Save,
  Plus,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Package,
  CheckCircle,
} from "lucide-react";

interface RestaurantFormData {
  name: string;
  slug: string;
  description: string;
  cuisine_type: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  contact_info: {
    phone: string;
    email: string;
    website: string;
  };
  business_hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  package_type: "starter" | "professional" | "unlimited";
  slide_limit: number;
  is_active: boolean;
}

const initialFormData: RestaurantFormData = {
  name: "",
  slug: "",
  description: "",
  cuisine_type: "",
  address: {
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States",
  },
  contact_info: {
    phone: "",
    email: "",
    website: "",
  },
  business_hours: {
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "10:00", close: "16:00", closed: false },
    sunday: { open: "10:00", close: "16:00", closed: true },
  },
  package_type: "starter",
  slide_limit: 1,
  is_active: true,
};

const cuisineTypes = [
  "Afghan",
  "American",
  "Italian",
  "Chinese",
  "Mexican",
  "Indian",
  "Japanese",
  "Thai",
  "Mediterranean",
  "French",
  "Greek",
  "Turkish",
  "Lebanese",
  "Persian",
  "Pakistani",
  "Other",
];

const packageTypes = [
  { value: "starter", name: "Starter", slides: 1, price: "$29/month" },
  {
    value: "professional",
    name: "Professional",
    slides: 5,
    price: "$79/month",
  },
  { value: "unlimited", name: "Unlimited", slides: 999, price: "$199/month" },
];

export default function CreateRestaurant() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<RestaurantFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug when name changes
    if (field === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof RestaurantFormData] as any),
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Restaurant name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.cuisine_type) {
      newErrors.cuisine_type = "Cuisine type is required";
    }

    if (!formData.contact_info.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_info.email)) {
      newErrors.email = "Valid email is required";
    }

    if (!formData.address.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.address.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check if slug already exists
      const { data: existingRestaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("slug", formData.slug)
        .single();

      if (existingRestaurant) {
        setErrors({
          slug: "This slug is already taken. Please choose a different one.",
        });
        setLoading(false);
        return;
      }

      // Create restaurant
      const { data: restaurant, error } = await supabase
        .from("restaurants")
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          cuisine_type: formData.cuisine_type,
          address: formData.address,
          contact_info: formData.contact_info,
          business_hours: formData.business_hours,
          package_type: formData.package_type,
          slide_limit: formData.slide_limit,
          is_active: formData.is_active,
          is_verified: false,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create default organization if needed
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: formData.name,
          type: "restaurant",
          created_by: user?.id,
        })
        .select()
        .single();

      if (orgError && orgError.code !== "23505") {
        // Ignore unique constraint violations
        console.error("Error creating organization:", orgError);
      }

      // Update restaurant with organization_id if created
      if (organization) {
        await supabase
          .from("restaurants")
          .update({ organization_id: organization.id })
          .eq("id", restaurant.id);
      }

      router.push(`/admin/restaurants/${restaurant.id}`);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      setErrors({ submit: "Failed to create restaurant. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handlePackageChange = (packageType: string) => {
    const packageData = packageTypes.find((p) => p.value === packageType);
    setFormData((prev) => ({
      ...prev,
      package_type: packageType as "starter" | "professional" | "unlimited",
      slide_limit: packageData?.slides || 1,
    }));
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Head>
          <title>Create Restaurant - Admin Dashboard</title>
          <meta name="description" content="Create a new restaurant" />
        </Head>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/restaurants"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Restaurants
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Create Restaurant
                </h1>
                <p className="text-gray-600 mt-2">
                  Add a new restaurant to the platform
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="flex items-center mb-6">
                <Building className="h-6 w-6 text-afghan-green mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Basic Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter restaurant name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green ${
                      errors.slug ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="restaurant-name"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    This will be used in the URL: yourdomain.com/restaurant/
                    {formData.slug}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Describe your restaurant..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Type *
                  </label>
                  <select
                    value={formData.cuisine_type}
                    onChange={(e) =>
                      handleInputChange("cuisine_type", e.target.value)
                    }
                    className={`w-full border rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green ${
                      errors.cuisine_type ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select cuisine type</option>
                    {cuisineTypes.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                  {errors.cuisine_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cuisine_type}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="flex items-center mb-6">
                <Phone className="h-6 w-6 text-afghan-green mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_info.phone}
                    onChange={(e) =>
                      handleNestedChange(
                        "contact_info",
                        "phone",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contact_info.email}
                    onChange={(e) =>
                      handleNestedChange(
                        "contact_info",
                        "email",
                        e.target.value
                      )
                    }
                    className={`w-full border rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="contact@restaurant.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.contact_info.website}
                    onChange={(e) =>
                      handleNestedChange(
                        "contact_info",
                        "website",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    placeholder="https://www.restaurant.com"
                  />
                </div>
              </div>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-afghan-green mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleNestedChange("address", "street", e.target.value)
                    }
                    className={`w-full border rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green ${
                      errors.street ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) =>
                      handleNestedChange("address", "city", e.target.value)
                    }
                    className={`w-full border rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) =>
                      handleNestedChange("address", "state", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.address.zip_code}
                    onChange={(e) =>
                      handleNestedChange("address", "zip_code", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    placeholder="10001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) =>
                      handleNestedChange("address", "country", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    placeholder="United States"
                  />
                </div>
              </div>
            </motion.div>

            {/* Package Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="flex items-center mb-6">
                <Package className="h-6 w-6 text-afghan-green mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Package Selection
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packageTypes.map((pkg) => (
                  <div
                    key={pkg.value}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.package_type === pkg.value
                        ? "border-afghan-green bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePackageChange(pkg.value)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {pkg.name}
                      </h3>
                      {formData.package_type === pkg.value && (
                        <CheckCircle className="h-5 w-5 text-afghan-green" />
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {pkg.price}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Up to {pkg.slides === 999 ? "unlimited" : pkg.slides}{" "}
                      slides
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Basic templates</li>
                      <li>• Email support</li>
                      {pkg.value !== "starter" && <li>• Advanced analytics</li>}
                      {pkg.value === "unlimited" && <li>• Priority support</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Restaurant Status
                  </h3>
                  <p className="text-sm text-gray-600">
                    Control whether the restaurant is active
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      handleInputChange("is_active", e.target.checked)
                    }
                    className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Active
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-end space-x-4"
            >
              <Link
                href="/admin/restaurants"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Restaurant
                  </>
                )}
              </button>
            </motion.div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import ClientLayout from "../../components/client/ClientLayout";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch business and user profile
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError("");
      try {
        // Try to find business where user is staff
        const { data: staffMember } = await supabase
          .from("business_staff")
          .select(
            `business:businesses!inner(
              id, name, description, address, phone, website, logo_url, is_active
            )`
          )
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();
        let foundBusiness = null;
        if (staffMember?.business) {
          foundBusiness = Array.isArray(staffMember.business)
            ? staffMember.business[0]
            : staffMember.business;
        }
        // If not found as staff, try as owner
        if (!foundBusiness) {
          const { data: userBusiness } = await supabase
            .from("businesses")
            .select(
              "id, name, description, address, phone, website, logo_url, is_active"
            )
            .eq("user_id", user.id)
            .eq("is_active", true)
            .maybeSingle();
          if (userBusiness) foundBusiness = userBusiness;
        }
        if (!foundBusiness) {
          setError("No business found. Please contact support.");
          setBusiness(null);
        } else {
          setBusiness(foundBusiness);
        }
        // Fetch user profile
        setProfile({
          email: user.email,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
        });
      } catch (err) {
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    if (user && !authLoading) fetchData();
  }, [user, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  // Handle input changes
  const handleBusinessChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBusiness({ ...business, [e.target.name]: e.target.value });
  };
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Update business
      if (business?.id) {
        const { error: bizError } = await supabase
          .from("businesses")
          .update({
            name: business.name,
            description: business.description,
            address: business.address,
            phone: business.phone,
            website: business.website,
            logo_url: business.logo_url,
          })
          .eq("id", business.id);
        if (bizError) throw bizError;
      }
      // Update user profile (first_name, last_name)
      if (user?.id) {
        const { error: userError } = await supabase
          .from("users")
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
          })
          .eq("id", user.id);
        if (userError) throw userError;
      }
      setSuccess("Settings updated successfully!");
    } catch (err) {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  if (error) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">{error}</h2>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Head>
        <title>Settings - Shivehview</title>
        <meta
          name="description"
          content="Manage your business and profile settings"
        />
      </Head>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        {success && <div className="mb-4 text-green-600">{success}</div>}
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Business Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                name="name"
                value={business?.name || ""}
                onChange={handleBusinessChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={business?.description || ""}
                onChange={handleBusinessChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={business?.address || ""}
                onChange={handleBusinessChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={business?.phone || ""}
                onChange={handleBusinessChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={business?.website || ""}
                onChange={handleBusinessChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profile?.email || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={profile?.first_name || ""}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={profile?.last_name || ""}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </ClientLayout>
  );
}

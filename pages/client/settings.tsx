import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import ClientLayout from "../../components/client/ClientLayout";
import { RefreshCw, Save, User as UserIcon, Building2, Globe, Phone, Mail, FileText } from "lucide-react";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError("");
      try {
        const { data: staffMember } = await supabase
          .from("business_staff")
          .select(`business:businesses!inner(id, name, description, address, phone, website, logo_url, is_active)`)
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();

        let foundBusiness = null;
        if (staffMember?.business) {
          foundBusiness = Array.isArray(staffMember.business) ? staffMember.business[0] : staffMember.business;
        }

        if (!foundBusiness) {
          const { data: userBusiness } = await supabase
            .from("businesses")
            .select("id, name, description, address, phone, website, logo_url, is_active")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .maybeSingle();
          if (userBusiness) foundBusiness = userBusiness;
        }

        if (foundBusiness) {
          setBusiness(foundBusiness);
        }

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBusiness({ ...business, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
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
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
          <p className="mt-6 text-sm font-medium text-black/40">Loading settings...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Head>
        <title>Settings - Shivehview</title>
      </Head>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-black">Settings</h1>
            <p className="text-sm text-black/40 mt-1">Manage your profile and business information</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-black/10 flex items-center gap-2 hover:bg-black/90 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {success && (
          <div className="mb-8 p-4 bg-black text-white rounded-xl text-center text-sm font-bold shadow-md">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-gray-50 border border-black/10 text-black rounded-xl text-center text-sm font-bold">
            {error}
          </div>
        )}

        <div className="space-y-12">
          {/* Profile Section */}
          <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 border-b border-black/5 bg-gray-50/50 flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-black/20" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-black/40">Personal Profile</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Email Address</label>
                <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-xl border border-black/5 text-sm font-medium text-black/30">
                  <Mail className="w-4 h-4" />
                  {profile?.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={profile?.first_name || ""}
                  onChange={handleProfileChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={profile?.last_name || ""}
                  onChange={handleProfileChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Business Section */}
          <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 border-b border-black/5 bg-gray-50/50 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-black/20" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-black/40">Business Information</h2>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Business Name</label>
                <input
                  type="text"
                  name="name"
                  value={business?.name || ""}
                  onChange={handleBusinessChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Description</label>
                <textarea
                  name="description"
                  value={business?.description || ""}
                  onChange={handleBusinessChange}
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                    <input
                      type="text"
                      name="phone"
                      value={business?.phone || ""}
                      onChange={handleBusinessChange}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                    <input
                      type="text"
                      name="website"
                      value={business?.website || ""}
                      onChange={handleBusinessChange}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Physical Address</label>
                <input
                  type="text"
                  name="address"
                  value={business?.address || ""}
                  onChange={handleBusinessChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

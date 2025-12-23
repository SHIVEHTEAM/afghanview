import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import ClientLayout from "../../components/client/ClientLayout";
import { motion } from "framer-motion";
import {
  Crown,
  Zap,
  Shield,
  Check,
  CreditCard,
  FileText,
  TrendingUp,
  Sparkles,
  BarChart3,
} from "lucide-react";

export default function PremiumPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      const { data: bData } = await supabase.from("businesses").select("*").eq("user_id", user.id).single();
      setBusiness(bData);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
          <p className="mt-6 text-sm font-medium text-black/40">Loading subscription details...</p>
        </div>
      </ClientLayout>
    );
  }

  const features = [
    "Unlimited HD Slideshows",
    "Premium Design Templates",
    "Real-time TV Synchronization",
    "Advanced Analytics Dashboard",
    "Multiple Staff Seats",
    "AI-Powered Content Generation",
    "Custom Branding Options",
    "Priority Customer Support",
  ];

  return (
    <ClientLayout>
      <Head>
        <title>Subscription - Shivehview</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-12 border-b border-black/5">
          <div>
            <h1 className="text-3xl font-bold text-black">Subscription</h1>
            <p className="text-sm text-black/40 mt-1">Manage your account plan and billing details</p>
          </div>
          <div className="px-6 py-3 bg-white border border-black/5 rounded-xl shadow-sm text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
            Tier: {business?.subscription_plan || "Free"}
          </div>
        </div>

        <div className="bg-black text-white p-12 rounded-2xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Crown className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Current Status</p>
              <h2 className="text-4xl font-bold mb-4 capitalize">{business?.subscription_plan || "Free"} Plan</h2>
              <p className="text-sm text-white/60">Your subscription is active and in good standing.</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Next Billing Date</p>
              <p className="text-2xl font-bold">Jan 20, 2026</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "AI Credits", val: "100", icon: Sparkles },
            { label: "Slideshows", val: "Unlimited", icon: TrendingUp },
            { label: "Staff Seats", val: "5", icon: Shield },
            { label: "Broadcasting", val: "Active", icon: Zap },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-black/5 p-8 rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                <s.icon className="w-5 h-5 text-black/20" />
              </div>
              <p className="text-xs font-bold text-black/30 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.val}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-black/5 p-12 rounded-2xl shadow-sm mb-12">
          <h3 className="text-xl font-bold mb-10">Plan Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-black/20 border border-black/5">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Billing History", icon: CreditCard, desc: "Manage your invoices and payment methods." },
            { label: "Usage Stats", icon: BarChart3, desc: "Detailed breakdown of your resource consumption." },
            { label: "Export Data", icon: FileText, desc: "Download your account data and billing reports." },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-black/5 hover:bg-white transition-all cursor-pointer group shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-black/5 group-hover:bg-black transition-all">
                  <item.icon className="w-5 h-5 text-black/20 group-hover:text-white" />
                </div>
                <h4 className="font-bold">{item.label}</h4>
              </div>
              <p className="text-sm text-black/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}

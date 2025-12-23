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
        router.push("/pricing");
        return;
      }

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!business) {
        router.push("/pricing");
        return;
      }

      const { data: subscription } = await supabase
        .from("business_subscriptions")
        .select("status")
        .eq("business_id", business.id)
        .in("status", ["active", "trial"])
        .single();

      if (subscription) {
        setHasValidSubscription(true);
      } else {
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

      if (!user) return;

      await supabase
        .from("profiles")
        .update({
          first_name: form.firstName,
          last_name: form.lastName,
        })
        .eq("id", user.id);

      await supabase
        .from("businesses")
        .update({
          name: form.businessName,
          type: form.businessType,
        })
        .eq("user_id", user.id);

      router.push("/client");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="relative">
          <div className="w-24 h-24 border-2 border-black/5 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-black rounded-full animate-spin"></div>
        </div>
        <p className="mt-12 text-[10px] font-black uppercase tracking-[0.5em] text-black animate-pulse">
          Initialising Deployment Protocol
        </p>
      </div>
    );
  }

  if (!hasValidSubscription) return null;

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      <Head>
        <title>Initialise Terminal // Shivehview</title>
      </Head>

      <div className="max-w-5xl mx-auto px-10 py-24">
        {/* Progress System */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-6 shadow-lg shadow-black/10">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                System Setup Active
              </div>
              <h1 className="text-6xl font-black text-black tracking-tighter uppercase leading-none">
                Initialise Terminal
              </h1>
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.4em] mt-4">
                Node Configuration // Step {currentStep} of 3
              </p>
            </div>
            <div className="text-[24px] font-black text-black/10 tabular-nums">
              0{currentStep} / 03
            </div>
          </div>
          <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              className="bg-black h-full rounded-full shadow-lg shadow-black/10"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-white rounded-[4rem] border border-black/5 p-16 shadow-2xl shadow-black/[0.02] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none">
                <User className="w-64 h-64 text-black" />
              </div>

              <div className="relative">
                <h2 className="text-[11px] font-black text-black/20 uppercase tracking-[0.5em] mb-12">
                  Operator Identity
                </h2>
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-4 px-4">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="w-full px-8 py-5 bg-gray-50/50 border border-black/[0.03] rounded-2xl font-black text-[12px] uppercase tracking-tight focus:bg-white focus:border-black/10 outline-none transition-all placeholder:text-black/5"
                        placeholder="Operator First"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-4 px-4">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="w-full px-8 py-5 bg-gray-50/50 border border-black/[0.03] rounded-2xl font-black text-[12px] uppercase tracking-tight focus:bg-white focus:border-black/10 outline-none transition-all placeholder:text-black/5"
                        placeholder="Operator Last"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-4 px-4">
                      Terminal Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50/50 border border-black/[0.03] rounded-2xl font-black text-[12px] uppercase tracking-tight focus:bg-white focus:border-black/10 outline-none transition-all placeholder:text-black/5"
                      placeholder="node@shivehview.com"
                    />
                  </div>
                </div>
                <div className="mt-16 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={!form.firstName || !form.lastName || !form.email}
                    className="bg-black text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-black/20 flex items-center gap-4 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    Next Protocol
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-white rounded-[4rem] border border-black/5 p-16 shadow-2xl shadow-black/[0.02] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none">
                <Building className="w-64 h-64 text-black" />
              </div>

              <div className="relative">
                <h2 className="text-[11px] font-black text-black/20 uppercase tracking-[0.5em] mb-12">
                  Business Node Registry
                </h2>
                <div className="space-y-12">
                  <div>
                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-4 px-4">
                      Business Identity
                    </label>
                    <input
                      type="text"
                      value={form.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50/50 border border-black/[0.03] rounded-2xl font-black text-[12px] uppercase tracking-tight focus:bg-white focus:border-black/10 outline-none transition-all placeholder:text-black/5"
                      placeholder="Enter Business Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-8 px-4">
                      Unit Classification
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {businessTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBusinessTypeSelect(type.id)}
                          className={`p-6 rounded-3xl border transition-all text-center flex flex-col items-center gap-4 ${form.businessType === type.id
                              ? "bg-black border-black shadow-2xl shadow-black/20"
                              : "bg-gray-50/50 border-black/[0.03] hover:border-black/10"
                            }`}
                        >
                          <div className={`p-4 rounded-xl ${form.businessType === type.id ? 'bg-white/10' : 'bg-gray-100'}`}>
                            <type.icon
                              className={`h-6 w-6 ${form.businessType === type.id ? 'text-white' : 'text-black/20'}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <h3 className={`text-[11px] font-black uppercase tracking-tight ${form.businessType === type.id ? 'text-white' : 'text-black'}`}>
                              {type.name}
                            </h3>
                            <p className={`text-[8px] font-bold uppercase tracking-widest ${form.businessType === type.id ? 'text-white/40' : 'text-black/20'}`}>
                              {type.description.split(' ')[0]}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-20 flex justify-between items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    className="px-8 py-5 border border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-black hover:bg-gray-50 transition-all"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={!form.businessName || !form.businessType}
                    className="bg-black text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-black/20 flex items-center gap-4 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    Continue Pipeline
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-white rounded-[4rem] border border-black/5 p-16 shadow-2xl shadow-black/[0.02] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none">
                <Check className="w-64 h-64 text-black" />
              </div>

              <div className="relative">
                <h2 className="text-[11px] font-black text-black/20 uppercase tracking-[0.5em] mb-12">
                  System Finalisation
                </h2>

                <div className="bg-gray-50/50 rounded-[3rem] p-12 border border-black/[0.03] mb-12">
                  <h3 className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] mb-8 px-2">Registry Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { label: "Lead Operator", val: `${form.firstName} ${form.lastName}` },
                      { label: "Terminal Access", val: form.email },
                      { label: "Node Identifier", val: form.businessName },
                      { label: "Unit Class", val: businessTypes.find((t) => t.id === form.businessType)?.name || 'UNITS_PENDING' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2 border-b border-black/[0.03] pb-4 px-2">
                        <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">{item.label}</span>
                        <p className="text-[12px] font-black text-black uppercase tracking-tight">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black text-white rounded-[2.5rem] p-10 flex items-center gap-8 mb-16 shadow-2xl shadow-black/20">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest mb-1">Quota Verified</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-tight">Active Matrix Subscription Confirmed // Network Ready</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    className="px-8 py-5 border border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-black hover:bg-gray-50 transition-all"
                  >
                    Modify Params
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    className="bg-black text-white px-16 py-7 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl shadow-black/40 flex items-center gap-4 transition-all"
                  >
                    Execute Boot Sequence
                    <Check className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

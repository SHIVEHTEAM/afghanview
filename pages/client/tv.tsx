import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import ClientLayout from "../../components/client/ClientLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv,
  Monitor,
  Play,
  Wifi,
  AlertCircle,
  Plus,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react";

interface Slideshow {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface TVDevice {
  id: string;
  name: string;
  type: "tv" | "monitor" | "tablet" | "phone";
  location: string;
  connectionCode: string;
  status: "online" | "offline" | "playing" | "paused";
  lastSeen: Date;
  business_id: string;
}

export default function TvManagementPage() {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [tvDevices, setTvDevices] = useState<TVDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTv, setShowAddTv] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let businessData = null;
      const { data: ownedBusiness } = await supabase.from("businesses").select("*").eq("user_id", user.id).single();

      if (ownedBusiness) {
        businessData = ownedBusiness;
      } else {
        const { data: staffMember } = await supabase.from("business_staff").select("business:businesses(*)").eq("user_id", user.id).eq("is_active", true).single();
        if (staffMember?.business) {
          businessData = Array.isArray(staffMember.business) ? staffMember.business[0] : staffMember.business;
        }
      }

      if (!businessData) throw new Error("Business not found");
      setBusiness(businessData);

      const { data: slideshowsData } = await supabase.from("slideshows").select("*").eq("business_id", businessData.id).eq("is_active", true).order("created_at", { ascending: false });
      setSlideshows(slideshowsData || []);

      const savedTvs = localStorage.getItem(`tv-devices-${businessData.id}`);
      if (savedTvs) {
        setTvDevices(JSON.parse(savedTvs).map((tv: any) => ({ ...tv, lastSeen: new Date(tv.lastSeen) })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const addTvDevice = (tvData: Omit<TVDevice, "id" | "lastSeen" | "connectionCode" | "business_id">) => {
    const newTv: TVDevice = {
      ...tvData,
      id: `tv-${Date.now()}-${Math.random()}`,
      connectionCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      lastSeen: new Date(),
      business_id: business.id,
    };
    const updatedTvs = [...tvDevices, newTv];
    setTvDevices(updatedTvs);
    localStorage.setItem(`tv-devices-${business.id}`, JSON.stringify(updatedTvs));
    setShowAddTv(false);
  };

  const removeTvDevice = (tvId: string) => {
    if (confirm("Are you sure you want to remove this TV?")) {
      const updatedTvs = tvDevices.filter((tv) => tv.id !== tvId);
      setTvDevices(updatedTvs);
      localStorage.setItem(`tv-devices-${business.id}`, JSON.stringify(updatedTvs));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
          <p className="mt-6 text-sm font-medium text-black/40">Loading TV management...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Head>
        <title>TV Management - Shivehview</title>
      </Head>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-black">TV Management</h1>
            <p className="text-sm text-black/40 mt-1">{tvDevices.length} screens connected</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-3 bg-white border border-black/5 rounded-xl hover:bg-gray-50 transition-all">
              <RefreshCw className="w-5 h-5 text-black/40" />
            </button>
            <button
              onClick={() => setShowAddTv(true)}
              className="bg-black text-white px-6 py-3 rounded-xl font-bold transition-all hover:bg-black/90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New TV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Active Screens", value: tvDevices.length, icon: Tv },
            { label: "Total Modules", value: slideshows.length, icon: Play },
            { label: "Network Status", value: "Online", icon: Wifi },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-black/40" />
                </div>
                <p className="text-xs font-bold text-black/40 uppercase tracking-widest">{stat.label}</p>
              </div>
              <p className="text-3xl font-bold text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-8 mb-12">
          <h3 className="text-lg font-bold text-black mb-2">Source URL</h3>
          <p className="text-sm text-black/40 mb-6">Open this URL on your TV browser to start displaying content.</p>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full bg-gray-50 rounded-xl border border-black/5 p-4 font-mono text-sm text-black/60 break-all">
              {business ? `${window.location.origin}/tv-display/${business.id}` : "Loading..."}
            </div>
            <button
              onClick={() => business && copyToClipboard(`${window.location.origin}/tv-display/${business.id}`)}
              className="w-full md:w-auto px-8 py-4 bg-black text-white font-bold rounded-xl transition-all hover:bg-black/90 flex items-center justify-center gap-2"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? "Copied" : "Copy URL"}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-6">Connected Devices</h2>
          {tvDevices.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-black/5 p-16 text-center">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Tv className="w-8 h-8 text-black/10" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No TVs connected</h3>
              <p className="text-sm text-black/40 mb-8 max-w-sm mx-auto">Get started by adding your first TV screen to the network.</p>
              <button onClick={() => setShowAddTv(true)} className="bg-black text-white px-8 py-3 rounded-xl font-bold">
                Add Your First TV
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tvDevices.map((tv) => (
                <div key={tv.id} className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-black/40" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-black">{tv.name}</h3>
                        <p className="text-xs text-black/30 capitalize">{tv.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${tv.status === 'online' ? 'bg-black text-white' : 'bg-gray-100 text-black/40'}`}>
                      {tv.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-black/30">Location</span>
                      <span className="font-bold">{tv.location}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-black/30">Connection Code</span>
                      <span className="font-mono font-bold">{tv.connectionCode}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-bold">
                      Control
                    </button>
                    <button onClick={() => removeTvDevice(tv.id)} className="p-2 bg-gray-50 text-black/20 hover:text-black rounded-lg border border-black/5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showAddTv && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[300]" onClick={() => setShowAddTv(false)}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-black/5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-black">Register New TV</h3>
                  <button onClick={() => setShowAddTv(false)} className="text-black/20 hover:text-black"><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addTvDevice({
                    name: formData.get("name") as string,
                    type: formData.get("type") as any,
                    location: formData.get("location") as string,
                    status: "offline",
                  });
                }}>
                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-2">Device Name</label>
                      <input type="text" name="name" required placeholder="Main Lobby TV" className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-2">Device Type</label>
                        <select name="type" className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none">
                          <option value="tv">TV</option>
                          <option value="monitor">Monitor</option>
                          <option value="tablet">Tablet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-2">Location</label>
                        <input type="text" name="location" required placeholder="Lobby" className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg shadow-black/10">
                    Register Device
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ClientLayout>
  );
}

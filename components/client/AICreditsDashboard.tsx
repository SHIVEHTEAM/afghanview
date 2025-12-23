import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Calendar,
  RefreshCw,
  Info,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "../../lib/auth";

interface AICredits {
  total: number;
  used: number;
  remaining: number;
  resetDate: string;
}

interface UsageHistory {
  id: string;
  type: string;
  credits: number;
  description: string;
  timestamp: string;
}

export default function AICreditsDashboard() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<AICredits | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setCredits({ total: 100, used: 35, remaining: 65, resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
      setUsageHistory([
        { id: "1", type: "fact_generation", credits: 5, description: "Generated 10 AI facts", timestamp: new Date().toISOString() },
        { id: "2", type: "content_creation", credits: 10, description: "Created AI menu content", timestamp: new Date(Date.now() - 86400000).toISOString() },
      ]);
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
        <p className="mt-6 text-sm font-medium text-black/40">Loading AI dashboard...</p>
      </div>
    );
  }

  if (!credits) return null;

  const usagePercent = (credits.used / credits.total) * 100;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-black">AI Credits</h1>
          <p className="text-sm text-black/40 mt-1">Monitor your AI usage and resource allocation</p>
        </div>
        <button onClick={() => window.location.reload()} className="p-3 bg-white border border-black/5 rounded-xl hover:bg-gray-50 transition-all text-black/20 hover:text-black">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white border border-black/5 p-12 rounded-2xl shadow-sm mb-12">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xs font-bold text-black/30 uppercase tracking-widest">Usage Overview</h2>
          <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase rounded-full">{usagePercent.toFixed(0)}% Used</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {[
            { label: "Total Allocation", val: credits.total },
            { label: "Credits Used", val: credits.used },
            { label: "Remaining", val: credits.remaining },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-5xl font-bold text-black tracking-tight">{s.val}</p>
            </div>
          ))}
        </div>

        <div className="h-3 bg-gray-50 rounded-full overflow-hidden mb-10">
          <div className="h-full bg-black rounded-full" style={{ width: `${usagePercent}%` }}></div>
        </div>

        <div className="flex items-center gap-2 text-xs text-black/40">
          <Calendar className="w-4 h-4" />
          <span>Credits reset on {new Date(credits.resetDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50 p-10 rounded-2xl border border-black/5">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="w-5 h-5 text-black/20" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Usage Rates</h3>
          </div>
          <div className="space-y-6">
            {[
              { label: "Fact Generation", cost: "5 Credits" },
              { label: "Content Assembly", cost: "10 Credits" },
              { label: "Image Enhancement", cost: "3 Credits" },
            ].map((r, i) => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-black/5 last:border-0 last:pb-0">
                <span className="text-sm font-medium">{r.label}</span>
                <span className="text-sm font-bold">{r.cost}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-2xl p-10 shadow-sm flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-4">Need more credits?</h3>
          <p className="text-sm text-black/40 mb-8">Upgrade your plan to get more monthly AI credits and unlock advanced features.</p>
          <button className="bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-black/10 hover:bg-black/90 transition-all">Upgrade Plan</button>
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-xs font-bold text-black/30 uppercase tracking-widest">Recent Activity</h2>
          <Clock className="w-4 h-4 text-black/10" />
        </div>
        <div className="divide-y divide-black/5">
          {usageHistory.map(item => (
            <div key={item.id} className="p-8 flex items-center justify-between hover:bg-gray-50/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4 text-black/10" /></div>
                <div>
                  <h4 className="text-base font-bold text-black">{item.description}</h4>
                  <p className="text-xs text-black/40">{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">-{item.credits}</p>
                <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest">Credits</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

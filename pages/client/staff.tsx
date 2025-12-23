import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Crown,
  Trash2,
  Search,
  Plus,
  X,
} from "lucide-react";

import ClientLayout from "../../components/client/ClientLayout";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { useToastNotifications } from "../../lib/toast-utils";

interface StaffMember {
  id: string;
  user_id: string;
  role: "owner" | "manager" | "staff";
  joined_at: string;
  is_active: boolean;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface Business {
  id: string;
  name: string;
  subscription_plan: string;
  max_staff_members: number;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
}

export default function StaffManagementPage() {
  const { user } = useAuth();
  const toast = useToastNotifications();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data: bData } = await supabase.from("businesses").select("*").eq("user_id", user.id).single();
      if (bData) {
        setBusiness(bData);
        const { data: sData } = await supabase.from("business_staff").select("*, user:profiles(email, first_name, last_name)").eq("business_id", bData.id);
        setStaff(sData || []);
        const { data: iData } = await supabase.from("staff_invitations").select("*").eq("business_id", bData.id).eq("status", "pending");
        setInvitations(iData || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRemoveStaff = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    const { error } = await supabase.from("business_staff").delete().eq("id", id);
    if (!error) {
      setStaff(staff.filter(s => s.id !== id));
      toast.showSuccess("Member removed");
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
          <p className="mt-6 text-sm font-medium text-black/40">Loading team...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <Head>
        <title>Staff - Shivehview</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-black">Staff Management</h1>
            <p className="text-sm text-black/40 mt-1">Manage your team members and their roles</p>
          </div>
          <button onClick={() => setShowInviteModal(true)} className="bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-black/10 flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Invite Member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-black/30 uppercase tracking-widest mb-4">Plan Limit</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold">{staff.length} / {business?.max_staff_members || 1}</span>
              <span className="px-2 py-1 bg-gray-50 border border-black/5 text-[10px] font-bold uppercase rounded-lg">{business?.subscription_plan}</span>
            </div>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-black/30 uppercase tracking-widest mb-4">Pending Invites</p>
            <span className="text-3xl font-bold">{invitations.length}</span>
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-black/5 bg-gray-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 w-4 h-4" />
              <input type="text" placeholder="Search staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-black/5 rounded-xl text-sm outline-none focus:border-black/10 transition-all font-medium" />
            </div>
          </div>
          <div className="divide-y divide-black/5">
            {staff.map(member => (
              <div key={member.id} className="p-8 flex items-center justify-between hover:bg-gray-50/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-lg font-bold text-black/20 uppercase">{member.user?.first_name?.[0]}</div>
                  <div>
                    <h3 className="text-base font-bold text-black">{member.user?.first_name} {member.user?.last_name}</h3>
                    <p className="text-xs text-black/40">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${member.role === 'owner' ? 'bg-black text-white' : 'bg-gray-100 text-black/40'}`}>{member.role}</span>
                  {member.role !== 'owner' && (
                    <button onClick={() => handleRemoveStaff(member.id)} className="p-3 text-black/10 hover:text-black hover:bg-white rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50" onClick={() => setShowInviteModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-black/5" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold text-black">Invite Member</h3>
                <button onClick={() => setShowInviteModal(false)} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-black/30 uppercase tracking-widest mb-2">Email Address</label>
                  <input type="email" placeholder="email@example.com" className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-sm outline-none focus:bg-white transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/30 uppercase tracking-widest mb-2">Role</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-sm font-bold outline-none cursor-pointer">
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <button className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg shadow-black/10">Send Invitation</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}

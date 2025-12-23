import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Crown,
  Shield,
  User,
  Mail,
  Calendar,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

interface StaffMember {
  id: string;
  role: "owner" | "manager" | "staff";
  permissions: any;
  joined_at: string;
  is_active: boolean;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  invited_by?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface StaffManagementProps {
  businessId: string;
  userRole: "owner" | "manager" | "staff";
}

const roleConfig = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "bg-black text-white",
    description: "Full access to all features and settings",
  },
  manager: {
    label: "Manager",
    icon: Shield,
    color: "bg-black text-white",
    description: "Can manage slides and invite staff members",
  },
  staff: {
    label: "Staff",
    icon: User,
    color: "bg-gray-100 text-black",
    description: "Can view and edit slides",
  },
};

export default function StaffManagement({
  businessId,
  userRole,
}: StaffManagementProps) {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "staff" as "owner" | "manager" | "staff",
  });
  const [editForm, setEditForm] = useState({
    role: "staff" as "owner" | "manager" | "staff",
    is_active: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStaff();
  }, [businessId]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/restaurant/staff?business_id=${businessId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }

      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setError("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/restaurant/staff?business_id=${businessId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuthToken()}`,
          },
          body: JSON.stringify(inviteForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to invite staff member");
      }

      const newStaff = await response.json();
      setStaff([newStaff, ...staff]);
      setSuccess("Staff member invited successfully!");
      setShowInviteModal(false);
      setInviteForm({ email: "", role: "staff" });
    } catch (error) {
      console.error("Error inviting staff:", error);
      setError(
        error instanceof Error ? error.message : "Failed to invite staff member"
      );
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/restaurant/staff?business_id=${businessId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAuthToken()}`,
          },
          body: JSON.stringify({
            staff_id: selectedStaff.id,
            ...editForm,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update staff member");
      }

      const updatedStaff = await response.json();
      setStaff(
        staff.map((s) => (s.id === selectedStaff.id ? updatedStaff : s))
      );
      setSuccess("Staff member updated successfully!");
      setShowEditModal(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error("Error updating staff:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update staff member"
      );
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/restaurant/staff?business_id=${businessId}&staff_id=${staffId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${await getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove staff member");
      }

      setStaff(staff.filter((s) => s.id !== staffId));
      setSuccess("Staff member removed successfully!");
    } catch (error) {
      console.error("Error removing staff:", error);
      setError(
        error instanceof Error ? error.message : "Failed to remove staff member"
      );
    }
  };

  const openEditModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setEditForm({
      role: staffMember.role,
      is_active: staffMember.is_active,
    });
    setShowEditModal(true);
  };

  const canInvite = ["owner", "manager"].includes(userRole);
  const canEdit = userRole === "owner";
  const canRemove = userRole === "owner";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-black">Staff Management</h2>
          <p className="text-black/40 mt-1 font-medium">
            Manage your restaurant staff and their permissions
          </p>
        </div>
        {canInvite && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-black hover:bg-black/90 transition-all duration-300 shadow-xl shadow-black/10"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Staff
          </button>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-lg shadow-black/5">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 text-black mr-4" />
            <p className="text-black font-bold uppercase tracking-tight">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-black text-white rounded-2xl p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-white mr-4" />
            <p className="text-white font-bold uppercase tracking-tight">{success}</p>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-2xl shadow-black/[0.02]">
        <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-black uppercase tracking-tight">Staff Members</h3>
          <div className="text-[10px] font-bold text-black/20 uppercase tracking-widest">{staff.length} Members</div>
        </div>
        <div className="divide-y divide-black/[0.03]">
          {staff.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-black/20" />
              </div>
              <p className="text-black/40 font-medium">No staff members yet</p>
              {canInvite && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="mt-6 text-black font-bold uppercase tracking-widest text-xs hover:underline"
                >
                  Invite your first staff member
                </button>
              )}
            </div>
          ) : (
            staff.map((staffMember) => {
              const roleInfo = roleConfig[staffMember.role];
              const RoleIcon = roleInfo.icon;
              const isCurrentUser = staffMember.user.id === user?.id;

              return (
                <motion.div
                  key={staffMember.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-8 py-6 hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                        <span className="text-white text-lg font-bold">
                          {staffMember.user.first_name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            staffMember.user.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <p className="text-base font-bold text-black tracking-tight">
                            {staffMember.user.first_name &&
                              staffMember.user.last_name
                              ? `${staffMember.user.first_name} ${staffMember.user.last_name}`
                              : staffMember.user.email}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-black text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {staffMember.user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-black/5 ${roleInfo.color}`}
                          >
                            <RoleIcon className="w-3.5 h-3.5 mr-2" />
                            {roleInfo.label}
                          </span>
                          {!staffMember.is_active && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-black/20 border border-black/5">
                              <XCircle className="w-3.5 h-3.5 mr-2" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-black font-bold uppercase tracking-tight">
                          Since {new Date(staffMember.joined_at).toLocaleDateString()}
                        </p>
                        {staffMember.invited_by && (
                          <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest mt-0.5">
                            By {staffMember.invited_by.first_name}
                          </p>
                        )}
                      </div>
                      {!isCurrentUser && (canEdit || canRemove) && (
                        <div className="flex items-center space-x-2">
                          {canEdit && (
                            <button
                              onClick={() => openEditModal(staffMember)}
                              className="p-3 text-black/20 hover:text-black hover:bg-gray-100 rounded-xl transition-all duration-200"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {canRemove && (
                            <button
                              onClick={() => handleRemoveStaff(staffMember.id)}
                              className="p-3 text-black/20 hover:text-black hover:bg-gray-100 rounded-xl transition-all duration-200"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-black/5"
          >
            <div className="px-8 py-6 border-b border-black/5">
              <h3 className="text-xl font-bold text-black uppercase tracking-tight">
                Invite Staff Member
              </h3>
            </div>
            <form onSubmit={handleInviteStaff} className="px-8 py-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 font-medium"
                  placeholder="staff@restaurant.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-3">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      role: e.target.value as any,
                    })
                  }
                  className="w-full px-5 py-4 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 font-medium appearance-none"
                >
                  {userRole === "owner" && (
                    <option value="owner">Owner - Full access</option>
                  )}
                  {userRole === "owner" && (
                    <option value="manager">
                      Manager - Can manage slides and invite staff
                    </option>
                  )}
                  <option value="staff">
                    Staff - Can view and edit slides
                  </option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-6 py-4 text-black font-bold border border-black/5 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-black/90 transition-all duration-300 shadow-xl shadow-black/10"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-black/5"
          >
            <div className="px-8 py-6 border-b border-black/5">
              <h3 className="text-xl font-bold text-black uppercase tracking-tight">
                Edit Staff Member
              </h3>
              <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">
                {selectedStaff.user.first_name} {selectedStaff.user.last_name}
              </p>
            </div>
            <form onSubmit={handleUpdateStaff} className="px-8 py-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-3">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value as any })
                  }
                  className="w-full px-5 py-4 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:border-black transition-all duration-300 font-medium appearance-none"
                >
                  <option value="owner">Owner - Full access</option>
                  <option value="manager">
                    Manager - Can manage slides and invite staff
                  </option>
                  <option value="staff">
                    Staff - Can view and edit slides
                  </option>
                </select>
              </div>
              <div>
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={editForm.is_active}
                      onChange={(e) =>
                        setEditForm({ ...editForm, is_active: e.target.checked })
                      }
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors duration-300 ${editForm.is_active ? 'bg-black' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${editForm.is_active ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-bold text-black uppercase tracking-tight">
                    Active member
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-4 text-black font-bold border border-black/5 rounded-2xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-4 bg-black text-white font-bold rounded-2xl hover:bg-black/90 transition-all duration-300 shadow-xl shadow-black/10"
                >
                  Update
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

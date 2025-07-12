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
    color: "bg-purple-100 text-purple-800",
    description: "Full access to all features and settings",
  },
  manager: {
    label: "Manager",
    icon: Shield,
    color: "bg-blue-100 text-blue-800",
    description: "Can manage slides and invite staff members",
  },
  staff: {
    label: "Staff",
    icon: User,
    color: "bg-gray-100 text-gray-800",
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your restaurant staff and their permissions
          </p>
        </div>
        {canInvite && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Staff
          </button>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircle className="w-5 h-5 text-red-400 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Staff Members</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {staff.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No staff members yet</p>
              {canInvite && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
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
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {staffMember.user.first_name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            staffMember.user.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {staffMember.user.first_name &&
                            staffMember.user.last_name
                              ? `${staffMember.user.first_name} ${staffMember.user.last_name}`
                              : staffMember.user.email}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {staffMember.user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}
                          >
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleInfo.label}
                          </span>
                          {!staffMember.is_active && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Joined{" "}
                          {new Date(staffMember.joined_at).toLocaleDateString()}
                        </p>
                        {staffMember.invited_by && (
                          <p className="text-xs text-gray-500">
                            Invited by {staffMember.invited_by.first_name}{" "}
                            {staffMember.invited_by.last_name}
                          </p>
                        )}
                      </div>
                      {!isCurrentUser && (canEdit || canRemove) && (
                        <div className="flex items-center space-x-1">
                          {canEdit && (
                            <button
                              onClick={() => openEditModal(staffMember)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canRemove && (
                            <button
                              onClick={() => handleRemoveStaff(staffMember.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Invite Staff Member
              </h3>
            </div>
            <form onSubmit={handleInviteStaff} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="staff@restaurant.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Staff Member
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedStaff.user.first_name} {selectedStaff.user.last_name}
              </p>
            </div>
            <form onSubmit={handleUpdateStaff} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) =>
                      setEditForm({ ...editForm, is_active: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active member
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

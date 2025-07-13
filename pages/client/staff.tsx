import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Crown,
  Settings,
  Trash2,
  Edit,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Plus,
  X,
} from "lucide-react";

import ClientLayout from "../../components/client/ClientLayout";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { useToastNotifications } from "../../lib/toast-utils";
import { ErrorMessage, SuccessMessage, Toast } from "../../components/ui";

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
  invited_by?: {
    first_name: string;
    last_name: string;
  };
}

interface Business {
  id: string;
  name: string;
  subscription_plan: string;
  max_staff_members: number;
  ai_credits: number;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired";
  invited_at: string;
  expires_at: string;
}

export default function StaffManagementPage() {
  const { user } = useAuth();
  const toast = useToastNotifications();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Invitation modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    fetchBusinessAndStaff();
  }, [user?.id]);

  // Redirect staff members away from this page
  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) return;

      try {
        // Check if user owns a business
        const { data: ownedBusiness } = await supabase
          .from("businesses")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (!ownedBusiness) {
          // Check if user is a staff member with management permissions
          const { data: staffMember } = await supabase
            .from("business_staff")
            .select("role")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .in("role", ["owner", "manager"])
            .single();

          if (!staffMember) {
            // User doesn't have management permissions, redirect to dashboard
            window.location.href = "/client";
          }
        }
      } catch (error) {
        console.error("Error checking access:", error);
        window.location.href = "/client";
      }
    };

    checkAccess();
  }, [user?.id]);

  const fetchBusinessAndStaff = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Get session for API authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      // Get user's business first
      const { data: userBusiness } = await supabase
        .from("businesses")
        .select(
          "id, name, slug, subscription_plan, max_staff_members, ai_credits"
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (!userBusiness) {
        // Check if user is staff member of a business
        const { data: staffMember } = await supabase
          .from("business_staff")
          .select(
            `
            business:businesses(
              id, name, slug, subscription_plan, max_staff_members, ai_credits
            )
          `
          )
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (staffMember?.business) {
          // Handle case where business might be an array
          const businessData = Array.isArray(staffMember.business)
            ? staffMember.business[0]
            : staffMember.business;

          setBusiness(businessData);

          // Fetch staff using API endpoint with authentication
          const response = await fetch(
            `/api/business/staff?business_id=${businessData.id}`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (response.ok) {
            const staffData = await response.json();
            setStaff(staffData);
          } else {
            throw new Error("Failed to fetch staff members");
          }

          // Fetch invitations
          const { data: invitationsData } = await supabase
            .from("staff_invitations")
            .select("*")
            .eq("business_id", businessData.id)
            .eq("status", "pending")
            .order("invited_at", { ascending: false });

          setInvitations(invitationsData || []);
        } else {
          setError("No business found. Please create a business first.");
        }
      } else {
        setBusiness(userBusiness);

        // Fetch staff using API endpoint with authentication
        const response = await fetch(
          `/api/business/staff?business_id=${userBusiness.id}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const staffData = await response.json();
          setStaff(staffData);
        } else {
          throw new Error("Failed to fetch staff members");
        }

        // Fetch invitations
        const { data: invitationsData } = await supabase
          .from("staff_invitations")
          .select("*")
          .eq("business_id", userBusiness.id)
          .eq("status", "pending")
          .order("invited_at", { ascending: false });

        setInvitations(invitationsData || []);
      }
    } catch (err) {
      console.error("Error fetching staff data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch staff data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Only show active staff in the UI
  const filteredStaff = staff.filter((member) => member.is_active);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case "manager":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "staff":
        return <Users className="w-4 h-4 text-gray-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "staff":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanLimits = () => {
    if (!business) return { staff: 1, canInvite: false };

    switch (business.subscription_plan) {
      case "free":
        return { staff: 1, canInvite: false };
      case "starter":
        return { staff: 3, canInvite: true };
      case "professional":
        return { staff: 10, canInvite: true };
      case "unlimited":
        return { staff: 50, canInvite: true };
      default:
        return { staff: 1, canInvite: false };
    }
  };

  const canInviteMore = () => {
    const limits = getPlanLimits();
    const currentStaff = staff.length + invitations.length;
    return limits.canInvite && currentStaff < limits.staff;
  };

  const handleInviteStaff = async () => {
    if (!business || !inviteEmail.trim()) {
      toast.validationError("Please enter a valid email address");
      return;
    }

    if (!inviteFirstName.trim() || !inviteLastName.trim()) {
      toast.validationError("Please enter both first name and last name");
      return;
    }

    if (!canInviteMore()) {
      toast.showWarning(
        "You have reached the maximum number of staff members for your plan"
      );
      return;
    }

    setInviting(true);
    setInviteError("");

    try {
      // Get session for API authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      // Send invitation using the new API
      const response = await fetch("/api/business/staff/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          business_id: business.id,
          firstName: inviteFirstName.trim(),
          lastName: inviteLastName.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send invitation");
      }

      // Add the new invitation to the list
      setInvitations((prev) => [result.invitation, ...prev]);
      setInviteEmail("");
      setInviteRole("staff");
      setInviteFirstName("");
      setInviteLastName("");
      setShowInviteModal(false);

      if (result.emailSent) {
        toast.showSuccess(`Invitation sent to ${inviteEmail}`);
      } else {
        toast.showWarning(
          `Invitation created but email delivery failed. The user can still access the invitation through the system.`
        );
      }
    } catch (err) {
      console.error("Error inviting staff:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitation";
      setInviteError(errorMessage);
      toast.showError(errorMessage);
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("staff_invitations")
        .update({ status: "expired" })
        .eq("id", invitationId);

      if (error) {
        throw error;
      }

      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      toast.showSuccess("Invitation cancelled successfully");
    } catch (err) {
      console.error("Error cancelling invitation:", err);
      toast.showError("Failed to cancel invitation");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("business_staff")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) {
        throw error;
      }

      setStaff((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: newRole as any } : member
        )
      );
      toast.showSuccess("Role updated successfully");
    } catch (err) {
      console.error("Error updating role:", err);
      toast.showError("Failed to update role");
    }
  };

  const handleRemoveStaff = async (memberId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Get session for API authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
      // Remove staff using API
      const response = await fetch(
        `/api/business/staff?business_id=${business?.id}&staff_id=${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to remove staff member");
      }
      // Refetch staff list after removal
      await fetchBusinessAndStaff();
    } catch (err) {
      console.error("Error removing staff member:", err);
      setError(
        err instanceof Error ? err.message : "Failed to remove staff member"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading staff management...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <ErrorMessage message={error} />
            <button
              onClick={fetchBusinessAndStaff}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const planLimits = getPlanLimits();
  const currentStaff = staff.length + invitations.length;

  return (
    <>
      <Head>
        <title>Staff Management - Shivehview</title>
        <meta
          name="description"
          content="Manage your team members and staff permissions"
        />
      </Head>

      <ClientLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Staff Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your team members and their permissions
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowInviteModal(true)}
                disabled={!canInviteMore()}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  canInviteMore()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Staff
              </button>
            </div>
          </div>

          {/* Plan Limits Alert */}
          {business && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {business.subscription_plan.charAt(0).toUpperCase() +
                        business.subscription_plan.slice(1)}{" "}
                      Plan
                    </p>
                    <p className="text-sm text-blue-700">
                      {currentStaff} of {planLimits.staff} staff members
                      {!planLimits.canInvite &&
                        " • Upgrade to invite more staff"}
                    </p>
                  </div>
                </div>
                {!planLimits.canInvite && (
                  <a
                    href="/pricing"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Upgrade Plan
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Pending Invitations ({invitations.length})
              </h3>
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between bg-white rounded-lg p-4 border border-yellow-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {invitation.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {invitation.role} • Invited{" "}
                          {new Date(invitation.invited_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                        Pending
                      </span>
                      <button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Staff List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Team Members ({filteredStaff.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <div key={member.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.user.first_name} {member.user.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {member.user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined{" "}
                          {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>

                      {member.role !== "owner" && (
                        <div className="flex items-center space-x-2">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleUpdateRole(member.id, e.target.value)
                            }
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                          </select>

                          <button
                            onClick={() => handleRemoveStaff(member.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredStaff.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No staff members found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || filterRole !== "all"
                      ? "Try adjusting your search or filters"
                      : "Invite your first team member to get started"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Invite Staff Member
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={inviteFirstName}
                      onChange={(e) => setInviteFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={inviteLastName}
                      onChange={(e) => setInviteLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {inviteError && <ErrorMessage message={inviteError} />}

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteStaff}
                    disabled={
                      inviting ||
                      !inviteEmail ||
                      !inviteFirstName.trim() ||
                      !inviteLastName.trim()
                    }
                    className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                      inviting ||
                      !inviteEmail ||
                      !inviteFirstName.trim() ||
                      !inviteLastName.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {inviting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </ClientLayout>
    </>
  );
}

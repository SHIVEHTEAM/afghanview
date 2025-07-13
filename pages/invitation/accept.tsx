import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  User,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { validateInvitationToken } from "../../lib/email";

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  business: {
    id: string;
    name: string;
  };
  inviter: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query;

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Sign-in form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitationDetails();
      checkAuthStatus();
    }
  }, [token]);

  const checkAuthStatus = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    setUserEmail(session?.user?.email || null);
  };

  const fetchInvitationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/business/staff/invitation-details?token=${token}`
      );
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to load invitation details");
        return;
      }

      setInvitation(result.invitation);
      // Pre-fill the email field
      setEmail(result.invitation.email);
    } catch (err) {
      console.error("Error fetching invitation:", err);
      setError("Failed to load invitation details");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if the signed-in user matches the invitation email
        if (data.user.email !== invitation?.email) {
          await supabase.auth.signOut();
          setError(
            "Please sign in with the email address that received this invitation."
          );
          return;
        }

        // User is now signed in, proceed to accept invitation
        await handleAcceptInvitation();
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setSigningIn(false);
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      setAccepting(true);
      setError(null);

      // Get session for API authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch("/api/business/staff/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to accept invitation");
      }

      setSuccess(result.message);

      // Redirect to client dashboard after a short delay
      setTimeout(() => {
        router.push("/client");
      }, 3000);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to accept invitation"
      );
    } finally {
      setAccepting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="w-5 h-5 text-purple-600" />;
      case "manager":
        return <Users className="w-5 h-5 text-blue-600" />;
      case "staff":
        return <User className="w-5 h-5 text-gray-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "manager":
        return "Manager";
      case "staff":
        return "Staff Member";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Accept Invitation - ShivehView</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                Loading Invitation...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your invitation.
              </p>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Invalid Invitation - ShivehView</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Invalid Invitation
              </h2>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Invitation Accepted - ShivehView</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome!</h2>
              <p className="text-gray-600">{success}</p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard...
              </p>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Accept Staff Invitation - ShivehView</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full"
        >
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-purple-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Staff Invitation
              </h1>
              <p className="text-gray-600">
                You've been invited to join a business on ShivehView
              </p>
            </div>

            {invitation && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {invitation.business.name}
                    </p>
                    <p className="text-sm text-gray-600">Business</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getRoleIcon(invitation.role)}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {getRoleLabel(invitation.role)}
                    </p>
                    <p className="text-sm text-gray-600">Your Role</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {invitation.email}
                    </p>
                    <p className="text-sm text-gray-600">Invited Email</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Expires</p>
                  </div>
                </div>

                {invitation.inviter && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {invitation.inviter.first_name}{" "}
                        {invitation.inviter.last_name}
                      </p>
                      <p className="text-sm text-gray-600">Invited by</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isLoggedIn ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>You've been invited to join the team!</strong>{" "}
                    Please sign in with your email address.
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 text-left mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 text-left mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Password Instructions:</strong>
                      </p>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>
                          • If you already have a ShivehView account, use your
                          existing password
                        </li>
                        <li>
                          • If this is your first time, check your email for a
                          temporary password
                        </li>
                        <li>
                          • If you forgot your password, you can reset it after
                          signing in
                        </li>
                      </ul>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signingIn}
                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                      signingIn
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {signingIn ? (
                      <>
                        <ArrowRight className="w-4 h-4 animate-spin mr-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Sign In & Accept Invitation
                      </>
                    )}
                  </button>
                </form>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-800">
                    <strong>Need help?</strong> Check your email (
                    {invitation?.email}) for login instructions. If you don't
                    remember your password, you can reset it after signing in.
                  </p>
                </div>
              </div>
            ) : userEmail !== invitation?.email ? (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    You are signed in as <strong>{userEmail}</strong>, but this
                    invitation was sent to <strong>{invitation?.email}</strong>.
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    Please sign in with the correct email address to accept this
                    invitation.
                  </p>
                </div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  You're signed in as <strong>{userEmail}</strong>. Ready to
                  join the team?
                </p>
                <button
                  onClick={handleAcceptInvitation}
                  disabled={accepting}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                    accepting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {accepting ? (
                    <>
                      <ArrowRight className="w-4 h-4 animate-spin mr-2" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

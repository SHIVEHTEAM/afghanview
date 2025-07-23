import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import { supabase } from "./supabase";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import { encode } from "next-auth/jwt";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  phone?: string;
  created_at: string;
  email_verified?: boolean;
  restaurant?: {
    id: string;
    name: string;
    address: any;
    contact_info: any;
    subscription_tier?: string;
    subscription_status?: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signUp: (userData: any) => Promise<{
    success: boolean;
    error?: string;
    requiresEmailVerification?: boolean;
  }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  checkOnboardingStatus: (userId: string) => Promise<{
    completed: boolean;
    business: any;
    restaurant: any;
    role?: string;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.signInWithPassword({
            email: String(credentials.email ?? ""),
            password: String(credentials.password ?? ""),
          });

          if (error || !user) {
            return null;
          }

          // Get user profile with role and business info
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError || !profile) {
            return null;
          }

          return {
            id: user.id,
            email: user.email!,
            name: profile.full_name,
            role: profile.role,
            business: profile.business,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.business_id = user.business_id;
      }
      token.accessToken = await encode({
        token,
        secret: process.env.NEXTAUTH_SECRET,
      });
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).name = token.name;
        (session.user as any).role = token.role;
        (session.user as any).business_id = token.business_id;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setUser(null);
        return;
      }

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          first_name: "",
          last_name: "",
          roles: [],
          phone: "",
          created_at: session.user.created_at,
          email_verified: session.user.email_confirmed_at ? true : false,
          restaurant: null,
        });
      } else {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          first_name: profile.first_name,
          last_name: profile.last_name,
          roles: profile.roles || [],
          phone: profile.phone || "",
          created_at: session.user.created_at,
          email_verified: session.user.email_confirmed_at ? true : false,
          restaurant: profile.restaurant || null,
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) {
        return {
          success: false,
          error: error?.message || "Invalid credentials",
        };
      }
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (profileError || !profile) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          first_name: "",
          last_name: "",
          roles: [],
          phone: "",
          created_at: data.user.created_at,
          restaurant: null,
        });
      } else {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          first_name: profile.first_name,
          last_name: profile.last_name,
          roles: profile.roles || [],
          phone: profile.phone || "",
          created_at: data.user.created_at,
          restaurant: profile.restaurant || null,
        });
      }
      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        success: false,
        error: (error as any).message || "Something went wrong",
      };
    }
  };

  const signUp = async (userData: any) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        restaurantName,
        restaurantAddress,
      } = userData;

      // Check if email confirmation is required
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            restaurant_name: restaurantName,
            restaurant_address: restaurantAddress,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && !data.user.email_confirmed_at) {
        // Email verification required
        return {
          success: true,
          requiresEmailVerification: true,
          error:
            "Please check your email to verify your account before signing in.",
        };
      }

      // Email already confirmed (or confirmation not required)
      if (data.user) {
        // Insert profile data
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          roles: ["restaurant_owner"],
          restaurant: {
            id: "", // fallback id for linter
            name: restaurantName,
            address: restaurantAddress,
            contact_info: { phone, email },
          },
        });

        if (profileError) {
          return { success: false, error: profileError.message };
        }

        // Set user state
        setUser({
          id: data.user.id,
          email: data.user.email!,
          first_name: firstName,
          last_name: lastName,
          roles: ["restaurant_owner"],
          phone: phone || "",
          created_at: data.user.created_at,
          email_verified: data.user.email_confirmed_at ? true : false,
          restaurant: {
            id: "", // fallback id for linter
            name: restaurantName,
            address: restaurantAddress,
            contact_info: { phone, email },
          },
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        error: (error as any).message || "Something went wrong",
      };
    }
  };

  const checkOnboardingStatus = async (userId: string) => {
    try {
      // Check if user has a business and staff role
      const { data: staffRecord, error: staffError } = await supabase
        .from("business_staff")
        .select(
          `
          role,
          business:businesses!inner(
            id,
            name,
            slug,
            is_active
          )
        `
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      // business can be array or object depending on join
      const business = Array.isArray(staffRecord?.business)
        ? staffRecord.business[0]
        : staffRecord?.business;

      if (staffError || !staffRecord || !business || !business.is_active) {
        return { completed: false, business: null, restaurant: null };
      }

      return {
        completed: true,
        business,
        restaurant: business, // for backward compatibility
        role: staffRecord.role,
      };
    } catch (error) {
      console.error("Onboarding check error:", error);
      return { completed: false, business: null, restaurant: null };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setUser(null);
      router.push("/auth/signin");
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user?.email || "",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        error: (error as any).message || "Something went wrong",
      };
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    checkAuth,
    resendVerificationEmail,
    checkOnboardingStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const getUserRole = async (userId: string) => {
  try {
    // First check if user owns a business
    const { data: ownedBusiness } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (ownedBusiness) {
      return "owner";
    }

    // Check if user is staff member
    const { data: staffMember } = await supabase
      .from("business_staff")
      .select("role")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (staffMember) {
      return staffMember.role;
    }

    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

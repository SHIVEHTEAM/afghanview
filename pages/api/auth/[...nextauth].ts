import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Check if user exists in admins table
          const { data: admin, error: adminError } = await supabase
            .from("admins")
            .select("*")
            .eq("email", credentials.email)
            .single();

          if (admin && !adminError) {
            // For now, we'll use a simple password check
            // In production, you should hash passwords
            if (credentials.password === "admin123") {
              return {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                type: "admin",
              };
            }
          }

          // Check if user exists in restaurants table (restaurant owners)
          const { data: restaurant, error: restaurantError } = await supabase
            .from("restaurants")
            .select("*")
            .eq("owner_email", credentials.email)
            .single();

          if (restaurant && !restaurantError) {
            // For now, we'll use a simple password check
            // In production, you should hash passwords
            if (credentials.password === "owner123") {
              return {
                id: restaurant.id,
                email: restaurant.owner_email,
                name: restaurant.name,
                role: "restaurant_owner",
                type: "restaurant",
                restaurantId: restaurant.id,
              };
            }
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.type = user.type;
        token.restaurantId = user.restaurantId;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.role = token.role;
        session.user.type = token.type;
        session.user.restaurantId = token.restaurantId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

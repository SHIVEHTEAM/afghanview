import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: "admin" | "client" | "viewer";
    business_id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    role: "admin" | "client" | "viewer";
    business_id?: string;
  }
}

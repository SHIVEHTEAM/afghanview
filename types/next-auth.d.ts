import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: "admin" | "client" | "viewer";
      restaurant_id?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: "admin" | "client" | "viewer";
    restaurant_id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    role: "admin" | "client" | "viewer";
    restaurant_id?: string;
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Fetch user roles
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .eq("is_active", true);
    const roles =
      userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];

    // Get user's restaurant if they're a restaurant owner
    let restaurant = null;
    if (roles.includes("restaurant_owner")) {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("created_by", user.id)
        .single();

      if (!restaurantError && restaurantData) {
        restaurant = restaurantData;
      }
    }

    // Prepare response data
    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      roles,
      phone: user.phone,
      created_at: user.created_at,
      restaurant: restaurant,
    };

    // Set session cookie
    res.setHeader(
      "Set-Cookie",
      `user_session=${user.id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
    );

    console.log("User signed in successfully:", userData);

    return res.status(200).json({
      success: true,
      user: userData,
      message: "Signed in successfully",
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session from cookie
    const userSession = req.cookies.user_session;

    if (!userSession) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userSession)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: "Invalid session" });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" });
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

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

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
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      restaurantName,
      restaurantAddress,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!restaurantName || !restaurantAddress) {
      return res
        .status(400)
        .json({ error: "Restaurant name and address are required" });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing user:", checkError);
      return res
        .status(500)
        .json({ error: "Database error", details: checkError });
    }

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user (no user_type)
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        password_hash: passwordHash,
        is_active: true,
        email_verified: false,
      })
      .select()
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      return res
        .status(500)
        .json({ error: "Failed to create user", details: userError });
    }

    // Get the restaurant_owner role id
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "restaurant_owner")
      .single();

    if (roleError || !role) {
      // Clean up user if role fetch fails
      await supabase.from("users").delete().eq("id", user.id);
      console.error("Role fetch error:", roleError);
      return res
        .status(500)
        .json({ error: "Failed to assign user role", details: roleError });
    }

    // Assign user the restaurant_owner role
    const { error: userRoleError } = await supabase.from("user_roles").insert({
      user_id: user.id,
      role_id: role.id,
      is_active: true,
    });

    if (userRoleError) {
      // Clean up user if role assignment fails
      await supabase.from("users").delete().eq("id", user.id);
      console.error("User role assignment error:", userRoleError);
      return res
        .status(500)
        .json({ error: "Failed to assign user role", details: userRoleError });
    }

    // Create restaurant with proper schema fields
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .insert({
        name: restaurantName,
        slug: restaurantName.toLowerCase().replace(/\s+/g, "-"),
        address: { address: restaurantAddress },
        contact_info: { phone: phone || null, email: email },
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (restaurantError) {
      // Clean up user and user_roles if restaurant creation fails
      await supabase.from("user_roles").delete().eq("user_id", user.id);
      await supabase.from("users").delete().eq("id", user.id);
      console.error("Restaurant creation error:", restaurantError);
      return res
        .status(500)
        .json({
          error: "Failed to create restaurant",
          details: restaurantError,
        });
    }

    // Fetch user roles for response
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .eq("is_active", true);
    const roles =
      userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];

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

    console.log("User created successfully:", userData);

    return res.status(201).json({
      success: true,
      user: userData,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error });
  }
}

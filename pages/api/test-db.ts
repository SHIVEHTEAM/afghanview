import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Test database connection
    const { data: restaurants, error: restaurantsError } = await supabase
      .from("restaurants")
      .select("count")
      .limit(1);

    if (restaurantsError) {
      return res.status(500).json({
        error: "Database connection failed",
        details: restaurantsError.message,
      });
    }

    // Test admin table
    const { data: admins, error: adminsError } = await supabase
      .from("admins")
      .select("count")
      .limit(1);

    if (adminsError) {
      return res.status(500).json({
        error: "Admin table access failed",
        details: adminsError.message,
      });
    }

    return res.status(200).json({
      message: "Database connection successful",
      tables: {
        restaurants: "Connected",
        admins: "Connected",
        slides: "Available",
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

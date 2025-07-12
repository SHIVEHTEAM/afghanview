import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    try {
      // Get user's business through staff relationship
      const { data: staffMember } = await supabase
        .from("business_staff")
        .select(
          `
          business:businesses!inner(
            id,
            name,
            type,
            description,
            created_at
          ),
          role,
          business_type
        `
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      let business = null;
      if (
        staffMember?.business &&
        Array.isArray(staffMember.business) &&
        staffMember.business.length > 0
      ) {
        business = staffMember.business[0];
      } else {
        // Check if user owns a business
        const { data: userBusiness } = await supabase
          .from("businesses")
          .select("id, name, type, description, created_at")
          .eq("user_id", userId)
          .eq("is_active", true)
          .single();
        if (userBusiness) {
          business = userBusiness;
        }
      }
      return res.status(200).json({ business });
    } catch (error) {
      console.error("Error fetching business:", error);
      return res.status(500).json({ error: "Failed to fetch business" });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}

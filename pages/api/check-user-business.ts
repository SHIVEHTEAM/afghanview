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
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter" });
      }

      // Get user info from profiles table
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) {
        return res
          .status(404)
          .json({ error: "User not found", details: userError });
      }

      // Check business staff relationships
      const { data: staffMember, error: staffError } = await supabase
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

      // Check if user created any businesses
      const { data: userBusiness, error: businessError } = await supabase
        .from("businesses")
        .select("id, name, type, description, created_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      // Get all slideshows for any business the user has access to
      let slideshows = [];
      let businessId = null;

      if (staffMember?.business) {
        const business = Array.isArray(staffMember.business)
          ? staffMember.business[0]
          : staffMember.business;
        businessId = business?.id;
      } else if (userBusiness) {
        businessId = userBusiness.id;
      }

      if (businessId) {
        const { data: slideshowData, error: slideshowError } = await supabase
          .from("slideshows")
          .select("*")
          .eq("business_id", businessId)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!slideshowError && slideshowData) {
          slideshows = slideshowData;
        }
      }

      const response = {
        user,
        business: staffMember?.business || userBusiness,
        staffRole: staffMember?.role,
        businessType: staffMember?.business_type || userBusiness?.type,
        slideshows,
        hasBusiness: !!(staffMember?.business || userBusiness),
        isStaff: !!staffMember,
        isOwner: !!userBusiness,
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error checking user business:", error);
      return res.status(500).json({
        error: "Failed to check user business",
        details: error,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

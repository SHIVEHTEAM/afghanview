import { NextApiRequest, NextApiResponse } from "next";
import { createCheckoutSession, STRIPE_PLANS } from "../../../lib/stripe";
import { supabase } from "../../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { planSlug, businessId, restaurantId, successUrl, cancelUrl } =
      req.body;

    // Support both old and new parameter names
    const actualBusinessId = businessId || restaurantId;

    // Validate required fields
    if (!planSlug || !actualBusinessId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error:
          "Missing required fields: planSlug, businessId, successUrl, cancelUrl",
      });
    }

    // Validate plan
    if (!STRIPE_PLANS[planSlug as keyof typeof STRIPE_PLANS]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Verify user has access to business
    const { data: staffRecord, error: staffError } = await supabase
      .from("business_staff")
      .select("role")
      .eq("user_id", user.id)
      .eq("business_id", actualBusinessId)
      .eq("is_active", true)
      .single();

    if (staffError || !staffRecord) {
      return res.status(403).json({ error: "Access denied to business" });
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      userId: user.id,
      businessId: actualBusinessId,
      planSlug: planSlug as keyof typeof STRIPE_PLANS,
      successUrl,
      cancelUrl,
    });

    res.status(200).json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}

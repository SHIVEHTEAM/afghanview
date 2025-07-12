import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import {
  upgradeSubscription,
  getPlanBySlug,
} from "../../../lib/premium-features";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { planSlug } = req.body;

    if (!planSlug) {
      return res.status(400).json({ error: "Plan slug is required" });
    }

    const plan = getPlanBySlug(planSlug);
    if (!plan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Get user's current subscription
    const { data: currentSubscription, error: subscriptionError } =
      await supabase
        .from("business_subscriptions")
        .select(
          `
        *,
        plan:subscription_plans(*)
      `
        )
        .eq(
          "business_id",
          (
            await supabase
              .from("business_staff")
              .select("business_id")
              .eq("user_id", session.user.id)
              .eq("is_active", true)
              .single()
          ).data?.business_id
        )
        .eq("status", "active")
        .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      throw subscriptionError;
    }

    // For now, we'll simulate a successful upgrade
    // In production, you'd integrate with Stripe or another payment processor
    const upgradeSuccess = await upgradeSubscription(session.user.id, planSlug);

    if (!upgradeSuccess) {
      return res.status(500).json({ error: "Failed to upgrade subscription" });
    }

    // Create billing history record
    await supabase.from("billing_history").insert({
      business_id: currentSubscription?.business_id,
      subscription_id: currentSubscription?.id,
      amount: plan.price * 100, // Convert to cents
      currency: plan.currency,
      status: "paid",
      payment_method: "card",
      paid_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${plan.name}`,
      plan: {
        name: plan.name,
        slug: plan.slug,
        price: plan.price,
      },
    });
  } catch (error) {
    console.error("Subscription upgrade error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

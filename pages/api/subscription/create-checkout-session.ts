import { NextApiRequest, NextApiResponse } from "next";
import { createCheckoutSession, STRIPE_PLANS } from "../../../lib/stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let {
      planSlug,
      interval = "month",
      promotionCode,
      successUrl,
      cancelUrl,
    } = req.body;
    // Ensure interval is type-safe
    if (interval !== "month" && interval !== "year") interval = "month";
    const plan = STRIPE_PLANS[planSlug as keyof typeof STRIPE_PLANS];
    if (!plan) {
      return res.status(400).json({ error: "Invalid plan" });
    }
    if (!plan.priceId[interval as "month" | "year"]) {
      return res.status(400).json({ error: "Invalid billing interval" });
    }
    // Build discounts array if promotionCode is provided
    const discounts = promotionCode
      ? [{ promotion_code: promotionCode }]
      : undefined;
    // Create checkout session
    const session = await createCheckoutSession({
      planSlug,
      interval,
      successUrl,
      cancelUrl,
      discounts,
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}

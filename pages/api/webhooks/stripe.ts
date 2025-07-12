import { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import { handleWebhookEvent, STRIPE_CONFIG } from "../../../lib/stripe";

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the raw body
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    // Verify webhook signature
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_CONFIG.webhookSecret
    );

    // Handle the event
    await handleWebhookEvent(event);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);

    if (error instanceof Error && error.message.includes("Invalid signature")) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    return res.status(500).json({ error: "Webhook processing failed" });
  }
}

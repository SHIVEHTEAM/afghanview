import Stripe from "stripe";
import { supabase } from "./supabase";

// Initialize Stripe with proper error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
  typescript: true,
});

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  currency: "usd",
  trialDays: 7,
};

// Subscription plan mapping
export const STRIPE_PLANS = {
  starter: {
    priceId: {
      // Live:
      // month: "price_1Rni3pCYIfRqIz7gS7MMsN6a",
      // year: "price_1Rni3pCYIfRqIz7gc8LA8EqC",
      // Test:
      month: "price_1Rnky8CYIfRqIz7gMCKotvyf",
      year: "price_1Rnky8CYIfRqIz7gOG4US1Li",
    },
    name: "Starter",
    price: 39,
    yearlyPrice: 390,
    features: {
      slideshows: 5,
      staff: 2,
      aiCredits: 100,
      support: "Email & Chat",
    },
  },
  professional: {
    priceId: {
      month: "price_1Rni5iCYIfRqIz7gOdBIcSY2",
      year: "price_1Rni6ECYIfRqIz7ghiejSm36",
    },
    name: "Professional",
    price: 99,
    yearlyPrice: 990,
    features: {
      slideshows: 20,
      staff: 5,
      aiCredits: 500,
      support: "Priority Support",
    },
  },
  unlimited: {
    priceId: {
      month: "price_1Rni7lCYIfRqIz7gcclFjD72",
      year: "price_1Rni86CYIfRqIz7gwpJRuwZa",
    },
    name: "Unlimited",
    price: 249,
    yearlyPrice: 2490,
    features: {
      slideshows: -1, // Unlimited
      staff: -1, // Unlimited
      aiCredits: -1, // Unlimited
      support: "24/7 Phone Support",
    },
  },
};

// Types for Stripe operations
type CreateCheckoutSessionParams = {
  planSlug: keyof typeof STRIPE_PLANS;
  interval: "month" | "year";
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
  discounts?: Array<{ promotion_code: string }>;
};

export interface CreateCustomerPortalParams {
  customerId: string;
  returnUrl: string;
}

export interface SubscriptionData {
  id: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  planId: string;
  customerId: string;
}

// Create Stripe customer
export async function createStripeCustomer(
  userId: string,
  email: string,
  name: string
) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    // Update user profile with Stripe customer ID
    await supabase
      .from("users")
      .update({
        stripe_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw new Error("Failed to create customer");
  }
}

// Create checkout session for subscription
export async function createCheckoutSession({
  planSlug,
  interval = "month",
  successUrl,
  cancelUrl,
  trialDays = STRIPE_CONFIG.trialDays,
  discounts,
}: CreateCheckoutSessionParams) {
  try {
    // Get plan details
    const plan = STRIPE_PLANS[planSlug];
    if (!plan) {
      throw new Error("Invalid plan");
    }
    // Use correct priceId for interval
    const priceId = plan.priceId[interval];
    if (!priceId) {
      throw new Error("Invalid billing interval");
    }

    // Create checkout session for paid plans (no customer, let Stripe create one)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          planSlug,
          interval,
        },
      },
      metadata: {
        planSlug,
        interval,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      ...(discounts ? { discounts } : {}),
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
}

// Create customer portal session
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: CreateCustomerPortalParams) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    throw new Error("Failed to create customer portal session");
  }
}

// Handle webhook events
export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    throw error;
  }
}

// Webhook handlers
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const { planSlug } = session.metadata || {};

  if (!planSlug) {
    throw new Error("Missing metadata in checkout session");
  }

  // Get plan details
  const plan = STRIPE_PLANS[planSlug as keyof typeof STRIPE_PLANS];
  if (!plan) {
    throw new Error("Invalid plan");
  }

  // --- USER/BUSINESS PROVISIONING LOGIC ---
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;

  // 1. Check if user exists
  let { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", customerEmail)
    .single();

  let userId = user?.id;

  if (!userId) {
    // 2. Create user in 'users' table
    const { data: newUser, error: newUserError } = await supabase
      .from("users")
      .insert({ email: customerEmail, name: customerName })
      .select()
      .single();
    if (newUserError) throw newUserError;
    userId = newUser.id;
    // 3. Create profile for user
    await supabase.from("profiles").insert({
      id: userId,
      first_name: customerName?.split(" ")[0] || "",
      last_name: customerName?.split(" ").slice(1).join(" ") || "",
      roles: ["restaurant_owner"],
      subscription_plan: planSlug,
      subscription_status: "active",
      email: customerEmail,
    });
  }

  // 4. Check if business exists for user
  let { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .single();
  let businessId = business?.id;
  if (!businessId) {
    // 5. Create business for user
    const { data: newBusiness, error: newBusinessError } = await supabase
      .from("businesses")
      .insert({
        user_id: userId,
        name: customerName ? `${customerName}'s Business` : customerEmail,
        type: "restaurant",
        subscription_plan: planSlug,
        created_by: userId,
        is_active: true,
      })
      .select()
      .single();
    if (newBusinessError) throw newBusinessError;
    businessId = newBusiness.id;
  }

  // Create or update subscription in database
  const { data: existingSubscription } = await supabase
    .from("restaurant_subscriptions")
    .select("id")
    .eq("stripe_subscription_id", session.subscription as string)
    .eq("status", "active")
    .single();

  const subscriptionData = {
    restaurant_id: businessId,
    plan_id: (
      await supabase
        .from("subscription_plans")
        .select("id")
        .eq("slug", planSlug)
        .single()
    ).data?.id,
    status: "trial",
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    trial_start: new Date().toISOString(),
    trial_end: new Date(
      Date.now() + STRIPE_CONFIG.trialDays * 24 * 60 * 60 * 1000
    ).toISOString(),
    stripe_subscription_id: session.subscription as string,
    stripe_customer_id: session.customer as string,
  };

  if (existingSubscription) {
    await supabase
      .from("restaurant_subscriptions")
      .update(subscriptionData)
      .eq("id", existingSubscription.id);
  } else {
    await supabase.from("restaurant_subscriptions").insert(subscriptionData);
  }

  // Create billing history record
  await supabase.from("billing_history").insert({
    restaurant_id: businessId,
    subscription_id: existingSubscription?.id,
    amount: plan.price * 100, // Convert to cents
    currency: STRIPE_CONFIG.currency,
    status: "paid",
    payment_method: "card",
    stripe_payment_intent_id: session.payment_intent as string,
    paid_at: new Date().toISOString(),
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const { planSlug } = subscription.metadata || {};

  if (!planSlug) {
    return; // Skip if no metadata
  }

  // Update subscription status
  await supabase
    .from("restaurant_subscriptions")
    .update({
      status: subscription.status,
      // Removed current_period_start and current_period_end
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Update subscription status
  await supabase
    .from("restaurant_subscriptions")
    .update({
      status: subscription.status,
      // Removed current_period_start and current_period_end
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as cancelled
  await supabase
    .from("restaurant_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) return;

  // Create billing history record
  const { data: subscription } = await supabase
    .from("restaurant_subscriptions")
    .select("restaurant_id, id")
    .eq("stripe_subscription_id", (invoice as any).subscription)
    .single();

  if (subscription) {
    await supabase.from("billing_history").insert({
      restaurant_id: subscription.restaurant_id,
      subscription_id: subscription.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: "paid",
      payment_method: "card",
      stripe_invoice_id: invoice.id,
      paid_at: new Date().toISOString(),
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) return;

  // Create billing history record for failed payment
  const { data: subscription } = await supabase
    .from("restaurant_subscriptions")
    .select("restaurant_id, id")
    .eq("stripe_subscription_id", (invoice as any).subscription)
    .single();

  if (subscription) {
    await supabase.from("billing_history").insert({
      restaurant_id: subscription.restaurant_id,
      subscription_id: subscription.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: "failed",
      payment_method: "card",
      stripe_invoice_id: invoice.id,
      created_at: new Date().toISOString(),
    });
  }
}

// Utility functions
export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const { data, error } = await supabase
    .from("restaurant_subscriptions")
    .select(
      `
      *,
      plan:subscription_plans(*)
    `
    )
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSubscription(stripeSubscriptionId: string) {
  try {
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
}

export async function reactivateSubscription(stripeSubscriptionId: string) {
  try {
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    throw new Error("Failed to reactivate subscription");
  }
}

export default stripe;

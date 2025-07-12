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
  trialDays: 14,
};

// Subscription plan mapping
export const STRIPE_PLANS = {
  free: {
    priceId: null, // No Stripe price ID for free plan
    name: "Free Forever",
    price: 0,
    features: {
      slideshows: 1,
      staff: 0,
      aiCredits: 10,
      support: "Email",
    },
  },
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    name: "Starter",
    price: 39,
    features: {
      slideshows: 5,
      staff: 2,
      aiCredits: 100,
      support: "Email & Chat",
    },
  },
  professional: {
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    name: "Professional",
    price: 99,
    features: {
      slideshows: 20,
      staff: 5,
      aiCredits: 500,
      support: "Priority Support",
    },
  },
  unlimited: {
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID!,
    name: "Unlimited",
    price: 249,
    features: {
      slideshows: -1, // Unlimited
      staff: -1, // Unlimited
      aiCredits: -1, // Unlimited
      support: "24/7 Phone Support",
    },
  },
};

// Types for Stripe operations
export interface CreateCheckoutSessionParams {
  userId: string;
  businessId: string;
  planSlug: keyof typeof STRIPE_PLANS;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}

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
  userId,
  businessId,
  planSlug,
  successUrl,
  cancelUrl,
  trialDays = STRIPE_CONFIG.trialDays,
}: CreateCheckoutSessionParams) {
  try {
    // Get user and restaurant data
    const { data: user } = await supabase
      .from("users")
      .select("email, first_name, last_name, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!user) {
      throw new Error("User not found");
    }

    // Get plan details
    const plan = STRIPE_PLANS[planSlug];
    if (!plan) {
      throw new Error("Invalid plan");
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await createStripeCustomer(
        userId,
        user.email,
        `${user.first_name} ${user.last_name}`
      );
      customerId = customer.id;
    }

    // Handle free plan differently
    if (planSlug === "free") {
      // For free plan, create a mock session that will be handled differently
      return {
        id: `free_${Date.now()}`,
        url: `${successUrl}?session_id=free_${Date.now()}&plan=free`,
        mode: "subscription",
        status: "complete",
      } as any;
    }

    // Create checkout session for paid plans
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          userId,
          businessId,
          planSlug,
        },
      },
      metadata: {
        userId,
        businessId,
        planSlug,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
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
  const { userId, restaurantId, planSlug } = session.metadata || {};

  if (!userId || !restaurantId || !planSlug) {
    throw new Error("Missing metadata in checkout session");
  }

  // Get plan details
  const plan = STRIPE_PLANS[planSlug as keyof typeof STRIPE_PLANS];
  if (!plan) {
    throw new Error("Invalid plan");
  }

  // Create or update subscription in database
  const { data: existingSubscription } = await supabase
    .from("restaurant_subscriptions")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("status", "active")
    .single();

  const subscriptionData = {
    restaurant_id: restaurantId,
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
    restaurant_id: restaurantId,
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
  const { userId, restaurantId, planSlug } = subscription.metadata || {};

  if (!userId || !restaurantId || !planSlug) {
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

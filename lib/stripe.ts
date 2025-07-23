import Stripe from "stripe";
import { supabase } from "./supabase";
import { createClient } from "@supabase/supabase-js";

// Create admin client for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      // Test:
      // month: "price_1Rnky8CYIfRqIz7gMCKotvyf",
      // year: "price_1Rnky8CYIfRqIz7gOG4US1Li",
      // Live:
      month: "price_1Rni3pCYIfRqIz7gS7MMsN6a",
      year: "price_1Rni3pCYIfRqIz7gc8LA8EqC",
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

// Webhook handlers (move these above handleWebhookEvent)
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  console.log("🔔 Starting checkout session completion handler");
  console.log("📋 Session data:", {
    id: session.id,
    customer_email: session.customer_details?.email,
    customer_name: session.customer_details?.name,
    metadata: session.metadata,
  });

  const { planSlug } = session.metadata || {};

  if (!planSlug) {
    console.error("❌ Missing planSlug in session metadata");
    throw new Error("Missing metadata in checkout session");
  }

  console.log("✅ Plan slug found:", planSlug);

  // Get plan details
  const plan = STRIPE_PLANS[planSlug as keyof typeof STRIPE_PLANS];
  if (!plan) {
    console.error("❌ Invalid plan:", planSlug);
    throw new Error("Invalid plan");
  }

  console.log("✅ Plan details:", plan);

  // --- USER/BUSINESS PROVISIONING LOGIC ---
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;

  if (!customerEmail) {
    console.error("❌ No customer email in checkout session");
    throw new Error("No customer email in checkout session");
  }

  console.log("✅ Customer email:", customerEmail);
  console.log("✅ Customer name:", customerName);

  try {
    // 1. Check if user exists in auth.users
    console.log("🔍 Checking if user exists in auth.users...");
    let { data: user, error: userError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      console.error("❌ Error listing users:", userError);
      throw userError;
    }

    let userId = user?.users?.find((u) => u.email === customerEmail)?.id;
    console.log(
      "🔍 User lookup result:",
      userId ? `Found user: ${userId}` : "User not found"
    );

    if (!userId) {
      console.log("👤 Creating new user in auth.users...");
      // 2. Create user in auth.users
      const { data: newUser, error: newUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email: customerEmail,
          email_confirm: true,
          user_metadata: {
            name: customerName,
            planSlug: planSlug,
          },
        });

      if (newUserError) {
        console.error("❌ Error creating user:", newUserError);
        throw newUserError;
      }

      userId = newUser.user.id;
      console.log("✅ Created new user:", userId);

      // Send magic link invite
      try {
        console.log("✉️ Sending magic link invite to:", customerEmail);
        const { data: inviteData, error: inviteError } =
          await supabaseAdmin.auth.admin.inviteUserByEmail(customerEmail, {
            redirectTo: `${
              process.env.NEXT_PUBLIC_SITE_URL || "https://shivehview.com"
            }/onboarding`,
          });
        if (inviteError) {
          console.error("❌ Error sending magic link invite:", inviteError);
        } else {
          console.log("✅ Magic link invite sent:", inviteData);
        }
      } catch (inviteErr) {
        console.error("❌ Exception sending magic link invite:", inviteErr);
      }
    }

    // 3. Create profile for user (if doesn't exist)
    console.log("👤 Checking if profile exists...");
    const { data: existingProfile, error: profileCheckError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("❌ Error checking profile:", profileCheckError);
      throw profileCheckError;
    }

    if (!existingProfile) {
      console.log("👤 Creating profile for user...");
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          first_name: customerName?.split(" ")[0] || "",
          last_name: customerName?.split(" ").slice(1).join(" ") || "",
          roles: ["restaurant_owner"],
          subscription_plan: planSlug,
          subscription_status: "active",
        });

      if (profileError) {
        console.error("❌ Error creating profile:", profileError);
        throw profileError;
      }
      console.log("✅ Created profile for user:", userId);
    } else {
      console.log("✅ Profile already exists for user:", userId);
    }

    // 4. Check if business exists for user
    console.log("🏢 Checking if business exists...");
    let { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (businessError && businessError.code !== "PGRST116") {
      console.error("❌ Error checking business:", businessError);
      throw businessError;
    }

    let businessId = business?.id;
    console.log(
      "🏢 Business lookup result:",
      businessId ? `Found business: ${businessId}` : "Business not found"
    );

    if (!businessId) {
      console.log("🏢 Creating business for user...");
      // 5. Create business for user
      const { data: newBusiness, error: newBusinessError } = await supabaseAdmin
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

      if (newBusinessError) {
        console.error("❌ Error creating business:", newBusinessError);
        throw newBusinessError;
      }
      businessId = newBusiness.id;
      console.log("✅ Created business:", businessId);
    }

    // Create or update subscription in database
    console.log("💳 Creating subscription record...");
    const { data: existingSubscription } = await supabaseAdmin
      .from("business_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", session.subscription as string)
      .eq("status", "active")
      .single();

    const subscriptionData = {
      business_id: businessId,
      plan_id: (
        await supabaseAdmin
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
      console.log("💳 Updating existing subscription...");
      await supabaseAdmin
        .from("business_subscriptions")
        .update(subscriptionData)
        .eq("id", existingSubscription.id);
    } else {
      console.log("💳 Creating new subscription...");
      await supabaseAdmin
        .from("business_subscriptions")
        .insert(subscriptionData);
    }

    // Create billing history record
    console.log("💰 Creating billing history...");
    await supabaseAdmin.from("billing_history").insert({
      business_id: businessId,
      subscription_id: existingSubscription?.id,
      amount: plan.price * 100, // Convert to cents
      currency: STRIPE_CONFIG.currency,
      status: "paid",
      payment_method: "card",
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
    });

    console.log("🎉 Successfully processed checkout session for user:", userId);
    console.log("📊 Summary:", {
      userId,
      businessId,
      planSlug,
      customerEmail,
    });
  } catch (error) {
    console.error("❌ Error in handleCheckoutSessionCompleted:", error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const { planSlug } = subscription.metadata || {};

  if (!planSlug) {
    return; // Skip if no metadata
  }

  // Update subscription status
  await supabaseAdmin
    .from("business_subscriptions")
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
  await supabaseAdmin
    .from("business_subscriptions")
    .update({
      status: subscription.status,
      // Removed current_period_start and current_period_end
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as cancelled
  await supabaseAdmin
    .from("business_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription) return;

  // Create billing history record
  const { data: subscription } = await supabaseAdmin
    .from("business_subscriptions")
    .select("business_id, id")
    .eq("stripe_subscription_id", (invoice as any).subscription)
    .single();

  if (subscription) {
    await supabaseAdmin.from("billing_history").insert({
      business_id: subscription.business_id,
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

  // Update subscription status
  await supabaseAdmin
    .from("business_subscriptions")
    .update({
      status: "past_due",
    })
    .eq("stripe_subscription_id", (invoice as any).subscription);
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

// Helper functions
export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const { data, error } = await supabaseAdmin
    .from("business_subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSubscription(stripeSubscriptionId: string) {
  const { error } = await supabaseAdmin
    .from("business_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) throw error;
}

export async function reactivateSubscription(stripeSubscriptionId: string) {
  const { error } = await supabaseAdmin
    .from("business_subscriptions")
    .update({
      status: "active",
      cancelled_at: null,
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) throw error;
}

export default stripe;

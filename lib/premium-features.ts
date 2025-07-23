import { supabase } from "./supabase";
import { createClient } from "@supabase/supabase-js";

// For server-side operations, we need the service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Create a server-side client for admin operations
const supabaseAdmin =
  supabaseServiceKey && supabaseUrl
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export interface PremiumFeatures {
  // AI Features
  aiCredits: number;
  aiContentGeneration: boolean;
  aiImageGeneration: boolean;
  aiFactGeneration: boolean;
  aiMenuOptimization: boolean;

  // Analytics & Insights
  advancedAnalytics: boolean;
  realTimeAnalytics: boolean;
  customerInsights: boolean;
  performanceReports: boolean;
  competitorAnalysis: boolean;

  // Content & Templates
  premiumTemplates: boolean;
  customTemplates: boolean;
  unlimitedSlides: boolean;
  advancedAnimations: boolean;
  customBranding: boolean;

  // Staff & Management
  staffManagement: boolean;
  roleBasedAccess: boolean;
  teamCollaboration: boolean;
  approvalWorkflows: boolean;

  // Integrations & API
  apiAccess: boolean;
  webhookSupport: boolean;
  thirdPartyIntegrations: boolean;
  customIntegrations: boolean;

  // Support & Services
  prioritySupport: boolean;
  dedicatedSupport: boolean;
  onboardingServices: boolean;
  customTraining: boolean;

  // Advanced Features
  multipleLocations: boolean;
  whiteLabelSolution: boolean;
  advancedScheduling: boolean;
  contentCalendar: boolean;
  aBTesting: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: PremiumFeatures;
  limits: {
    slides: number;
    staffMembers: number;
    locations: number;
    aiCredits: number;
    storageGB: number;
  };
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    slug: "starter",
    price: 39,
    currency: "USD",
    interval: "month",
    features: {
      aiCredits: 0,
      aiContentGeneration: false,
      aiImageGeneration: false,
      aiFactGeneration: false,
      aiMenuOptimization: false,
      advancedAnalytics: false,
      realTimeAnalytics: false,
      customerInsights: false,
      performanceReports: false,
      competitorAnalysis: false,
      premiumTemplates: false,
      customTemplates: false,
      unlimitedSlides: false,
      advancedAnimations: false,
      customBranding: false,
      staffManagement: false,
      roleBasedAccess: false,
      teamCollaboration: false,
      approvalWorkflows: false,
      apiAccess: false,
      webhookSupport: false,
      thirdPartyIntegrations: false,
      customIntegrations: false,
      prioritySupport: false,
      dedicatedSupport: false,
      onboardingServices: false,
      customTraining: false,
      multipleLocations: false,
      whiteLabelSolution: false,
      advancedScheduling: false,
      contentCalendar: false,
      aBTesting: false,
    },
    limits: {
      slides: 5,
      staffMembers: 1,
      locations: 1,
      aiCredits: 0,
      storageGB: 1,
    },
  },
  {
    id: "professional",
    name: "Professional",
    slug: "professional",
    price: 99,
    currency: "USD",
    interval: "month",
    features: {
      aiCredits: 100,
      aiContentGeneration: true,
      aiImageGeneration: true,
      aiFactGeneration: true,
      aiMenuOptimization: true,
      advancedAnalytics: true,
      realTimeAnalytics: true,
      customerInsights: true,
      performanceReports: true,
      competitorAnalysis: false,
      premiumTemplates: true,
      customTemplates: false,
      unlimitedSlides: true,
      advancedAnimations: true,
      customBranding: true,
      staffManagement: true,
      roleBasedAccess: true,
      teamCollaboration: true,
      approvalWorkflows: false,
      apiAccess: false,
      webhookSupport: false,
      thirdPartyIntegrations: false,
      customIntegrations: false,
      prioritySupport: true,
      dedicatedSupport: false,
      onboardingServices: true,
      customTraining: false,
      multipleLocations: false,
      whiteLabelSolution: false,
      advancedScheduling: true,
      contentCalendar: true,
      aBTesting: false,
    },
    limits: {
      slides: -1, // Unlimited
      staffMembers: 10,
      locations: 1,
      aiCredits: 100,
      storageGB: 10,
    },
  },
  {
    id: "unlimited",
    name: "Unlimited",
    slug: "unlimited",
    price: 249,
    currency: "USD",
    interval: "month",
    features: {
      aiCredits: 1000,
      aiContentGeneration: true,
      aiImageGeneration: true,
      aiFactGeneration: true,
      aiMenuOptimization: true,
      advancedAnalytics: true,
      realTimeAnalytics: true,
      customerInsights: true,
      performanceReports: true,
      competitorAnalysis: true,
      premiumTemplates: true,
      customTemplates: true,
      unlimitedSlides: true,
      advancedAnimations: true,
      customBranding: true,
      staffManagement: true,
      roleBasedAccess: true,
      teamCollaboration: true,
      approvalWorkflows: true,
      apiAccess: true,
      webhookSupport: true,
      thirdPartyIntegrations: true,
      customIntegrations: true,
      prioritySupport: true,
      dedicatedSupport: true,
      onboardingServices: true,
      customTraining: true,
      multipleLocations: true,
      whiteLabelSolution: true,
      advancedScheduling: true,
      contentCalendar: true,
      aBTesting: true,
    },
    limits: {
      slides: -1, // Unlimited
      staffMembers: -1, // Unlimited
      locations: -1, // Unlimited
      aiCredits: 1000,
      storageGB: 100,
    },
  },
];

export async function getUserSubscription(userId: string) {
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!business) return null;

  const { data: subscription } = await supabase
    .from("business_subscriptions")
    .select("*")
    .eq("business_id", business.id)
    .eq("status", "active")
    .single();

  return subscription;
}

export async function getUserFeatures(
  userId: string
): Promise<PremiumFeatures | null> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return subscriptionPlans[0].features; // Starter features
    }

    const planSlug = subscription.plan?.slug || "starter";
    const plan = subscriptionPlans.find((p) => p.slug === planSlug);
    return plan?.features || subscriptionPlans[0].features;
  } catch (error) {
    console.error("Error fetching user features:", error);
    return subscriptionPlans[0].features;
  }
}

export async function checkFeatureAccess(
  userId: string,
  feature: keyof PremiumFeatures
): Promise<boolean> {
  try {
    const features = await getUserFeatures(userId);
    const value = features?.[feature];
    return typeof value === "boolean" ? value : false;
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
}

export async function useAICredits(
  userId: string,
  credits: number = 1
): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) return false;

    const planSlug = subscription.plan?.slug || "starter";
    const plan = subscriptionPlans.find((p) => p.slug === planSlug);

    if (!plan || plan.limits.aiCredits === 0) return false;

    // Check if user has enough credits
    const currentCredits =
      subscription.metadata?.aiCredits || plan.limits.aiCredits;
    if (currentCredits < credits) return false;

    // Deduct credits
    await supabase
      .from("restaurant_subscriptions")
      .update({
        metadata: {
          ...subscription.metadata,
          aiCredits: currentCredits - credits,
        },
      })
      .eq("id", subscription.id);

    return true;
  } catch (error) {
    console.error("Error using AI credits:", error);
    return false;
  }
}

export async function getRemainingCredits(userId: string): Promise<number> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) return 0;

    const planSlug = subscription.plan?.slug || "starter";
    const plan = subscriptionPlans.find((p) => p.slug === planSlug);

    if (!plan) return 0;

    return subscription.metadata?.aiCredits || plan.limits.aiCredits;
  } catch (error) {
    console.error("Error getting remaining credits:", error);
    return 0;
  }
}

export async function upgradeSubscription(
  userId: string,
  newPlanSlug: string
): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) return false;

    const newPlan = subscriptionPlans.find((p) => p.slug === newPlanSlug);
    if (!newPlan) return false;

    // Update subscription
    await supabase
      .from("restaurant_subscriptions")
      .update({
        plan_id: newPlan.id,
        metadata: {
          ...subscription.metadata,
          aiCredits: newPlan.limits.aiCredits,
        },
      })
      .eq("id", subscription.id);

    return true;
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return false;
  }
}

export function getPlanBySlug(slug: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find((plan) => plan.slug === slug);
}

export function getPlanFeatures(slug: string): PremiumFeatures | null {
  const plan = getPlanBySlug(slug);
  return plan?.features || null;
}

export function getPlanLimits(slug: string) {
  const plan = getPlanBySlug(slug);
  return plan?.limits || null;
}

export async function checkSubscriptionStatus(userId: string) {
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!business) return { hasSubscription: false, subscription: null };

  const { data: subscription } = await supabase
    .from("business_subscriptions")
    .select("*")
    .eq("business_id", business.id)
    .in("status", ["active", "trial"])
    .single();

  return {
    hasSubscription: !!subscription,
    subscription,
  };
}

export async function getSubscriptionDetails(userId: string) {
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!business) return null;

  const { data: subscription } = await supabase
    .from("business_subscriptions")
    .select(
      `
      *,
      plan:subscription_plans(*)
    `
    )
    .eq("business_id", business.id)
    .single();

  return subscription;
}

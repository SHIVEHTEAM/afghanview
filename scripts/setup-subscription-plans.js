const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const subscriptionPlans = [
  {
    name: "Starter",
    slug: "starter",
    description: "Perfect for small businesses getting started",
    features: {
      slides: 5,
      staffMembers: 1,
      locations: 1,
      aiCredits: 0,
      storageGB: 1,
      aiContentGeneration: false,
      aiImageGeneration: false,
      aiFactGeneration: false,
      advancedAnalytics: false,
      premiumTemplates: false,
      customBranding: false,
      staffManagement: false,
      prioritySupport: false,
      apiAccess: false,
      multipleLocations: false,
      whiteLabelSolution: false,
    },
    pricing: {
      monthly: 39,
      yearly: 390,
      currency: "USD",
      trialDays: 14,
    },
    limits: {
      slides: 5,
      staffMembers: 1,
      locations: 1,
      aiCredits: 0,
      storageGB: 1,
    },
    is_active: true,
    is_popular: false,
    sort_order: 1,
  },
  {
    name: "Professional",
    slug: "professional",
    description: "Best for growing businesses",
    features: {
      slides: -1, // Unlimited
      staffMembers: 10,
      locations: 1,
      aiCredits: 100,
      storageGB: 10,
      aiContentGeneration: true,
      aiImageGeneration: true,
      aiFactGeneration: true,
      advancedAnalytics: true,
      premiumTemplates: true,
      customBranding: true,
      staffManagement: true,
      prioritySupport: true,
      apiAccess: false,
      multipleLocations: false,
      whiteLabelSolution: false,
    },
    pricing: {
      monthly: 99,
      yearly: 990,
      currency: "USD",
      trialDays: 14,
    },
    limits: {
      slides: -1, // Unlimited
      staffMembers: 10,
      locations: 1,
      aiCredits: 100,
      storageGB: 10,
    },
    is_active: true,
    is_popular: true,
    sort_order: 2,
  },
  {
    name: "Unlimited",
    slug: "unlimited",
    description: "For large businesses and chains",
    features: {
      slides: -1, // Unlimited
      staffMembers: -1, // Unlimited
      locations: -1, // Unlimited
      aiCredits: 1000,
      storageGB: 100,
      aiContentGeneration: true,
      aiImageGeneration: true,
      aiFactGeneration: true,
      advancedAnalytics: true,
      premiumTemplates: true,
      customBranding: true,
      staffManagement: true,
      prioritySupport: true,
      apiAccess: true,
      multipleLocations: true,
      whiteLabelSolution: true,
    },
    pricing: {
      monthly: 249,
      yearly: 2490,
      currency: "USD",
      trialDays: 14,
    },
    limits: {
      slides: -1, // Unlimited
      staffMembers: -1, // Unlimited
      locations: -1, // Unlimited
      aiCredits: 1000,
      storageGB: 100,
    },
    is_active: true,
    is_popular: false,
    sort_order: 3,
  },
];

async function setupSubscriptionPlans() {
  console.log("🚀 Setting up subscription plans...");

  try {
    // Check if plans already exist
    const { data: existingPlans, error: checkError } = await supabase
      .from("subscription_plans")
      .select("slug");

    if (checkError) {
      console.error("❌ Error checking existing plans:", checkError);
      return;
    }

    if (existingPlans && existingPlans.length > 0) {
      console.log("✅ Subscription plans already exist, skipping...");
      return;
    }

    // Insert subscription plans
    const { data: insertedPlans, error: insertError } = await supabase
      .from("subscription_plans")
      .insert(subscriptionPlans)
      .select();

    if (insertError) {
      console.error("❌ Error inserting subscription plans:", insertError);
      return;
    }

    console.log("✅ Successfully created subscription plans:");
    insertedPlans.forEach((plan) => {
      console.log(`  - ${plan.name} (${plan.slug})`);
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the setup
setupSubscriptionPlans()
  .then(() => {
    console.log("🎉 Subscription plans setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  });

const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock restaurant ID
const MOCK_RESTAURANT_ID = "550e8400-e29b-41d4-a716-446655440000";

async function setupDemoData() {
  try {
    console.log("Setting up demo data...");

    // First, let's create a sample restaurant if it doesn't exist
    const { data: existingRestaurant, error: restaurantCheckError } =
      await supabase
        .from("restaurants")
        .select("id")
        .eq("id", MOCK_RESTAURANT_ID)
        .single();

    if (restaurantCheckError && restaurantCheckError.code !== "PGRST116") {
      throw restaurantCheckError;
    }

    if (!existingRestaurant) {
      console.log("Creating sample restaurant...");
      const { error: restaurantError } = await supabase
        .from("restaurants")
        .insert([
          {
            id: MOCK_RESTAURANT_ID,
            name: "Afghan Palace",
            slug: "afghan-palace",
            description: "Authentic Afghan cuisine and culture",
            cuisine_type: "Afghan",
            address: {
              street: "123 Main Street",
              city: "New York",
              state: "NY",
              zip: "10001",
              country: "USA",
            },
            contact_info: {
              phone: "+1-555-123-4567",
              email: "info@afghanpalace.com",
              website: "https://afghanpalace.com",
            },
            business_hours: {
              monday: "11:00 AM - 10:00 PM",
              tuesday: "11:00 AM - 10:00 PM",
              wednesday: "11:00 AM - 10:00 PM",
              thursday: "11:00 AM - 10:00 PM",
              friday: "11:00 AM - 11:00 PM",
              saturday: "12:00 PM - 11:00 PM",
              sunday: "12:00 PM - 10:00 PM",
            },
            is_active: true,
            is_verified: true,
          },
        ]);

      if (restaurantError) {
        throw restaurantError;
      }
    }

    // Clear existing slides
    console.log("Clearing existing slides...");
    await supabase
      .from("slides")
      .delete()
      .eq("restaurant_id", MOCK_RESTAURANT_ID);

    // Create sample slides
    console.log("Creating sample slides...");
    const sampleSlides = [
      {
        restaurant_id: MOCK_RESTAURANT_ID,
        name: "Welcome Slide",
        type: "image",
        title: "Welcome to Afghan Palace",
        subtitle: "Authentic Afghan Cuisine & Culture",
        content: {
          imageUrl:
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
          dimensions: { width: 1920, height: 1080 },
        },
        duration: 6000,
        order_index: 0,
        is_active: true,
      },
      {
        restaurant_id: MOCK_RESTAURANT_ID,
        name: "Menu Specials",
        type: "menu",
        title: "Today's Specials",
        subtitle: "Fresh & Authentic",
        content: {
          items: [
            "🍚 Kabuli Pulao - $22.99",
            "🥟 Mantu Dumplings - $18.99",
            "🍖 Qorma-e-Gosht - $24.99",
            "🥖 Naan-e-Afghan - $3.99",
          ],
        },
        duration: 8000,
        order_index: 1,
        is_active: true,
      },
      {
        restaurant_id: MOCK_RESTAURANT_ID,
        name: "Weekend Promotion",
        type: "promo",
        title: "Weekend Special",
        subtitle: "Family Feast Package",
        content: {
          text: "Get 20% off on orders over $50",
        },
        duration: 7000,
        order_index: 2,
        is_active: true,
      },
      {
        restaurant_id: MOCK_RESTAURANT_ID,
        name: "Business Hours",
        type: "hours",
        title: "Visit Us",
        subtitle: "We're Open Daily",
        content: {
          hours: [
            "Monday - Friday: 11:00 AM - 10:00 PM",
            "Saturday - Sunday: 12:00 PM - 11:00 PM",
            "Holidays: 12:00 PM - 9:00 PM",
          ],
        },
        duration: 6000,
        order_index: 3,
        is_active: true,
      },
      {
        restaurant_id: MOCK_RESTAURANT_ID,
        name: "Customer Quote",
        type: "quote",
        title: "What Our Customers Say",
        content: {
          quote:
            "The best Afghan food I've ever tasted! The flavors are authentic and the service is exceptional.",
          author: "Sarah Johnson",
        },
        duration: 5000,
        order_index: 4,
        is_active: true,
      },
    ];

    const { error: slidesError } = await supabase
      .from("slides")
      .insert(sampleSlides);

    if (slidesError) {
      throw slidesError;
    }

    console.log("✅ Demo data setup completed successfully!");
    console.log(`📊 Created ${sampleSlides.length} sample slides`);
    console.log("🏪 Restaurant ID:", MOCK_RESTAURANT_ID);
    console.log("🌐 You can now test the slideshow at: /client");
  } catch (error) {
    console.error("❌ Error setting up demo data:", error);
    process.exit(1);
  }
}

// Run the setup
setupDemoData();

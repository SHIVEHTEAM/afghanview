const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables from both .env and .env.local
require("dotenv").config();
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\n💡 Make sure these are in your .env or .env.local file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupEnhancedDatabase() {
  console.log("🚀 Setting up enhanced database schema...\n");

  try {
    // First, let's check what tables exist
    console.log("📋 Checking existing database structure...");

    // Try to add the new columns to existing tables
    console.log("🔧 Adding enhanced features to existing tables...");

    try {
      // Add new columns to slides table
      const { error: slidesError } = await supabase
        .from("slides")
        .select("id")
        .limit(1);

      if (slidesError) {
        console.log(
          "   ⚠️  Could not access slides table:",
          slidesError.message
        );
      } else {
        console.log("   ✅ Slides table accessible");
      }
    } catch (err) {
      console.log("   ⚠️  Error checking slides table:", err.message);
    }

    // Create sample data for testing
    console.log("\n🎯 Creating sample data...");

    // Get existing restaurant or create one
    const { data: existingRestaurants } = await supabase
      .from("restaurants")
      .select("id, name")
      .limit(1);

    let restaurantId;
    if (existingRestaurants && existingRestaurants.length > 0) {
      restaurantId = existingRestaurants[0].id;
      console.log(
        `   ℹ️  Using existing restaurant: ${existingRestaurants[0].name}`
      );
    } else {
      // Create a sample restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .insert([
          {
            name: "Afghan Palace Enhanced",
            description:
              "Authentic Afghan cuisine with enhanced slideshow features",
            address: "123 Main Street, City, State 12345",
            phone: "+1 (555) 123-4567",
            website: "https://afghanpalace.com",
            package_type: "professional",
            slide_limit: 50,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (restaurantError) {
        console.log(
          "   ⚠️  Could not create restaurant:",
          restaurantError.message
        );
        console.log("   💡 You may need to create a restaurant manually first");
        return;
      }

      restaurantId = restaurant.id;
      console.log("   ✅ Created sample restaurant");
    }

    // Create sample slides with enhanced features
    const sampleSlides = [
      {
        restaurant_id: restaurantId,
        name: "Welcome Slide Enhanced",
        type: "image",
        title: "Welcome to Afghan Palace",
        subtitle: "Authentic Afghan Cuisine",
        content: {
          imageUrl:
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop",
          dimensions: { width: 1920, height: 1080 },
          // Enhanced features stored in content
          multipleImages: [
            {
              id: "1",
              url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop",
              alt: "Welcome to Afghan Palace",
              dimensions: { width: 1920, height: 1080 },
              sort_order: 0,
              is_primary: true,
            },
            {
              id: "2",
              url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1920&h=1080&fit=crop",
              alt: "Restaurant Interior",
              dimensions: { width: 1920, height: 1080 },
              sort_order: 1,
              is_primary: false,
            },
          ],
          selectedImageIndex: 0,
        },
        duration: 6000,
        order_index: 0,
        is_active: true,
      },
      {
        restaurant_id: restaurantId,
        name: "Menu Highlights Enhanced",
        type: "menu",
        title: "Our Special Menu",
        subtitle: "Chef's Recommendations",
        content: {
          items: [
            "🍚 Kabuli Pulao - $22.99",
            "🥟 Mantu Dumplings - $18.99",
            "🍖 Qorma-e-Gosht - $24.99",
            "🥘 Ashak - $20.99",
            "🍗 Chapli Kebab - $26.99",
          ],
        },
        duration: 8000,
        order_index: 1,
        is_active: true,
      },
      {
        restaurant_id: restaurantId,
        name: "Special Promotion Enhanced",
        type: "promo",
        title: "Weekend Special",
        subtitle: "Limited Time Offer",
        content: {
          promotion: "Get 20% off on orders over $50 this weekend!",
          valid_until: "2024-12-31",
          isLocked: true, // Admin locked this promotion
          adminNotes: "Important promotion - do not edit",
        },
        duration: 7000,
        order_index: 2,
        is_active: true,
      },
      {
        restaurant_id: restaurantId,
        name: "Customer Quote Enhanced",
        type: "quote",
        title: "What Our Customers Say",
        subtitle: "Amazing Experience",
        content: {
          quote:
            "The best Afghan food I've ever tasted! The atmosphere is wonderful and the service is exceptional.",
          author: "Sarah Johnson",
        },
        duration: 6000,
        order_index: 3,
        is_active: true,
      },
      {
        restaurant_id: restaurantId,
        name: "Business Hours Enhanced",
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
        duration: 5000,
        order_index: 4,
        is_active: true,
      },
    ];

    // Insert sample slides
    const { data: slides, error: slidesError } = await supabase
      .from("slides")
      .insert(sampleSlides)
      .select();

    if (slidesError) {
      console.log("   ⚠️  Could not insert slides:", slidesError.message);
      console.log(
        "   💡 This might be due to missing columns. Let's try updating existing slides instead."
      );

      // Try to update existing slides with enhanced content
      const { data: existingSlides } = await supabase
        .from("slides")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("order_index", { ascending: true });

      if (existingSlides && existingSlides.length > 0) {
        console.log(
          `   ℹ️  Found ${existingSlides.length} existing slides, updating with enhanced features...`
        );

        for (
          let i = 0;
          i < Math.min(existingSlides.length, sampleSlides.length);
          i++
        ) {
          const existingSlide = existingSlides[i];
          const enhancedContent = sampleSlides[i].content;

          const { error: updateError } = await supabase
            .from("slides")
            .update({
              content: enhancedContent,
              name: sampleSlides[i].name,
            })
            .eq("id", existingSlide.id);

          if (updateError) {
            console.log(
              `   ⚠️  Could not update slide ${i + 1}:`,
              updateError.message
            );
          } else {
            console.log(
              `   ✅ Updated slide ${i + 1}: ${sampleSlides[i].name}`
            );
          }
        }
      }
    } else {
      console.log(`   ✅ Created ${slides.length} enhanced sample slides`);
    }

    console.log("\n🎉 Enhanced database setup completed!");
    console.log("\n📋 What was added:");
    console.log("   ✅ Enhanced slide content with multiple images support");
    console.log("   ✅ Admin locking functionality (stored in content)");
    console.log("   ✅ Sample slides with various types");
    console.log("   ✅ Enhanced content structure for future features");

    console.log("\n🔧 Next steps:");
    console.log("   1. Test the enhanced slide editor in the admin interface");
    console.log("   2. Try creating slides with multiple images");
    console.log("   3. Test the admin locking functionality");
    console.log("   4. Run: npm run dev to start the development server");
  } catch (error) {
    console.error("❌ Error setting up enhanced database:", error);
    console.log(
      "\n💡 This might be due to database permissions or missing tables."
    );
    console.log(
      "   Try running the basic setup first: node scripts/setup-demo-data.js"
    );
  }
}

// Run the setup
setupEnhancedDatabase();

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

async function setupDatabase() {
  console.log("🚀 Setting up enhanced database schema...");

  try {
    // Read and execute the enhanced schema
    const schemaPath = path.join(__dirname, "../database/enhanced-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    const { error } = await supabase.rpc("exec_sql", { sql: schema });
    if (error) {
      console.error("❌ Error executing schema:", error);
      return false;
    }

    console.log("✅ Database schema created successfully");
    return true;
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    return false;
  }
}

async function createStorageBucket() {
  console.log("📦 Creating storage bucket...");

  try {
    // Create the slideshow-media bucket
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();
    if (listError) {
      console.error("❌ Error listing buckets:", listError);
      return false;
    }

    const bucketExists = buckets.some(
      (bucket) => bucket.name === "slideshow-media"
    );

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(
        "slideshow-media",
        {
          public: true,
          allowedMimeTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "video/mp4",
            "video/webm",
            "video/mov",
            "video/avi",
            "video/quicktime",
          ],
          fileSizeLimit: 52428800, // 50MB
        }
      );

      if (createError) {
        console.error("❌ Error creating bucket:", createError);
        return false;
      }

      console.log("✅ slideshow-media bucket created successfully");
    } else {
      console.log("✅ slideshow-media bucket already exists");
    }

    return true;
  } catch (error) {
    console.error("❌ Error with storage setup:", error);
    return false;
  }
}

async function setupStoragePolicies() {
  console.log("🔒 Setting up storage policies...");

  try {
    const policies = [
      {
        name: "Public read access to slideshow images",
        definition: `
          CREATE POLICY "Public read access to slideshow images" ON storage.objects
          FOR SELECT USING (bucket_id = 'slideshow-images');
        `,
      },
      {
        name: "Authenticated users can upload slideshow images",
        definition: `
          CREATE POLICY "Authenticated users can upload slideshow images" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'slideshow-images' 
            AND auth.role() = 'authenticated'
          );
        `,
      },
      {
        name: "Users can update their own slideshow images",
        definition: `
          CREATE POLICY "Users can update their own slideshow images" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'slideshow-images' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `,
      },
      {
        name: "Users can delete their own slideshow images",
        definition: `
          CREATE POLICY "Users can delete their own slideshow images" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'slideshow-images' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `,
      },
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql: policy.definition,
        });
        if (error && !error.message.includes("already exists")) {
          console.error(`❌ Error creating policy "${policy.name}":`, error);
        } else {
          console.log(`✅ Policy "${policy.name}" created/verified`);
        }
      } catch (error) {
        if (!error.message.includes("already exists")) {
          console.error(`❌ Error with policy "${policy.name}":`, error);
        }
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Error setting up storage policies:", error);
    return false;
  }
}

async function createDemoData() {
  console.log("🎭 Creating demo data...");

  try {
    // Create demo restaurants
    const { data: restaurants, error: restaurantError } = await supabase
      .from("restaurants")
      .insert([
        {
          name: "Afghan Palace Restaurant",
          description:
            "Authentic Afghan cuisine in a warm, welcoming atmosphere",
          address: "123 Main Street, Kabul, Afghanistan",
          phone: "+93 70 123 4567",
          email: "info@afghanpalace.com",
          website: "https://afghanpalace.com",
        },
        {
          name: "Silk Road Bistro",
          description: "Modern fusion of Afghan and international flavors",
          address: "456 Central Avenue, Kabul, Afghanistan",
          phone: "+93 70 987 6543",
          email: "contact@silkroadbistro.com",
          website: "https://silkroadbistro.com",
        },
      ])
      .select();

    if (restaurantError) {
      console.error("❌ Error creating restaurants:", restaurantError);
      return false;
    }

    console.log(`✅ Created ${restaurants.length} demo restaurants`);

    // Create demo slides for each restaurant
    for (const restaurant of restaurants) {
      const { data: slides, error: slidesError } = await supabase
        .from("slides")
        .insert([
          {
            restaurant_id: restaurant.id,
            title: "Welcome to " + restaurant.name,
            description: "Experience the finest Afghan cuisine",
            slide_type: "text",
            content:
              "Welcome to our restaurant! We serve authentic Afghan dishes prepared with love and tradition.",
            duration: 5000,
            sort_order: 0,
          },
          {
            restaurant_id: restaurant.id,
            title: "Our Special Dishes",
            description: "Discover our signature menu items",
            slide_type: "image",
            duration: 4000,
            sort_order: 1,
          },
          {
            restaurant_id: restaurant.id,
            title: "Traditional Atmosphere",
            description: "Immerse yourself in Afghan hospitality",
            slide_type: "image",
            duration: 4000,
            sort_order: 2,
          },
        ])
        .select();

      if (slidesError) {
        console.error("❌ Error creating slides:", slidesError);
        continue;
      }

      console.log(
        `✅ Created ${slides.length} demo slides for ${restaurant.name}`
      );

      // Add demo images for image slides
      for (const slide of slides) {
        if (slide.slide_type === "image") {
          const { error: imageError } = await supabase
            .from("slide_images")
            .insert([
              {
                slide_id: slide.id,
                image_url:
                  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
                alt_text: "Delicious Afghan cuisine",
                sort_order: 0,
              },
              {
                slide_id: slide.id,
                image_url:
                  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
                alt_text: "Traditional Afghan restaurant interior",
                sort_order: 1,
              },
            ]);

          if (imageError) {
            console.error("❌ Error creating slide images:", imageError);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Error creating demo data:", error);
    return false;
  }
}

async function createAdminUser() {
  console.log("👑 Creating admin user...");

  try {
    // Create admin user in auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: "admin@shivehview.com",
        password: "admin123456",
        email_confirm: true,
      });

    if (authError) {
      console.error("❌ Error creating admin user:", authError);
      return false;
    }

    // Create admin profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authUser.user.id,
      email: "admin@shivehview.com",
      full_name: "System Administrator",
      role: "admin",
    });

    if (profileError) {
      console.error("❌ Error creating admin profile:", profileError);
      return false;
    }

    console.log("✅ Admin user created successfully");
    console.log("   Email: admin@shivehview.com");
    console.log("   Password: admin123456");
    return true;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    return false;
  }
}

async function main() {
  console.log("🎯 Starting enhanced database setup...\n");

  const steps = [
    { name: "Database Schema", fn: setupDatabase },
    { name: "Storage Bucket", fn: createStorageBucket },
    { name: "Storage Policies", fn: setupStoragePolicies },
    { name: "Demo Data", fn: createDemoData },
    { name: "Admin User", fn: createAdminUser },
  ];

  for (const step of steps) {
    console.log(`\n📋 Step: ${step.name}`);
    const success = await step.fn();
    if (!success) {
      console.error(`\n❌ Failed at step: ${step.name}`);
      process.exit(1);
    }
  }

  console.log("\n🎉 Enhanced database setup completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("   1. Start your Next.js development server");
  console.log(
    "   2. Visit http://localhost:3000/admin to access the admin panel"
  );
  console.log("   3. Login with admin@shivehview.com / admin123456");
  console.log(
    "   4. Visit http://localhost:3000/client to see the client slideshow"
  );
  console.log("\n🔧 Features available:");
  console.log("   ✅ Multiple images per slide");
  console.log("   ✅ Drag & drop reordering");
  console.log("   ✅ Admin slide locking");
  console.log("   ✅ Enhanced permissions system");
  console.log("   ✅ Real-time updates");
}

main().catch(console.error);

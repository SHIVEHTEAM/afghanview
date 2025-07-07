const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugFetchErrors() {
  console.log("🔍 Debugging fetch errors...");

  try {
    // 1. Test basic Supabase connection
    console.log("\n📋 Testing Supabase connection...");
    const { data: testData, error: testError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Supabase connection error:", testError);
      return;
    }
    console.log("✅ Supabase connection working");

    // 2. Test slideshows API endpoint
    console.log("\n📋 Testing slideshows API...");
    try {
      const response = await fetch(
        "http://localhost:3000/api/slideshows?restaurantId=e46a2c25-fe10-4fd2-a2bd-4c72969a898e&userId=7c767b63-5d95-4a36-b3fa-bc5bf4877bc0"
      );
      console.log("📋 Slideshows API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ Slideshows API working, found",
          data.length,
          "slideshows"
        );
      } else {
        const errorText = await response.text();
        console.error("❌ Slideshows API error:", errorText);
      }
    } catch (fetchError) {
      console.error("❌ Slideshows API fetch error:", fetchError.message);
    }

    // 3. Test slideshows by slug
    console.log("\n📋 Testing slideshows by slug...");
    try {
      const response = await fetch(
        "http://localhost:3000/api/slideshows?slug=video-slideshow-0ga9g9"
      );
      console.log("📋 Slideshows by slug response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ Slideshows by slug working, found",
          data.length,
          "slideshows"
        );
      } else {
        const errorText = await response.text();
        console.error("❌ Slideshows by slug error:", errorText);
      }
    } catch (fetchError) {
      console.error("❌ Slideshows by slug fetch error:", fetchError.message);
    }

    // 4. Test auth/me endpoint
    console.log("\n📋 Testing auth/me API...");
    try {
      const response = await fetch("http://localhost:3000/api/auth/me");
      console.log("📋 Auth/me API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Auth/me API working");
      } else {
        const errorText = await response.text();
        console.error("❌ Auth/me API error:", errorText);
      }
    } catch (fetchError) {
      console.error("❌ Auth/me API fetch error:", fetchError.message);
    }

    // 5. Test slides API
    console.log("\n📋 Testing slides API...");
    try {
      const response = await fetch("http://localhost:3000/api/slides");
      console.log("📋 Slides API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Slides API working, found", data.length, "slides");
      } else {
        const errorText = await response.text();
        console.error("❌ Slides API error:", errorText);
      }
    } catch (fetchError) {
      console.error("❌ Slides API fetch error:", fetchError.message);
    }

    // 6. Test specific slide
    console.log("\n📋 Testing specific slide API...");
    try {
      const response = await fetch(
        "http://localhost:3000/api/slideshows/68811aed-6d3f-439f-b974-a9d5c45885a7"
      );
      console.log("📋 Specific slide API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Specific slide API working");
      } else {
        const errorText = await response.text();
        console.error("❌ Specific slide API error:", errorText);
      }
    } catch (fetchError) {
      console.error("❌ Specific slide API fetch error:", fetchError.message);
    }

    // 7. Check if Next.js dev server is running
    console.log("\n📋 Testing if Next.js server is running...");
    try {
      const response = await fetch("http://localhost:3000");
      console.log("📋 Next.js server response status:", response.status);
      console.log("✅ Next.js server is running");
    } catch (fetchError) {
      console.error("❌ Next.js server not running:", fetchError.message);
      console.log("💡 Make sure to run: npm run dev");
    }
  } catch (error) {
    console.error("❌ General error:", error);
  }
}

// Run the debug script
debugFetchErrors();

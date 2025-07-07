const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSlideshowFetch() {
  console.log("🧪 Testing slideshow fetch...");

  try {
    // 1. Test fetching all slides
    console.log("\n📋 Fetching all slides...");
    const { data: allSlides, error: allError } = await supabase
      .from("slides")
      .select("*")
      .order("created_at", { ascending: false });

    if (allError) {
      console.error("❌ Error fetching all slides:", allError);
      return;
    }

    console.log(`✅ Found ${allSlides.length} slides`);
    allSlides.forEach((slide, index) => {
      console.log(`📋 Slide ${index}:`, {
        id: slide.id,
        name: slide.name,
        type: slide.type,
        content_keys: slide.content ? Object.keys(slide.content) : "null",
        content_type: typeof slide.content,
        content_sample: slide.content
          ? JSON.stringify(slide.content).substring(0, 200) + "..."
          : "null",
      });
    });

    // 2. Test fetching by slug
    console.log("\n🔍 Testing fetch by slug...");
    const { data: slugSlides, error: slugError } = await supabase
      .from("slides")
      .select("*")
      .eq("content->slug", "video-slideshow-0ga9g9");

    if (slugError) {
      console.error("❌ Error fetching by slug:", slugError);
    } else {
      console.log(`✅ Found ${slugSlides.length} slides with slug`);
      slugSlides.forEach((slide, index) => {
        console.log(`📋 Slug slide ${index}:`, {
          id: slide.id,
          name: slide.name,
          type: slide.type,
          content: slide.content,
        });
      });
    }

    // 3. Test specific slide that's causing issues
    console.log("\n🔍 Testing specific slide...");
    const { data: specificSlide, error: specificError } = await supabase
      .from("slides")
      .select("*")
      .eq("id", "68811aed-6d3f-439f-b974-a9d5c45885a7")
      .single();

    if (specificError) {
      console.error("❌ Error fetching specific slide:", specificError);
    } else {
      console.log("✅ Specific slide found:", {
        id: specificSlide.id,
        name: specificSlide.name,
        type: specificSlide.type,
        content_type: typeof specificSlide.content,
        content_keys: specificSlide.content
          ? Object.keys(specificSlide.content)
          : "null",
      });

      // Try to parse the content
      if (specificSlide.content) {
        try {
          console.log("📋 Content parsed successfully");
          console.log("📋 Content keys:", Object.keys(specificSlide.content));

          if (specificSlide.content.images) {
            console.log(
              "📋 Images count:",
              specificSlide.content.images.length
            );
            specificSlide.content.images.forEach((img, index) => {
              console.log(`📋 Image ${index}:`, {
                name: img.name,
                type: img.type,
                url: img.url ? "present" : "missing",
              });
            });
          }
        } catch (parseError) {
          console.error("❌ Error parsing content:", parseError);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the test
testSlideshowFetch();

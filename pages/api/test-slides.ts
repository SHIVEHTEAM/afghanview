import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("=== TESTING SLIDES TABLE ===");

    // Test 1: Try to insert a test slide
    console.log("1. Testing slide insertion...");
    const testSlide = {
      name: "Test Slide",
      type: "image",
      title: "Test Title",
      content: { test: true },
      created_by: "00000000-0000-0000-0000-000000000000", // Dummy UUID
    };

    const { data: insertData, error: insertError } = await supabase
      .from("slides")
      .insert(testSlide)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting test slide:", insertError);
      return res.status(200).json({
        error: "Cannot insert slides",
        details: insertError,
      });
    }

    console.log("✅ Test slide inserted successfully:", insertData);

    // Test 2: Try to fetch the test slide
    console.log("2. Testing slide retrieval...");
    const { data: fetchData, error: fetchError } = await supabase
      .from("slides")
      .select("*")
      .eq("id", insertData.id)
      .single();

    if (fetchError) {
      console.error("Error fetching test slide:", fetchError);
      return res.status(200).json({
        error: "Cannot fetch slides",
        details: fetchError,
      });
    }

    console.log("✅ Test slide fetched successfully:", fetchData);

    // Test 3: Delete the test slide
    console.log("3. Cleaning up test slide...");
    const { error: deleteError } = await supabase
      .from("slides")
      .delete()
      .eq("id", insertData.id);

    if (deleteError) {
      console.error("Error deleting test slide:", deleteError);
    } else {
      console.log("✅ Test slide deleted successfully");
    }

    // Test 4: Count all slides
    const { count, error: countError } = await supabase
      .from("slides")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error counting slides:", countError);
    } else {
      console.log(`📊 Total slides in database: ${count}`);
    }

    return res.status(200).json({
      success: true,
      message: "Slides table is working correctly",
      totalSlides: count || 0,
      testResult: {
        insert: insertData,
        fetch: fetchData,
      },
    });
  } catch (error) {
    console.error("Test error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

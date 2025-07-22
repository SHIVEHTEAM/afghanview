const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  console.error(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to clean category name for folder path
function cleanCategoryName(category) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Helper function to clean filename
function cleanFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
}

async function organizeMusicStorage() {
  console.log("🎵 Organizing Music Storage...");

  try {
    // List all files in the music directory
    console.log("📂 Scanning existing music files...");
    const { data: musicFiles, error: listError } = await supabase.storage
      .from("slideshow-media")
      .list("music", {
        limit: 1000,
        offset: 0,
      });

    if (listError) {
      throw new Error(`Failed to list music files: ${listError.message}`);
    }

    if (!musicFiles || musicFiles.length === 0) {
      console.log("✅ No music files found to organize");
      return;
    }

    console.log(`📋 Found ${musicFiles.length} music files to organize`);

    // Get all music tracks from database to get category information
    const { data: tracks, error: tracksError } = await supabase
      .from("music_tracks")
      .select("id, name, category, file_url");

    if (tracksError) {
      throw new Error(`Failed to fetch music tracks: ${tracksError.message}`);
    }

    // Create a map of file URLs to track information
    const trackMap = new Map();
    tracks.forEach((track) => {
      // Extract filename from URL
      const urlParts = track.file_url.split("/");
      const filename = urlParts[urlParts.length - 1];
      trackMap.set(filename, track);
    });

    let organizedCount = 0;
    let skippedCount = 0;

    // Process each music file
    for (const file of musicFiles) {
      try {
        // Check if this file is in our database
        const track = trackMap.get(file.name);

        if (!track) {
          console.log(`⚠️  Skipping ${file.name} - not found in database`);
          skippedCount++;
          continue;
        }

        // Generate new organized path
        const cleanCategory = cleanCategoryName(track.category);
        const cleanFilename = cleanFilename(file.name);
        const timestamp = Date.now();
        const newPath = `music/${cleanCategory}/${timestamp}-${cleanFilename}`;

        // Download the file
        console.log(`📥 Downloading ${file.name}...`);
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("slideshow-media")
          .download(`music/${file.name}`);

        if (downloadError) {
          console.warn(
            `⚠️  Failed to download ${file.name}: ${downloadError.message}`
          );
          skippedCount++;
          continue;
        }

        // Upload to new organized location
        console.log(`📤 Uploading ${file.name} to ${newPath}...`);
        const { error: uploadError } = await supabase.storage
          .from("slideshow-media")
          .upload(newPath, fileData, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.warn(
            `⚠️  Failed to upload ${file.name} to new location: ${uploadError.message}`
          );
          skippedCount++;
          continue;
        }

        // Get new public URL
        const { data: urlData } = supabase.storage
          .from("slideshow-media")
          .getPublicUrl(newPath);

        // Update database record with new URL
        const { error: updateError } = await supabase
          .from("music_tracks")
          .update({ file_url: urlData.publicUrl })
          .eq("id", track.id);

        if (updateError) {
          console.warn(
            `⚠️  Failed to update database for ${file.name}: ${updateError.message}`
          );
        }

        // Delete old file
        const { error: deleteError } = await supabase.storage
          .from("slideshow-media")
          .remove([`music/${file.name}`]);

        if (deleteError) {
          console.warn(
            `⚠️  Failed to delete old file ${file.name}: ${deleteError.message}`
          );
        }

        console.log(`✅ Organized ${file.name} -> ${newPath}`);
        organizedCount++;
      } catch (error) {
        console.warn(`⚠️  Error processing ${file.name}: ${error.message}`);
        skippedCount++;
      }
    }

    console.log("");
    console.log("🎉 Music Storage Organization Complete!");
    console.log(`📊 Results:`);
    console.log(`  ✅ Organized: ${organizedCount} files`);
    console.log(`  ⚠️  Skipped: ${skippedCount} files`);
    console.log("");
    console.log("📁 New folder structure:");
    console.log("  music/");
    console.log("  ├── afghan-traditional/");
    console.log("  ├── persian-classical/");
    console.log("  ├── pashto-traditional/");
    console.log("  ├── ambient-relaxing/");
    console.log("  ├── upbeat-energetic/");
    console.log("  └── instrumental/");
  } catch (error) {
    console.error("❌ Error organizing music storage:", error);
    process.exit(1);
  }
}

// Run the organization
organizeMusicStorage();

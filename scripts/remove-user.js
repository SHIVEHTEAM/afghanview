#!/usr/bin/env node

/**
 * Script to safely remove a user from the database
 * Usage: node scripts/remove-user.js <email>
 *
 * This script will:
 * 1. Find the user by email
 * 2. Remove all related data in the correct order
 * 3. Finally remove the user account
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeUser(email) {
  console.log(`🔍 Looking for user with email: ${email}`);

  try {
    // 1. Find the user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", email)
      .single();

    if (userError || !user) {
      console.error("❌ User not found:", email);
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`🆔 User ID: ${user.id}`);

    // 2. Find associated business
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("user_id", user.id)
      .single();

    if (business) {
      console.log(`🏢 Found business: ${business.name}`);

      // 3. Remove business-related data first
      console.log("🗑️ Removing business-related data...");

      // Remove staff invitations
      const { error: staffInvitationsError } = await supabase
        .from("staff_invitations")
        .delete()
        .eq("business_id", business.id);

      if (staffInvitationsError) {
        console.error(
          "Error removing staff invitations:",
          staffInvitationsError
        );
      } else {
        console.log("✅ Removed staff invitations");
      }

      // Remove staff members
      const { error: staffMembersError } = await supabase
        .from("staff_members")
        .delete()
        .eq("business_id", business.id);

      if (staffMembersError) {
        console.error("Error removing staff members:", staffMembersError);
      } else {
        console.log("✅ Removed staff members");
      }

      // Remove business staff
      const { error: businessStaffError } = await supabase
        .from("business_staff")
        .delete()
        .eq("business_id", business.id);

      if (businessStaffError) {
        console.error("Error removing business staff:", businessStaffError);
      } else {
        console.log("✅ Removed business staff");
      }

      // Remove slideshows
      const { error: slideshowsError } = await supabase
        .from("slideshows")
        .delete()
        .eq("business_id", business.id);

      if (slideshowsError) {
        console.error("Error removing slideshows:", slideshowsError);
      } else {
        console.log("✅ Removed slideshows");
      }

      // Remove media files
      const { error: mediaFilesError } = await supabase
        .from("media_files")
        .delete()
        .eq("business_id", business.id);

      if (mediaFilesError) {
        console.error("Error removing media files:", mediaFilesError);
      } else {
        console.log("✅ Removed media files");
      }

      // Remove media collections
      const { error: mediaCollectionsError } = await supabase
        .from("media_collections")
        .delete()
        .eq("business_id", business.id);

      if (mediaCollectionsError) {
        console.error(
          "Error removing media collections:",
          mediaCollectionsError
        );
      } else {
        console.log("✅ Removed media collections");
      }

      // Remove facts
      const { error: factsError } = await supabase
        .from("facts")
        .delete()
        .eq("business_id", business.id);

      if (factsError) {
        console.error("Error removing facts:", factsError);
      } else {
        console.log("✅ Removed facts");
      }

      // Remove music playlists
      const { error: musicPlaylistsError } = await supabase
        .from("music_playlists")
        .delete()
        .eq("business_id", business.id);

      if (musicPlaylistsError) {
        console.error("Error removing music playlists:", musicPlaylistsError);
      } else {
        console.log("✅ Removed music playlists");
      }

      // Remove auto generation settings
      const { error: autoGenSettingsError } = await supabase
        .from("auto_generation_settings")
        .delete()
        .eq("user_id", user.id);

      if (autoGenSettingsError) {
        console.error(
          "Error removing auto generation settings:",
          autoGenSettingsError
        );
      } else {
        console.log("✅ Removed auto generation settings");
      }

      // Remove business subscriptions
      const { error: businessSubscriptionsError } = await supabase
        .from("business_subscriptions")
        .delete()
        .eq("business_id", business.id);

      if (businessSubscriptionsError) {
        console.error(
          "Error removing business subscriptions:",
          businessSubscriptionsError
        );
      } else {
        console.log("✅ Removed business subscriptions");
      }

      // Remove billing history
      const { error: billingHistoryError } = await supabase
        .from("billing_history")
        .delete()
        .eq("business_id", business.id);

      if (billingHistoryError) {
        console.error("Error removing billing history:", billingHistoryError);
      } else {
        console.log("✅ Removed billing history");
      }

      // Remove analytics events
      const { error: analyticsEventsError } = await supabase
        .from("analytics_events")
        .delete()
        .eq("business_id", business.id);

      if (analyticsEventsError) {
        console.error("Error removing analytics events:", analyticsEventsError);
      } else {
        console.log("✅ Removed analytics events");
      }

      // Remove display sessions
      const { error: displaySessionsError } = await supabase
        .from("display_sessions")
        .delete()
        .eq("business_id", business.id);

      if (displaySessionsError) {
        console.error("Error removing display sessions:", displaySessionsError);
      } else {
        console.log("✅ Removed display sessions");
      }

      // Remove content analytics
      const { error: contentAnalyticsError } = await supabase
        .from("content_analytics")
        .delete()
        .eq("business_id", business.id);

      if (contentAnalyticsError) {
        console.error(
          "Error removing content analytics:",
          contentAnalyticsError
        );
      } else {
        console.log("✅ Removed content analytics");
      }

      // Remove notifications
      const { error: notificationsError } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (notificationsError) {
        console.error("Error removing notifications:", notificationsError);
      } else {
        console.log("✅ Removed notifications");
      }

      // Remove user favorites
      const { error: userFavoritesError } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id);

      if (userFavoritesError) {
        console.error("Error removing user favorites:", userFavoritesError);
      } else {
        console.log("✅ Removed user favorites");
      }

      // Remove user roles
      const { error: userRolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id);

      if (userRolesError) {
        console.error("Error removing user roles:", userRolesError);
      } else {
        console.log("✅ Removed user roles");
      }

      // Remove subscriptions
      const { error: subscriptionsError } = await supabase
        .from("subscriptions")
        .delete()
        .eq("user_id", user.id);

      if (subscriptionsError) {
        console.error("Error removing subscriptions:", subscriptionsError);
      } else {
        console.log("✅ Removed subscriptions");
      }

      // Remove API keys
      const { error: apiKeysError } = await supabase
        .from("api_keys")
        .delete()
        .eq("user_id", user.id);

      if (apiKeysError) {
        console.error("Error removing API keys:", apiKeysError);
      } else {
        console.log("✅ Removed API keys");
      }

      // Remove email logs
      const { error: emailLogsError } = await supabase
        .from("email_logs")
        .delete()
        .eq("recipient_email", email);

      if (emailLogsError) {
        console.error("Error removing email logs:", emailLogsError);
      } else {
        console.log("✅ Removed email logs");
      }

      // 4. Remove the business
      const { error: businessDeleteError } = await supabase
        .from("businesses")
        .delete()
        .eq("id", business.id);

      if (businessDeleteError) {
        console.error("Error removing business:", businessDeleteError);
        return;
      } else {
        console.log("✅ Removed business");
      }
    }

    // 5. Remove profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) {
      console.error("Error removing profile:", profileError);
      return;
    } else {
      console.log("✅ Removed profile");
    }

    // 6. Finally remove the user
    const { error: userDeleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (userDeleteError) {
      console.error("Error removing user:", userDeleteError);
      return;
    } else {
      console.log("✅ Removed user");
    }

    console.log("🎉 User successfully removed from database!");
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 User ID: ${user.id}`);
    if (business) {
      console.log(`🏢 Business: ${business.name} (${business.id})`);
    }
  } catch (error) {
    console.error("❌ Error removing user:", error);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: node scripts/remove-user.js <email>");
  console.log("Example: node scripts/remove-user.js user@example.com");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error("❌ Invalid email format");
  process.exit(1);
}

// Confirm before proceeding
console.log(
  "⚠️  WARNING: This will permanently delete the user and all associated data!"
);
console.log(`📧 Email: ${email}`);
console.log("");

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Are you sure you want to continue? (yes/no): ", (answer) => {
  rl.close();

  if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
    console.log("🚀 Starting user removal process...");
    removeUser(email);
  } else {
    console.log("❌ Operation cancelled");
    process.exit(0);
  }
});

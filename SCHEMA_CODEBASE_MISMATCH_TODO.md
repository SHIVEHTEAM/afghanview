# Codebase & Schema Mismatch TODO

This file lists all mismatches and issues found between the codebase and `database/latest-schema.sql`. Use this as a reference for future refactoring and bug fixing.

---

## 1. Business Table (`businesses`)

- **Field mismatches:**
  - Code expects fields: `slug`, `business_type`, `created_by`, `is_verified` (not present in schema)
  - Code sometimes uses `type`, sometimes `business_type` (should be consistent)
- **Constraint mismatches:**
  - Code assumes one business per user, but schema allows many (no unique constraint on `user_id`)
- **Logic mismatches:**
  - Some code expects to join on `slug` (not present in schema)
  - Some code expects to filter by `is_verified` (not present in schema)

---

## 2. Staff Table (`business_staff`)

- **Field mismatches:**
  - Code expects to join on `business_type` and sometimes expects more fields than schema provides
  - Some legacy code references `restaurant_staff`/`restaurants` (legacy?)
- **Logic mismatches:**
  - Code expects to join `business_staff` to `businesses` and `users` tables
  - Some code expects to filter by `is_active` (present in schema)

---

## 3. Slideshows Table (`slideshows`)

- **Field mismatches:**
  - Code uses `name` for title, but schema uses `title`
  - Code expects `play_count`, `last_played`, `is_favorite`, `content`, `images` (not present in schema)
- **Type mismatches:**
  - Code sometimes expects `settings` as an object, schema uses `jsonb`
- **Relationship mismatches:**
  - Code expects to join on `slug` (not present in schema)
  - Some admin code expects `created_by`, `is_locked`, `is_template` (not present in schema)

---

## 4. General Issues

- **Deletion logic:**
  - Code deletes related records before deleting a business, but schema may not have `ON DELETE CASCADE` for all relationships
- **Legacy/duplicate logic:**
  - Some code references legacy tables (`restaurant_staff`, `restaurants`)
- **Multiple business logic:**
  - Some flows assume one business per user, others allow multiple

---

## TODO (for future fixing)

- [ ] Decide on single vs multiple business per user and update schema/code accordingly
- [ ] Add missing fields to schema or remove from code (e.g., `slug`, `business_type`, `created_by`, `is_verified`)
- [ ] Standardize on `type` vs `business_type` in both code and schema
- [ ] Add unique constraint on `user_id` in `businesses` if only one business per user is desired
- [ ] Add or remove fields in `slideshows` as needed (`name` vs `title`, `play_count`, etc.)
- [ ] Refactor legacy/duplicate logic (remove or migrate `restaurant_staff`, `restaurants`)
- [ ] Ensure all foreign key relationships have proper `ON DELETE CASCADE` or handle deletions in code
- [ ] Update all joins and queries to use only fields present in schema
- [ ] Audit all admin and onboarding flows for field and logic mismatches

---

_Update this file as you discover more mismatches or as you fix them in the codebase or schema._

---

## 5. Media Collections & Media Files

- **Field mismatches:**
  - Code expects to store and retrieve fields like `id`, `file_path`, `name`, `url`, `original_filename`, `file_size`, `mime_type`, `width`, `height`, `duration`, `media_type`, `is_public`, `uploaded_by`, `created_at`, `business_id`.
  - Code sometimes uses `restaurantId` for `business_id` (naming inconsistency).
  - Code expects to store additional metadata (e.g., `duration`, `video_metadata`, `publicUrl`) that may not always be present in schema or is handled differently.
- **Type mismatches:**
  - Code expects `media_type` as a string ("image" or "video"), schema uses `character varying` with a check constraint.
  - Code expects `metadata` as an object, schema uses `jsonb`.
- **Logic mismatches:**
  - Code sometimes skips database record creation for uploads (see `/api/media/upload.ts`), which can lead to orphaned files in storage.
  - Code expects to be able to delete media files both from storage and the database, but may not always handle foreign key constraints or cascading deletes.
  - Code expects to join media files to businesses via `business_id`, but sometimes uses `restaurantId` or other context-specific naming.
- **General issues:**
  - No clear handling of `ON DELETE CASCADE` for media files when a business is deleted.
  - Some upload flows do not store all metadata or do not enforce all required fields from the schema.

---

_Continue to update this file as more mismatches are found or fixed._

---

## 6. Profiles Table

- **Field mismatches:**
  - Code expects fields: `id`, `first_name`, `last_name`, `phone`, `roles`, `business` (jsonb), `created_at`, `updated_at`, sometimes `full_name`, `restaurant`, `email_verified`.
  - Code sometimes expects `roles` as an array of strings, schema uses `ARRAY DEFAULT '{}'::text[]`.
  - Code sometimes expects `business` as a nested object, schema uses `jsonb`.
  - Code sometimes expects `restaurant` as a nested object (legacy/compatibility), not present in schema.
- **Type mismatches:**
  - Code expects `roles` as array, schema uses Postgres array.
  - Code expects `business` as object, schema uses `jsonb`.
- **Logic mismatches:**
  - Code sometimes upserts or inserts profiles with only a subset of fields (e.g., missing `phone`, `business`, etc.).
  - Code sometimes expects to join or filter by `roles`, but schema does not enforce any role structure.
  - Code sometimes expects to use `profiles` for authentication/authorization, but schema does not enforce any constraints or relationships to `auth.users`.
- **General issues:**
  - No enforced foreign key between `profiles.id` and `auth.users.id` (unless added elsewhere).
  - Some legacy code expects `restaurant` field for backward compatibility.
  - Some code expects `full_name` or `email_verified`, which are not present in schema.

---

_Continue to update this file as more mismatches are found or fixed._

---

## 7. Users Table

- **Field mismatches:**
  - Code expects fields: `first_name`, `last_name`, `phone`, `avatar_url`, `email_verified`, `is_active`, `last_login_at`, `stripe_customer_id`, `roles`, `business_count`, `staff_roles`, `created_at`, `updated_at`.
  - Schema may not have all these fields (e.g., `roles`, `business_count`, `staff_roles` are computed in code, not schema fields).
- **Type mismatches:**
  - Code sometimes expects `roles` as array, but schema may not have a `roles` field in `users` (it's in `profiles`).
- **Logic mismatches:**
  - Code sometimes queries `users` directly, sometimes via `profiles`.
  - Some admin and API code expects to update or delete users and cascade to related tables, but schema may not have ON DELETE CASCADE.

## 8. Restaurants & Restaurant Staff (Legacy)

- **Field mismatches:**
  - Code and scripts still reference `restaurants`, `restaurant_staff`, and `restaurant_subscriptions` tables, but schema is now business-centric (`businesses`, `business_staff`, `business_subscriptions`).
  - Code expects fields like `slug`, `cuisine_type`, `address`, `contact_info`, `is_verified`, `created_by` in `restaurants`.
- **Type mismatches:**
  - Code expects `restaurant_id` in many places, but schema now uses `business_id`.
- **Logic mismatches:**
  - Some API endpoints, scripts, and components still use `restaurant` logic (e.g., `/api/restaurant/staff/`, `scripts/setup-staff-system.js`).
  - Some code tries to join or upsert into both restaurant and business tables, causing confusion and possible bugs.
  - Documentation and setup scripts reference legacy tables.

## 9. Business Type Configs

- **Field mismatches:**
  - Code defines business type configs in TypeScript (`types/business.ts`) with more fields and richer structure than the schema table.
  - Schema uses `business_type` as USER-DEFINED, code uses TypeScript enum.
- **Type mismatches:**
  - Code expects `allowed_slideshow_types`, `default_settings`, `features` as objects/arrays, schema uses `jsonb`.
- **Logic mismatches:**
  - Code uses hardcoded configs in TypeScript, not always reading from the database table.
  - No dynamic loading of configs from DB in most places; changes in DB may not reflect in app.

## 10. Slide Templates

- **Field mismatches:**
  - Code expects fields: `id`, `name`, `description`, `type`, `category`, `thumbnail_url`, `template_data`, `is_active`, `is_system`, `usage_count`, `created_at`, `updated_at`, `created_by_user`.
  - Schema has similar fields, but code sometimes expects `is_public`, `created_by_user` (joined from users), and richer `template_data`.
- **Type mismatches:**
  - Code expects `type` as string ("image", "menu", etc.), schema uses CHECK constraint.
  - Code expects `template_data` as object, schema uses `jsonb`.
- **Logic mismatches:**
  - Some code uses legacy/restaurant-specific template logic.
  - Not all template features in code are reflected in schema (e.g., `is_public`).

## 11. Subscriptions

- **Field mismatches:**
  - Code references both `subscriptions` and `business_subscriptions` tables; schema has both, but only `business_subscriptions` is used for businesses.
  - Code sometimes expects `restaurant_subscriptions` (legacy), but schema uses `business_subscriptions`.
- **Type mismatches:**
  - Code expects `plan` as joined object, schema uses `plan_id` foreign key.
- **Logic mismatches:**
  - Some code and scripts still use `restaurant_id` and `restaurant_subscriptions` (legacy), causing confusion.
  - Some admin and analytics code expects to join on both old and new tables.

## 12. Facts & AI Fact Generation

- **Field mismatches:**
  - Code expects fields: `id`, `text`, `category`, `prompt`, `backgroundColor`, `fontColor`, `fontSize`, `emoji`, `created_by`, `updated_by`, `timestamp`.
  - Schema has: `id`, `text`, `category`, `prompt`, `background_color`, `font_size`, `animation_type`, `is_active`, `created_at`, `updated_at`, `created_by`, `updated_by`.
- **Type mismatches:**
  - Code uses camelCase for some fields (`backgroundColor`), schema uses snake_case (`background_color`).
  - Code expects `emoji` and `fontColor`, schema does not have these fields.
- **Logic mismatches:**
  - Code generates facts via API and stores them in memory or as slides, but does not always persist to `facts` table.
  - Some code expects to link facts to slides, but schema uses `fact_slides` join table.

---

# General TODOs (add to as you find more):

- Remove all legacy `restaurant`, `restaurant_staff`, `restaurant_subscriptions` logic from codebase, scripts, and docs.
- Standardize all field names and types between code and schema (e.g., `business_type` vs `type`, `backgroundColor` vs `background_color`).
- Refactor code to always use business-centric tables and relationships.
- Ensure all computed fields in code are either added to schema or handled as virtual fields only.
- Add missing foreign key constraints and ON DELETE CASCADE where needed.
- Update all API endpoints, admin pages, and scripts to use new business logic.
- Add dynamic loading of business type configs from DB, not just TypeScript.
- Ensure all AI-generated facts are persisted to the `facts` table and linked to slides via `fact_slides`.
- Audit all uses of `subscriptions` vs `business_subscriptions` and remove legacy usage.

---

## 8. Analytics & Display Tables

### Analytics Events (`analytics_events`)

- **Field mismatches:**
  - Code expects fields: `business_id`, `session_id`, `event_type`, `event_data`, `occurred_at`, `user_agent`, `ip_address`.
  - Code sometimes expects `user_id` (not present in schema).
- **Logic mismatches:**
  - Code references `analytics_events` in admin pages but doesn't fully implement event tracking.
  - Some code expects to filter by `user_id` (not present in schema).
  - Code sometimes expects different event types than what schema supports.

### Display Sessions (`display_sessions`)

- **Field mismatches:**
  - Code expects fields: `id`, `business_id`, `device_id`, `device_info`, `location_info`, `started_at`, `ended_at`, `total_duration`, `slides_shown`, `interactions`.
- **Logic mismatches:**
  - Code doesn't seem to actively use `display_sessions` table for tracking display sessions.
  - No clear implementation of session tracking in the codebase.

### Slide Views (`slide_views`)

- **Field mismatches:**
  - Code expects fields: `session_id`, `slide_id`, `viewed_at`, `duration`, `interaction_type`.
- **Logic mismatches:**
  - Code doesn't actively track slide views using this table.
  - Some analytics code uses `play_count` from slideshows instead of proper view tracking.

### Content Analytics (`content_analytics`)

- **Field mismatches:**
  - Code expects fields: `slide_id`, `fact_id`, `view_count`, `play_count`, `engagement_score`, `last_viewed_at`, `created_at`.
- **Logic mismatches:**
  - Code doesn't actively use this table for analytics.
  - Analytics are mostly mocked or use simple counts from other tables.

---

## 9. Email & System Tables

### Email Templates (`email_templates`)

- **Field mismatches:**
  - Code expects fields: `id`, `name`, `subject`, `html_content`, `text_content`, `variables`, `is_active`, `created_at`, `updated_at`.
- **Logic mismatches:**
  - Code doesn't actively use email templates system.
  - No clear implementation of email templating in the codebase.

### Email Logs (`email_logs`)

- **Field mismatches:**
  - Code expects fields: `template_id`, `recipient_email`, `subject`, `content`, `status`, `sent_at`, `delivered_at`, `error_message`.
- **Logic mismatches:**
  - Code doesn't actively log emails using this table.
  - No clear implementation of email logging in the codebase.

### System Settings (`system_settings`)

- **Field mismatches:**
  - Code expects fields: `key`, `value`, `description`, `is_public`, `created_at`, `updated_at`.
- **Logic mismatches:**
  - Code doesn't actively use system settings table.
  - Settings are mostly hardcoded or stored in environment variables.

### API Keys (`api_keys`)

- **Field mismatches:**
  - Code expects fields: `user_id`, `name`, `key_hash`, `permissions`, `last_used_at`, `expires_at`, `is_active`, `created_at`.
- **Logic mismatches:**
  - Code doesn't actively use API keys system.
  - No clear implementation of API key management in the codebase.

---

## 10. Legacy & Unused Tables

### Organizations (`organizations`)

- **Field mismatches:**
  - Code expects fields: `name`, `slug`, `description`, `logo_url`, `website`, `contact_email`, `contact_phone`, `address`, `settings`, `is_active`, `created_at`, `updated_at`, `created_by`, `updated_by`.
- **Logic mismatches:**
  - Code doesn't actively use organizations table.
  - No clear implementation of organization management in the codebase.

### Roles (`roles`)

- **Field mismatches:**
  - Code expects fields: `name`, `description`, `permissions`, `is_system_role`, `created_at`.
- **Logic mismatches:**
  - Code doesn't actively use roles table.
  - Roles are mostly hardcoded in the application logic.

### Staff Members (`staff_members`)

- **Field mismatches:**
  - Code expects fields: `business_id`, `user_id`, `role`, `permissions`, `created_at`, `updated_at`.
- **Logic mismatches:**
  - Code uses `business_staff` instead of `staff_members`.
  - This table appears to be unused or replaced by `business_staff`.

### Subscriptions (`subscriptions`)

- **Field mismatches:**
  - Code expects fields: `user_id`, `business_id`, `stripe_subscription_id`, `stripe_customer_id`, `plan_type`, `status`, `current_period_start`, `current_period_end`, `created_at`, `updated_at`.
- **Logic mismatches:**
  - Code uses `business_subscriptions` instead of `subscriptions`.
  - This table appears to be unused or replaced by `business_subscriptions`.

---

## 11. General Codebase Issues

### Inconsistent Field Usage

- **Business Type:** Code sometimes uses `type`, sometimes `business_type` - should be consistent.
- **User ID References:** Code sometimes uses `user_id`, sometimes `created_by` - should be consistent.
- **Slideshow Title:** Code sometimes uses `name`, sometimes `title` - should be consistent.

### Missing Foreign Key Constraints

- Many relationships in code don't have corresponding foreign key constraints in schema.
- This can lead to orphaned records and data integrity issues.

### Legacy Code References

- Code still references old table names (`restaurants`, `restaurant_staff`, `restaurant_subscriptions`).
- Some API endpoints and functions still use old naming conventions.

### Incomplete Implementations

- Many features in the schema (analytics, email system, API keys, etc.) are not fully implemented in the codebase.
- Code often uses mock data or simple implementations instead of full database integration.

### Type Mismatches

- Code sometimes expects different data types than what the schema provides.
- Some fields are expected as objects but stored as JSONB in schema.

---

## 12. Priority Fixes Needed

### 🔴 CRITICAL - Data Integrity

1. **Add missing foreign key constraints** to prevent orphaned records.
2. **Standardize field names** across codebase (business_type vs type, name vs title, etc.).
3. **Fix unique constraints** where code assumes uniqueness (e.g., one business per user).

### 🟠 HIGH PRIORITY - Functionality

1. **Remove legacy table references** and update all code to use new table names.
2. **Implement proper analytics tracking** using the analytics tables in schema.
3. **Fix slideshow field mismatches** (name vs title, missing fields).
4. **Update all API endpoints** to use correct field names and table relationships.

### 🟡 MEDIUM PRIORITY - Cleanup

1. **Remove unused code** that references non-existent or unused tables.
2. **Implement missing features** that are defined in schema but not in code.
3. **Add proper error handling** for missing fields and relationships.
4. **Update documentation** to reflect actual schema and code relationships.

### 🟢 LOW PRIORITY - Optimization

1. **Add indexes** for frequently queried fields.
2. **Optimize queries** to use proper joins and relationships.
3. **Add validation** for data consistency between code and schema.
4. **Implement caching** for frequently accessed data.

---

## 13. Migration Strategy

### Phase 1: Critical Fixes

1. Update schema to match code expectations (add missing fields, constraints).
2. Fix all field name inconsistencies in code.
3. Add proper foreign key constraints.

### Phase 2: Functionality

1. Remove all legacy table references.
2. Implement proper analytics tracking.
3. Fix all API endpoint mismatches.

### Phase 3: Cleanup

1. Remove unused code and tables.
2. Implement missing features.
3. Add comprehensive testing.

### Phase 4: Optimization

1. Add performance optimizations.
2. Implement proper caching.
3. Add monitoring and alerting.

---

**Note:** This document should be updated as fixes are implemented and new issues are discovered.

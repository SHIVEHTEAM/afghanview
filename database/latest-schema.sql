-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.agencies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  website text,
  industry text,
  size text DEFAULT '1-10'::text CHECK (size = ANY (ARRAY['1-10'::text, '11-50'::text, '51-200'::text, '201-500'::text, '500+'::text])),
  timezone text DEFAULT 'UTC'::text,
  language text DEFAULT 'en'::text,
  settings jsonb DEFAULT '{}'::jsonb,
  subscription_plan text DEFAULT 'free'::text CHECK (subscription_plan = ANY (ARRAY['free'::text, 'starter'::text, 'professional'::text, 'enterprise'::text])),
  subscription_status text DEFAULT 'trial'::text CHECK (subscription_status = ANY (ARRAY['active'::text, 'trial'::text, 'expired'::text, 'cancelled'::text])),
  trial_ends_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT agencies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  business_id uuid,
  session_id uuid,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamp with time zone DEFAULT now(),
  user_agent text,
  ip_address inet,
  CONSTRAINT analytics_events_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.display_sessions(id)
);
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text NOT NULL,
  key_hash text NOT NULL,
  permissions jsonb DEFAULT '{}'::jsonb,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT api_keys_pkey PRIMARY KEY (id)
);
CREATE TABLE public.auto_generation_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  is_enabled boolean DEFAULT false,
  generation_interval_hours integer DEFAULT 24,
  categories ARRAY DEFAULT ARRAY['Afghan Culture'::text, 'Afghan Cuisine'::text, 'Afghan Hospitality'::text],
  max_facts_per_generation integer DEFAULT 3,
  auto_create_slides boolean DEFAULT true,
  background_music_url text,
  last_generation_at timestamp with time zone,
  next_generation_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT auto_generation_settings_pkey PRIMARY KEY (id),
  CONSTRAINT auto_generation_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.billing_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  business_id uuid,
  subscription_id uuid,
  amount integer NOT NULL,
  currency text DEFAULT 'USD'::text,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  payment_method text,
  invoice_url text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT billing_history_pkey PRIMARY KEY (id),
  CONSTRAINT billing_history_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.business_subscriptions(id)
);
CREATE TABLE public.business_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  color text,
  features jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT business_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.business_staff (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  business_type text NOT NULL CHECK (business_type = ANY (ARRAY['restaurant'::text, 'retail'::text, 'service'::text, 'entertainment'::text, 'healthcare'::text, 'education'::text, 'real_estate'::text, 'other'::text])),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'manager'::text, 'staff'::text])),
  permissions jsonb DEFAULT '{}'::jsonb,
  joined_at timestamp with time zone DEFAULT now(),
  invited_by uuid,
  is_active boolean DEFAULT true,
  CONSTRAINT business_staff_pkey PRIMARY KEY (id),
  CONSTRAINT business_staff_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT business_staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT business_staff_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id)
);
CREATE TABLE public.business_subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  business_id uuid,
  plan_id uuid,
  status text NOT NULL CHECK (status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'trial'::text])),
  current_period_start timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  cancelled_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  stripe_subscription_id text,
  stripe_customer_id text,
  CONSTRAINT business_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT business_subscriptions_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT business_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id)
);
CREATE TABLE public.business_type_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_type USER-DEFINED NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  allowed_slideshow_types jsonb DEFAULT '[]'::jsonb,
  default_settings jsonb DEFAULT '{}'::jsonb,
  features jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT business_type_configs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.businesses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'restaurant'::text,
  description text,
  address text,
  phone text,
  website text,
  logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  slug text UNIQUE,
  business_type text DEFAULT 'restaurant'::text,
  created_by uuid,
  is_verified boolean DEFAULT false,
  subscription_plan text DEFAULT 'starter'::text,
  ai_credits integer DEFAULT 10 CHECK (ai_credits >= 0),
  ai_credits_used integer DEFAULT 0 CHECK (ai_credits_used >= 0),
  max_slideshows integer DEFAULT 1 CHECK (max_slideshows >= 1),
  max_staff_members integer DEFAULT 1 CHECK (max_staff_members >= 1),
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT businesses_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.chat_message_reactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_message_reactions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chat_message_status (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['sent'::text, 'delivered'::text, 'read'::text])),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_message_status_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  content text NOT NULL,
  sender_id uuid NOT NULL,
  room_id uuid NOT NULL,
  message_type text DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'file'::text, 'image'::text, 'system'::text])),
  attachments jsonb,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  reply_to_message_id uuid,
  is_system boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  edit_history jsonb,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chat_room_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['admin'::text, 'member'::text])),
  joined_at timestamp with time zone DEFAULT now(),
  left_at timestamp with time zone,
  is_active boolean DEFAULT true,
  CONSTRAINT chat_room_members_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['direct'::text, 'group'::text, 'project'::text, 'client'::text])),
  participants ARRAY NOT NULL,
  project_id uuid,
  client_id uuid,
  settings jsonb,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  agency_id uuid,
  CONSTRAINT chat_rooms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  company text,
  website text,
  industry text,
  status text DEFAULT 'prospect'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'prospect'::text, 'archived'::text])),
  assigned_to uuid,
  billing_address jsonb,
  notes text,
  tags ARRAY,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  agency_id uuid,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.content_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slide_id uuid,
  fact_id uuid,
  view_count integer DEFAULT 0,
  play_count integer DEFAULT 0,
  engagement_score numeric DEFAULT 0.00,
  last_viewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT content_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT content_analytics_fact_id_fkey FOREIGN KEY (fact_id) REFERENCES public.facts(id)
);
CREATE TABLE public.display_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  business_id uuid,
  device_id text,
  device_info jsonb,
  location_info jsonb,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  total_duration integer,
  slides_shown integer DEFAULT 0,
  interactions integer DEFAULT 0,
  CONSTRAINT display_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.email_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  template_id uuid,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['sent'::text, 'delivered'::text, 'failed'::text, 'bounced'::text])),
  sent_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  error_message text,
  CONSTRAINT email_logs_pkey PRIMARY KEY (id),
  CONSTRAINT email_logs_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_templates(id)
);
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fact_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fact_id uuid,
  slide_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fact_slides_pkey PRIMARY KEY (id),
  CONSTRAINT fact_slides_fact_id_fkey FOREIGN KEY (fact_id) REFERENCES public.facts(id)
);
CREATE TABLE public.facts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  text text NOT NULL,
  category character varying NOT NULL,
  prompt text NOT NULL,
  background_color character varying DEFAULT '#1f2937'::character varying,
  font_size integer DEFAULT 28,
  animation_type character varying DEFAULT 'fade'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  business_id uuid,
  font_color character varying DEFAULT '#ffffff'::character varying,
  emoji text,
  is_auto_generated boolean DEFAULT false,
  generation_prompt text,
  CONSTRAINT facts_pkey PRIMARY KEY (id),
  CONSTRAINT facts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT facts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id),
  CONSTRAINT facts_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);
CREATE TABLE public.media_collection_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  collection_id uuid,
  media_file_id uuid,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT media_collection_items_pkey PRIMARY KEY (id),
  CONSTRAINT media_collection_items_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.media_collections(id),
  CONSTRAINT media_collection_items_media_file_id_fkey FOREIGN KEY (media_file_id) REFERENCES public.media_files(id)
);
CREATE TABLE public.media_collections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  business_id uuid,
  name text NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT media_collections_pkey PRIMARY KEY (id),
  CONSTRAINT media_collections_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT media_collections_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT media_collections_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.media_files (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  business_id uuid,
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  width integer,
  height integer,
  duration integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  uploaded_by uuid,
  media_type character varying DEFAULT 'image'::character varying CHECK (media_type::text = ANY (ARRAY['image'::character varying, 'video'::character varying]::text[])),
  duration_ms integer,
  video_metadata jsonb,
  url text,
  public_url text,
  restaurant_id uuid,
  thumbnail_url text,
  processing_status text DEFAULT 'completed'::text,
  processing_error text,
  CONSTRAINT media_files_pkey PRIMARY KEY (id),
  CONSTRAINT media_files_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT media_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);
CREATE TABLE public.music_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  icon character varying,
  color_gradient character varying,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT music_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.music_playlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  business_id uuid,
  created_by uuid,
  is_public boolean DEFAULT false,
  play_mode character varying DEFAULT 'sequential'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT music_playlists_pkey PRIMARY KEY (id),
  CONSTRAINT music_playlists_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT music_playlists_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.music_tracks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  artist character varying NOT NULL,
  description text,
  duration integer NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  file_type character varying,
  category character varying NOT NULL,
  tags ARRAY,
  source character varying DEFAULT 'user_upload'::character varying,
  uploaded_by uuid,
  is_public boolean DEFAULT true,
  is_approved boolean DEFAULT true,
  play_count integer DEFAULT 0,
  favorite_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT music_tracks_pkey PRIMARY KEY (id),
  CONSTRAINT music_tracks_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.organization_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id uuid,
  user_id uuid,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text, 'viewer'::text])),
  permissions jsonb DEFAULT '{}'::jsonb,
  joined_at timestamp with time zone DEFAULT now(),
  invited_by uuid,
  is_active boolean DEFAULT true,
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  website text,
  contact_email text,
  contact_phone text,
  address jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.playlist_tracks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  playlist_id uuid,
  track_id uuid,
  position integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT playlist_tracks_pkey PRIMARY KEY (id),
  CONSTRAINT playlist_tracks_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.music_playlists(id),
  CONSTRAINT playlist_tracks_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.music_tracks(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text,
  last_name text,
  phone text,
  roles ARRAY DEFAULT '{}'::text[],
  business jsonb,
  migrated_from_old_system boolean DEFAULT false,
  original_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ai_credits integer DEFAULT 10 CHECK (ai_credits >= 0),
  ai_credits_used integer DEFAULT 0 CHECK (ai_credits_used >= 0),
  subscription_plan text DEFAULT 'starter'::text,
  subscription_status text DEFAULT 'active'::text,
  subscription_expires_at timestamp with time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  client_id uuid NOT NULL,
  status text DEFAULT 'planning'::text CHECK (status = ANY (ARRAY['planning'::text, 'in_progress'::text, 'review'::text, 'completed'::text, 'on_hold'::text, 'cancelled'::text])),
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])),
  start_date date,
  end_date date,
  budget numeric,
  actual_cost numeric,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tags ARRAY,
  settings jsonb,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  agency_id uuid,
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb DEFAULT '{}'::jsonb,
  is_system_role boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.slide_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type = ANY (ARRAY['image'::text, 'menu'::text, 'promo'::text, 'quote'::text, 'hours'::text, 'custom'::text])),
  category text,
  thumbnail_url text,
  template_data jsonb NOT NULL,
  is_active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT slide_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.slide_versions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slide_id uuid,
  version_number integer NOT NULL,
  content jsonb NOT NULL,
  styling jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT slide_versions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.slide_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  slide_id uuid,
  viewed_at timestamp with time zone DEFAULT now(),
  duration integer,
  interaction_type text CHECK (interaction_type = ANY (ARRAY['view'::text, 'click'::text, 'swipe'::text])),
  CONSTRAINT slide_views_pkey PRIMARY KEY (id),
  CONSTRAINT slide_views_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.display_sessions(id)
);
CREATE TABLE public.slides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slideshow_id uuid,
  title text,
  content text,
  media_url text,
  media_type text,
  order_index integer DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT slides_pkey PRIMARY KEY (id),
  CONSTRAINT slides_slideshow_id_fkey FOREIGN KEY (slideshow_id) REFERENCES public.slideshows(id)
);
CREATE TABLE public.slideshow_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slideshow_id uuid,
  slide_id uuid,
  order_index integer DEFAULT 0,
  CONSTRAINT slideshow_slides_pkey PRIMARY KEY (id),
  CONSTRAINT slideshow_slides_slideshow_id_fkey FOREIGN KEY (slideshow_id) REFERENCES public.slideshows(id),
  CONSTRAINT slideshow_slides_slide_id_fkey FOREIGN KEY (slide_id) REFERENCES public.slides(id)
);
CREATE TABLE public.slideshows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid,
  title text NOT NULL,
  description text,
  settings jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text,
  play_count integer DEFAULT 0,
  last_played timestamp with time zone,
  is_favorite boolean DEFAULT false,
  content jsonb DEFAULT '{}'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  slug text,
  created_by uuid,
  is_locked boolean DEFAULT false,
  is_template boolean DEFAULT false,
  background_music text,
  music_volume integer DEFAULT 50 CHECK (music_volume >= 0 AND music_volume <= 100),
  music_loop boolean DEFAULT true,
  auto_play boolean DEFAULT true,
  show_controls boolean DEFAULT true,
  show_progress boolean DEFAULT true,
  loop_slideshow boolean DEFAULT true,
  shuffle_slides boolean DEFAULT false,
  aspect_ratio text DEFAULT '16:9'::text CHECK (aspect_ratio = ANY (ARRAY['16:9'::text, '4:3'::text, '1:1'::text, 'auto'::text])),
  quality text DEFAULT 'medium'::text CHECK (quality = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  transition_duration integer DEFAULT 800,
  auto_random_fact boolean DEFAULT false,
  random_fact_interval integer DEFAULT 6,
  music_playlist_id uuid,
  music_play_mode character varying DEFAULT 'sequential'::character varying,
  CONSTRAINT slideshows_pkey PRIMARY KEY (id),
  CONSTRAINT slideshows_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT slideshows_music_playlist_id_fkey FOREIGN KEY (music_playlist_id) REFERENCES public.music_playlists(id)
);
CREATE TABLE public.staff_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'manager'::text, 'staff'::text])),
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text, 'declined'::text])),
  invited_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  accepted_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT staff_invitations_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT staff_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id),
  CONSTRAINT staff_invitations_accepted_by_fkey FOREIGN KEY (accepted_by) REFERENCES auth.users(id)
);
CREATE TABLE public.staff_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid,
  user_id uuid,
  role text NOT NULL DEFAULT 'staff'::text,
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_members_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  features jsonb NOT NULL,
  pricing jsonb NOT NULL,
  limits jsonb NOT NULL,
  is_active boolean DEFAULT true,
  is_popular boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  business_id uuid,
  stripe_subscription_id text,
  stripe_customer_id text,
  plan_type text NOT NULL DEFAULT 'starter'::text,
  status text NOT NULL DEFAULT 'active'::text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  track_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_favorites_pkey PRIMARY KEY (id),
  CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_favorites_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.music_tracks(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  role_id uuid,
  assigned_by uuid,
  assigned_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
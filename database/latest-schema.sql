-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  restaurant_id uuid,
  session_id uuid,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamp with time zone DEFAULT now(),
  user_agent text,
  ip_address inet,
  CONSTRAINT analytics_events_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_events_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
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
  CONSTRAINT api_keys_pkey PRIMARY KEY (id),
  CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.billing_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  restaurant_id uuid,
  subscription_id uuid,
  amount integer NOT NULL,
  currency text DEFAULT 'USD'::text,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  payment_method text,
  invoice_url text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT billing_history_pkey PRIMARY KEY (id),
  CONSTRAINT billing_history_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT billing_history_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.restaurant_subscriptions(id)
);
CREATE TABLE public.display_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  restaurant_id uuid,
  device_id text,
  device_info jsonb,
  location_info jsonb,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  total_duration integer,
  slides_shown integer DEFAULT 0,
  interactions integer DEFAULT 0,
  CONSTRAINT display_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT display_sessions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id)
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
  restaurant_id uuid,
  name text NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT media_collections_pkey PRIMARY KEY (id),
  CONSTRAINT media_collections_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT media_collections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT media_collections_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE TABLE public.media_files (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  restaurant_id uuid,
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
  CONSTRAINT media_files_pkey PRIMARY KEY (id),
  CONSTRAINT media_files_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT media_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
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
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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
  CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT organization_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id)
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
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT organizations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE TABLE public.restaurant_staff (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  restaurant_id uuid,
  user_id uuid,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'manager'::text, 'staff'::text])),
  permissions jsonb DEFAULT '{}'::jsonb,
  joined_at timestamp with time zone DEFAULT now(),
  invited_by uuid,
  is_active boolean DEFAULT true,
  CONSTRAINT restaurant_staff_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_staff_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT restaurant_staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT restaurant_staff_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id)
);
CREATE TABLE public.restaurant_subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  restaurant_id uuid,
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
  CONSTRAINT restaurant_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT restaurant_subscriptions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT restaurant_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id)
);
CREATE TABLE public.restaurants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  organization_id uuid,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cuisine_type text,
  address jsonb NOT NULL,
  contact_info jsonb NOT NULL,
  business_hours jsonb,
  social_media jsonb,
  branding jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  verified_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT restaurants_pkey PRIMARY KEY (id),
  CONSTRAINT restaurants_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT restaurants_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id),
  CONSTRAINT restaurants_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT restaurants_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
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
  CONSTRAINT slide_templates_pkey PRIMARY KEY (id),
  CONSTRAINT slide_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT slide_templates_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE TABLE public.slide_versions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slide_id uuid,
  version_number integer NOT NULL,
  content jsonb NOT NULL,
  styling jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT slide_versions_pkey PRIMARY KEY (id),
  CONSTRAINT slide_versions_slide_id_fkey FOREIGN KEY (slide_id) REFERENCES public.slides(id),
  CONSTRAINT slide_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.slide_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid,
  slide_id uuid,
  viewed_at timestamp with time zone DEFAULT now(),
  duration integer,
  interaction_type text CHECK (interaction_type = ANY (ARRAY['view'::text, 'click'::text, 'swipe'::text])),
  CONSTRAINT slide_views_pkey PRIMARY KEY (id),
  CONSTRAINT slide_views_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.display_sessions(id),
  CONSTRAINT slide_views_slide_id_fkey FOREIGN KEY (slide_id) REFERENCES public.slides(id)
);
CREATE TABLE public.slides (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  restaurant_id uuid,
  template_id uuid,
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['image'::text, 'menu'::text, 'promo'::text, 'quote'::text, 'hours'::text, 'custom'::text])),
  title text NOT NULL,
  subtitle text,
  content jsonb NOT NULL,
  styling jsonb DEFAULT '{}'::jsonb,
  duration integer DEFAULT 6000,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  published_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  is_locked boolean DEFAULT false,
  CONSTRAINT slides_pkey PRIMARY KEY (id),
  CONSTRAINT slides_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id),
  CONSTRAINT slides_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.slide_templates(id),
  CONSTRAINT slides_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.users(id),
  CONSTRAINT slides_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT slides_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
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
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  role_id uuid,
  assigned_by uuid,
  assigned_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  avatar_url text,
  email_verified boolean DEFAULT false,
  email_verified_at timestamp with time zone,
  last_login_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT users_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
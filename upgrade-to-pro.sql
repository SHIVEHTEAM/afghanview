-- Upgrade Ahmad Seyar Hasir to Pro Plan
-- Run this in your Supabase SQL editor

-- First, let's find the user and business
SELECT 
  u.id as user_id,
  u.email,
  b.id as business_id,
  b.name as business_name,
  b.subscription_plan as current_plan
FROM auth.users u
LEFT JOIN public.businesses b ON b.user_id = u.id OR b.created_by = u.id
WHERE u.email = 'ahmadseyarhasir@gmail.com';

-- Update the business to Pro plan
UPDATE public.businesses 
SET 
  subscription_plan = 'pro',
  ai_credits = 50,
  max_slideshows = 999999, -- Unlimited
  max_staff_members = 10,
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'ahmadseyarhasir@gmail.com'
) OR created_by = (
  SELECT id FROM auth.users WHERE email = 'ahmadseyarhasir@gmail.com'
);

-- Also update the profile
UPDATE public.profiles 
SET 
  subscription_plan = 'pro',
  ai_credits = 50,
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'ahmadseyarhasir@gmail.com'
);

-- Verify the changes
SELECT 
  u.email,
  b.name as business_name,
  b.subscription_plan,
  b.ai_credits,
  b.max_slideshows,
  b.max_staff_members,
  p.subscription_plan as profile_plan,
  p.ai_credits as profile_credits
FROM auth.users u
LEFT JOIN public.businesses b ON b.user_id = u.id OR b.created_by = u.id
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'ahmadseyarhasir@gmail.com'; 
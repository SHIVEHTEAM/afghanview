-- SQL Script to Upgrade User Subscription to Professional (PostgreSQL)
-- Replace 'user_email@example.com' with the actual user's email address

-- Option 1: Update user profile subscription (most common)
UPDATE profiles 
SET 
    subscription_plan = 'professional',
    subscription_status = 'active',
    subscription_expires_at = CASE 
        WHEN subscription_expires_at IS NULL THEN NOW() + INTERVAL '1 year'
        ELSE subscription_expires_at + INTERVAL '1 year'
    END,
    ai_credits = 500, -- Professional plan gets 500 AI credits
    updated_at = NOW()
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'a.seyarhasir@gmail.com'
);

-- Option 2: Update business subscription if user owns a business
UPDATE businesses 
SET 
    subscription_plan = 'professional',
    ai_credits = 500,
    max_slideshows = 20, -- Professional plan allows 20 slideshows
    max_staff_members = 5, -- Professional plan allows 5 staff members
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'a.seyarhasir@gmail.com'
);

-- Option 3: Update business_subscriptions table (if using Stripe)
UPDATE business_subscriptions 
SET 
    status = 'active',
    updated_at = NOW(),
    current_period_end = CASE 
        WHEN current_period_end IS NULL THEN NOW() + INTERVAL '1 year'
        ELSE current_period_end + INTERVAL '1 year'
    END
WHERE business_id = (
    SELECT id FROM businesses WHERE user_id = (
        SELECT id FROM auth.users WHERE email = 'a.seyarhasir@gmail.com'
    )
);

-- Option 4: Update legacy subscriptions table
UPDATE subscriptions 
SET 
    plan_type = 'professional',
    status = 'active',
    current_period_end = CASE 
        WHEN current_period_end IS NULL THEN NOW() + INTERVAL '1 year'
        ELSE current_period_end + INTERVAL '1 year'
    END,
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'a.seyarhasir@gmail.com'
);

-- Verify all updates
SELECT 
    u.email,
    p.subscription_plan as user_plan,
    p.subscription_status as user_status,
    p.subscription_expires_at as user_expires,
    p.ai_credits as user_ai_credits,
    b.subscription_plan as business_plan,
    b.ai_credits as business_ai_credits,
    b.max_slideshows,
    b.max_staff_members,
    bs.status as business_subscription_status,
    bs.current_period_end as business_subscription_expires,
    s.plan_type as legacy_plan_type,
    s.status as legacy_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN businesses b ON u.id = b.user_id
LEFT JOIN business_subscriptions bs ON b.id = bs.business_id
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email = 'a.seyarhasir@gmail.com'; 
-- Make shivehteam@gmail.com an admin
-- Run this in your Supabase SQL Editor

-- First, get the user ID
DO $$
DECLARE
    target_user_id uuid;
    admin_role_id uuid;
    restaurant_owner_role_id uuid;
BEGIN
    -- Get the user ID for shivehteam@gmail.com
    SELECT id INTO target_user_id FROM users WHERE email = 'shivehteam@gmail.com';
    
    -- Get the admin role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    
    -- Get the restaurant_owner role ID
    SELECT id INTO restaurant_owner_role_id FROM roles WHERE name = 'restaurant_owner';
    
    -- Check if user exists
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email shivehteam@gmail.com not found';
    END IF;
    
    -- Check if admin role exists
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Admin role not found';
    END IF;
    
    -- Remove existing restaurant_owner role (optional)
    DELETE FROM user_roles WHERE user_id = target_user_id AND role_id = restaurant_owner_role_id;
    
    -- Assign admin role
    INSERT INTO user_roles (user_id, role_id, is_active)
    VALUES (target_user_id, admin_role_id, true)
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;
    
    RAISE NOTICE 'User % is now an admin', target_user_id;
END $$;

-- Verify the change
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    array_agg(r.name) as roles
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'shivehteam@gmail.com'
GROUP BY u.id, u.email, u.first_name, u.last_name; 
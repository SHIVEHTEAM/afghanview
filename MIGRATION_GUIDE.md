# User Migration to Supabase Auth Guide

This guide will help you migrate your existing users from the custom authentication system to Supabase Auth, and set up email verification.

## 🚀 Quick Start

### 1. Set Up Supabase Auth

1. **Enable Email Auth in Supabase Dashboard:**

   - Go to Authentication > Settings
   - Enable "Email auth"
   - Enable "Confirm email" (recommended for security)
   - Configure your email templates if needed

2. **Create the Profiles Table:**
   ```bash
   # Run this SQL in your Supabase SQL editor
   # Copy the contents of database/create-profiles-table.sql
   ```

### 2. Run the Migration

1. **Install dependencies:**

   ```bash
   npm install dotenv
   ```

2. **Run the migration script:**

   ```bash
   node scripts/run-user-migration.js
   ```

3. **Check the migration results:**
   - The script will show how many users were migrated
   - It will display temporary passwords for each user
   - Users will need to reset their passwords

### 3. Test the New Auth Flow

1. **Test with a migrated user:**

   - Go to `/auth/forgot-password`
   - Enter the user's email
   - Check email for reset link
   - Set a new password
   - Sign in with new credentials

2. **Test new user signup:**
   - Go to `/auth/signup`
   - Create a new account
   - Verify email (if enabled)
   - Sign in

## 📋 Migration Details

### What the Migration Does

1. **Reads existing users** from your `users` table
2. **Creates Supabase Auth users** with temporary passwords
3. **Syncs profile data** to the new `profiles` table
4. **Preserves user roles** and restaurant associations
5. **Updates restaurant ownership** to use new user IDs

### Migration Safety

- ✅ **Non-destructive:** Original user data is preserved
- ✅ **Idempotent:** Can be run multiple times safely
- ✅ **Error handling:** Failed migrations are logged
- ✅ **Rollback ready:** Original data remains intact

### Post-Migration Steps

1. **Notify users** about the migration
2. **Ask users to reset passwords** using "Forgot Password"
3. **Monitor for issues** in the first few days
4. **Clean up old data** after confirming everything works

## 🔧 Configuration

### Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Email Templates (Optional)

Customize email templates in Supabase Dashboard:

- **Confirmation email:** For new user signups
- **Reset password email:** For password resets
- **Magic link email:** For passwordless auth (if enabled)

## 🛠️ Troubleshooting

### Common Issues

1. **"Service role key not found"**

   - Check your `.env.local` file
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

2. **"User already exists in Supabase Auth"**

   - This is normal for users already migrated
   - The script will skip these users

3. **"RLS policy violation"**

   - Ensure you're using the service role key for migration
   - Check that profiles table RLS policies are correct

4. **"Email not sending"**
   - Check Supabase email settings
   - Verify email templates are configured
   - Check spam folders

### Rollback Plan

If you need to rollback:

1. **Keep original user data** (it's not deleted)
2. **Switch back to old auth** by reverting code changes
3. **Update API routes** to use old authentication
4. **Test thoroughly** before going live

## 📧 Email Verification Setup

### Automatic Setup

The migration automatically:

- ✅ Creates users with confirmed emails (for existing users)
- ✅ Sets up email verification for new signups
- ✅ Handles verification flow in the UI

### Manual Configuration

If you need to customize:

1. **Supabase Dashboard > Authentication > Settings:**

   - Enable "Confirm email"
   - Set confirmation redirect URL
   - Configure email templates

2. **Email Templates:**
   - Customize subject lines
   - Add your branding
   - Test email delivery

## 🔒 Security Considerations

### Password Security

- Users get temporary passwords during migration
- They must reset passwords via email
- No plain text passwords are stored

### Session Management

- Old sessions are invalidated
- Users must sign in again
- JWT tokens are used for authentication

### Data Privacy

- User data is preserved during migration
- Profile data is linked to Supabase Auth users
- RLS policies protect user data

## 📊 Monitoring

### Migration Metrics

- Number of users migrated
- Number of failed migrations
- Temporary passwords generated
- Profile data synced

### Post-Migration Monitoring

- User login success rates
- Email verification rates
- Password reset usage
- Error rates

## 🎯 Next Steps

After successful migration:

1. **Test thoroughly** with different user types
2. **Monitor user feedback** and issues
3. **Clean up old authentication code** (optional)
4. **Consider additional features:**
   - Social login (Google, Facebook)
   - Two-factor authentication
   - Session management
   - User profile management

## 📞 Support

If you encounter issues:

1. **Check the logs** from the migration script
2. **Verify Supabase configuration**
3. **Test with a single user first**
4. **Review the troubleshooting section above**

---

**Need help?** Check the Supabase documentation or create an issue in your project repository.

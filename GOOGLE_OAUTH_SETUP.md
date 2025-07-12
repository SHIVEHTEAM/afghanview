# Google OAuth Setup Guide

This guide will help you set up Google OAuth for your ShivehView application.

## Prerequisites

- A Google Cloud Console account
- A Supabase project
- Your application deployed or running locally

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity API

### 1.2 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add the following authorized redirect URIs:
   - `https://your-domain.com/auth/callback` (production)
   - `http://localhost:3000/auth/callback` (development)
5. Copy the Client ID and Client Secret

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and click "Enable"
4. Enter your Google Client ID and Client Secret
5. Save the configuration

### 2.2 Configure Site URL and Redirect URLs

1. Go to "Authentication" > "Settings"
2. Set your Site URL:
   - Production: `https://your-domain.com`
   - Development: `http://localhost:3000`
3. Add redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback`

## Step 3: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

## Step 4: Database Setup

Make sure your database has the necessary tables for user profiles. The system will automatically create a profile when a user signs in with Google for the first time.

## Step 5: Testing

### 5.1 Local Testing

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/auth/signin`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected to `/auth/callback` and then to the appropriate page

### 5.2 Production Testing

1. Deploy your application
2. Update your Google OAuth redirect URIs to include your production domain
3. Update your Supabase site URL and redirect URLs
4. Test the OAuth flow on your production site

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**

   - Make sure the redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"Provider not enabled" error**

   - Ensure Google provider is enabled in Supabase
   - Verify Client ID and Secret are correct

3. **"Site URL not allowed" error**

   - Update your Supabase site URL settings
   - Add your domain to the allowed redirect URLs

4. **Callback page not found**
   - Ensure `/auth/callback` route exists
   - Check that the callback page is properly configured

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded correctly
3. Test Supabase connection independently
4. Check Google Cloud Console for any API errors

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Client Secrets**: Keep your Google Client Secret secure
3. **HTTPS**: Always use HTTPS in production
4. **Redirect URIs**: Only add trusted domains to redirect URIs
5. **Session Management**: Implement proper session handling

## Additional Configuration

### Custom Scopes

If you need additional user information, you can modify the OAuth scopes in the sign-in function:

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: "email profile openid",
  },
});
```

### User Profile Creation

The system automatically creates a user profile when someone signs in with Google for the first time. You can customize this behavior in the callback page.

## Support

If you encounter issues:

1. Check the Supabase documentation
2. Review Google OAuth documentation
3. Check the browser console for detailed error messages
4. Verify all configuration steps have been completed

# Hostinger Email Setup Guide

## Step 1: Get SMTP Settings from Hostinger

1. **Login to Hostinger Control Panel**

   - Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
   - Login with your Hostinger account

2. **Access Email Settings**

   - Go to "Email" section
   - Find your domain `shivehagency.com`
   - Click on "Manage" next to your email account

3. **Get SMTP Settings**
   - Look for "Email Client Configuration" or "SMTP Settings"
   - Note down these settings:
     - **SMTP Server**: `smtp.hostinger.com`
     - **SMTP Port**: `587` (or `465` for SSL)
     - **Username**: `noreply@shivehagency.com`
     - **Password**: Your email password
     - **Security**: TLS/SSL

## Step 2: Environment Variables

Add these to your `.env.local` file:

```bash
# Hostinger Email Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@shivehagency.com
SMTP_PASS=your_email_password_here
FROM_EMAIL=noreply@shivehagency.com

# Site URL
NEXT_PUBLIC_SITE_URL=https://shivehview.com
```

## Step 3: Test Email Configuration

Run this command to test your email setup:

```bash
bun run test-email
```

## Step 4: Alternative Ports

If port 587 doesn't work, try these alternatives:

### Option 1: Port 465 (SSL)

```bash
SMTP_PORT=465
SMTP_SECURE=true
```

### Option 2: Port 587 (TLS)

```bash
SMTP_PORT=587
SMTP_SECURE=false
```

## Step 5: Troubleshooting

### Common Issues:

1. **Authentication Failed**

   - Check username/password
   - Ensure email account is active
   - Try generating app password

2. **Connection Timeout**

   - Check firewall settings
   - Try different ports
   - Verify SMTP server address

3. **SSL/TLS Issues**
   - Try different security settings
   - Check if port 465 works better

## Step 6: Security Best Practices

1. **Use App Password** (if available)

   - Generate app-specific password
   - Don't use main account password

2. **Environment Variables**

   - Never commit passwords to git
   - Use `.env.local` for local development
   - Use environment variables in production

3. **Rate Limiting**
   - Hostinger has sending limits
   - Monitor email delivery rates
   - Implement retry logic

## Step 7: Production Deployment

For production deployment:

1. **Vercel Environment Variables**

   - Add all SMTP variables to Vercel dashboard
   - Set `NEXT_PUBLIC_SITE_URL` to your production domain

2. **Email Limits**
   - Check Hostinger email sending limits
   - Monitor delivery rates
   - Set up email monitoring

## Step 8: Email Templates

Our system includes professional templates:

- **HTML Version**: Beautiful, responsive design
- **Text Version**: Plain text fallback
- **Branding**: ShivehView and Afghan culture themed

## Step 9: Testing

### Test Email Sending:

1. Go to `/client/staff`
2. Send invitation to your email
3. Check if email is received
4. Verify invitation link works

### Test API Endpoint:

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test Email</h1>",
    "text": "Test Email"
  }'
```

## Step 10: Monitoring

### Check Email Queue Status:

```bash
curl http://localhost:3000/api/email/status
```

### Monitor Logs:

- Check console for email delivery logs
- Monitor for failed deliveries
- Track email queue status

---

This setup will use your Hostinger email account to send all staff invitations and other emails from your ShivehView application.

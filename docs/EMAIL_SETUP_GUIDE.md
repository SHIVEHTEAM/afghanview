# Email Setup Guide - Free & Custom Solutions

This guide covers all the email options for ShivehView, from free services to building your own email system.

## 🆓 Free Email Services

### 1. **Resend** (Recommended)

**Free tier**: 3,000 emails/month

```bash
# Install
bun add resend

# Environment variables
RESEND_API_KEY=your_api_key_here
```

**Setup**:

1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to `.env.local`
4. Update `lib/email.ts` to use Resend

### 2. **SendGrid**

**Free tier**: 100 emails/day

```bash
# Install
bun add @sendgrid/mail

# Environment variables
SENDGRID_API_KEY=your_api_key_here
```

### 3. **Brevo (Sendinblue)**

**Free tier**: 300 emails/day

```bash
# Install
bun add @getbrevo/brevo

# Environment variables
BREVO_API_KEY=your_api_key_here
```

## 🏗️ Custom Email Solutions

### Option 1: Gmail SMTP (Free)

**Setup**:

1. Enable 2-factor authentication on Gmail
2. Generate App Password
3. Add to environment variables

```bash
# Environment variables
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
FROM_EMAIL=noreply@shivehview.com
```

### Option 2: Custom SMTP Server

```bash
# Environment variables
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_username
SMTP_PASS=your_password
FROM_EMAIL=noreply@shivehview.com
```

### Option 3: Webhook-Based Email Service

```bash
# Environment variables
EMAIL_WEBHOOK_URL=https://your-email-service.com/webhook
FROM_EMAIL=noreply@shivehview.com
```

## 🚀 Our Custom Email System

We've built a complete email system that can work with any provider:

### Features:

- ✅ **Email queuing** with retry logic
- ✅ **Multiple provider support** (SMTP, webhooks, console)
- ✅ **Professional templates** ready to use
- ✅ **API endpoints** for sending and status
- ✅ **Error handling** and logging

### How to Use:

1. **Choose your email method** by setting environment variables
2. **Emails are automatically queued** when invitations are sent
3. **Check status** via `/api/email/status`
4. **Monitor logs** for delivery status

### Environment Variables:

```bash
# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Email Configuration (choose one method)
# Method 1: Gmail SMTP
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Method 2: Custom SMTP
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_username
SMTP_PASS=your_password

# Method 3: Webhook
EMAIL_WEBHOOK_URL=https://your-email-service.com/webhook

# From email address
FROM_EMAIL=noreply@shivehview.com
```

## 📧 Email Templates

Our system includes professional email templates:

- **HTML version**: Beautiful, responsive design
- **Text version**: Plain text fallback
- **Customizable**: Easy to modify branding and content

### Template Features:

- ✅ Afghan culture-inspired design
- ✅ Mobile-responsive layout
- ✅ Clear call-to-action buttons
- ✅ Professional branding
- ✅ Accessibility compliant

## 🔧 Testing Email Setup

### 1. Test Configuration

```bash
# Test SMTP connection
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>",
    "text": "Test"
  }'
```

### 2. Check Queue Status

```bash
# Get queue status
curl http://localhost:3000/api/email/status
```

### 3. Test Staff Invitation

1. Go to `/client/staff`
2. Send invitation to your email
3. Check console logs for email details
4. Verify invitation link works

## 🛠️ Building Your Own Email Service

### Option 1: Simple SMTP Server

```typescript
// Using our built-in SMTP server
import { sendEmailWithSMTP } from "./lib/smtp-server";

await sendEmailWithSMTP(
  "user@example.com",
  "Subject",
  "<h1>HTML Content</h1>",
  "Text Content"
);
```

### Option 2: Email Queue System

```typescript
// Using our queue system
import { emailService } from "./lib/simple-email-api";

const emailId = await emailService.queueEmail(
  "user@example.com",
  "Subject",
  "<h1>HTML Content</h1>",
  "Text Content"
);
```

### Option 3: Webhook Integration

```typescript
// Send to external email service via webhook
const response = await fetch("https://your-email-service.com/webhook", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: "user@example.com",
    subject: "Subject",
    html: "<h1>Content</h1>",
    text: "Content",
  }),
});
```

## 📊 Email Analytics & Monitoring

### Built-in Monitoring:

- ✅ Email queue status
- ✅ Delivery success/failure rates
- ✅ Retry attempts tracking
- ✅ Console logging for debugging

### Production Monitoring:

- Set up email delivery tracking
- Monitor bounce rates
- Track open/click rates
- Set up alerts for failures

## 🔒 Security Considerations

### Email Security:

- ✅ SPF/DKIM records for domain
- ✅ Rate limiting on email endpoints
- ✅ Email validation and sanitization
- ✅ Secure SMTP connections (TLS)

### Privacy:

- ✅ GDPR-compliant email templates
- ✅ Unsubscribe links
- ✅ Data retention policies
- ✅ User consent tracking

## 💰 Cost Comparison

| Service         | Free Tier   | Paid Plans | Setup Difficulty |
| --------------- | ----------- | ---------- | ---------------- |
| **Resend**      | 3K/month    | $20/100K   | Easy             |
| **SendGrid**    | 100/day     | $15/100K   | Medium           |
| **Brevo**       | 300/day     | $25/100K   | Easy             |
| **Gmail SMTP**  | Unlimited\* | Free       | Easy             |
| **Custom SMTP** | Depends     | Depends    | Hard             |

\*Gmail has daily sending limits but no monthly cost

## 🎯 Recommendation

### For Development/Testing:

Use **Gmail SMTP** - it's free and easy to set up.

### For Production:

Use **Resend** - best free tier, excellent deliverability, easy setup.

### For Custom Solution:

Use our **built-in email system** - flexible, scalable, no external dependencies.

## 🚀 Quick Start

1. **Choose your email method** from the options above
2. **Set environment variables** in `.env.local`
3. **Test the setup** with a staff invitation
4. **Monitor logs** to ensure emails are being sent
5. **Deploy to production** with your chosen method

---

This system gives you complete control over email delivery while providing professional templates and reliable delivery mechanisms.

# ShivehView Business Management System - Setup Guide

## 🚀 Complete System Overview

This comprehensive business management system includes:

- **Multi-category business support** (Restaurants, Stores, Salons, Clinics, Gyms, Hotels, Schools, Offices)
- **Stripe payment integration** with free trials
- **Role-based access control** and staff management
- **AI-powered content generation** with credit system
- **Premium features** gated by subscription tiers
- **Secure payment processing** with PCI compliance

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Stripe account
- Domain with SSL certificate (for production)

## 🔧 Environment Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Product/Price IDs
STRIPE_STARTER_PRICE_ID=price_your_starter_price_id_here
STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id_here
STRIPE_UNLIMITED_PRICE_ID=price_your_unlimited_price_id_here

# Security Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=your_database_url_here

# AI Configuration (if using AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (if using email features)
SMTP_HOST=your_smtp_host_here
SMTP_PORT=587
SMTP_USER=your_smtp_user_here
SMTP_PASS=your_smtp_password_here

# File Storage Configuration
STORAGE_BUCKET=your_storage_bucket_here
STORAGE_REGION=your_storage_region_here

# Analytics Configuration
ANALYTICS_ID=your_analytics_id_here
```

## 🗄️ Database Setup

### 1. Supabase Project Setup

1. Create a new Supabase project
2. Run the database migrations from `database/latest-schema.sql`
3. Set up Row Level Security (RLS) policies
4. Configure authentication settings

### 2. Required Database Tables

The system uses these main tables:

- `users` - User accounts and profiles
- `restaurants` - Business information (supports all categories)
- `restaurant_staff` - Staff management and roles
- `restaurant_subscriptions` - Subscription management
- `subscription_plans` - Available plans and pricing
- `billing_history` - Payment history
- `slides` - Content management
- `business_categories` - Business type definitions

## 💳 Stripe Configuration

### 1. Stripe Account Setup

1. Create a Stripe account
2. Get your API keys from the Stripe Dashboard
3. Create products and prices for each subscription tier

### 2. Create Subscription Products

Create these products in your Stripe Dashboard:

**Starter Plan ($9/month)**

- Product: "ShivehView Starter"
- Price: $9/month
- Features: Basic slides, email support, 1 location

**Professional Plan ($29/month)**

- Product: "ShivehView Professional"
- Price: $29/month
- Features: Unlimited slides, AI features, staff management

**Unlimited Plan ($99/month)**

- Product: "ShivehView Unlimited"
- Price: $99/month
- Features: Everything + multiple locations, API access

### 3. Webhook Configuration

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 🔐 Security Configuration

### 1. SSL Certificate

For production, ensure you have a valid SSL certificate. Stripe requires HTTPS for all webhook endpoints.

### 2. Environment Variables Security

- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly
- Use strong, unique secrets

### 3. Database Security

- Enable RLS (Row Level Security) on all tables
- Use service role key only for server-side operations
- Implement proper authentication checks

## 🚀 Installation & Deployment

### 1. Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Run database migrations
npm run run-migrations

# Start development server
npm run dev
```

### 2. Production Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### 3. Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📊 Business Categories & Features

### Supported Business Types

1. **Restaurants** 🍽️

   - Menu management
   - Daily specials
   - Reservation system
   - Order tracking

2. **Stores** 🛍️

   - Product catalog
   - Inventory display
   - Price updates
   - Promotional banners

3. **Salons** 💇‍♀️

   - Service menu
   - Appointment booking
   - Stylist profiles
   - Before/after gallery

4. **Clinics** 🏥

   - Service list
   - Doctor profiles
   - Appointment scheduling
   - Health tips

5. **Gyms** 💪

   - Class schedule
   - Trainer profiles
   - Membership info
   - Workout tips

6. **Hotels** 🏨

   - Room types
   - Amenities
   - Local attractions
   - Room booking

7. **Schools** 🎓

   - Course catalog
   - Faculty profiles
   - Events calendar
   - Student achievements

8. **Offices** 🏢
   - Services overview
   - Team profiles
   - Contact info
   - Company news

## 💰 Subscription Plans

### Starter Plan ($9/month)

- 5 slides per month
- Basic templates
- Email support
- Mobile display
- 14-day free trial

### Professional Plan ($29/month)

- Unlimited slides
- AI-powered content (100 credits)
- Advanced templates
- Priority support
- Analytics dashboard
- Staff management
- Custom branding

### Unlimited Plan ($99/month)

- Everything in Professional
- Multiple locations
- White-label solution
- API access
- Dedicated support
- Custom integrations
- Advanced analytics
- 1000 AI credits

## 🔄 User Flow

### 1. Signup Process

1. User visits signup page
2. Enters basic information
3. Selects business category
4. Account created with free trial

### 2. Onboarding Flow

1. Business information collection
2. Location and hours setup
3. Branding customization
4. Package selection
5. Payment setup with Stripe

### 3. Dashboard Access

1. Role-based dashboard based on business category
2. Category-specific features and templates
3. Premium features based on subscription tier

## 🛡️ Security Best Practices

### Payment Security

- All payment data processed by Stripe
- No credit card data stored locally
- PCI DSS Level 1 compliance through Stripe
- Secure webhook verification

### Data Protection

- Row Level Security (RLS) on all tables
- Encrypted data transmission
- Regular security audits
- GDPR compliance measures

### Access Control

- Role-based permissions
- Session management
- Rate limiting
- Input validation

## 📈 Analytics & Monitoring

### Key Metrics to Track

- User signups and conversions
- Subscription upgrades/downgrades
- Feature usage by business category
- Payment success/failure rates
- Customer support tickets

### Monitoring Tools

- Stripe Dashboard for payment analytics
- Supabase Analytics for database performance
- Application monitoring (Vercel Analytics)
- Error tracking and logging

## 🆘 Support & Troubleshooting

### Common Issues

1. **Webhook Failures**

   - Check webhook endpoint URL
   - Verify webhook secret
   - Check server logs for errors

2. **Payment Processing Issues**

   - Verify Stripe API keys
   - Check subscription plan configuration
   - Ensure SSL certificate is valid

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure proper table structure

### Getting Help

- Check the application logs
- Review Stripe Dashboard for payment issues
- Contact support with specific error messages
- Use browser developer tools for frontend issues

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks

- Update dependencies monthly
- Review and rotate API keys quarterly
- Monitor Stripe webhook health
- Backup database regularly
- Review security logs

### Feature Updates

- Monitor user feedback
- Track feature usage analytics
- Plan quarterly feature releases
- Maintain backward compatibility

## 📝 Legal Compliance

### Payment Processing

- PCI DSS compliance through Stripe
- Secure handling of payment information
- Proper refund and cancellation policies

### Data Protection

- GDPR compliance for EU users
- Data retention policies
- User consent management
- Right to data deletion

### Terms of Service

- Clear subscription terms
- Cancellation policies
- Refund procedures
- Service level agreements

---

## 🎉 Getting Started

1. **Set up your environment** following the configuration guide
2. **Configure Stripe** with your products and webhooks
3. **Deploy the application** to your preferred platform
4. **Test the complete flow** from signup to payment
5. **Monitor and optimize** based on user feedback

The system is now ready to handle multiple business types with secure payment processing and comprehensive feature management!

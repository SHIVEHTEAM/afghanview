# 📺 TV Management System Documentation

## Overview

The Shivehview TV Management System provides a seamless way to connect and manage display devices for businesses. It eliminates the need for manual URL copying and provides a professional, automated setup experience.

## 🏗️ System Architecture

### Core Components

1. **TV Display Page** (`/tv-display/[businessId]`)

   - Automatic business connection
   - Device type detection
   - Connection code generation
   - Slideshow selection interface

2. **TV Management Dashboard** (`/client/tv`)

   - Device management interface
   - Connection code tracking
   - Quick setup guide
   - Real-time status monitoring

3. **API Endpoints**
   - `/api/business/[id]` - Business information
   - `/api/slideshows` - Slideshow data
   - `/tv/[id]` - Slideshow display

### Data Flow

```
Business Dashboard → TV Display URL → TV Device → Connection Code → Linked Device
```

## 🚀 Current Features

### ✅ Implemented Features

1. **Automatic TV Connection**

   - TVs automatically connect to business when visiting display URL
   - No manual URL copying required
   - Unique connection codes for device identification

2. **Device Management**

   - Add/remove TV devices with names and locations
   - Track device types (TV, Monitor, Tablet, Phone)
   - Monitor connection status and last seen times

3. **User-Friendly Setup**

   - Step-by-step setup guide
   - Visual instructions with numbered steps
   - Copy-to-clipboard functionality for URLs and codes

4. **Professional Interface**

   - Beautiful gradients and animations
   - Responsive design for all devices
   - Status indicators and connection feedback

5. **Slideshow Integration**
   - Direct access to business slideshows
   - One-click slideshow start
   - Automatic slideshow selection

## 📋 Setup Instructions

### For Business Owners

1. **Access TV Management**

   - Go to `/client/tv` in your dashboard
   - View current TV devices and connection status

2. **Add TV Device**

   - Click "Add TV" button
   - Enter device name, type, and location
   - Device gets unique connection code

3. **Share Display URL**
   - Copy the TV Display URL shown on the page
   - Share with TV devices or display locations

### For TV Setup

1. **Open TV Display**

   - On TV, open web browser
   - Navigate to the TV Display URL
   - Page automatically connects to business

2. **Enter Connection Code** (Future Enhancement)

   - Enter the connection code shown on dashboard
   - TV becomes linked to business account

3. **Start Slideshow**
   - Select desired slideshow from dropdown
   - Click "Start Slideshow" to begin display

## 🔧 Technical Implementation

### File Structure

```
pages/
├── tv-display/
│   └── [businessId].tsx          # TV display interface
├── client/
│   └── tv.tsx                    # TV management dashboard
└── api/
    └── business/
        └── [id].ts               # Business API endpoint

components/
└── client/
    └── dashboard/
        └── tabs/
            └── SlideshowsTab.tsx # Slideshow management (existing)
```

### Key Technologies

- **Next.js** - React framework for pages and API routes
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Styling and responsive design
- **Framer Motion** - Animations and transitions
- **Supabase** - Database and authentication
- **localStorage** - Temporary device storage (will be replaced with database)

### Data Models

```typescript
interface TVDevice {
  id: string;
  name: string;
  type: "tv" | "monitor" | "tablet" | "phone";
  location: string;
  connectionCode: string;
  status: "online" | "offline" | "playing" | "paused";
  currentSlideshow?: string;
  lastSeen: Date;
  business_id: string;
}

interface Business {
  id: string;
  name: string;
  title: string;
  type: string;
  user_id: string;
}
```

## 🚀 Future Enhancements

### Phase 1: Real-time Communication

1. **WebSocket Integration**

   ```typescript
   // Real-time TV control
   interface TVControlMessage {
     type: "play" | "pause" | "next" | "previous" | "volume";
     deviceId: string;
     slideshowId?: string;
     value?: number;
   }
   ```

2. **Live Status Updates**

   - Real-time connection status
   - Live slideshow progress
   - Device health monitoring

3. **Remote Control Features**
   - Play/pause slideshows remotely
   - Volume control
   - Slideshow switching
   - Emergency stop functionality

### Phase 2: Database Integration

1. **TV Devices Table**

   ```sql
   CREATE TABLE tv_devices (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     business_id UUID REFERENCES businesses(id),
     name VARCHAR(255) NOT NULL,
     type VARCHAR(50) NOT NULL,
     location VARCHAR(255),
     connection_code VARCHAR(10) UNIQUE NOT NULL,
     status VARCHAR(50) DEFAULT 'offline',
     current_slideshow_id UUID REFERENCES slideshows(id),
     last_seen TIMESTAMP DEFAULT NOW(),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Connection Logs Table**
   ```sql
   CREATE TABLE tv_connection_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     device_id UUID REFERENCES tv_devices(id),
     event_type VARCHAR(50) NOT NULL,
     event_data JSONB,
     timestamp TIMESTAMP DEFAULT NOW()
   );
   ```

### Phase 3: Advanced Features

1. **Auto-Discovery**

   - Network device discovery
   - Automatic TV detection
   - Zero-configuration setup

2. **Analytics Dashboard**

   - TV usage statistics
   - Slideshow performance metrics
   - Device health reports
   - Connection reliability data

3. **Multi-Business Support**

   - Chain/branch management
   - Centralized TV control
   - Cross-location content sharing

4. **Content Scheduling**
   - Time-based slideshow scheduling
   - Day-of-week programming
   - Holiday-specific content
   - Emergency message broadcasting

### Phase 4: Enterprise Features

1. **User Management**

   - Role-based access control
   - TV device permissions
   - Audit logging

2. **Content Management**

   - Centralized content library
   - Version control for slideshows
   - Content approval workflows

3. **Integration APIs**
   - RESTful API for third-party integration
   - Webhook support for external systems
   - Mobile app for remote management

## 🔒 Security Considerations

### Current Security

1. **Business Isolation**

   - TV devices are isolated by business ID
   - No cross-business access

2. **Connection Codes**
   - Unique 6-character codes
   - Temporary and replaceable

### Future Security Enhancements

1. **Authentication**

   - TV device authentication
   - Secure connection establishment
   - Token-based access control

2. **Network Security**

   - HTTPS enforcement
   - API rate limiting
   - Input validation and sanitization

3. **Data Protection**
   - Encrypted device communication
   - Secure storage of device credentials
   - GDPR compliance for user data

## 🧪 Testing Strategy

### Unit Tests

```typescript
// TV device management tests
describe("TV Device Management", () => {
  test("should create new TV device with connection code", () => {
    // Test implementation
  });

  test("should validate device type", () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// End-to-end TV setup tests
describe("TV Setup Flow", () => {
  test("should connect TV to business dashboard", () => {
    // Test implementation
  });

  test("should start slideshow on connected TV", () => {
    // Test implementation
  });
});
```

### Performance Tests

- TV connection latency
- Slideshow loading times
- Concurrent device handling
- Memory usage optimization

## 📊 Monitoring and Analytics

### Key Metrics

1. **Connection Metrics**

   - Number of connected devices
   - Connection success rate
   - Average connection time

2. **Usage Metrics**

   - Slideshow play time
   - Device uptime
   - Content engagement

3. **Performance Metrics**
   - Page load times
   - API response times
   - Error rates

### Monitoring Tools

- Application performance monitoring (APM)
- Real-time error tracking
- User behavior analytics
- System health dashboards

## 🚀 Deployment Considerations

### Production Setup

1. **Environment Variables**

   ```env
   NEXT_PUBLIC_APP_URL=https://shivehview.com
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

2. **CDN Configuration**

   - Static asset optimization
   - Image and video caching
   - Global content delivery

3. **Database Optimization**
   - Connection pooling
   - Query optimization
   - Indexing strategy

### Scaling Strategy

1. **Horizontal Scaling**

   - Load balancer configuration
   - Multiple server instances
   - Database read replicas

2. **Caching Strategy**
   - Redis for session storage
   - CDN for static content
   - Database query caching

## 📝 API Documentation

### Business API

```http
GET /api/business/{id}
Authorization: Bearer {token}
Content-Type: application/json

Response:
{
  "id": "uuid",
  "name": "Business Name",
  "title": "Business Title",
  "type": "restaurant",
  "user_id": "uuid"
}
```

### TV Device API (Future)

```http
POST /api/tv-devices
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "business_id": "uuid",
  "name": "Main Dining TV",
  "type": "tv",
  "location": "Main Dining Area"
}

Response:
{
  "id": "uuid",
  "connection_code": "ABC123",
  "status": "offline"
}
```

## 🤝 Contributing

### Development Setup

1. **Clone Repository**

   ```bash
   git clone https://github.com/your-org/shivehview.git
   cd shivehview
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   # Configure environment variables
   ```

4. **Start Development Server**
   ```bash
   pnpm run dev
   ```

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for version control

### Testing

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run e2e tests
pnpm test:e2e
```

## 📞 Support

### Documentation

- [API Reference](./API_REFERENCE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [FAQ](./FAQ.md)

### Contact

- Technical Support: tech@shivehview.com
- Feature Requests: features@shivehview.com
- Bug Reports: bugs@shivehview.com

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready

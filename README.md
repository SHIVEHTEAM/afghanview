# 🇦🇫 AfghanView – Visual Display for Afghan Restaurants

**AfghanView** is a cloud-based visual display platform designed for Afghan restaurants across the US. It turns any Smart TV into an auto-playing cultural slideshow that showcases Afghanistan's natural beauty, history, poetry, cuisine, and more.

Restaurants can also customize their feed with their **own promotional content** (menus, deals, events) using a dedicated dashboard.

---

## 🎯 Purpose

AfghanView enhances the customer experience by:

- Displaying high-quality photos of Afghanistan
- Sharing cultural facts, poetry, and food insights
- Allowing restaurants to insert their own branded content
- Helping diaspora businesses stay connected with Afghan heritage

---

## 🖼️ Live Demo

Try our public loop:

```
http://localhost:3000
```

---

## 💡 Features

| Feature                    | Description                                                                   |
| -------------------------- | ----------------------------------------------------------------------------- |
| Auto-play Slideshow        | Fullscreen image/video slider optimized for TVs                               |
| Cultural Feed              | Includes curated Afghan landscapes, historical places, quotes, and food facts |
| Custom Restaurant Content  | Each restaurant can upload slides (logo, promotions, menus, etc.)             |
| Admin Dashboard            | Login-based portal for each restaurant to manage their display                |
| Cloud Synced               | All content served from CDN or edge cache for fast TV loading                 |
| QR Code on Screen          | Optional QR for menu, social media, or contact info                           |
| Multilingual Support       | Farsi, English, Pashto (planned)                                              |
| Responsive for All Devices | Display mode works on Smart TVs, tablets, laptops                             |
| Low Bandwidth Mode         | For restaurants with limited internet speeds (planned)                        |

---

## 📦 Tech Stack

| Layer              | Technology                  | Purpose                                          |
| ------------------ | --------------------------- | ------------------------------------------------ |
| **Frontend**       | Next.js (App Router)        | Website & display loop UI                        |
| **Styling**        | TailwindCSS + Framer Motion | Responsive and animated UI                       |
| **Database**       | Supabase Postgres           | User data, restaurant profiles, slide references |
| **Storage**        | Supabase Storage            | Store images and custom content                  |
| **Auth**           | Supabase Auth               | Login system for restaurant admins               |
| **CMS (internal)** | Admin Panel (custom built)  | Upload and manage curated cultural slides        |
| **Hosting**        | Vercel                      | Deployment of frontend and backend API           |
| **CDN**            | Supabase + Vercel Edge      | Fast asset delivery to Smart TVs                 |

---

## 🧑‍🍳 For Restaurants

Each restaurant gets:

- A private URL: `afghanview.com/display/{restaurant-id}`
- A dashboard to upload their content
- Default AfghanView cultural feed
- Optional scheduling (e.g. menu slide every 3rd image)

### Example Display Flow:

1. Afghan Mountains (default)
2. Herat Facts (default)
3. Restaurant Menu (custom)
4. Rumi Quote (default)
5. Chef Image or Offer (custom)

---

## 🛠️ System Architecture

```plaintext
[ Restaurant Dashboard (Next.js) ] ----> [ Supabase Auth + DB + Storage ]
                |
                v
      [ Admin Uploads Images / Text ]
                |
                v
  [ Supabase CDN + Edge Functions (Caching) ]
                |
                v
   [ Restaurant TV opens afghanview.com/display/{id} ]
                |
                v
    [ Slideshow with auto-sync content ]
```

---

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/SHIVEHTEAM/afghanview.git
cd afghanview
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 🔐 Admin Roles

| Role             | Permissions                            |
| ---------------- | -------------------------------------- |
| Super Admin      | Manage curated cultural content        |
| Restaurant Admin | Upload and manage personal slides      |
| Viewer (TV)      | No login; just loads slideshow via URL |

## 🔑 Authentication System

The platform now includes a comprehensive authentication system:

### User Types

- **Admin Users**: Full system access, manage all restaurants and content (created through backend)
- **Restaurant Owners**: Manage their own restaurant content and slides (sign up through website)

### Features

- **Secure Sign-in/Sign-up**: Email-based authentication with password hashing
- **Role-based Access Control**: Automatic redirects based on user type
- **Protected Routes**: Secure access to admin and client dashboards
- **Session Management**: Cookie-based sessions with automatic expiration

### Sign-up Process

- **Restaurant Owners**: Can sign up directly through the website
- **Admin Users**: Created through backend database management only
- **Default Role**: All sign-ups are restaurant owners by default

### Demo Accounts

For testing purposes:

- **Admin**: `admin@afghanview.com` / `admin123`
- **Restaurant**: `owner@afghanpalace.com` / `owner123`

### Environment Setup

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## 💰 Monetization Plan

| Tier         | Price       | Features                                       |
| ------------ | ----------- | ---------------------------------------------- |
| Free Trial   | $0 (7 days) | Access to demo loop only                       |
| Basic Plan   | $9.99/mo    | Default cultural content + 2 custom slides     |
| Premium Plan | $19.99/mo   | Unlimited slides, scheduling, optional QR code |
| Enterprise   | Custom      | For franchises with 5+ TVs                     |

---

## 🧩 Future Plans

- Offline playback support (using PWA and local caching)
- Android TV / Fire Stick app (Phase 2)
- Background music (Afghan instrumental)
- Scheduled slides (menu during lunch hours only)
- Sponsorship/ads from Afghan brands or tourist services
- Auto-translate cultural facts (Farsi ↔ English)
- Real-time update without refresh

---

## 👥 Target Users

- Afghan Restaurants in the US, UK, Canada
- Afghan Grocery Stores
- Cultural Centers or Events
- Airport lounges with Afghan representation

---

## 🧪 Content Guidelines

- **Image resolution:** 1920x1080 preferred
- **Accepted formats:** JPEG, PNG (MP4 coming soon)
- **Content limit (free):** Max 10 slides, 2 custom
- **Review policy:** Admin-approved for default feed

---

## ✍️ License

MIT — © 2025 AfghanView

---

## 🙌 Contributors

- **Ahmad Seyar Hasir** – Founder & Product Manager
- **Coming Soon:** Designers, Content Curators, Developers

---

## 📩 Contact

For partnerships, custom requests, or demo access:

📧 **[contact@afghanview.com](mailto:contact@afghanview.com)**
🌐 [www.afghanview.com](https://afghanview.com)
📱 Instagram: [@afghanview.tv](https://instagram.com/afghanview.tv)

---

**Built with ❤️ for Afghan restaurants worldwide**

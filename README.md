<p align="center">
  <img src="https://img.shields.io/badge/DineOS-v1.0.0-FF9500?style=for-the-badge&labelColor=1a1a2e" alt="Version" />
</p>

<h1 align="center">🍽️ DineOS</h1>
<h3 align="center">The Operating System Your Restaurant Didn't Know It Needed.</h3>

<p align="center">
  <em>A Multi-Tenant, AI-Powered Restaurant SaaS Platform — From QR Scan to Kitchen Screen in Under 2 Seconds.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white" alt="Redux" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Firebase-DD2C00?style=flat-square&logo=firebase&logoColor=white" alt="Firebase" />
  <img src="https://img.shields.io/badge/Groq_AI-F55036?style=flat-square&logo=lightning&logoColor=white" alt="Groq" />
</p>

---

## 📖 Table of Contents

- [The Vision](#-the-vision)
- [System Architecture](#-system-architecture)
- [Core Modules Deep-Dive](#-core-modules-deep-dive)
- [AI Engine — The Brain](#-ai-engine--the-brain)
- [Real-time Engine — The Nervous System](#-real-time-engine--the-nervous-system)
- [Security & Multi-Tenancy](#-security--multi-tenancy)
- [Tech Stack Breakdown](#-tech-stack-breakdown)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 The Vision

DineOS isn't just _another_ restaurant ordering tool. It's a complete **Restaurant Operating System** designed from the ground up as a **multi-tenant SaaS platform**.

**The Problem:** A customer sits down, scans a QR code, and expects magic. The kitchen needs to know instantly. The waiter needs a heads-up. The owner needs analytics by closing time. And all of this needs to work for _thousands_ of restaurants simultaneously, each with their own branding, menu, staff, and data — completely isolated from each other.

**The DineOS Solution:**

```
Customer scans QR → Lands on branded digital menu → AI helps choose dishes
→ Places order → Socket.io pushes to Chef KDS in real-time
→ Chef marks "Ready" → Waiter gets notified instantly
→ Owner sees revenue update live on the analytics dashboard.
```

All of it. In real-time. Per-tenant. AI-enhanced. Production-grade.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React 19 + Vite + TS)             │
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │  Customer UI  │ │  Admin Panel │ │  Chef/Waiter │ │  Super Admin  │  │
│  │ (Mobile-First)│ │(Desktop-First)│ │     KDS      │ │   Console     │  │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───────┬───────┘  │
│         │                │                │                  │          │
│         └────────────────┼────────────────┼──────────────────┘          │
│                          │           Socket.io Client                   │
│                    Redux Toolkit (auth, cart, restaurant, orders)       │
│                    Axios Interceptors (JWT auto-refresh)                │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTPS + WSS
┌──────────────────────────┼──────────────────────────────────────────────┐
│                     SERVER LAYER (Node.js + Express 5)                  │
│                          │                                              │
│  ┌───────────────────────┴─────────────────────────────────────────┐    │
│  │                    Middleware Pipeline                           │    │
│  │  Helmet → CORS → Morgan → platformConfig → Auth → tenantContext │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                          │                                              │
│  ┌──────────┐ ┌──────────┴──────────┐ ┌────────────┐ ┌──────────────┐  │
│  │  12 Route │ │  20 Controllers     │ │  AI Service│ │Socket Service│  │
│  │  Modules  │ │  (Business Logic)   │ │  (7 Funcs) │ │ (5 Emitters) │  │
│  └──────────┘ └─────────────────────┘ └────────────┘ └──────────────┘  │
│                          │                                              │
│  ┌───────────────────────┴─────────────────────────────────────────┐    │
│  │                    Data Layer (Mongoose 9)                      │    │
│  │  Restaurant │ User │ Menu │ Order │ Table │ Coupon │ Session    │    │
│  │  Category │ AIConversation │ Notification │ GlobalConfig        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   MongoDB Atlas    Firebase Admin     Groq Cloud
   (Data Store)     (Phone OTP)       (LLM Inference)
```

---

## 🎯 Core Modules Deep-Dive

### 👤 For the **Restaurant Owner** — Admin Dashboard

The command center for running a restaurant digitally.

| Feature | Description |
| :--- | :--- |
| **Menu Studio** | Full CRUD for categories & items. AI-generated descriptions, tag management, and real-time availability toggles. |
| **Live Orders Board** | Kanban-style view tracking every order from `New → Preparing → Ready → Completed`. |
| **Staff Management** | Onboard chefs & waiters, assign tables, manage duty status and staff roles. |
| **QR Generator** | Bulk-generate downloadable QR codes (PDF) for every table — one scan links directly to the branded digital menu. |
| **Analytics & AI Insights** | Revenue charts, top-selling items, order trends via Recharts — plus AI-generated business analysis from Groq. |
| **Marketing Hub** | Create and manage coupons (% or fixed), set loyalty reward perks, AI-generated promotional copy. |
| **Restaurant Settings** | Brand customization (name, slug, logo, theme color, currency), autoPilot toggle, table count management. |

---

### 👨‍🍳 For the **Kitchen** — Chef KDS (Kitchen Display System)

A dedicated real-time dashboard for chefs, built for speed and clarity.

- Orders appear instantly via **Socket.io** the moment a customer places them.
- Kanban pipeline: `New → Preparing → Ready` with one-tap status updates.
- Dedicated `kitchen_<restaurantId>` socket room ensures chefs only see their restaurant's orders.
- On-duty toggle for shift management.

---

### 🍽️ For the **Waiter** — Service Dashboard

- Real-time alerts when orders are marked `Ready` by the chef.
- Table assignment management with color-coded identification.
- One-tap order completion to close the loop.
- Personal `user_<userId>` socket channel for targeted notifications.

---

### 📱 For the **Customer** — Smart Digital Menu

The entire dining experience, from scan to satisfaction.

| Journey Step | What Happens |
| :--- | :--- |
| **1. QR Scan** | Customer scans the table QR → hits `/r/:restaurantSlug/table/:tableNo` → a guest JWT session (4hr TTL) is auto-generated. |
| **2. Branded Menu** | Loads the restaurant's menu with their custom theme, logo, and categories. Mobile-first, designed for speed. |
| **3. AI Concierge** | Floating chat button powered by Groq (LLaMA3-70B). Ask it anything: "What's vegan?", "Suggest something spicy", "What goes with naan?". |
| **4. Smart Cart** | Add items, get AI pairing suggestions (`CartSuggestions` component), apply coupon codes, redeem loyalty points. |
| **5. Order & Track** | Place the order → real-time status updates via Socket.io on their `table_<restaurantId>_<tableNo>` channel. |
| **6. Profile & Loyalty** | Optionally login via Firebase Phone OTP to earn loyalty points, view order history, and unlock personalized rewards. |

---

### 🛡️ For the **SaaS Provider** — Super Admin Console

The God-mode panel for the platform operator.

| Feature | Description |
| :--- | :--- |
| **Global Dashboard** | Platform-wide stats: total restaurants, active tenants, subscriber count. |
| **Restaurant Directory** | View all onboarded restaurants, toggle their `active/inactive` status. |
| **Subscriber Management** | Track subscription tiers, trial activations, and premium conversions. |
| **Platform Settings** | Toggle maintenance mode, manage global announcements (AI-generated broadcasts), enable/disable AI chat or loyalty system globally, set max table limits. |
| **Profile & Security** | Change password, manage super admin profile. |

---

## 🧠 AI Engine — The Brain

DineOS integrates **7 specialized AI functions** via the Groq SDK (LLaMA 3.3 70B Versatile), each fine-tuned with role-specific system prompts:

| AI Function | Purpose | Used By |
| :--- | :--- | :--- |
| `getAiConciergeResponse` | Contextual dining assistant. Aware of cart, loyalty points, active coupons, and the full menu. Addresses customers by name. | Customer |
| `getCartSuggestions` | Chef-style food pairing engine. Returns JSON with item IDs and pairing reasons. | Customer |
| `generateItemDescription` | Creates appetizing, sensory menu descriptions under 150 chars. | Admin |
| `analyzeBusinessInsights` | Full business intelligence report with trend analysis, demand prediction, and marketing strategy. | Admin |
| `generateCouponDescription` | Punchy, high-energy marketing copy for promotional offers. | Admin |
| `generatePerkDescription` | Luxury copywriting for loyalty reward perks. | Admin |
| `generateBroadcastMessage` | Professional platform announcements for the Super Admin notification system. | Super Admin |

### Concierge Context Awareness

The AI Concierge doesn't just know the menu — it knows the _customer's current session_:

```
Guest Session Context (REAL-TIME):
├── Guest Name: "Raj" (or "Guest" if anonymous)
├── Cart: Butter Chicken (x1), Garlic Naan (x2). Total: ₹580
├── Loyalty: 340 points available
└── Offers: FEAST20 (20% OFF), WELCOME50 (₹50 OFF)
```

This allows it to make contextual suggestions like: _"Namaste Raj! Since you have Butter Chicken in your tray, I'd recommend our Roomali Roti — it's the perfect companion. And with your FEAST20 code, you'll save 20% on the entire order!"_

---

## ⚡ Real-time Engine — The Nervous System

DineOS uses a **room-based Socket.io architecture** with 4 distinct channel types for surgical event targeting:

```
Socket Rooms Architecture:
│
├── Restaurant Room: "<restaurantId>"
│   └── All admins of that restaurant receive events here
│
├── Kitchen Room: "kitchen_<restaurantId>"
│   └── Only chefs of that restaurant
│
├── User Room: "user_<userId>"
│   └── Specific staff member (waiter/chef)
│
└── Table Room: "table_<restaurantId>_<tableNo>"
    └── Customer sitting at that specific table
```

**Key Events Emitted:**

| Event | Channel | Trigger |
| :--- | :--- | :--- |
| `new-order` | Restaurant + Kitchen | Customer places an order |
| `order-status-update` | Table + Restaurant | Chef/Waiter updates status |
| `table-status-change` | Restaurant | Table occupancy changes |

The frontend `SocketService` class handles auto-reconnection (up to 10 attempts with exponential backoff) and automatic re-joining of channels on disconnect.

---

## 🔐 Security & Multi-Tenancy

### Authentication — Triple-Layer

DineOS implements **6 distinct authentication middlewares**, each tailored to a specific user role:

| Middleware | Who it Protects | Token Type |
| :--- | :--- | :--- |
| `authenticateAdmin` | Restaurant owners | JWT Access Token |
| `authenticateStaff` | Chefs, Waiters, Admins | JWT Access Token |
| `authenticateGuest` | Customers at tables | Guest Session Token (4hr TTL) |
| `authenticateAny` | Mixed endpoints (tries Admin → Guest) | Either |
| `authenticateSuperAdmin` | Platform operators | JWT Access Token |
| `verifyRefresh` | Token renewal endpoint | JWT Refresh Token (7-day) |

**Admin Onboarding Flow:** Phone Number → Firebase OTP → Verified → JWT issued → Profile setup → Restaurant setup.

### Multi-Tenant Isolation — The tenantContext Middleware

Every single database query in DineOS is scoped to a `restaurantId`. The `tenantContext` middleware resolves this from 5 possible sources:

```
Resolution Priority:
1. Guest Session → req.guestSession.restaurantId
2. URL Slug     → /r/:restaurantSlug → Restaurant.findOne({ slug })
3. URL Param    → /api/menu/:restaurantId
4. Query Param  → ?restaurantId=xxx
5. User Object  → req.user.restaurantId (staff fallback)
```

A secondary `verifyRestaurantAccess` middleware validates that admins can only ever access their own restaurant's data — acting as a safety net against horizontal privilege escalation.

### Additional Security

- **Helmet.js** for HTTP header hardening
- **CORS** restricted to configured frontend origins
- **bcryptjs** for password hashing (salt rounds: 10)
- **Sparse indexes** on email and phone for uniqueness without null conflicts

---

## 💻 Tech Stack Breakdown

### Frontend

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7.2 | Build tool & dev server |
| Redux Toolkit | 2.11 | State management (4 slices: `auth`, `cart`, `restaurant`, `orders`) |
| React Router DOM | 7.13 | Client-side routing with protected routes |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 12.38 | Animations & transitions |
| Axios | 1.14 | HTTP client with interceptor-based JWT refresh |
| Socket.io Client | 4.8 | Real-time WebSocket communication |
| Firebase | 12.11 | Phone OTP authentication |
| Recharts | 3.8 | Data visualization for analytics |
| Lucide React | 0.562 | Icon library |
| React Hot Toast | 2.6 | Toast notifications |
| React Markdown | 10.1 | AI response rendering |
| date-fns | 4.1 | Date formatting & manipulation |

### Backend

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| Node.js | 18+ | Runtime |
| Express | 5.2 | HTTP framework |
| Mongoose | 9.0 | MongoDB ODM with 10 models |
| Socket.io | 4.8 | Real-time server |
| Firebase Admin | 13.7 | Server-side OTP verification |
| Groq SDK | 1.1 | LLM inference (LLaMA 3.3-70B) |
| JSON Web Token | 9.0 | JWT generation & verification |
| bcryptjs | 3.0 | Password hashing |
| Helmet | 8.1 | Security headers |
| PDFKit | 0.17 | QR code PDF generation |
| QRCode | 1.5 | QR code image generation |
| Morgan | 1.10 | HTTP request logging |

---

## 📁 Project Structure

```
DineOS/
│
├── frontend/                          # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── components/                # 22 Reusable UI components
│   │   │   ├── AiConcierge.tsx        #   AI chat interface
│   │   │   ├── CartSuggestions.tsx     #   AI pairing suggestions
│   │   │   ├── CustomerLayout.tsx     #   Customer page wrapper
│   │   │   ├── DashboardLayout.tsx    #   Admin layout with sidebar
│   │   │   ├── Navbar.tsx             #   Top navigation bar
│   │   │   ├── ProtectedRoute.tsx     #   Role-based route guard
│   │   │   ├── Sidebar.tsx            #   Admin sidebar navigation
│   │   │   ├── SuperAdminLayout.tsx   #   Super admin layout
│   │   │   └── ...                    #   + 14 more components
│   │   │
│   │   ├── pages/                     # 34 Page-level components
│   │   │   ├── AdminPage.tsx          #   Restaurant settings & staff mgmt
│   │   │   ├── DashboardPage.tsx      #   Admin home dashboard
│   │   │   ├── MenuPage.tsx           #   Menu Studio (CRUD)
│   │   │   ├── OrdersPage.tsx         #   Live order management
│   │   │   ├── AnalyticsPage.tsx      #   Charts & AI insights
│   │   │   ├── ChefDashboard.tsx      #   Chef KDS
│   │   │   ├── WaiterDashboard.tsx    #   Waiter service dashboard
│   │   │   ├── CustomerMenuPage.tsx   #   Digital menu (58KB — richest page)
│   │   │   ├── MarketingPage.tsx      #   Coupons, loyalty, AI copy
│   │   │   ├── SuperAdmin*.tsx        #   5 Super Admin pages
│   │   │   └── ...                    #   + public marketing pages
│   │   │
│   │   ├── store/
│   │   │   ├── store.ts               #   Redux store configuration
│   │   │   └── slices/
│   │   │       ├── authSlice.ts       #   Auth state + Firebase OTP flow
│   │   │       ├── cartSlice.ts       #   Cart state + localStorage sync
│   │   │       ├── restaurantSlice.ts #   Restaurant profile & config
│   │   │       └── orderSlice.ts      #   Order management state
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts                 #   Axios instance + JWT interceptors
│   │   │   └── socket.ts             #   SocketService class (auto-reconnect)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useRedux.ts            #   Type-safe Redux hooks
│   │   │   ├── useAPIError.ts         #   Standardized error handling
│   │   │   ├── useCart.ts             #   Cart operations hook
│   │   │   └── useTabTitle.ts         #   Dynamic page titles
│   │   │
│   │   ├── config/                    #   Environment variable exports
│   │   ├── context/                   #   React context providers
│   │   ├── utils/                     #   Shared utilities
│   │   └── router.tsx                 #   App routing (34 routes)
│   │
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                           # Node.js + Express 5
│   ├── server.js                      #   Entry point (HTTP + Socket.io init)
│   └── src/
│       ├── middleware/
│       │   ├── auth.js                #   6 auth middlewares
│       │   ├── tenantContext.js        #   Multi-tenant isolation (4 exports)
│       │   └── platformConfig.js      #   Maintenance mode guard
│       │
│       ├── models/                    #   10 Mongoose schemas
│       │   ├── Restaurant.js          #   Tenant core (slug, theme, loyalty)
│       │   ├── User.js                #   5 roles (admin/customer/chef/waiter/superadmin)
│       │   ├── Menu.js                #   Menu items with tags & allergens
│       │   ├── Order.js               #   Snapshot-based order records
│       │   ├── Table.js               #   Table status management
│       │   ├── Coupon.js              #   Discount codes (% or fixed)
│       │   ├── GlobalConfig.js        #   Platform-wide settings
│       │   └── ...                    #   + Session, AIConversation, Category
│       │
│       ├── routes/                    #   12 route modules
│       │   └── controllers/           #   20 controller files
│       │       ├── orderController.js  #   (24KB — heaviest controller)
│       │       ├── authController.js   #   Firebase OTP + JWT flow
│       │       ├── menuController.js   #   CRUD + AI descriptions
│       │       ├── marketingController.js  # Coupons + loyalty + AI copy
│       │       └── ...
│       │
│       ├── services/
│       │   ├── aiService.js           #   7 Groq AI functions
│       │   └── socketService.js       #   Room-based event emitters
│       │
│       └── utils/
│           └── tokenGenerator.js      #   JWT creation & verification
│
├── .github/                           #   GitHub configurations
├── restaurant_gpt_prd.md             #   Product Requirements Document
└── CONTRIBUTING.md                    #   Engineering standards
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Minimum Version | Purpose |
| :--- | :--- | :--- |
| Node.js | v18+ | Runtime for both frontend and backend |
| npm | v9+ | Package management |
| MongoDB | v6+ | Database (Atlas recommended) |
| Firebase Project | — | Phone OTP authentication |
| Groq API Key | — | AI features ([console.groq.com](https://console.groq.com)) |

### 1. Clone the Repository

```bash
git clone https://github.com/Dwarika202249/restaurant-gpt.git
cd restaurant-gpt
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see [Environment Configuration](#-environment-configuration) below).

```bash
npm run dev        # Starts on http://localhost:5000 with Nodemon
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (see [Environment Configuration](#-environment-configuration) below).

```bash
npm run dev        # Starts on http://localhost:5173 with Vite HMR
```

### 4. Verify the Setup

- **Backend Health:** Visit `http://localhost:5000` → should return `{"status": "ok"}`
- **Frontend:** Visit `http://localhost:5173` → DineOS marketing homepage
- **Socket.io:** Check backend console for `"New client connected"` messages when frontend loads

---

## 🔑 Environment Configuration

### Backend (`/backend/.env`)

```env
# ─── Server ────────────────────────────────────────
NODE_ENV=development
PORT=5000

# ─── Database ──────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# ─── JWT Secrets ───────────────────────────────────
JWT_SECRET=your_strong_access_token_secret
JWT_REFRESH_SECRET=your_strong_refresh_token_secret

# ─── Groq AI ──────────────────────────────────────
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# ─── Razorpay (Payment Gateway) ───────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# ─── Cloudinary (Image Hosting) ───────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# ─── Firebase Admin SDK ───────────────────────────
FIREBASE_SERVICE_ACCOUNT='{ "type": "service_account", ... }'

# ─── CORS ─────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

### Frontend (`/frontend/.env`)

```env
# ─── API ──────────────────────────────────────────
VITE_API_URL=http://localhost:5000/api

# ─── Razorpay ─────────────────────────────────────
VITE_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxx

# ─── Firebase Web Config ─────────────────────────
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> ⚠️ **Important:** Never commit `.env` files to version control. Both directories have `.gitignore` configured to exclude them.

---

## 📡 API Reference

DineOS exposes **12 route modules** across **68+ endpoints**:

| Module | Base Path | Auth Required | Key Endpoints |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth` | Public | `POST /admin/send-otp`, `POST /admin/verify-otp`, `POST /admin/refresh`, `POST /guest-session` |
| **Restaurant** | `/api/restaurant` | Admin | `GET /profile`, `PUT /profile`, `POST /setup`, `DELETE /:id` |
| **Menu** | `/api/menu` | Admin | `POST /category`, `POST /item`, `PATCH /item/:id/availability` |
| **Orders** | `/api/orders` | Staff | `GET /`, `POST /create`, `PATCH /:id/status`, `GET /stats` |
| **Customer** | `/api/customer` | Guest | Profile management, order history, loyalty |
| **Public** | `/api/public` | None | `GET /menu/:slug`, `GET /config` |
| **Coupons** | `/api/restaurant/coupons` | Admin | CRUD for discount codes |
| **AI** | `/api/ai` | Any | `POST /chat`, `POST /analyze`, `GET /conversation/:sessionId` |
| **Marketing** | `/api/marketing` | Admin | Loyalty perks, AI-generated copy |
| **Notifications** | `/api/notifications` | Admin | Real-time broadcast system |
| **Subscription** | `/api/subscription` | Admin | Tier management |
| **Super Admin** | `/api/superadmin` | SuperAdmin | `GET /stats`, `GET /restaurants`, `PATCH /config` |

---

## 🗄️ Database Schema

DineOS uses **10 Mongoose models** with optimized compound indexes:

| Model | Key Fields | Tenant-Scoped | Indexes |
| :--- | :--- | :--- | :--- |
| `Restaurant` | name, slug (unique), ownerId, themeColor, loyaltySettings, isPremium | — (IS the tenant) | `slug`, `ownerId` |
| `User` | name, phone, role (5 types), restaurantId, loyaltyPoints[], assignedTables[] | ✅ | `restaurantId`, `role`, `email` (sparse), `phone` (sparse) |
| `Menu` | restaurantId, items [{name, price, tags, allergens, isAvailable}] | ✅ | `restaurantId` |
| `Order` | restaurantId, orderNumber (unique), status, items [{nameSnapshot, priceSnapshot}], couponUsed, pointsEarned | ✅ | `restaurantId+orderedAt`, `status+restaurantId` |
| `Table` | restaurantId, tableNo, status | ✅ | `restaurantId` |
| `Category` | restaurantId, name, displayOrder | ✅ | `restaurantId` |
| `Coupon` | code, restaurantId, discountType, value, maxUses, usedCount | ✅ | `code+restaurantId` (compound unique) |
| `Session` | sessionId, restaurantId, tableNo, expiresAt (TTL) | ✅ | `sessionId`, `expiresAt` (TTL) |
| `AIConversation` | restaurantId, sessionId, messages[], totalTokensUsed | ✅ | `sessionId`, `restaurantId+createdAt` |
| `GlobalConfig` | maintenanceMode, announcement, features, platformInfo | ❌ (Singleton) | — |

### The Snapshot Pattern

Orders use **price snapshots** — `nameSnapshot` and `priceSnapshot` — to freeze the item details at the time of purchase. This ensures that post-order menu edits never corrupt historical revenue data.

---

## 🗺️ Roadmap

### Currently Implemented ✅

- [x] Multi-tenant restaurant onboarding with custom branding
- [x] Firebase Phone OTP authentication (Admin, Staff, Customer)
- [x] Full menu CRUD with AI-generated descriptions
- [x] Real-time order management (Customer → Chef → Waiter → Complete)
- [x] Socket.io room-based architecture (4 channel types)
- [x] AI Concierge with session-aware context
- [x] AI Cart Suggestions with pairing logic
- [x] Admin analytics with Recharts + AI business insights
- [x] Coupon system (percentage & fixed discounts)
- [x] Loyalty points system with configurable earn/redeem rates
- [x] QR code generation (individual + bulk PDF)
- [x] Super Admin platform management console
- [x] Maintenance mode with global announcements
- [x] Staff management (Chef & Waiter dashboards)

### Coming Soon — Super Pro 🚀

- [ ] **Inventory Management** — Real-time stock tracking, low-stock alerts, and supplier integration
- [ ] **WhatsApp Automation** — Order confirmations, AI-driven promotional messages, and reservation reminders
- [ ] **Multi-lingual AI** — Expanding the Concierge to support 15+ regional languages
- [ ] **Docker + CI/CD** — Docker Compose setup, GitHub Actions pipeline, AWS EC2 deployment
- [ ] **Razorpay Payment Integration** — Complete payment lifecycle with webhook verification
- [ ] **Table Reservation System** — Time-slot booking with SMS/WhatsApp confirmations
- [ ] **E2E Testing** — Playwright test suite covering all critical user journeys

---

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Branch naming conventions (`feat/`, `fix/`, `refactor/`, `docs/`)
- PR process and architectural review requirements
- Redux Toolkit slice standards
- Multi-tenant data isolation rules
- Tailwind CSS styling guidelines

---

## 📜 License

DineOS is proprietary software. All rights reserved.

---

<p align="center">
  <strong>Built with 🔥 for the future of dining.</strong>
  <br />
  <em>From QR scan to kitchen screen — in under 2 seconds.</em>
</p>

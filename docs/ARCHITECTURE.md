# DineOS — System Architecture Document

> **Classification:** Internal Engineering Reference
> **Version:** 1.0.0 | **Last Updated:** April 2026

---

## 1. Architecture Overview

DineOS follows a **Client-Server Monolith** architecture with a strict **Multi-Tenant SaaS** data model. The system is split into two independent deployable units — a React SPA frontend and a Node.js API backend — communicating over REST (HTTP/S) and WebSockets (Socket.io).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                              │
│                                                                             │
│   React 19 + TypeScript + Vite 7                                           │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │  Marketing Site │ Admin Panel │ Chef KDS │ Waiter KDS │ Customer UI  │ │
│   └────────────────────────────────┬──────────────────────────────────────┘ │
│                                    │                                        │
│   Redux Toolkit (4 slices)    Socket.io Client    Axios (JWT interceptors) │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTPS + WSS
┌────────────────────────────────────┼────────────────────────────────────────┐
│                          SERVER LAYER (Node.js)                             │
│                                    │                                        │
│   Express 5 HTTP Framework                                                  │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                    MIDDLEWARE PIPELINE                                │ │
│   │  Helmet → CORS → Morgan → PlatformConfig → Auth → TenantContext     │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│   ┌────────────┐  ┌───────────────┐  ┌────────────┐  ┌────────────────┐   │
│   │ 12 Route   │  │ 20 Controller │  │ 2 Service  │  │ 3 Middleware   │   │
│   │ Modules    │  │ Files         │  │ Files      │  │ Files          │   │
│   └────────────┘  └───────────────┘  └────────────┘  └────────────────┘   │
│                                    │                                        │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                    DATA ACCESS LAYER (Mongoose 9)                    │ │
│   │  10 Models: Restaurant, User, Menu, Order, Table, Category,         │ │
│   │            Coupon, Session, AIConversation, GlobalConfig             │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
              ┌──────────────────────┼────────────────────────┐
              │                      │                        │
       MongoDB Atlas          Firebase Admin            Groq Cloud
       (Persistent Data)      (OTP Verification)       (LLM Inference)
```

---

## 2. Frontend Architecture

### 2.1 Technology Decisions

| Decision  | Choice              | Rationale                                                |
| :-------- | :------------------ | :------------------------------------------------------- |
| Framework | React 19            | Component model, ecosystem maturity, concurrent features |
| Language  | TypeScript 5.9      | Type safety critical for multi-role SaaS                 |
| Bundler   | Vite 7              | Fast HMR, ESBuild-based, superior DX                     |
| State     | Redux Toolkit 2.11  | Predictable state for auth, cart, orders, restaurant     |
| Styling   | Tailwind CSS 3.4    | Utility-first, rapid iteration, theme consistency        |
| Routing   | React Router 7.13   | File-based routing, layout nesting, protected routes     |
| Animation | Framer Motion 12.38 | Declarative animations for customer UI                   |
| Charts    | Recharts 3.8        | React-native charting for analytics dashboard            |

### 2.2 State Management — Redux Store

The store holds 4 slices, each responsible for a bounded domain:

```
Redux Store
├── auth        → User identity, tokens, OTP flow, duty status
│                 (10 async thunks, 3 sync reducers)
│
├── cart         → Item list, quantities, totals, sessionId
│                 (8 reducers, localStorage sync, auto-clear on logout)
│
├── restaurant  → Current tenant profile, public restaurant data
│                 (6 async thunks, auto-reset on login transition)
│
└── orders      → Order list, stats aggregation, real-time additions
                  (3 async thunks, 3 sync reducers for socket events)
```

**Key Pattern — Cross-slice Coordination:**
All 4 slices listen for `logout.fulfilled`, `verifyOTP.pending`, and `verifyFirebaseToken.pending` actions via `extraReducers` / `addMatcher`. This ensures that login transitions and logouts atomically reset cart, restaurant, and order state — preventing stale tenant data leaks across sessions.

### 2.3 Service Layer

| Service            | File                 | Responsibility                                                                                                                                         |
| :----------------- | :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API Client**     | `services/api.ts`    | Axios instance with request interceptor (auto-attach JWT), response interceptor (401 → auto-refresh → retry), and 403 → force logout                   |
| **Socket Service** | `services/socket.ts` | Singleton `SocketService` class. Manages connection lifecycle, auto-reconnection (10 attempts, exponential backoff), and room re-joining on disconnect |

### 2.4 Custom Hooks

| Hook               | Purpose                                                                                            |
| :----------------- | :------------------------------------------------------------------------------------------------- |
| `useRedux()`       | Composite hook returning typed `dispatch`, `auth` state, and full `state` — eliminates boilerplate |
| `useAppDispatch()` | Typed `dispatch` for `AppDispatch`                                                                 |
| `useAppSelector()` | Typed `useSelector` for `RootState`                                                                |
| `useAPIError()`    | Standardized error extraction from Axios errors — returns `{ message, status, data }`              |
| `useCart()`        | Cart operations abstraction                                                                        |
| `useTabTitle()`    | Dynamic document title management                                                                  |

### 2.5 Routing Architecture

DineOS has **34 routes** organized across 5 layout groups:

| Layout              | Routes                                                                                           | Guard                          |
| :------------------ | :----------------------------------------------------------------------------------------------- | :----------------------------- |
| `PublicLayout`      | `/`, `/services`, `/about`, `/contact`, `/help`, `/privacy`, `/terms`                            | None                           |
| `DashboardLayout`   | `/dashboard`, `/admin`, `/menu`, `/orders`, `/analytics`, `/qr-management`, `/marketing`         | `ProtectedRoute (admin)`       |
| `SuperAdminLayout`  | `/superadmin/dashboard`, `restaurants`, `subscribers`, `settings`, `profile`                     | SuperAdmin auth                |
| Staff Standalone    | `/chef/dashboard`, `/waiter/dashboard`                                                           | `ProtectedRoute (chef/waiter)` |
| Customer Standalone | `/r/:restaurantSlug/table/:tableNo`, `/customer/:slug/table/:tableNo`, profile, history, rewards | Guest session                  |

---

## 3. Backend Architecture

### 3.1 Server Initialization Flow

```
server.js (Entry Point)
│
├── 1. dotenv.config()           → Load env vars
├── 2. mongoose.connect()        → MongoDB Atlas connection
├── 3. Express middleware stack   → Helmet, CORS, Morgan, JSON parser
├── 4. platformConfig middleware  → Global maintenance mode check
├── 5. http.createServer(app)    → HTTP server for dual protocol
├── 6. socketService.init()      → Initialize Socket.io on HTTP server
├── 7. Mount 12 route modules    → REST API endpoints
├── 8. Health check (GET /)      → Status endpoint
├── 9. Error handler (500)       → Global error middleware
├── 10. 404 handler              → Catch-all
└── 11. httpServer.listen(PORT)  → Start server
```

### 3.2 Middleware Pipeline

Requests flow through this ordered pipeline:

```
Request → Helmet → CORS → Morgan → PlatformConfig → [Route-specific Auth] → [TenantContext] → Controller → Response
```

| Middleware                | File                | Purpose                                                                           |
| :------------------------ | :------------------ | :-------------------------------------------------------------------------------- |
| `helmet()`                | npm                 | HTTP header hardening (XSS, clickjacking, MIME sniffing)                          |
| `cors()`                  | npm                 | Origin validation (restricted to `FRONTEND_URL` in production)                    |
| `morgan('dev')`           | npm                 | HTTP request logging                                                              |
| `platformConfig`          | `platformConfig.js` | Global maintenance mode gate — blocks all requests except SuperAdmin when enabled |
| `authenticateAdmin`       | `auth.js`           | Verifies JWT, loads User, ensures `role === 'admin' \|\| 'superadmin'`            |
| `authenticateStaff`       | `auth.js`           | Verifies JWT for `admin/superadmin/waiter/chef` roles                             |
| `authenticateGuest`       | `auth.js`           | Verifies guest session token, sets `req.guestSession`                             |
| `authenticateAny`         | `auth.js`           | Tries admin token first → falls back to guest token                               |
| `authenticateSuperAdmin`  | `auth.js`           | Verifies JWT, ensures `role === 'superadmin'`                                     |
| `verifyRefresh`           | `auth.js`           | Validates refresh token for token rotation endpoint                               |
| `attachRestaurantContext` | `tenantContext.js`  | Resolves `restaurantId` from 5 sources (session → slug → param → query → user)    |
| `verifyRestaurantAccess`  | `tenantContext.js`  | Safety net — ensures admin only accesses own restaurant                           |

### 3.3 Route → Controller Mapping

| Route Module              | Controller(s)                                                         | Endpoints                                                                                 |
| :------------------------ | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `/api/auth`               | `authController.js` (10 functions)                                    | OTP send/verify, Firebase verify, refresh, logout, guest session, superadmin login/signup |
| `/api/restaurant`         | `restaurantController.js`, `staffController.js`, `tableController.js` | Profile CRUD, staff management, table management                                          |
| `/api/menu`               | `menuController.js`                                                   | Category & item CRUD, AI description generation, availability toggle                      |
| `/api/orders`             | `orderController.js` (24KB — largest)                                 | Create, list, status update, stats aggregation, table assignment                          |
| `/api/customer`           | `customerController.js`, `updateCustomerProfile.js`                   | Profile, order history, loyalty points                                                    |
| `/api/ai`                 | `aiController.js`, `customerAiController.js`                          | Concierge chat, business insights, cart suggestions                                       |
| `/api/restaurant/coupons` | `couponController.js`                                                 | Coupon CRUD with AI-generated descriptions                                                |
| `/api/marketing`          | `marketingController.js` (14KB)                                       | Loyalty perks, CRM, AI copy generation                                                    |
| `/api/notifications`      | `notificationController.js`                                           | Real-time broadcast system                                                                |
| `/api/subscription`       | `subscriptionController.js`                                           | Plan management                                                                           |
| `/api/public`             | public routes                                                         | Menu by slug, platform config                                                             |
| `/api/superadmin`         | `superAdminController.js`                                             | Stats, restaurants, config, AI-generated broadcasts                                       |

### 3.4 Service Layer

| Service            | File               | Functions                                                                                                                                                                                |
| :----------------- | :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI Service**     | `aiService.js`     | `getAiConciergeResponse`, `getCartSuggestions`, `generateItemDescription`, `analyzeBusinessInsights`, `generateCouponDescription`, `generatePerkDescription`, `generateBroadcastMessage` |
| **Socket Service** | `socketService.js` | `init`, `getIO`, `emitToRestaurant`, `emitToUser`, `emitToKitchen`, `emitToTable`                                                                                                        |

---

## 4. Data Flow Diagrams

### 4.1 Customer Order Flow

```
Customer (Browser)                    Server (Express)                 Chef (Browser)
      │                                     │                               │
      │  1. POST /auth/guest-session        │                               │
      │────────────────────────────────────►│                               │
      │◄────────────────────────────────────│ Guest JWT (45min)             │
      │                                     │                               │
      │  2. GET /public/menu/:slug          │                               │
      │────────────────────────────────────►│                               │
      │◄────────────────────────────────────│ Menu + Categories             │
      │                                     │                               │
      │  3. POST /ai/chat                  │                               │
      │────────────────────────────────────►│ → Groq LLM                   │
      │◄────────────────────────────────────│ AI Response                   │
      │                                     │                               │
      │  4. POST /orders/create             │                               │
      │────────────────────────────────────►│ Create Order (snapshot)       │
      │                                     │                               │
      │                                     │  socket: 'new-order'          │
      │                                     │──────────────────────────────►│
      │  socket: 'order-status-update'      │                               │
      │◄─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│◄──────────────────────────────│
      │                                     │  PATCH /orders/:id/status     │
```

### 4.2 Authentication Flow (Admin)

```
Admin (Browser)                       Server (Express)                    Firebase
      │                                     │                               │
      │  Phase 1: Firebase Phone OTP        │                               │
      │─────────────────────────────────────────────────────────────────────►│
      │◄─────────────────────────────────────────────────────────────────────│
      │  Firebase ID Token                  │                               │
      │                                     │                               │
      │  Phase 2: Token Exchange            │                               │
      │  POST /auth/firebase-verify         │                               │
      │────────────────────────────────────►│                               │
      │                                     │  firebaseAdmin.verifyIdToken()│
      │                                     │──────────────────────────────►│
      │                                     │◄──────────────────────────────│
      │                                     │  Find/Create User             │
      │                                     │  Generate JWT + Refresh       │
      │◄────────────────────────────────────│                               │
      │  { accessToken, refreshToken, user }│                               │
      │                                     │                               │
      │  Phase 3: Auto-Refresh              │                               │
      │  (Axios interceptor on 401)         │                               │
      │  POST /auth/admin/refresh           │                               │
      │────────────────────────────────────►│  Rotate refresh token         │
      │◄────────────────────────────────────│  New access + refresh         │
```

---

## 5. Multi-Tenant Isolation Model

DineOS uses **Logical Tenant Isolation** — all tenants share the same database and collections, but every document is tagged with a `restaurantId` foreign key, and every query is scoped through middleware.

### 5.1 Isolation Enforcement Layers

| Layer                  | Mechanism                    | Implementation                                                                                             |
| :--------------------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **L1: Middleware**     | `attachRestaurantContext`    | Resolves `restaurantId` from 5 sources and attaches to `req`                                               |
| **L2: Access Control** | `verifyRestaurantAccess`     | Cross-checks admin's `restaurantId` against `req.restaurantId`                                             |
| **L3: Query Helper**   | `buildRestaurantFilter()`    | Utility to always append `restaurantId` to Mongoose filter objects                                         |
| **L4: Schema Design**  | Mongoose `ref: 'Restaurant'` | Every tenant-scoped model has `restaurantId` as required field                                             |
| **L5: Index Strategy** | Compound indexes             | `{ restaurantId: 1, orderedAt: 1 }`, `{ status: 1, restaurantId: 1 }` — ensures tenant queries hit indexes |

### 5.2 Resolution Priority

```javascript
// tenantContext.js — Resolution order:
1. req.guestSession.restaurantId  // Guest token payload
2. req.params.restaurantSlug      // URL slug → DB lookup
3. req.params.restaurantId        // Direct URL param
4. req.query.restaurantId         // Query string
5. req.user.restaurantId          // Authenticated staff fallback
```

---

## 6. Real-time Architecture (Socket.io)

### 6.1 Room Topology

```
Socket.io Server
│
├── Restaurant Room:  "<restaurantId>"
│   ├── Admins see: new orders, status changes, table updates
│   └── All staff of this restaurant receive global events
│
├── Kitchen Room:     "kitchen_<restaurantId>"
│   └── Only chef-role users receive order events here
│
├── User Room:        "user_<userId>"
│   └── Targeted notifications for a specific staff member
│
└── Table Room:       "table_<restaurantId>_<tableNo>"
    └── Customers at this table receive order status updates
```

### 6.2 Client-side Resilience

The `SocketService` class (frontend) implements:

- **Transport priority:** WebSocket first, HTTP long-polling fallback
- **Auto-reconnection:** 10 attempts with exponential backoff (1s → 5s max)
- **Room re-joining:** Stores last join params, auto-rejoins on reconnect
- **Singleton pattern:** Single connection shared across all components

---

## 7. External Service Integrations

| Service            | SDK                   | Purpose                                   | Failure Strategy                          |
| :----------------- | :-------------------- | :---------------------------------------- | :---------------------------------------- |
| **MongoDB Atlas**  | `mongoose@9`          | Persistent data store                     | `process.exit(1)` on connection failure   |
| **Firebase Admin** | `firebase-admin@13.7` | Server-side OTP verification              | Fallback to demo OTP in dev mode          |
| **Groq**           | `groq-sdk@1.1`        | LLM inference (`llama-3.3-70b-versatile`) | Returns graceful fallback string on error |
| **Razorpay**       | Planned               | Payment processing                        | Test mode only (pending integration)      |
| **Cloudinary**     | Planned               | Image uploads                             | Placeholder — not yet integrated          |

---

## 8. Security Architecture

| Layer                 | Mechanism                                                                  |
| :-------------------- | :------------------------------------------------------------------------- |
| **Transport**         | HTTPS enforced in production                                               |
| **Headers**           | `helmet()` — CSP, X-Frame-Options, HSTS, XSS-Protection                    |
| **CORS**              | Restricted to `FRONTEND_URL`, credentials required                         |
| **Authentication**    | 6 middleware variants for 5 user roles                                     |
| **Token Rotation**    | Refresh tokens are single-use (old token removed, new one issued)          |
| **Password Security** | bcryptjs with 10 salt rounds, `select: false` on password field            |
| **Tenant Isolation**  | 5-layer middleware + schema enforcement                                    |
| **Data Privacy**      | AI service receives only aggregated, anonymized data for business insights |

---

_This document is a living reference. All architectural details are sourced directly from the DineOS codebase._

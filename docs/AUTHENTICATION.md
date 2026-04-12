# DineOS — Authentication & Security Reference

> **Classification:** Internal Engineering Reference
> **Auth Providers:** Firebase (Phone OTP) + JWT (Local)
> **Middleware File:** `backend/src/middleware/auth.js` (294 lines, 6 middlewares)
> **Controller File:** `backend/src/routes/controllers/authController.js` (668 lines, 10 functions)

---

## 1. Authentication Architecture Overview

DineOS uses a **Dual-Layer Authentication** model:

```
Layer 1: Identity Verification (Firebase)
├── Phone OTP sent via Firebase Auth SDK (client-side)
├── Firebase verifies phone → issues Firebase ID Token
└── ID Token sent to DineOS backend for exchange

Layer 2: Session Management (JWT)
├── Backend verifies Firebase ID Token via firebase-admin SDK
├── Generates local Access Token + Refresh Token pair
├── Access Token used for all subsequent API calls
└── Refresh Token rotated on each renewal (single-use)
```

### Why Two Layers?

| Concern | Solution |
| :--- | :--- |
| **Identity verification** | Firebase — battle-tested phone OTP, no SMS gateway to manage |
| **API authorization** | Local JWT — full control over claims, expiry, and role-based access |
| **Multi-role support** | 5 roles in one system — Firebase only does identity, JWT handles roles |
| **Token lifecycle** | Custom refresh rotation — Firebase tokens aren't controllable |

---

## 2. User Roles & Access Matrix

DineOS has **5 distinct user roles**:

| Role | Login Method | Auth Middleware | Access Scope |
| :--- | :--- | :--- | :--- |
| `admin` | Firebase Phone OTP → JWT | `authenticateAdmin` | Own restaurant data only |
| `chef` | OTP (pre-registered phone) → JWT | `authenticateStaff` | Own restaurant's kitchen orders |
| `waiter` | OTP (pre-registered phone) → JWT | `authenticateStaff` | Own restaurant's table orders |
| `customer` | Firebase Phone OTP → JWT *or* Guest Token | `authenticateGuest` / `authenticateAny` | Public menu + own session data |
| `superadmin` | Email + Password → JWT | `authenticateSuperAdmin` | Platform-wide data |

---

## 3. Authentication Flows

### 3.1 Admin Login (Firebase Phone OTP)

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Firebase   │         │   Backend    │
│  (LoginPage) │         │   Auth SDK   │         │  (Express)   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │  1. signInWithPhone()  │                        │
       │───────────────────────►│                        │
       │                        │  2. SMS OTP sent       │
       │  3. User enters OTP    │                        │
       │───────────────────────►│                        │
       │                        │  4. Verify → ID Token  │
       │◄───────────────────────│                        │
       │                                                 │
       │  5. POST /auth/firebase-verify { idToken }      │
       │────────────────────────────────────────────────►│
       │                                                 │  6. firebaseAdmin.verifyIdToken()
       │                                                 │  7. Find/Create User (role: admin)
       │                                                 │  8. generateTokens(userId, restaurantId)
       │◄────────────────────────────────────────────────│
       │  { accessToken, refreshToken, user }            │
       │                                                 │
       │  9. Store in Redux + localStorage               │
```

### 3.2 Staff Login (Pre-registered Phone)

Staff members (chefs/waiters) must be **pre-registered by the admin** before they can log in.

```
Step 1: Admin adds staff member → User record created (role: chef/waiter, phone: XXXXXXXXXX)
Step 2: Staff opens /staff/login → enters phone number
Step 3: POST /auth/staff/send-otp → backend checks User exists with role in ['waiter', 'chef']
        ├── NOT FOUND → 403 "Access Denied: Not in staff registry"
        └── FOUND → Generate 6-digit OTP, store in global.otpStore
Step 4: Staff enters OTP → POST /auth/admin/verify-otp → JWT issued
```

### 3.3 Customer Login (Guest Session + Optional Firebase)

```
Flow A: Anonymous Guest (No Login)
├── QR Scan → /r/:slug/table/:tableNo
├── POST /auth/guest-session → Guest JWT (45 min TTL)
└── Can browse menu, chat with AI, place orders

Flow B: Authenticated Customer (Firebase OTP)
├── Customer taps "Login" in profile section
├── Firebase Phone OTP flow
├── POST /auth/firebase-verify { idToken, guestSessionId, restaurantId }
├── Backend links guest orders to customer account (Order.updateMany)
└── Customer gets loyalty points, order history, personalized AI
```

### 3.4 SuperAdmin Login (Email + Password)

```
POST /auth/superadmin/login { email, password }
├── User.findOne({ email, role: 'superadmin' }).select('+password')
├── user.comparePassword(password) → bcrypt comparison
└── generateTokens(userId, null) → no restaurantId for superadmin
```

### 3.5 Demo Mode

A demo phone number (`9999999999`) with fixed OTP (`123456`) is hardcoded for development and demonstration:

```javascript
const DEMO_PHONE = '9999999999';
const isDemo = phone.replace(/\D/g, '') === DEMO_PHONE;
const otp = isDemo ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
```

---

## 4. Middleware Reference

### 4.1 `authenticateAdmin`

```
Request → Extract Bearer token → verifyAccessToken(token)
        → User.findById(decoded.userId)
        → Assert: role === 'admin' || 'superadmin'
        → req.user = user, req.restaurantId = user.restaurantId
        → next()
```

### 4.2 `authenticateStaff`

```
Same as authenticateAdmin, but allows roles: ['admin', 'superadmin', 'waiter', 'chef']
```

### 4.3 `authenticateGuest`

```
Request → Extract Bearer token → verifyGuestToken(token)
        → req.guestSession = { sessionId, restaurantId, tableNo }
        → req.restaurantId = decoded.restaurantId
        → next()
```

### 4.4 `authenticateAny`

```
Request → Try verifyAccessToken (admin/staff)
        │  ├── Success → req.user = user → next()
        │  └── Fail → try verifyGuestToken
        │              ├── Success → req.guestSession = {...} → next()
        │              └── Fail → 401 "Invalid token"
```

### 4.5 `authenticateSuperAdmin`

```
Same as authenticateAdmin, but asserts: role === 'superadmin' ONLY
```

### 4.6 `verifyRefresh`

```
Request → Extract refreshToken from body
        → verifyRefreshToken(token) → decoded
        → User.findById(decoded.userId)
        → Check token exists in user.refreshTokens[] and not expired
        → req.user = user → next()
```

---

## 5. Token Architecture

### 5.1 Token Generation

```javascript
// utils/tokenGenerator.js
function generateTokens(userId, restaurantId) {
  const accessToken = jwt.sign(
    { userId, restaurantId },
    process.env.JWT_SECRET,
    { expiresIn: '4h' }    // Short-lived
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }    // Long-lived
  );

  return { accessToken, refreshToken };
}

function generateGuestToken(sessionId, restaurantId, tableNo) {
  return jwt.sign(
    { sessionId, restaurantId, tableNo },
    process.env.JWT_SECRET,
    { expiresIn: '45m' }   // Session-scoped
  );
}
```

### 5.2 Token Refresh Flow (Single-Use Rotation)

```
Client 401 → Axios Interceptor → dispatch(refreshAccessToken(refreshToken))
           → POST /api/auth/admin/refresh

Server:
├── Verify refresh token exists in user.refreshTokens[]
├── Verify not expired
├── Generate NEW access + refresh pair
├── REMOVE old refresh token from array
├── PUSH new refresh token to array
├── Save user
└── Return { accessToken, refreshToken }

Client:
├── Update Redux state + localStorage
├── Retry original failed request with new access token
```

**Security:** Each refresh token is **single-use**. After rotation, the old token is invalidated. If an attacker steals a refresh token, it can only be used once before the legitimate user's next request invalidates it.

### 5.3 Token Storage (Frontend)

| Token | Storage | Access |
| :--- | :--- | :--- |
| Access Token | `localStorage` + Redux `auth.accessToken` | Axios request interceptor |
| Refresh Token | `localStorage` + Redux `auth.refreshToken` | Axios 401 response interceptor |

---

## 6. OTP System

### 6.1 OTP Storage

```javascript
// In-memory store (development)
global.otpStore = {
  '9876543210': {
    otp: '482917',
    expiresAt: Date('2026-04-13T02:10:00Z'),  // 10 minutes TTL
    attempts: 0                                 // Max 3 attempts
  }
};
```

> **⚠️ Production TODO:** Replace `global.otpStore` with Redis (TTL-based key-value store) for horizontal scaling.

### 6.2 OTP Verification Rules

| Rule | Value | Behavior on Violation |
| :--- | :--- | :--- |
| Expiry | 10 minutes | `400 "OTP expired"` + delete from store |
| Max Attempts | 3 | `400 "Maximum attempts exceeded"` + delete from store |
| Invalid OTP | — | `400 "Invalid OTP"` + increment attempts counter |
| Success | — | Delete from store + proceed to JWT issuance |

---

## 7. Password Security (SuperAdmin)

| Aspect | Implementation |
| :--- | :--- |
| **Hashing** | bcryptjs, 10 salt rounds |
| **Storage** | `User.password` field with `select: false` default |
| **Query** | Must explicitly `.select('+password')` to retrieve |
| **Comparison** | `user.comparePassword()` instance method |
| **Hook** | `pre('save')` automatically hashes when field is modified |

---

## 8. Frontend Auth Guards — `ProtectedRoute`

```typescript
// components/ProtectedRoute.tsx
<ProtectedRoute requiredRole="admin">
  <DashboardLayout />
</ProtectedRoute>
```

The `ProtectedRoute` component:
1. Checks `isAuthenticated` from Redux auth state
2. Validates `user.role` matches `requiredRole`
3. Redirects to `/login` if unauthenticated
4. Redirects to appropriate dashboard if role mismatch

### Route Protection Map

| Route Group | Guard | Redirect |
| :--- | :--- | :--- |
| `/dashboard`, `/menu`, `/admin`, etc. | `requiredRole="admin"` | → `/login` |
| `/chef/dashboard` | `requiredRole="chef"` | → `/staff/login` |
| `/waiter/dashboard` | `requiredRole="waiter"` | → `/staff/login` |
| `/superadmin/*` | SuperAdmin layout auth | → `/supremeadmin` |
| `/r/:slug/table/:tableNo` | Guest session (auto-generated) | — |

---

## 9. Guest-to-Customer Migration

When a guest customer logs in (Firebase OTP) during an active session, their anonymous orders are linked to their new user account:

```javascript
// authController.js (verifyOTP / verifyFirebaseToken)
if (isCustomerPath && guestSessionId && sessionRestaurantId) {
  await Order.updateMany(
    { 
      guestSessionId: new ObjectId(guestSessionId), 
      restaurantId: new ObjectId(sessionRestaurantId),
      customerId: null  // Only unlinked orders
    },
    { $set: { customerId: user._id } }
  );
}
```

This enables:
- Order history persistence across sessions
- Loyalty points earning for retroactive orders
- Personalized AI recommendations on future visits

---

## 10. Security Hardening Checklist

| ✅ | Measure | Status |
| :--- | :--- | :--- |
| ✅ | Helmet.js HTTP headers | Active |
| ✅ | CORS restricted to FRONTEND_URL | Active |
| ✅ | JWT secret separation (access ≠ refresh) | Active |
| ✅ | Single-use refresh token rotation | Active |
| ✅ | bcrypt password hashing (10 rounds) | Active |
| ✅ | Password field excluded from default queries | Active |
| ✅ | OTP max attempts (3) + expiry (10 min) | Active |
| ✅ | Role-based route protection | Active |
| ✅ | Tenant isolation middleware | Active |
| ✅ | Staff pre-registration requirement | Active |
| ⬜ | Rate limiting (100 req/15min) | Planned |
| ⬜ | Redis-based OTP store | Planned |
| ⬜ | HTTPS enforcement | Production-only |

---

*All authentication flows, middleware implementations, and token strategies are sourced from the DineOS codebase.*

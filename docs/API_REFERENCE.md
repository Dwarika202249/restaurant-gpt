# DineOS — API Reference

> **Classification:** Developer Reference
> **Version:** 1.0.0 | **Base URL:** `http://localhost:5000/api`

---

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Types

| Token | TTL | Purpose | Issuer |
| :--- | :--- | :--- | :--- |
| **Access Token** | Short-lived | API authentication | `generateTokens()` |
| **Refresh Token** | 7 days | Access token renewal (single-use, rotated) | `generateTokens()` |
| **Guest Token** | 45 minutes | Customer session at a table | `generateGuestToken()` |
| **Firebase ID Token** | ~1 hour | Phone OTP verification (external) | Firebase Auth |

---

## 1. Auth — `/api/auth`

### `POST /admin/send-otp`

Send a 6-digit OTP to admin's phone number.

**Auth:** Public
**Body:**
```json
{ "phone": "9876543210" }
```
**Success (200):**
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development or for demo phone (9999999999)
}
```
**Errors:** `400` Invalid phone format

---

### `POST /staff/send-otp`

Send OTP to a pre-registered staff member. Rejects if phone is not in the staff registry.

**Auth:** Public
**Body:**
```json
{ "phone": "9876543210" }
```
**Success (200):**
```json
{ "message": "Authentication key sent to your mobile" }
```
**Errors:** `403` Access Denied — phone not registered as staff

---

### `POST /admin/verify-otp`

Verify OTP and receive JWT tokens. Creates new user if phone is not registered.

**Auth:** Public
**Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "guestSessionId": "optional_session_id",
  "restaurantId": "optional_restaurant_id"
}
```
**Success (200):**
```json
{
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": {
      "id": "60f...",
      "name": "Raj",
      "email": "raj@example.com",
      "phone": "9876543210",
      "role": "admin",
      "restaurantId": "60f...",
      "profileComplete": true
    }
  }
}
```
**Errors:** `400` OTP expired/invalid, `403` Customer using admin login

---

### `POST /firebase-verify`

Exchange a Firebase ID Token (phone OTP) for local JWT tokens.

**Auth:** Public
**Body:**
```json
{
  "idToken": "firebase_id_token",
  "guestSessionId": "optional",
  "restaurantId": "optional"
}
```
**Success (200):** Same response structure as `/admin/verify-otp`

---

### `POST /admin/refresh`

Rotate access/refresh token pair. The old refresh token is invalidated.

**Auth:** Requires valid refresh token (verified by `verifyRefresh` middleware)
**Body:**
```json
{ "refreshToken": "eyJhbG..." }
```
**Success (200):**
```json
{
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

### `POST /admin/logout`

Invalidate the refresh token on the server.

**Auth:** `authenticateAdmin`
**Body:**
```json
{ "refreshToken": "eyJhbG..." }
```
**Success (200):**
```json
{ "message": "Logout successful" }
```

---

### `POST /guest-session`

Generate a guest session token for a customer scanning a QR code.

**Auth:** Public
**Body:**
```json
{
  "restaurantSlug": "tandoori-palace",
  "tableNo": 5
}
```
**Success (200):**
```json
{
  "data": {
    "guestToken": "eyJhbG...",
    "sessionId": "1712956800abc123",
    "restaurantId": "60f...",
    "restaurantName": "Tandoori Palace",
    "tableNo": 5,
    "expiresAt": "2026-04-13T02:00:00.000Z"
  }
}
```
**Errors:** `404` Restaurant not found, `400` Invalid table number

---

### `POST /superadmin/login`

SuperAdmin login with email and password.

**Auth:** Public
**Body:**
```json
{ "email": "supreme@dineos.com", "password": "secret" }
```
**Success (200):** Same token response structure with `role: "superadmin"`

---

### `POST /superadmin/signup`

Create a new admin user (requires manual DB promotion to `superadmin`).

**Auth:** Public
**Body:**
```json
{ "name": "Supreme Admin", "email": "supreme@dineos.com", "password": "secret" }
```
**Success (201):** User created with `role: "admin"` — needs manual promotion

---

### `POST /superadmin/change-password`

**Auth:** `authenticateSuperAdmin`
**Body:**
```json
{ "currentPassword": "old_pass", "newPassword": "new_pass" }
```

---

## 2. Restaurant — `/api/restaurant`

### `GET /profile`
**Auth:** `authenticateAdmin`
**Response:** Full restaurant object including loyalty settings

### `PUT /profile`
**Auth:** `authenticateAdmin`
**Body:** Partial restaurant update (name, slug, themeColor, currency, loyaltySettings, etc.)

### `POST /setup`
**Auth:** `authenticateAdmin`
**Body:**
```json
{
  "name": "Tandoori Palace",
  "slug": "tandoori-palace",
  "tablesCount": 15,
  "currency": "INR",
  "themeColor": "#ff9500"
}
```

### `DELETE /:restaurantId`
**Auth:** `authenticateAdmin`
**Cascade:** Deletes restaurant and all associated data

### `GET /public/:slug`
**Auth:** Public
**Response:** Restaurant info for customer-facing pages (name, theme, logo)

---

## 3. Menu — `/api/menu`

### `GET /:restaurantId`
**Auth:** `authenticateAdmin`
**Response:** All categories and items for the restaurant

### `POST /category`
**Auth:** `authenticateAdmin`
**Body:** `{ "name": "Starters", "displayOrder": 1 }`

### `PUT /category/:id`
**Auth:** `authenticateAdmin`

### `DELETE /category/:id`
**Auth:** `authenticateAdmin`
**Side effect:** Orphaned items reassigned to "Others" category

### `POST /item`
**Auth:** `authenticateAdmin`
**Body:**
```json
{
  "categoryId": "60f...",
  "name": "Paneer Tikka",
  "description": "Smoky cottage cheese cubes",
  "price": 280,
  "tags": ["veg", "spicy"],
  "allergens": ["dairy"],
  "isAvailable": true
}
```

### `PUT /item/:id`
**Auth:** `authenticateAdmin`

### `DELETE /item/:id`
**Auth:** `authenticateAdmin`

### `PATCH /item/:id/availability`
**Auth:** `authenticateAdmin`
**Body:** `{ "isAvailable": false }`

---

## 4. Orders — `/api/orders`

### `GET /`
**Auth:** `authenticateStaff`
**Query Params:**
| Param | Type | Example |
| :--- | :--- | :--- |
| `status` | string | `new`, `preparing`, `ready`, `completed` |
| `date` | string | `today`, `yesterday` |
| `startDate` | string | `2026-04-01` |
| `endDate` | string | `2026-04-13` |
| `searchTerm` | string | Order number or item name |
| `paymentStatus` | string | `pending`, `completed` |
| `limit` | number | `50` |

### `POST /create`
**Auth:** `authenticateGuest` or `authenticateAny`
**Body:**
```json
{
  "tableNo": 5,
  "items": [
    {
      "itemId": "60f...",
      "nameSnapshot": "Paneer Tikka",
      "priceSnapshot": 280,
      "quantity": 2,
      "itemTotal": 560
    }
  ],
  "subtotal": 560,
  "taxAmount": 28,
  "total": 588
}
```
**Side Effects:**
- Emits `new-order` via Socket.io to restaurant + kitchen rooms
- Emits order status to table room

### `PATCH /:orderId/status`
**Auth:** `authenticateStaff`
**Body:** `{ "status": "preparing" }`
**Valid transitions:** `new → preparing → ready → completed`
**Side Effects:** Emits `order-status-update` to relevant socket rooms

### `GET /stats`
**Auth:** `authenticateAdmin`
**Query:** `{ "dateRange": "last7days" }` or `{ "startDate": "...", "endDate": "..." }`
**Response:**
```json
{
  "data": {
    "summary": { "totalOrders": 142, "totalRevenue": 48500, "averageOrderValue": 341 },
    "byStatus": [{ "_id": "completed", "count": 120, "revenue": 42000 }],
    "byHour": [{ "_id": 13, "count": 25, "revenue": 8500 }],
    "topItems": [{ "_id": "Butter Chicken", "count": 45, "revenue": 13500 }]
  }
}
```

---

## 5. AI — `/api/ai`

### `POST /chat`
**Auth:** `authenticateAny`
**Body:**
```json
{
  "message": "What's a good spicy dish?",
  "restaurantSlug": "tandoori-palace",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Namaste! How can I help?" }
  ],
  "sessionContext": {
    "cart": [{ "name": "Naan", "quantity": 2, "price": 80 }],
    "loyalty": { "customerName": "Raj", "points": 340 },
    "offers": [{ "code": "FEAST20", "discountType": "percentage", "value": 20 }]
  }
}
```
**Response:**
```json
{
  "response": "Namaste Raj! Since you already have Naan, I'd recommend our Rogan Josh..."
}
```

### `POST /analyze`
**Auth:** `authenticateAdmin`
**Body:** `{ "dateRange": { "start": "2026-04-01", "end": "2026-04-13" } }`
**Response:** Markdown-formatted business analysis from Groq

---

## 6. Public — `/api/public`

### `GET /menu/:slug`
**Auth:** None
**Response:** Full menu with categories and available items for a restaurant slug

### `GET /config`
**Auth:** None
**Response:** Platform-wide configuration (maintenance mode, announcements, feature flags)

---

## 7. Super Admin — `/api/superadmin`

### `GET /stats`
**Auth:** `authenticateSuperAdmin`
**Response:** Platform-wide statistics (total restaurants, users, orders)

### `GET /restaurants`
**Auth:** `authenticateSuperAdmin`
**Response:** List of all onboarded restaurants with status

### `PATCH /restaurants/:restaurantId/status`
**Auth:** `authenticateSuperAdmin`
**Body:** `{ "status": "active" | "inactive" }`

### `GET /config`
**Auth:** `authenticateSuperAdmin`
**Response:** GlobalConfig singleton document

### `PATCH /config`
**Auth:** `authenticateSuperAdmin`
**Body:** Partial update to GlobalConfig (maintenance, announcements, features)

### `POST /generate-broadcast`
**Auth:** `authenticateSuperAdmin`
**Body:**
```json
{ "context": "Server upgrade tonight", "type": "warning", "target": "owners" }
```
**Response:** AI-generated professional broadcast message

---

## 8. Coupons — `/api/restaurant/coupons`

### `POST /`
**Auth:** `authenticateAdmin`
**Body:**
```json
{
  "code": "FEAST20",
  "discountType": "percentage",
  "value": 20,
  "minOrderAmount": 500,
  "maxDiscountAmount": 200,
  "expiryDate": "2026-05-01",
  "maxUses": 100
}
```

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "message": "Human-readable error description",
  "error": "Technical detail (development mode only)"
}
```

**Standard HTTP Status Codes:**
| Code | Meaning |
| :--- | :--- |
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation) |
| `401` | Unauthorized (missing/expired token) |
| `403` | Forbidden (wrong role) |
| `404` | Resource not found |
| `500` | Internal server error |

---

*All endpoints and response shapes are sourced directly from the DineOS controller implementations.*

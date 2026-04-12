# DineOS — Frontend State Management & Hooks Reference

> **Classification:** Internal Engineering Reference
> **Store:** Redux Toolkit 2.11 | **Slices:** 4 | **Custom Hooks:** 6
> **Configured in:** `frontend/src/store/store.ts`

---

## 1. Store Configuration

```typescript
// store.ts
const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurant: restaurantReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/verifyOTP/fulfilled'],
        ignoredPaths: ['auth.lastVerifiedAt']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 2. Auth Slice — `authSlice.ts`

> **File:** `frontend/src/store/slices/authSlice.ts` (547 lines)
> **Purpose:** User identity, authentication flow, OTP lifecycle, token management

### State Shape

```typescript
interface AuthState {
  user: User | null;           // Current authenticated user
  accessToken: string | null;  // JWT access token
  refreshToken: string | null; // JWT refresh token
  isAuthenticated: boolean;    // Derived auth status
  loading: boolean;            // Any async operation in progress
  otpSent: boolean;            // OTP send lifecycle flag
  otpPhone: string | null;     // Phone number OTP was sent to
  demoOTP: string | null;      // Dev-mode OTP (auto-fill)
  error: string | null;        // Last error message
}
```

### User Interface

```typescript
interface User {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone: string;
  role: 'admin' | 'customer' | 'superadmin' | 'waiter' | 'chef';
  restaurantId?: string;
  loyaltyPoints?: number;
  profileComplete?: boolean;
  onDuty?: boolean;
  assignedTables?: number[];
  staffColor?: string;
  createdAt?: string;
}
```

### Async Thunks (10)

| Thunk | Purpose | Dispatched From |
| :--- | :--- | :--- |
| `sendOTP(phone)` | Send OTP to admin phone | `LoginPage` |
| `sendStaffOTP(phone)` | Send OTP to staff phone (pre-registration required) | `StaffLoginPage` |
| `verifyOTP({ phone, otp })` | Verify OTP → receive JWT tokens + user | `LoginPage`, `StaffLoginPage` |
| `verifyFirebaseToken({ idToken })` | Exchange Firebase token → local JWT | `LoginPage` (Firebase flow) |
| `refreshAccessToken(refreshToken)` | Rotate access/refresh pair | `api.ts` interceptor (automatic) |
| `superAdminLogin({ email, password })` | SuperAdmin email/password login | `SuperAdminLoginPage` |
| `updateAdminProfile({ name, email, phone })` | Update admin profile fields | `AdminPage` |
| `changeSuperAdminPassword({ current, new })` | Change SuperAdmin password | `SuperAdminProfilePage` |
| `toggleDutyStatus()` | Toggle staff on/off duty | `ChefDashboard`, `WaiterDashboard` |
| `logout()` | Server-side logout + clear tokens | Global (Navbar, Sidebar) |

### Sync Reducers (3)

| Reducer | Purpose |
| :--- | :--- |
| `clearError` | Reset `error` to null |
| `resetAuth` | Full state reset + localStorage clear |
| `resetOTPSent` | Reset OTP flow flags |

### Cross-slice Impact

When `logout.fulfilled` or `logout.rejected` fires:
- `cartSlice` → clears all items, removes `dineOS_cart` from localStorage
- `restaurantSlice` → resets `currentRestaurant` to null
- `orderSlice` → no explicit matcher (orders re-fetched on next page load)

When `verifyOTP.pending` or `verifyFirebaseToken.pending` fires:
- `cartSlice` → clears cart (prevents stale data from previous session)
- `restaurantSlice` → resets restaurant (forces fresh fetch on dashboard)

### Token Persistence

```
Login Success → tokens stored in localStorage
                ├── localStorage.setItem('accessToken', ...)
                └── localStorage.setItem('refreshToken', ...)

App Load → initialState reads from localStorage
           ├── accessToken: localStorage.getItem('accessToken')
           └── isAuthenticated: !!localStorage.getItem('accessToken')
```

---

## 3. Cart Slice — `cartSlice.ts`

> **File:** `frontend/src/store/slices/cartSlice.ts` (228 lines)
> **Purpose:** Shopping cart state with localStorage synchronization

### State Shape

```typescript
interface CartState {
  items: CartItem[];       // Array of cart items
  tableNo?: number;        // Customer's table number
  sessionId?: string;      // Guest session reference
  subtotal: number;        // Sum of item totals
  taxAmount: number;       // 5% CGST/SGST
  total: number;           // subtotal + taxAmount
  lastUpdated: number;     // Timestamp of last modification
}

interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  customizations?: { [key: string]: string };
}
```

### Tax Calculation

```typescript
const TAX_RATE = 0.05; // 5% (CGST/SGST for India)

const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total }; // All rounded to 2 decimals
};
```

### Sync Reducers (8)

| Reducer | Purpose |
| :--- | :--- |
| `addItem(CartItem)` | Add item or increment quantity if exists |
| `removeItem(itemId)` | Remove item completely |
| `updateQuantity({ itemId, quantity })` | Set exact quantity (0 → remove) |
| `clearCart()` | Empty entire cart |
| `setTableNo(number)` | Set table number |
| `setSessionId(string)` | Set guest session ID |
| `updateItemCustomizations({ itemId, customizations })` | Special instructions |
| `restoreCart(CartState)` | Restore from saved state |

### localStorage Sync

Every mutation calls `saveCartToStorage(state)`:

```typescript
// Persisted under key: 'dineOS_cart'
localStorage.setItem('dineOS_cart', JSON.stringify(state));

// Loaded on slice initialization
initialState: loadCartFromStorage()
```

### Auto-clear Behavior

The cart uses `addMatcher` to auto-clear on auth transitions:
- `logout.fulfilled` → clear cart, remove localStorage key
- `logout.rejected` → clear cart (even failed logout clears client state)
- `verifyOTP.pending` → clear cart (new login = clean slate)
- `verifyFirebaseToken.pending` → clear cart

---

## 4. Restaurant Slice — `restaurantSlice.ts`

> **File:** `frontend/src/store/slices/restaurantSlice.ts` (354 lines)
> **Purpose:** Current tenant profile (admin-side) and public restaurant data (customer-side)

### State Shape

```typescript
interface RestaurantState {
  currentRestaurant: Restaurant | null; // Authenticated admin's restaurant
  publicRestaurant: Restaurant | null;  // Customer-facing data (loaded by slug)
  loading: boolean;
  error: string | null;
  lastFetched: string | null;           // ISO timestamp of last profile fetch
}
```

### Restaurant Interface

```typescript
interface Restaurant {
  _id?: string;
  name: string;
  slug: string;
  ownerId?: string;
  logoUrl?: string;
  themeColor?: string;           // Default: '#ff9500'
  currency?: string;             // Default: 'INR'
  tablesCount?: number;
  autoPilot?: boolean;
  isActive?: boolean;
  isPremium?: boolean;
  subscriptionExpiresAt?: string;
  trialActivatedAt?: string;
  loyaltySettings?: {
    enabled: boolean;
    earnRate: number;
    redeemRate: number;
    minPointsToRedeem: number;
    maxRedemptionPercentage: number;
  };
}
```

### Async Thunks (6)

| Thunk | Purpose |
| :--- | :--- |
| `fetchRestaurantProfile()` | Load current admin's restaurant |
| `updateRestaurantProfile(updates)` | Update restaurant settings |
| `setupRestaurant({ name, slug, ... })` | Initial restaurant creation |
| `deleteRestaurant(restaurantId)` | Delete restaurant + cascade |
| `upgradeToPremium()` | Mock premium upgrade |
| `fetchRestaurantBySlug(slug)` | Public restaurant lookup (customer side) |

### Dual State Pattern

```
Admin Login → fetchRestaurantProfile() → state.currentRestaurant

Customer QR Scan → fetchRestaurantBySlug('tandoori-palace') → state.publicRestaurant
```

This separation ensures admin and customer contexts never bleed into each other.

---

## 5. Order Slice — `orderSlice.ts`

> **File:** `frontend/src/store/slices/orderSlice.ts` (200 lines)
> **Purpose:** Order list, status management, analytics aggregation

### State Shape

```typescript
interface OrderState {
  orders: Order[];           // List of orders
  stats: OrderStats | null;  // Aggregated statistics
  loading: boolean;
  error: string | null;
}

interface Order {
  _id: string;
  orderNumber: string;
  tableNo: number | string;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  items: OrderItem[];
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  pointsEarned?: number;
  pointsRedeemed?: number;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  orderedAt: string;
  customerId?: { _id: string; name: string; phone: string } | null;
}

interface OrderStats {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalTax: number;
    averageOrderValue: number;
    completedOrders: number;
  };
  byStatus: Array<{ _id: string; count: number; revenue: number }>;
  byHour: Array<{ _id: number; count: number; revenue: number }>;
  topItems: Array<{ _id: string; count: number; revenue: number }>;
}
```

### Async Thunks (3)

| Thunk | Purpose |
| :--- | :--- |
| `fetchOrders(filters)` | Fetch orders with status/date/search filters |
| `updateOrderStatus({ orderId, status })` | Transition order status |
| `fetchOrderStats(dateRange)` | Aggregated analytics data |

### Socket-Driven Sync Reducers (3)

These reducers are dispatched by Socket.io event handlers, not by user actions:

| Reducer | Trigger | Purpose |
| :--- | :--- | :--- |
| `addNewOrder(order)` | `socket.on('new-order')` | Prepend to order list + update stats counter |
| `updateExistingOrder(order)` | `socket.on('order-status-update')` | Update order status in-place |
| `clearOrderError()` | Manual | Reset error state |

### Real-time + REST Hybrid

```
Initial Load:  fetchOrders() via REST → populates state.orders
Live Updates:  socket.on('new-order') → addNewOrder() → prepends to state.orders
Status Changes: socket.on('order-status-update') → updateExistingOrder() → patches in-place
```

---

## 6. Custom Hooks

### `useRedux()` — Composite Store Hook

> **File:** `frontend/src/hooks/useRedux.ts`

```typescript
export const useRedux = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const state = useAppSelector((state) => state);

  return { dispatch, auth, state };
};
```

**Usage:**
```typescript
const { dispatch, auth } = useRedux();
// Instead of:
// const dispatch = useDispatch<AppDispatch>();
// const auth = useSelector((state: RootState) => state.auth);
```

### `useAppDispatch()` — Typed Dispatch

```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>();
```

### `useAppSelector` — Typed Selector

```typescript
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### `useAPIError()` — Standardized Error Handling

> **File:** `frontend/src/hooks/useAPIError.ts`

```typescript
export const useAPIError = () => {
  const handleError = useCallback((error: unknown): APIError => {
    if (error instanceof AxiosError) {
      return {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'An unexpected error occurred' };
  }, []);

  const getErrorMessage = useCallback((error: unknown): string => {
    return handleError(error).message;
  }, [handleError]);

  return { handleError, getErrorMessage };
};
```

**Usage:**
```typescript
const { getErrorMessage } = useAPIError();
try {
  await dispatch(fetchOrders({})).unwrap();
} catch (err) {
  toast.error(getErrorMessage(err));
}
```

### `useCart()` — Cart Operations

> **File:** `frontend/src/hooks/useCart.ts`

Abstracts cart dispatch operations into a clean interface.

### `useTabTitle()` — Dynamic Page Titles

> **File:** `frontend/src/hooks/useTabTitle.ts`

Sets `document.title` based on the current page context.

---

## 7. Data Flow Patterns

### Pattern 1: REST → Redux (Standard)

```
Component Mount → useEffect → dispatch(fetchOrders()) → Redux → re-render
```

### Pattern 2: Socket.io → Redux (Real-time)

```
Socket Event → socket.on('new-order', (order) => dispatch(addNewOrder(order))) → Redux → re-render
```

### Pattern 3: Axios Interceptor → Redux (Auto-refresh)

```
API 401 Error → Interceptor → dispatch(refreshAccessToken()) → Retry original request
               ↓ (if refresh fails)
               dispatch(resetAuth()) → redirect to /login
```

### Pattern 4: Cross-slice State Reset (Auth Transition)

```
dispatch(logout()) → authSlice: clear user/tokens
                   → cartSlice: clear items + localStorage
                   → restaurantSlice: clear currentRestaurant
```

---

*All state shapes, thunk signatures, and reducer implementations are sourced from `frontend/src/store/`.*

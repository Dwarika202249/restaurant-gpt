# DineOS — Real-time Engine & Socket.io Reference

> **Classification:** Internal Engineering Reference
> **Protocol:** WebSocket (Socket.io 4.8)
> **Backend Service:** `backend/src/services/socketService.js` (99 lines)
> **Frontend Service:** `frontend/src/services/socket.ts` (103 lines)

---

## 1. Architecture Overview

DineOS uses Socket.io for **bidirectional real-time communication** between the server and all connected clients. The architecture follows a **room-based event routing** model where events are surgically delivered only to the relevant audience.

```
                        Socket.io Server
                    ┌───────────────────────┐
                    │   HTTP Server (Node)  │
                    │   + Socket.io Layer   │
                    └───────────┬───────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
    ┌───────┴───────┐  ┌───────┴───────┐  ┌───────┴───────┐
    │ Admin Client  │  │ Staff Client  │  │Customer Client│
    │ (Restaurant   │  │ (Kitchen +    │  │ (Table Room)  │
    │  Room)        │  │  User Room)   │  │               │
    └───────────────┘  └───────────────┘  └───────────────┘
```

---

## 2. Room Topology

Every connected socket joins one or more **rooms** based on their role. Events emitted to a room are received only by sockets in that room.

### Room Types

| Room Format | Example | Who Joins | Purpose |
| :--- | :--- | :--- | :--- |
| `<restaurantId>` | `60f4a3b2c1d2e3f4a5b6c7d8` | Admin, all staff | Global restaurant events |
| `kitchen_<restaurantId>` | `kitchen_60f4a3...` | Chefs only | Kitchen-specific order events |
| `user_<userId>` | `user_60f5b4c3...` | Individual staff member | Personal targeted notifications |
| `table_<restaurantId>_<tableNo>` | `table_60f4a3..._5` | Customer at table 5 | Order status updates for that table |

### Room Join Events (Client → Server)

| Event | Payload | Who Emits | Room(s) Joined |
| :--- | :--- | :--- | :--- |
| `join-restaurant` | `restaurantId` | Admin | `<restaurantId>` |
| `join-staff` | `{ restaurantId, userId, role }` | Chef / Waiter | `<restaurantId>` + `user_<userId>` + (if chef: `kitchen_<restaurantId>`) |
| `join-table` | `{ restaurantId, tableNo }` | Customer | `table_<restaurantId>_<tableNo>` |

---

## 3. Server-side Implementation

### 3.1 Initialization

```javascript
// server.js
const http = require('http');
const socketService = require('./src/services/socketService');

const httpServer = http.createServer(app);
socketService.init(httpServer);  // Bind Socket.io to HTTP server

httpServer.listen(PORT);
```

### 3.2 Connection Handling

```javascript
// socketService.js — init()
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Admin joining their restaurant's global channel
  socket.on('join-restaurant', (restaurantId) => {
    socket.join(restaurantId.toString());
  });

  // Staff joining personal + role-specific channels
  socket.on('join-staff', ({ restaurantId, userId, role }) => {
    socket.join(restaurantId.toString());          // Restaurant room
    socket.join(`user_${userId.toString()}`);       // Personal room
    if (role === 'chef') {
      socket.join(`kitchen_${restaurantId.toString()}`);  // Kitchen room
    }
  });

  // Customer joining their table's channel
  socket.on('join-table', ({ restaurantId, tableNo }) => {
    socket.join(`table_${restaurantId.toString()}_${tableNo.toString()}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
```

### 3.3 Emission Functions (Server → Client)

| Function | Target Room | Use Case |
| :--- | :--- | :--- |
| `emitToRestaurant(restaurantId, event, data)` | `<restaurantId>` | New orders, table status changes |
| `emitToKitchen(restaurantId, event, data)` | `kitchen_<restaurantId>` | Order assignments for chefs |
| `emitToUser(userId, event, data)` | `user_<userId>` | Targeted waiter notifications |
| `emitToTable(restaurantId, tableNo, event, data)` | `table_<restaurantId>_<tableNo>` | Customer order status updates |

### 3.4 Event Emission Points (in Controllers)

```javascript
// orderController.js — On new order creation
socketService.emitToRestaurant(restaurantId, 'new-order', orderData);
socketService.emitToKitchen(restaurantId, 'new-order', orderData);

// orderController.js — On status change
socketService.emitToRestaurant(restaurantId, 'order-status-update', updatedOrder);
socketService.emitToTable(restaurantId, tableNo, 'order-status-update', updatedOrder);

// tableController.js — On table status change
socketService.emitToRestaurant(restaurantId, 'table-status-change', tableData);
```

---

## 4. Client-side Implementation

### 4.1 SocketService Class

```typescript
// frontend/src/services/socket.ts
class SocketService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;
  private currentJoinParams: { type: string, data: any } | null = null;

  connect() { /* ... */ }
  disconnect() { /* ... */ }
  getSocket() { return this.socket; }
  joinStaffChannel(restaurantId, userId, role) { /* ... */ }
  joinTableChannel(restaurantId, tableNo) { /* ... */ }
  joinRestaurantChannel(restaurantId) { /* ... */ }
}

export const socketService = new SocketService();  // Singleton
```

### 4.2 Connection Configuration

```typescript
this.socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],  // Prefer WebSocket, fallback to polling
  reconnectionAttempts: 10,               // Max retry count
  reconnectionDelay: 1000,                // Start delay (1 second)
  reconnectionDelayMax: 5000,             // Max delay (5 seconds)
  randomizationFactor: 0.5,              // Jitter factor
});
```

### 4.3 Auto-Reconnection & Room Re-joining

The client stores the last join parameters. On reconnection, it automatically re-joins the appropriate room:

```typescript
this.socket.on('connect', () => {
  // Re-join previous channel if we were connected before
  if (this.currentJoinParams) {
    const { type, data } = this.currentJoinParams;
    if (type === 'staff') this.socket?.emit('join-staff', data);
    if (type === 'table') this.socket?.emit('join-table', data);
    if (type === 'restaurant') this.socket?.emit('join-restaurant', data);
  }
});
```

### 4.4 URL Resolution

```typescript
// Socket.io connects to the server root, not /api
const SOCKET_URL = VITE_API_URL.replace('/api', '') || 'http://localhost:5000';
```

---

## 5. Event Reference

### Events Emitted by Server

| Event | Room(s) | Data Shape | Consumer |
| :--- | :--- | :--- | :--- |
| `new-order` | Restaurant + Kitchen | Full order object | Admin Dashboard, Chef KDS |
| `order-status-update` | Restaurant + Table | Updated order object | Admin, Waiter, Customer |
| `table-status-change` | Restaurant | `{ tableNo, status }` | Admin Dashboard |

### Events Emitted by Client

| Event | Data Shape | Purpose |
| :--- | :--- | :--- |
| `join-restaurant` | `restaurantId` | Admin subscribes to restaurant events |
| `join-staff` | `{ restaurantId, userId, role }` | Staff subscribes to relevant channels |
| `join-table` | `{ restaurantId, tableNo }` | Customer subscribes to table updates |

---

## 6. Integration with Redux

Socket events are bridged to Redux through event listeners set up in page components:

```typescript
// Example: ChefDashboard.tsx
useEffect(() => {
  const socket = socketService.getSocket();
  
  socket?.on('new-order', (order) => {
    dispatch(addNewOrder(order));     // Prepends to state.orders
  });

  socket?.on('order-status-update', (order) => {
    dispatch(updateExistingOrder(order));  // Patches in-place
  });

  return () => {
    socket?.off('new-order');
    socket?.off('order-status-update');
  };
}, []);
```

### Data Flow

```
Server emits event
  → Socket.io Client receives
    → Component event handler dispatches Redux action
      → Redux state updates
        → React re-renders
          → UI reflects real-time change
```

---

## 7. CORS Configuration

```javascript
// socketService.js — Server-side
io = require('socket.io')(httpServer, {
  cors: {
    origin: '*',              // TODO: Restrict in production to FRONTEND_URL
    methods: ['GET', 'POST']
  }
});
```

> **⚠️ Production TODO:** Replace `origin: '*'` with the configured `FRONTEND_URL` environment variable.

---

## 8. Connection Lifecycle

```
App Load → socketService.connect()
         → WebSocket handshake with server
         → 'connect' event fired
         → Join appropriate room based on user role
         
During Session:
         → Server emits events to rooms
         → Client receives and dispatches to Redux
         
Disconnect (network issue):
         → 'disconnect' event fired
         → Auto-reconnection starts (up to 10 attempts)
         → On reconnect: 'connect' event → auto re-join rooms
         
App Close / Logout:
         → socketService.disconnect()
         → Socket destroyed, rooms left automatically
```

---

## 9. Scaling Considerations

Current architecture uses a **single-process Socket.io server**. For horizontal scaling:

| Concern | Current | Future |
| :--- | :--- | :--- |
| **Process count** | Single Node.js process | Multiple processes behind load balancer |
| **Room state** | In-memory (single process) | Redis adapter (`@socket.io/redis-adapter`) |
| **Sticky sessions** | Not needed | Required for polling transport |
| **Connection limit** | ~10K per process | Scale with adapter + processes |

---

*All Socket.io configurations, room logic, and event patterns are sourced from `socketService.js` and `socket.ts`.*

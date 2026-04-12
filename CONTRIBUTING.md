# Contributing to DineOS 🛠️

Welcome to the **DineOS** ecosystem! We are building the next generation of multi-tenant restaurant intelligence. As a contributor, you are expected to uphold the highest engineering standards to ensure the stability, scalability, and security of our SaaS platform.

---

## 🏗️ Code Philosophy

DineOS is built on three core pillars:
1. **Clean Code**: We follow SOLID principles. Every function should do one thing and do it well.
2. **Modular Components**: We utilize the **Atomic Design** methodology (Atoms → Molecules → Organisms → Templates → Pages). Components must be decoupled and reusable.
3. **Strict TypeScript**: No `any`. Ever. Every interface and type must be explicitly defined to maintain the structural integrity of our multi-tenant architecture.

---

## 🔄 Development Workflow

### **Branch Naming Convention**
We use a structured branching model. Please name your branches using the following prefixes:
- `feat/`: New features or enhancements (e.g., `feat/whatsapp-integration`).
- `fix/`: Bug fixes (e.g., `fix/kds-socket-latency`).
- `refactor/`: Code improvements without functional changes.
- `docs/`: Documentation updates.

### **The Pull Request (PR) Process**
1. **Self-Review**: Ensure your code is linted and passes all local tests.
2. **Description**: Your PR must include a clear description of the "What" and the "Why".
3. **Architectural Review**: Every PR is subject to a review for multi-tenant safety. Any query missing a `restaurantId` filter will be automatically rejected.
4. **CI Checks**: Ensure all GitHub Actions (linting, build, tests) passed.

---

## 📦 State Management Standards

We use **Redux Toolkit** for predictable state transitions. To maintain consistency, follow these rules:

- **Slices**: Keep slices focused. Avoid mixing UI state with domain logic.
- **Hooks**: Never use `useDispatch` or `useSelector` directly.
    - Use `useAppDispatch` and `useAppSelector` from `useRedux.ts`.
    - Better yet, use the `useRedux()` composite hook to access common state slices like `auth` and `dispatch` in a single line.

```typescript
// Example Implementation
const { dispatch, auth } = useRedux();
```

---

## 🌐 API & Communications

### **Axios Services**
All API calls must be abstracted into service files (e.g., `api.ts`). Use the pre-configured axios instance that handles authentication headers automatically.

### **Error Handling**
Consistency in error reporting is critical. Use the `useAPIError` hook for standardized toast notifications and logging:
```typescript
const { handleError } = useAPIError();
// ... inside catch block
handleError(error, "Failed to update menu item");
```

---

## 🎨 Styling & UI

- **Utility-First**: We strictly adhere to **Tailwind CSS**. Avoid writing custom CSS in `.css` or `.scss` files unless absolutely necessary.
- **Design Tokens**: Use our established theme palette. The primary orange theme and glassmorphic effects should be consistent across all modules.
- **Atomic Classes**: Group related utility classes logically (Layout → Spacing → Typography → Effects).

---

## 🗄️ Database & Multi-Tenancy

DineOS uses a strict logical isolation model. 

### **The Multi-tenant Golden Rule**
Every database interaction **MUST** be scoped to a `restaurantId`. 
- **Models**: Ensure your Mongoose schemas include a `ref: 'Restaurant'` field.
- **Middleware**: Use the `tenantContext` middleware to automatically inject the correct context into `req.restaurantId`.
- **Querying**: Always use the `buildRestaurantFilter` utility to append isolation filters to your queries.

```javascript
// Correct Query Pattern
const filter = buildRestaurantFilter(req.restaurantId, { status: 'new' });
const pendingOrders = await Order.find(filter);
```

---

## 🤝 Getting Help

If you're stuck or have architectural questions, please:
1. Check the existing documentation in `/mdfiles`.
2. Open a Discussion on GitHub.
3. Reach out to the core engineering team.

*Thank you for helping us build the future of dining!*

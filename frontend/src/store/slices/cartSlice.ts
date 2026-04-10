import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logout, verifyFirebaseToken, verifyOTP } from './authSlice';

// Types for cart items
export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  customizations?: {
    [key: string]: string;
  };
}

export interface CartState {
  items: CartItem[];
  tableNo?: number;
  sessionId?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  lastUpdated: number;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  taxAmount: 0,
  total: 0,
  lastUpdated: Date.now(),
};

// Tax rate constant (e.g., 5% for CGST/SGST in India)
const TAX_RATE = 0.05;

/**
 * Calculate totals based on items
 */
const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

/**
 * Load cart from localStorage
 */
const loadCartFromStorage = (): CartState => {
  try {
    const stored = localStorage.getItem('dineOS_cart');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load cart from localStorage:', error);
  }
  return initialState;
};

/**
 * Save cart to localStorage
 */
const saveCartToStorage = (state: CartState) => {
  try {
    localStorage.setItem('dineOS_cart', JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error);
  }
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    /**
     * Add item to cart or increase quantity if exists
     */
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find((item) => item.itemId === action.payload.itemId);

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.taxAmount = totals.taxAmount;
      state.total = totals.total;
      state.lastUpdated = Date.now();

      saveCartToStorage(state);
    },

    /**
     * Remove item from cart completely
     */
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.itemId !== action.payload);

      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.taxAmount = totals.taxAmount;
      state.total = totals.total;
      state.lastUpdated = Date.now();

      saveCartToStorage(state);
    },

    /**
     * Update quantity of item in cart
     */
    updateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const item = state.items.find((item) => item.itemId === action.payload.itemId);

      if (item) {
        if (action.payload.quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter((item) => item.itemId !== action.payload.itemId);
        } else {
          item.quantity = action.payload.quantity;
        }

        const totals = calculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.taxAmount = totals.taxAmount;
        state.total = totals.total;
        state.lastUpdated = Date.now();

        saveCartToStorage(state);
      }
    },

    /**
     * Clear entire cart
     */
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.taxAmount = 0;
      state.total = 0;
      state.tableNo = undefined;
      state.sessionId = undefined;
      state.lastUpdated = Date.now();

      saveCartToStorage(state);
    },

    /**
     * Set table number for the cart
     */
    setTableNo: (state, action: PayloadAction<number>) => {
      state.tableNo = action.payload;
      state.lastUpdated = Date.now();
      saveCartToStorage(state);
    },

    /**
     * Set session ID for guest customers
     */
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
      state.lastUpdated = Date.now();
      saveCartToStorage(state);
    },

    /**
     * Update customizations for a cart item
     */
    updateItemCustomizations: (
      state,
      action: PayloadAction<{ itemId: string; customizations: { [key: string]: string } }>
    ) => {
      const item = state.items.find((item) => item.itemId === action.payload.itemId);
      if (item) {
        item.customizations = action.payload.customizations;
        state.lastUpdated = Date.now();
        saveCartToStorage(state);
      }
    },

    /**
     * Restore cart from a saved state (e.g., from API)
     */
    restoreCart: (state, action: PayloadAction<CartState>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    // Clear cart on logout/new session
    builder.addMatcher(
      (action) => [logout.fulfilled.type, logout.rejected.type, verifyOTP.pending.type, verifyFirebaseToken.pending.type].includes(action.type),
      (state) => {
        state.items = [];
        state.subtotal = 0;
        state.taxAmount = 0;
        state.total = 0;
        state.tableNo = undefined;
        state.sessionId = undefined;
        state.lastUpdated = Date.now();
        localStorage.removeItem('dineOS_cart');
      }
    );
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setTableNo,
  setSessionId,
  updateItemCustomizations,
  restoreCart,
} = cartSlice.actions;

export default cartSlice.reducer;

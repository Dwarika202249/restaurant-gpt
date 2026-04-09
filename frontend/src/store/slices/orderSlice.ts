import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../store';
import { VITE_API_URL } from '@/config/env';

const API_URL = VITE_API_URL;

// Type definitions
export interface OrderItem {
  itemId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  itemTotal: number;
  customizations?: Array<{ key: string; value: string }>;
}

export interface Order {
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
  customerId?: {
    _id: string;
    name: string;
    phone: string;
  } | null;
}

export interface OrderStatsSummary {
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  averageOrderValue: number;
  completedOrders: number;
}

export interface OrderStats {
  summary: OrderStatsSummary;
  byStatus: Array<{ _id: string; count: number; revenue: number }>;
  byHour: Array<{ _id: number; count: number; revenue: number }>;
  topItems: Array<{ _id: string; count: number; revenue: number }>;
}

interface OrderState {
  orders: Order[];
  stats: OrderStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  stats: null,
  loading: false,
  error: null,
};

/**
 * Thunk to fetch orders with status filter
 */
export const fetchOrders = createAsyncThunk<
  Order[],
  { status?: string; limit?: number; date?: string; startDate?: string; endDate?: string; searchTerm?: string; paymentStatus?: string },
  { state: RootState }
>('orders/fetchAll', async (filters, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const response = await axios.get(`${API_URL}/orders`, {
      params: filters,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    return response.data.data.orders;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
  }
});

/**
 * Thunk to update order status
 */
export const updateOrderStatus = createAsyncThunk<
  Order,
  { orderId: string; status: string },
  { state: RootState }
>('orders/updateStatus', async ({ orderId, status }, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${auth.accessToken}` } }
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
  }
});

/**
 * Thunk to fetch order statistics
 */
export const fetchOrderStats = createAsyncThunk<
  OrderStats,
  { dateRange?: string; startDate?: string; endDate?: string },
  { state: RootState }
>('orders/fetchStats', async (params, { rejectWithValue, getState }) => {
  try {
    const { auth } = getState();
    const response = await axios.get(`${API_URL}/orders/stats`, {
      params,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    addNewOrder: (state, action) => {
      // Check if order already exists to prevent duplicates
      const exists = state.orders.find(o => o._id === action.payload._id);
      if (!exists) {
        state.orders = [action.payload, ...state.orders];
        
        // Update basic stats if they exist
        if (state.stats) {
          state.stats.summary.totalOrders += 1;
          state.stats.summary.totalRevenue += action.payload.total;
        }
      }
    },
    updateExistingOrder: (state, action) => {
      const index = state.orders.findIndex((o) => o._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Status
    builder
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });

    // Fetch Stats
    builder
      .addCase(fetchOrderStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderError, addNewOrder, updateExistingOrder } = orderSlice.actions;
export default orderSlice.reducer;

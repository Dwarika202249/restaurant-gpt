import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import store from '../store/store';
import { refreshAccessToken, resetAuth } from '../store/slices/authSlice';
import { VITE_API_URL } from '../config/env';

// Create axios instance with base URL
const apiClient: AxiosInstance = axios.create({
  baseURL: VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor - attach auth token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle 401 and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    // Always get the latest refresh token from localStorage
    const refreshToken = localStorage.getItem('refreshToken');

    // If 401 and we have a refresh token, try to refresh
    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Dispatch refresh token action
        const result = await store.dispatch(
          refreshAccessToken(refreshToken)
        );

        if (result.payload && 'accessToken' in result.payload) {
          // Retry original request with new token
          const newToken = result.payload.accessToken;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        store.dispatch(resetAuth());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For 403, also trigger logout
    if (error.response?.status === 403) {
      store.dispatch(resetAuth());
    }

    return Promise.reject(error);
  }
);

/**
 * API endpoints object for type safety and convenience
 */
export const API = {
  // Auth endpoints
  auth: {
    sendOTP: (phone: string) =>
      apiClient.post('/auth/admin/send-otp', { phone }),
    verifyOTP: (phone: string, otp: string) =>
      apiClient.post('/auth/admin/verify-otp', { phone, otp }),
    refresh: (refreshToken: string) =>
      apiClient.post('/auth/admin/refresh', { refreshToken }),
    logout: (refreshToken: string) =>
      apiClient.post('/auth/admin/logout', { refreshToken }),
    generateGuestSession: (restaurantSlug: string, tableNo: number) =>
      apiClient.post('/auth/guest-session', { restaurantSlug, tableNo })
  },

  // Restaurant endpoints
  restaurant: {
    getProfile: () => apiClient.get('/restaurant/profile'),
    updateProfile: (data: any) => apiClient.put('/restaurant/profile', data),
    setup: (data: any) => apiClient.post('/restaurant/setup', data),
    delete: (restaurantId: string) =>
      apiClient.delete(`/restaurant/${restaurantId}`),
    getBySlug: (slug: string) => apiClient.get(`/restaurant/public/${slug}`)
  },

  // Menu endpoints (for future use)
  menu: {
    getByRestaurant: (restaurantId: string) =>
      apiClient.get(`/menu/${restaurantId}`),
    addCategory: (data: any) => apiClient.post('/menu/category', data),
    updateCategory: (id: string, data: any) =>
      apiClient.put(`/menu/category/${id}`, data),
    deleteCategory: (id: string) => apiClient.delete(`/menu/category/${id}`),
    addItem: (data: any) => apiClient.post('/menu/item', data),
    updateItem: (id: string, data: any) =>
      apiClient.put(`/menu/item/${id}`, data),
    deleteItem: (id: string) => apiClient.delete(`/menu/item/${id}`),
    updateItemAvailability: (id: string, isAvailable: boolean) =>
      apiClient.patch(`/menu/item/${id}/availability`, { isAvailable })
  },

  // Public menu endpoints
  publicMenu: {
    getBySlug: (slug: string) => apiClient.get(`/public/menu/${slug}`),
    getItemById: (itemId: string) => apiClient.get(`/public/item/${itemId}`)
  },

  // Order endpoints (for future use)
  orders: {
    list: (filters?: any) =>
      apiClient.get('/orders', { params: filters }),
    getById: (orderId: string) => apiClient.get(`/orders/${orderId}`),
    updateStatus: (orderId: string, status: string) =>
      apiClient.patch(`/orders/${orderId}/status`, { status }),
    getStats: (dateRange?: string) =>
      apiClient.get('/orders/stats', { params: { dateRange } }),
    create: (data: any) => apiClient.post('/orders/create', data),
    getStatus: (orderId: string) => apiClient.get(`/orders/${orderId}/status`)
  },

  // AI endpoints (for future use)
  ai: {
    chat: (data: any) => apiClient.post('/ai/chat', data),
    analyze: (data: any) => apiClient.post('/ai/analyze', data),
    getConversation: (sessionId: string) =>
      apiClient.get(`/ai/conversation/${sessionId}`)
  },

  // Payment endpoints (for future use)
  payment: {
    createOrder: (data: any) => apiClient.post('/payment/create-order', data),
    verify: (data: any) => apiClient.post('/payment/verify', data),
    webhook: (data: any) => apiClient.post('/payment/webhook', data)
  },

  // QR endpoints (for future use)
  qr: {
    generate: (restaurantId: string, tableCount: number) =>
      apiClient.post('/qr/generate', { restaurantId, tableCount }),
    downloadByTable: (tableNo: number) =>
      apiClient.get(`/qr/download/${tableNo}`),
    downloadAll: () => apiClient.get('/qr/download-all')
  },

  // Public/Global endpoints
  public: {
    getConfig: () => apiClient.get('/public/config')
  },

  // SuperAdmin endpoints
  superAdmin: {
    login: (credentials: any) => apiClient.post('/auth/superadmin/login', credentials),
    signup: (data: any) => apiClient.post('/auth/superadmin/signup', data),
    getStats: () => apiClient.get('/superadmin/stats'),
    getRestaurants: () => apiClient.get('/superadmin/restaurants'),
    toggleStatus: (restaurantId: string, status: 'active' | 'inactive') => 
      apiClient.patch(`/superadmin/restaurants/${restaurantId}/status`, { status }),
    getSubscribers: () => apiClient.get('/superadmin/subscribers'),
    getGlobalConfig: () => apiClient.get('/superadmin/config'),
    updateGlobalConfig: (data: any) => apiClient.patch('/superadmin/config', data),
    generateAIBroadcast: (data: { context: string, type: string, target: string }) => 
      apiClient.post('/superadmin/generate-broadcast', data)
  }
};

export const superAdminApi = API.superAdmin;
export default apiClient;

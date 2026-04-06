/**
 * DineOS Frontend Environment Configuration
 * 
 * Centralized source of truth for all API and Socket URLs.
 * In development, these default to localhost. In production, 
 * they must be set via Netlify environment variables.
 */

// Basic API URL (e.g., https://api.dineos.app/api)
export const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Socket.io Base URL (e.g., https://api.dineos.app)
// We derive this from VITE_API_URL if not explicitly provided
export const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  import.meta.env.VITE_API_URL?.replace('/api', '') || 
  'http://localhost:5000';

// Razorpay Key for payments
export const VITE_RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || '';

// Export as a single object for convenience
const env = {
  apiUrl: VITE_API_URL,
  socketUrl: VITE_SOCKET_URL,
  razorpayKey: VITE_RAZORPAY_KEY
};

export default env;

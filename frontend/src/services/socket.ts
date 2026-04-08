import { io, Socket } from 'socket.io-client';
import { VITE_API_URL } from '@/config/env';

// We get the base URL of the API, ensuring it works both locally and in production.
// If VITE_API_URL includes `/api`, we should connect to the origin (the root).
const SOCKET_URL = VITE_API_URL.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;

  connect() {
    if (this.socket?.connected || this.isConnecting) return this.socket;

    this.isConnecting = true;
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log(`[Socket] Connected with ID: ${this.socket?.id}`);
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected. Reason: ${reason}`);
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error(`[Socket] Connection Error:`, error);
      this.isConnecting = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Helper methodologies for Staff
  joinStaffChannel(restaurantId: string, userId: string, role: string) {
    if (!this.socket?.connected) {
      this.connect();
    }
    this.socket?.emit('join-staff', { restaurantId, userId, role });
  }

  // Helper methodologies for Customers
  joinTableChannel(restaurantId: string, tableNo: string) {
    if (!this.socket?.connected) {
      this.connect();
    }
    this.socket?.emit('join-table', { restaurantId, tableNo });
  }

  // Helper methodology for Admins
  joinRestaurantChannel(restaurantId: string) {
    if (!this.socket?.connected) {
      this.connect();
    }
    this.socket?.emit('join-restaurant', restaurantId);
  }
}

export const socketService = new SocketService();

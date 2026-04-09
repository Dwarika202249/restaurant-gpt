import { io, Socket } from 'socket.io-client';
import { VITE_API_URL } from '@/config/env';

// We get the base URL of the API, ensuring it works both locally and in production.
// If VITE_API_URL includes `/api`, we should connect to the origin (the root).
const SOCKET_URL = VITE_API_URL.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;
  private currentJoinParams: { type: 'staff' | 'table' | 'restaurant', data: any } | null = null;

  connect() {
    if (this.socket?.connected || this.isConnecting) return this.socket;

    this.isConnecting = true;
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    this.socket.on('connect', () => {
      console.log(`[Socket] Connected with ID: ${this.socket?.id}`);
      this.isConnecting = false;
      
      // Re-join previous channel if we were connected before
      if (this.currentJoinParams) {
        console.log(`[Socket] Re-joining ${this.currentJoinParams.type} channel...`);
        const { type, data } = this.currentJoinParams;
        if (type === 'staff') this.socket?.emit('join-staff', data);
        if (type === 'table') this.socket?.emit('join-table', data);
        if (type === 'restaurant') this.socket?.emit('join-restaurant', data);
      }
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
      this.currentJoinParams = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Helper methodologies for Staff
  joinStaffChannel(restaurantId: string, userId: string, role: string) {
    const data = { restaurantId, userId, role };
    this.currentJoinParams = { type: 'staff', data };
    
    if (!this.socket?.connected) {
      this.connect();
    } else {
      this.socket.emit('join-staff', data);
    }
  }

  // Helper methodologies for Customers
  joinTableChannel(restaurantId: string, tableNo: string) {
    const data = { restaurantId, tableNo };
    this.currentJoinParams = { type: 'table', data };
    
    if (!this.socket?.connected) {
      this.connect();
    } else {
      this.socket.emit('join-table', data);
    }
  }

  // Helper methodology for Admins
  joinRestaurantChannel(restaurantId: string) {
    this.currentJoinParams = { type: 'restaurant', data: restaurantId };
    
    if (!this.socket?.connected) {
      this.connect();
    } else {
      this.socket.emit('join-restaurant', restaurantId);
    }
  }
}

export const socketService = new SocketService();

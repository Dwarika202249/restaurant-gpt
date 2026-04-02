let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: '*', // Adjust for production later
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Admin joining their restaurant's channel
      socket.on('join-restaurant', (restaurantId) => {
        if (restaurantId) {
          socket.join(restaurantId);
          console.log(`Socket ${socket.id} joined restaurant room: ${restaurantId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  /**
   * Emit a real-time event to all clients in a restaurant room (useful for admin notifications)
   */
  emitToRestaurant: (restaurantId, event, data) => {
    if (io && restaurantId) {
      io.to(restaurantId.toString()).emit(event, data);
    }
  }
};

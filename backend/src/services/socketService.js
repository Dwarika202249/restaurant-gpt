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

      // Admin/Global joining their restaurant's channel
      socket.on('join-restaurant', (restaurantId) => {
        if (restaurantId) {
          socket.join(restaurantId.toString());
          console.log(`Socket ${socket.id} joined restaurant room: ${restaurantId}`);
        }
      });

      // Staff joining their personal channel and role-specific channels
      socket.on('join-staff', ({ restaurantId, userId, role }) => {
        if (restaurantId && userId) {
          // Join personal channel
          const personalRoom = `user_${userId}`;
          socket.join(personalRoom);
          console.log(`Socket ${socket.id} joined personal room: ${personalRoom}`);

          // If chef, join the kitchen broadcast channel
          if (role === 'chef') {
            const kitchenRoom = `kitchen_${restaurantId}`;
            socket.join(kitchenRoom);
            console.log(`Socket ${socket.id} joined kitchen room: ${kitchenRoom}`);
          }
          
          // Optionally, everyone gets attached to the main restaurant room too
          socket.join(restaurantId.toString());
        }
      });

      // Customer joining a specific table channel
      socket.on('join-table', ({ restaurantId, tableNo }) => {
        if (restaurantId && tableNo) {
          const tableRoom = `table_${restaurantId}_${tableNo}`;
          socket.join(tableRoom);
          console.log(`Socket ${socket.id} joined table room: ${tableRoom}`);
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
  },
  
  /**
   * Emit event to specific user (waiter or chef)
   */
  emitToUser: (userId, event, data) => {
    if (io && userId) {
      io.to(`user_${userId.toString()}`).emit(event, data);
    }
  },

  /**
   * Emit event to all chefs in the kitchen of a restaurant
   */
  emitToKitchen: (restaurantId, event, data) => {
    if (io && restaurantId) {
      io.to(`kitchen_${restaurantId.toString()}`).emit(event, data);
    }
  },
  
  /**
   * Emit event to a specific table
   */
  emitToTable: (restaurantId, tableNo, event, data) => {
    if (io && restaurantId && tableNo) {
      io.to(`table_${restaurantId.toString()}_${tableNo.toString()}`).emit(event, data);
    }
  }
};

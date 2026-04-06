require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const http = require('http');
const socketService = require('./src/services/socketService');

// Create HTTP Server
const httpServer = http.createServer(app);

// Initialize Socket.io
socketService.init(httpServer);

// Routes
const authRoutes = require('./src/routes/auth');
const restaurantRoutes = require('./src/routes/restaurant');
const menuRoutes = require('./src/routes/menu');
const orderRoutes = require('./src/routes/orders');
const customerRoutes = require('./src/routes/customer');
const publicRoutes = require('./src/routes/public');
const couponRoutes = require('./src/routes/coupons');
const aiRoutes = require('./src/routes/ai');
const subscriptionRoutes = require('./src/routes/subscription');
const marketingRoutes = require('./src/routes/marketing');
const notificationRoutes = require('./src/routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/restaurant/coupons', couponRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'RestaurantGPT Backend is running',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`RestaurantGPT Backend listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

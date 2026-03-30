const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats
} = require('./controllers/orderController');
const { authenticateAdmin, authenticateAny } = require('../middleware/auth');
const { attachRestaurantContext } = require('../middleware/tenantContext');

/**
 * Public Routes (Guest can create orders)
 */

/**
 * @route   POST /api/orders
 * @desc    Create a new order from cart
 * @access  Public (guests) / Private (customers)
 * @body    { restaurantId, items[], tableNo, paymentMethod, customerId (optional), guestSessionId (optional) }
 */
router.post('/', createOrder);

/**
 * Admin Routes (Protected)
 */

router.get(
  '/stats',
  authenticateAdmin,
  attachRestaurantContext,
  getOrderStats
);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get active orders for customer/guest tracking
 * @access  Public (Guest/Customer)
 */
router.get(
  '/my-orders',
  authenticateAny,
  attachRestaurantContext,
  getMyOrders
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for restaurant with filters
 * @access  Private (Admin)
 * @query   status: 'new' | 'preparing' | 'ready' | 'completed'
 * @query   date: 'today' | 'week' | 'month'
 * @query   page: number (default: 1)
 * @query   limit: number (default: 20, max: 100)
 */
router.get(
  '/',
  authenticateAdmin,
  attachRestaurantContext,
  getOrders
);

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get a single order by ID
 * @access  Private (Admin)
 */
router.get(
  '/:orderId',
  authenticateAdmin,
  attachRestaurantContext,
  getOrderById
);

/**
 * @route   PATCH /api/orders/:orderId/status
 * @desc    Update order status in workflow
 * @access  Private (Admin)
 * @body    { status: 'new' | 'preparing' | 'ready' | 'completed' }
 */
router.patch(
  '/:orderId/status',
  authenticateAdmin,
  attachRestaurantContext,
  updateOrderStatus
);

/**
 * @route   PATCH /api/orders/:orderId/payment
 * @desc    Update payment status (used by Razorpay webhook or simulated success)
 * @access  Public (Guest/Admin) - Restricted to own order for guests
 * @body    { paymentStatus: 'pending' | 'completed' | 'failed', razorpayOrderId (optional) }
 */
router.patch(
  '/:orderId/payment',
  authenticateAny,
  attachRestaurantContext,
  updatePaymentStatus
);

module.exports = router;

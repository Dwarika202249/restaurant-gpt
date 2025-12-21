const { Order, Menu, Restaurant } = require('../../models');
const mongoose = require('mongoose');

/**
 * Create a new order from customer cart
 * POST /api/orders
 * Body: { restaurantId, items[], tableNo, paymentMethod, customerId (optional) }
 * items format: [{ itemId, quantity, customizations: [{key, value}] }]
 */
const createOrder = async (req, res) => {
  try {
    const { restaurantId, items, tableNo, paymentMethod, customerId, guestSessionId } = req.body;

    // Validation
    if (!restaurantId || !items || items.length === 0 || tableNo === undefined) {
      return res.status(400).json({
        message: 'Restaurant ID, items, and table number are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        message: 'Invalid restaurant ID'
      });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    // Verify table number is valid
    if (tableNo < 1 || tableNo > restaurant.tablesCount) {
      return res.status(400).json({
        message: `Invalid table number. Restaurant has ${restaurant.tablesCount} tables`
      });
    }

    // Fetch menu to get item snapshots
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({
        message: 'Menu not found for this restaurant'
      });
    }

    // Build order items with snapshots
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of items) {
      // Validate item exists
      if (!mongoose.Types.ObjectId.isValid(cartItem.itemId)) {
        return res.status(400).json({
          message: 'Invalid item ID format'
        });
      }

      // Find item in menu
      const menuItem = menu.items.find(
        (item) => item._id.toString() === cartItem.itemId.toString()
      );

      if (!menuItem) {
        return res.status(404).json({
          message: `Item ${cartItem.itemId} not found in menu`
        });
      }

      // Validate quantity
      if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
        return res.status(400).json({
          message: 'Item quantity must be a positive integer'
        });
      }

      // Create snapshot of item (price at order time)
      const itemTotal = menuItem.price * cartItem.quantity;
      const orderItem = {
        itemId: menuItem._id,
        nameSnapshot: menuItem.name,
        priceSnapshot: menuItem.price,
        quantity: cartItem.quantity,
        customizations: cartItem.customizations || [],
        itemTotal
      };

      orderItems.push(orderItem);
      subtotal += itemTotal;
    }

    // Calculate tax (assuming 5% tax, can be configurable)
    const taxRate = 0.05;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + taxAmount;

    // Generate order number
    const orderCount = await Order.countDocuments({ restaurantId });
    const orderNumber = `${restaurant.slug.toUpperCase()}-${Date.now().toString().slice(-6)}-${(orderCount + 1).toString().padStart(4, '0')}`;

    // Create order
    const order = new Order({
      restaurantId,
      orderNumber,
      tableNo,
      status: 'new',
      items: orderItems,
      subtotal,
      taxAmount,
      total,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'razorpay',
      customerId: customerId || null,
      guestSessionId: guestSessionId || null,
      orderedAt: new Date()
    });

    await order.save();

    // Update menu item order count
    for (const orderItem of orderItems) {
      await Menu.updateOne(
        { restaurantId, 'items._id': orderItem.itemId },
        { $inc: { 'items.$.ordersCount': 1 } }
      );
    }

    return res.status(201).json({
      message: 'Order created successfully',
      data: {
        order,
        orderNumber: order.orderNumber,
        total: order.total
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all orders for a restaurant (admin only)
 * GET /api/orders?status=new&date=today&page=1&limit=20
 * Query params: status, date (today/week/month), page, limit
 */
const getOrders = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { status, date, page = 1, limit = 20 } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        message: 'Restaurant ID is required'
      });
    }

    // Build filter
    const filter = { restaurantId };

    // Filter by status if provided
    if (status && ['new', 'preparing', 'ready', 'completed'].includes(status)) {
      filter.status = status;
    }

    // Filter by date range
    if (date) {
      const now = new Date();
      let startDate;

      switch (date) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          break;
      }

      if (startDate) {
        filter.orderedAt = { $gte: startDate };
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * pageSize;

    // Fetch orders
    const orders = await Order.find(filter)
      .sort({ orderedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Get total count
    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: pageSize,
          pages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:orderId
 */
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { restaurantId } = req;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    // Fetch order (verify it belongs to the admin's restaurant)
    const order = await Order.findOne({
      _id: orderId,
      restaurantId
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      message: 'Order retrieved successfully',
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update order status
 * PATCH /api/orders/:orderId/status
 * Body: { status: 'new' | 'preparing' | 'ready' | 'completed' }
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const { restaurantId } = req;

    // Validate
    if (!status) {
      return res.status(400).json({
        message: 'Status is required'
      });
    }

    const validStatuses = ['new', 'preparing', 'ready', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    // Update order
    const updateData = {
      status,
      updatedAt: new Date()
    };

    // If marking as completed, set completedAt
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId },
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get order statistics/analytics
 * GET /api/orders/stats?dateRange=today|week|month
 */
const getOrderStats = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { dateRange = 'today' } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        message: 'Restaurant ID is required'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return res.status(400).json({
          message: 'Invalid date range. Use: today, week, or month'
        });
    }

    // Aggregation pipeline for stats
    const stats = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          orderedAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                totalTax: { $sum: '$taxAmount' },
                averageOrderValue: { $avg: '$total' },
                completedOrders: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
              }
            }
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$total' }
              }
            }
          ],
          byHour: [
            {
              $group: {
                _id: { $hour: '$orderedAt' },
                count: { $sum: 1 },
                revenue: { $sum: '$total' }
              }
            },
            { $sort: { _id: 1 } }
          ],
          topItems: [
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.nameSnapshot',
                count: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.itemTotal' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    const result = stats[0] || {};

    return res.status(200).json({
      message: 'Order statistics retrieved successfully',
      data: {
        dateRange,
        startDate,
        endDate: now,
        summary: result.summary?.[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          totalTax: 0,
          averageOrderValue: 0,
          completedOrders: 0
        },
        byStatus: result.byStatus || [],
        byHour: result.byHour || [],
        topItems: result.topItems || []
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve order statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update payment status for an order
 * PATCH /api/orders/:orderId/payment
 * Body: { paymentStatus: 'pending' | 'completed' | 'failed', razorpayOrderId (optional) }
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, razorpayOrderId } = req.body;
    const { restaurantId } = req;

    // Validate
    if (!paymentStatus) {
      return res.status(400).json({
        message: 'Payment status is required'
      });
    }

    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: 'Invalid order ID'
      });
    }

    // Update order
    const updateData = {
      paymentStatus,
      updatedAt: new Date()
    };

    if (razorpayOrderId) {
      updateData.razorpayOrderId = razorpayOrderId;
    }

    // Auto-update order status to preparing if payment completed
    if (paymentStatus === 'completed') {
      updateData.status = 'preparing';
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId },
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      message: 'Payment status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(500).json({
      message: 'Failed to update payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats
};

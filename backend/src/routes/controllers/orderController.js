const { Order, Menu, Restaurant, User, Coupon } = require('../../models');
const mongoose = require('mongoose');

/**
 * Create a new order from customer cart
 * POST /api/orders
 * Body: { restaurantId, items[], tableNo, paymentMethod, customerId, couponCode, pointsRedeemed }
 */
const createOrder = async (req, res) => {
  try {
    const { 
      restaurantId, 
      items, 
      tableNo, 
      paymentMethod, 
      customerId, 
      guestSessionId,
      couponCode,
      pointsRedeemed = 0
    } = req.body;

    // 1. Basic Validation
    if (!restaurantId || !items || items.length === 0 || tableNo === undefined) {
      return res.status(400).json({ message: 'Restaurant ID, items, and table number are required' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // 2. Build order items and calculate subtotal
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) return res.status(404).json({ message: 'Menu not found' });

    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of items) {
      const menuItem = menu.items.find(i => i._id.toString() === cartItem.itemId.toString());
      if (!menuItem) return res.status(404).json({ message: `Item ${cartItem.itemId} not found` });

      const itemTotal = menuItem.price * cartItem.quantity;
      orderItems.push({
        itemId: menuItem._id,
        nameSnapshot: menuItem.name,
        priceSnapshot: menuItem.price,
        quantity: cartItem.quantity,
        customizations: cartItem.customizations || [],
        itemTotal
      });
      subtotal += itemTotal;
    }

    let runningTotal = subtotal;
    let discountAmount = 0;
    let couponUsed = null;

    // 3. Apply Coupon (If provided)
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(), 
        restaurantId,
        status: 'active'
      });

      if (coupon) {
        const isExpired = coupon.expiryDate && new Date() > new Date(coupon.expiryDate);
        const isMinMet = subtotal >= coupon.minOrderAmount;
        
        if (!isExpired && isMinMet) {
          const couponDiscount = coupon.discountType === 'percentage' 
            ? (subtotal * coupon.value / 100) 
            : Math.min(subtotal, coupon.value);
          
          discountAmount += couponDiscount;
          runningTotal -= couponDiscount;
          couponUsed = coupon._id;
          
          // Increment coupon use count
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // 4. Apply Loyalty Points (If provided & User logged in)
    let finalPointsRedeemed = 0;
    if (pointsRedeemed > 0 && customerId && restaurant.loyaltySettings?.enabled) {
      const user = await User.findById(customerId);
      if (user) {
        const userPointsObj = user.loyaltyPoints.find(l => l.restaurantId.toString() === restaurantId.toString());
        const userBalance = userPointsObj ? userPointsObj.points : 0;
        
        // Cap redemption: min(requested, actual balance, 50% of subtotal)
        const redeemRate = restaurant.loyaltySettings.redeemRate || 1;
        const maxRedeemableVal = subtotal * (restaurant.loyaltySettings.maxRedemptionPercentage / 100);
        const requestedVal = pointsRedeemed * redeemRate;
        
        const actualRedeemVal = Math.min(requestedVal, userBalance * redeemRate, maxRedeemableVal);
        finalPointsRedeemed = Math.floor(actualRedeemVal / redeemRate);
        
        discountAmount += actualRedeemVal;
        runningTotal -= actualRedeemVal;

        // Deduct points from user
        if (userPointsObj) {
          userPointsObj.points -= finalPointsRedeemed;
          await user.save();
        }
      }
    }

    // 5. Final Calculations
    const taxRate = 0.05; // 5%
    const taxAmount = Math.round(runningTotal * taxRate * 100) / 100;
    const finalTotal = Math.max(0, runningTotal + taxAmount);

    const orderCount = await Order.countDocuments({ restaurantId });
    const orderNumber = `${restaurant.slug.toUpperCase()}-${Date.now().toString().slice(-4)}-${(orderCount + 1).toString().padStart(4, '0')}`;

    const order = new Order({
      restaurantId,
      orderNumber,
      tableNo,
      status: 'new',
      items: orderItems,
      subtotal,
      taxAmount,
      total: finalTotal,
      discountAmount,
      couponUsed,
      pointsRedeemed: finalPointsRedeemed,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'razorpay',
      customerId: customerId || null,
      guestSessionId: guestSessionId || null,
      orderedAt: new Date()
    });

    await order.save();

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
      let startDateVal;
      let endDateVal;

      switch (date) {
        case 'today':
          startDateVal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDateVal = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDateVal = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDateVal = new Date(now.getFullYear(), 0, 1);
          break;
        case 'custom':
          if (req.query.startDate && req.query.endDate) {
            startDateVal = new Date(req.query.startDate);
            endDateVal = new Date(req.query.endDate);
            // Include entire end date by setting time to 23:59:59.999
            endDateVal.setHours(23, 59, 59, 999);
          }
          break;
        default:
          break;
      }

      if (startDateVal) {
        filter.orderedAt = { $gte: startDateVal };
        if (endDateVal) {
          filter.orderedAt.$lte = endDateVal;
        }
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
      return res.status(404).json({ message: 'Order not found' });
    }

    // --- Loyalty Points Earning Logic ---
    if (status === 'completed' && order.customerId) {
      const restaurant = await Restaurant.findById(restaurantId);
      if (restaurant && restaurant.loyaltySettings?.enabled) {
        const earnRate = restaurant.loyaltySettings.earnRate || 10;
        const pointsEarned = Math.floor((order.subtotal / 100) * earnRate);
        
        if (pointsEarned > 0) {
          order.pointsEarned = pointsEarned;
          await order.save();

          // Credit to user
          const user = await User.findById(order.customerId);
          if (user) {
            let userPointsObj = user.loyaltyPoints.find(l => l.restaurantId.toString() === restaurantId.toString());
            if (userPointsObj) {
              userPointsObj.points += pointsEarned;
            } else {
              user.loyaltyPoints.push({ restaurantId, points: pointsEarned });
            }
            await user.save();
          }
        }
      }
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
    const { dateRange = 'today', startDate, endDate } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        message: 'Restaurant ID is required'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDateVal;
    let endDateVal;

    switch (dateRange) {
      case 'today':
        startDateVal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDateVal = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDateVal = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDateVal = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          startDateVal = new Date(startDate);
          endDateVal = new Date(endDate);
          endDateVal.setHours(23, 59, 59, 999);
        } else {
          return res.status(400).json({
            message: 'Both startDate and endDate are required for custom date range'
          });
        }
        break;
      default:
        return res.status(400).json({
          message: 'Invalid date range. Use: today, week, month, year, or custom'
        });
    }

    const dateFilter = { $gte: startDateVal };
    if (endDateVal) {
      dateFilter.$lte = endDateVal;
    }

    // Aggregation pipeline for stats
    const stats = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          orderedAt: dateFilter
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

    const filter = { _id: orderId, restaurantId };
    
    // Safety: If it's a guest, they can only update their own order
    if (req.guestSession) {
      filter.guestSessionId = req.guestSession.sessionId;
    }

    const order = await Order.findOneAndUpdate(
      filter,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // --- Loyalty Point Accrual ---
    if (paymentStatus === 'completed' && order.customerId && order.total > 0) {
      try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (restaurant && restaurant.loyaltySettings?.enabled) {
          const earnRate = restaurant.loyaltySettings.earnRate || 10; // Default 10 points per 100
          const pointsToEarn = Math.floor((order.total / 100) * earnRate);
          
          if (pointsToEarn > 0) {
            const user = await User.findById(order.customerId);
            if (user) {
              const lpIndex = user.loyaltyPoints.findIndex(lp => lp.restaurantId.toString() === restaurantId.toString());
              if (lpIndex !== -1) {
                user.loyaltyPoints[lpIndex].points += pointsToEarn;
              } else {
                user.loyaltyPoints.push({ restaurantId: new mongoose.Types.ObjectId(restaurantId), points: pointsToEarn });
              }
              await user.save();
              
              // Record earned points on the order snapshot
              order.pointsEarned = pointsToEarn;
              await order.save();
            }
          }
        }
      } catch (loyaltyError) {
        console.error('Failed to accrue loyalty points:', loyaltyError);
        // We don't fail the whole request if loyalty point calculation fails
      }
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

/**
 * Get active orders for the current guest/customer session
 * GET /api/orders/my-orders
 */
const getMyOrders = async (req, res) => {
  try {
    const { restaurantId } = req;
    const guestSessionId = req.guestSession?.sessionId;
    const customerId = req.user?._id;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant context not found' });
    }

    // Build filter based on user identity (Guest or Logged-in Customer)
    const identityFilter = [];
    
    if (customerId) {
      identityFilter.push({ customerId: new mongoose.Types.ObjectId(customerId) });
    }
    
    if (guestSessionId && mongoose.Types.ObjectId.isValid(guestSessionId)) {
      identityFilter.push({ guestSessionId: new mongoose.Types.ObjectId(guestSessionId) });
    }

    if (identityFilter.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Filter to show active orders OR recently completed ones (last 30 mins)
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const statusFilter = req.query.history === 'true' && customerId 
      ? [{ status: { $exists: true } }] // Show all orders for history view
      : [
          { status: { $ne: 'completed' } },
          { status: 'completed', completedAt: { $gte: thirtyMinsAgo } }
        ];

    // Combine identity and status filters using $and to ensure strict isolation
    const filter = {
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      $and: [
        { $or: identityFilter },
        { $or: statusFilter }
      ]
    };

    const orders = await Order.find(filter)
      .sort({ orderedAt: -1 })
      .lean();

    return res.status(200).json({
      message: 'Active orders retrieved successfully',
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats
};

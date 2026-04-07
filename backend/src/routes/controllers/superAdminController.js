const { Restaurant, User, Order, GlobalConfig } = require('../../models');
const mongoose = require('mongoose');
const aiService = require('../../services/aiService');
const socketService = require('../../services/socketService');

/**
 * Get Global Platform Statistics
 * Focused on "This Month" comparisons
 */
const getGlobalStats = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalRestaurants,
      activeRestaurants,
      newRestaurantsThisMonth,
      totalOrders,
      ordersThisMonth
    ] = await Promise.all([
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ status: 'active' }),
      Restaurant.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

    // Simple revenue calculation (This could be expanded with payment integration)
    const revenueStats = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: 'served' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const globalRevenueThisMonth = revenueStats.length > 0 ? revenueStats[0].total : 0;

    return res.status(200).json({
      success: true,
      data: {
        restaurants: {
          total: totalRestaurants,
          active: activeRestaurants,
          newThisMonth: newRestaurantsThisMonth
        },
        orders: {
          total: totalOrders,
          thisMonth: ordersThisMonth
        },
        revenue: {
          thisMonth: globalRevenueThisMonth
        }
      }
    });
  } catch (error) {
    console.error('Get Global Stats Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get All Restaurants
 */
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .lean();

    // Map through restaurants to get additional info if needed
    // (e.g., owner details)
    const enhancedRestaurants = await Promise.all(restaurants.map(async (restro) => {
      const owner = await User.findOne({ restaurantId: restro._id, role: 'admin' }).select('name email phone');
      return {
        ...restro,
        owner
      };
    }));

    return res.status(200).json({
      success: true,
      data: enhancedRestaurants
    });
  } catch (error) {
    console.error('Get All Restaurants Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Toggle Restaurant Status (Active/Inactive)
 */
const toggleRestaurantStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { status },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Restaurant status updated to ${status}`,
      data: restaurant
    });
  } catch (error) {
    console.error('Toggle Restaurant Status Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get All Subscribers (Premium/Active Trial)
 */
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Restaurant.find({
      $or: [
        { isPremium: true },
        { subscriptionExpiresAt: { $gt: new Date() } }
      ]
    }).lean();

    const enhancedSubscribers = await Promise.all(subscribers.map(async (restro) => {
      const owner = await User.findOne({ restaurantId: restro._id, role: 'admin' }).select('name email');
      return {
        ...restro,
        owner
      };
    }));

    return res.status(200).json({
      success: true,
      data: enhancedSubscribers
    });
  } catch (error) {
    console.error('Get Subscribers Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get Global Platform Configuration
 */
const getGlobalConfig = async (req, res) => {
  try {
    let config = await GlobalConfig.findOne();
    
    // If no config exists, create the initial one
    if (!config) {
      config = await GlobalConfig.create({});
    }

    return res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get Global Config Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update Global Platform Configuration
 */
const updateGlobalConfig = async (req, res) => {
  try {
    const updateData = req.body;
    updateData.updatedAt = new Date();
    if (req.user) updateData.updatedBy = req.user._id;

    let config = await GlobalConfig.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Emit real-time update to all connected clients
    socketService.getIO().emit('PLATFORM_CONFIG_UPDATED', config);

    return res.status(200).json({
      success: true,
      message: 'Platform configuration updated',
      data: config
    });
  } catch (error) {
    console.error('Update Global Config Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Generate AI Broadcast Message
 */
const generateAIBroadcast = async (req, res) => {
  try {
    const { context, type, target } = req.body;
    const message = await aiService.generateBroadcastMessage({ context, type, target });

    return res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('AI Broadcast Controller Error:', error);
    return res.status(500).json({ message: 'Failed to generate AI broadcast' });
  }
};

module.exports = {
  getGlobalStats,
  getAllRestaurants,
  toggleRestaurantStatus,
  getSubscribers,
  getGlobalConfig,
  updateGlobalConfig,
  generateAIBroadcast
};

const { Order, User } = require('../../models');
const mongoose = require('mongoose');

/**
 * Get all customers for a restaurant with aggregated stats
 * GET /api/restaurant/customers
 */
const getRestaurantCustomers = async (req, res) => {
  try {
    const { restaurantId } = req;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant context not found' });
    }

    // Aggregate orders to get customer stats
    const customerStats = await Order.aggregate([
      { 
        $match: { 
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          customerId: { $ne: null } // Only logged-in customers
        } 
      },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
          lastOrderAt: { $max: '$orderedAt' }
        }
      }
    ]);

    // Fetch user details for these customers
    const result = await Promise.all(customerStats.map(async (stat) => {
      const user = await User.findById(stat._id).select('name phone email lastLoginAt');
      if (!user) return null;
      
      return {
        id: user._id,
        name: user.name || 'Anonymous',
        phone: user.phone,
        email: user.email,
        totalSpent: Math.round(stat.totalSpent * 100) / 100,
        orderCount: stat.orderCount,
        lastOrderAt: stat.lastOrderAt,
        lastLoginAt: user.lastLoginAt
      };
    }));

    // Filter out any nulls and sort by totalSpent descending
    const finalCustomers = result
      .filter(c => c !== null)
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return res.status(200).json({
      message: 'Customers retrieved successfully',
      data: finalCustomers
    });
  } catch (error) {
    console.error('Get restaurant customers error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve customers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRestaurantCustomers
};

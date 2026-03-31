const { Restaurant } = require('../../models');

/**
 * Handle Mock Subscription Payment
 * POST /api/subscription/upgrade
 * Body: { plan: 'premium' }
 */
const upgradeToPremium = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { plan } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant context not found' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Update restaurant to Premium
    // In a real app, this would be done after Stripe/Razorpay webhook
    restaurant.isPremium = true;
    restaurant.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await restaurant.save();

    return res.status(200).json({
      message: 'Subscription upgraded successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Subscription upgrade error:', error);
    return res.status(500).json({ 
      message: 'Failed to upgrade subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  upgradeToPremium
};

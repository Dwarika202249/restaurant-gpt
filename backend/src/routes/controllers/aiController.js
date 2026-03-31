const { Order, Restaurant, Menu } = require('../../models');
const { generateItemDescription, analyzeBusinessInsights } = require('../../services/aiService');
const mongoose = require('mongoose');

/**
 * Generate AI description for a menu item
 * POST /api/ai/describe-item
 * Body: { name, description, category, tags }
 */
const describeItem = async (req, res) => {
  try {
    const { name, description, category, tags } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const aiDescription = await generateItemDescription({ name, description, category, tags });

    return res.status(200).json({
      message: 'AI description generated successfully',
      data: aiDescription
    });
  } catch (error) {
    console.error('AI describe error:', error);
    return res.status(500).json({ 
      message: 'Failed to generate AI description',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Perform business analysis using AI
 * POST /api/ai/analyze-stats
 * Body: { startDate, endDate }
 */
const analyzeStats = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { startDate, endDate } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant context not found' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // 1. Subscription Check (Premium or Trial)
    const isTrial = (Date.now() - new Date(restaurant.trialActivatedAt).getTime()) < (30 * 24 * 60 * 60 * 1000);
    if (!restaurant.isPremium && !isTrial) {
      return res.status(403).json({ 
        message: 'Premium subscription required for AI Business Analyst',
        requiresUpgrade: true
      });
    }

    // 2. Fetch Stats for the specific range
    // Note: We'll reuse the logic from getOrderStats but for AI consumption
    const start = new Date(startDate || Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = new Date(endDate || Date.now());
    end.setHours(23, 59, 59, 999);

    const stats = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          orderedAt: { $gte: start, $lte: end }
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
                averageOrderValue: { $avg: '$total' },
                completedOrders: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
              }
            }
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
    const summary = result.summary?.[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      completedOrders: 0
    };

    // 3. Call AI Service
    const insights = await analyzeBusinessInsights(
      [], // Raw orders (skipped for performance, using stats instead)
      { summary, topItems: result.topItems || [] },
      restaurant,
      { start: start.toLocaleDateString(), end: end.toLocaleDateString() }
    );

    return res.status(200).json({
      message: 'AI Business Insights generated',
      data: insights
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return res.status(500).json({ 
      message: 'Failed to perform AI analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  describeItem,
  analyzeStats
};

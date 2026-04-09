const { Restaurant, Session } = require('../models');

/**
 * Middleware to attach restaurantId to request based on user role
 * Implements strict multi-tenant isolation
 * 
 * For Admin: Uses restaurantId from authenticated user
 * For Guest: Extracts from restaurant slug in URL or session ID
 */
const attachRestaurantContext = async (req, res, next) => {
  try {


    // Case 2: Guest user - extract from URL slug or session
    if (req.guestSession && req.guestSession.restaurantId) {
      req.restaurantId = req.guestSession.restaurantId;
      return next();
    }

    // Case 3: Extract from restaurant slug in URL params
    if (req.params.restaurantSlug) {
      const restaurant = await Restaurant.findOne({
        slug: req.params.restaurantSlug.toLowerCase()
      });

      if (!restaurant) {
        return res.status(404).json({
          message: 'Restaurant not found'
        });
      }

      req.restaurantId = restaurant._id;
      return next();
    }

    // Case 4: Extract from restaurant ID in URL params
    if (req.params.restaurantId) {
      req.restaurantId = req.params.restaurantId;
      return next();
    }

    // Case 5: Extract from query params
    if (req.query.restaurantId) {
      req.restaurantId = req.query.restaurantId;
      return next();
    }

    // Case 6: User Fallback (For staff members in their own restaurant)
    if (req.user && req.user.restaurantId) {
      req.restaurantId = req.user.restaurantId;
      return next();
    }

    return res.status(400).json({
      message: 'Unable to determine restaurant context'
    });
  } catch (error) {
    console.error('Tenant context middleware error:', error);
    return res.status(500).json({
      message: 'Error processing restaurant context',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to verify restaurant access
 * Ensures user/guest only accesses data belonging to their restaurant
 * 
 * This acts as a safety net for queries that should be filtered by restaurantId
 */
const verifyRestaurantAccess = async (req, res, next) => {
  try {
    if (!req.restaurantId) {
      return res.status(400).json({
        message: 'Restaurant context not found'
      });
    }

    // If user is admin, verify they own the restaurant
    if (req.user && req.user.role === 'admin') {
      if (req.user.restaurantId.toString() !== req.restaurantId.toString()) {
        return res.status(403).json({
          message: 'Forbidden: You do not have access to this restaurant'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Restaurant access verification error:', error);
    return res.status(500).json({
      message: 'Error verifying restaurant access'
    });
  }
};

/**
 * Utility function to build query filter with restaurantId
 * CRITICAL: Use this for every database query to ensure multi-tenant isolation
 * 
 * Example:
 *   const filter = buildRestaurantFilter(req.restaurantId, { status: 'new' });
 *   Order.find(filter)
 */
const buildRestaurantFilter = (restaurantId, additionalFilter = {}) => {
  return {
    restaurantId,
    ...additionalFilter
  };
};

/**
 * Middleware to enforce restaurantId in all database queries
 * Logs warnings if used without proper context (development only)
 */
const enforceRestaurantIsolation = (req, res, next) => {
  if (!req.restaurantId) {
    console.warn(
      'WARNING: Request missing restaurantId context',
      {
        method: req.method,
        path: req.path,
        user: req.user ? req.user._id : 'guest'
      }
    );
  }
  next();
};

module.exports = {
  attachRestaurantContext,
  verifyRestaurantAccess,
  buildRestaurantFilter,
  enforceRestaurantIsolation
};

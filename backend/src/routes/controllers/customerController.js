const { Restaurant, Session } = require('../../models');
const { generateGuestToken } = require('../../utils/tokenGenerator');
const mongoose = require('mongoose');

/**
 * Create or retrieve guest session when customer scans QR code
 * Called when customer lands on /r/:slug/table/:tableNo
 * POST /api/customer/session
 * Body: { restaurantSlug, tableNo }
 */
const createGuestSession = async (req, res) => {
  try {
    const { restaurantSlug, tableNo, sessionId: providedSessionId } = req.body;

    // Validation
    if (!restaurantSlug || !tableNo) {
      return res.status(400).json({
        message: 'Restaurant slug and table number are required'
      });
    }

    if (isNaN(tableNo) || tableNo < 1) {
      return res.status(400).json({
        message: 'Invalid table number'
      });
    }

    // Find restaurant by slug
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug.toLowerCase() });
    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    const { _id: restaurantId, tablesCount } = restaurant;

    // Verify table exists
    if (tableNo > tablesCount) {
      return res.status(400).json({
        message: `Invalid table number. This restaurant has ${tablesCount} tables`
      });
    }

    // 1. If a sessionId was provided, try to resume it
    if (providedSessionId) {
      // Find session by its unique sessionId field OR _id
      let session = null;
      if (mongoose.Types.ObjectId.isValid(providedSessionId)) {
        session = await Session.findOne({
          $or: [{ _id: providedSessionId }, { sessionId: providedSessionId }],
          restaurantId,
          tableNo,
          expiresAt: { $gt: new Date() }
        });
      } else {
        session = await Session.findOne({
          sessionId: providedSessionId,
          restaurantId,
          tableNo,
          expiresAt: { $gt: new Date() }
        });
      }

      if (session) {
        const guestToken = generateGuestToken(
          session._id.toString(),
          restaurantId.toString(),
          tableNo
        );

        return res.status(200).json({
          message: 'Guest session resumed successfully',
          data: {
            sessionId: session._id,
            restaurantId,
            tableNo,
            sessionToken: guestToken,
            expiresAt: session.expiresAt,
            resumed: true
          }
        });
      }
    }

    // 2. No valid sessionId provided or found, ALWAYS Create NEW session for this device
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

    const newSession = new Session({
      sessionId: new mongoose.Types.ObjectId().toString(),
      restaurantId,
      tableNo,
      cart: [],
      expiresAt
    });

    await newSession.save();

    // Generate guest JWT token
    const guestToken = generateGuestToken(
      newSession._id.toString(),
      restaurantId.toString(),
      tableNo
    );

    return res.status(201).json({
      message: 'New guest session created successfully',
      data: {
        sessionId: newSession._id,
        restaurantId,
        tableNo,
        sessionToken: guestToken,
        expiresAt,
        resumed: false
      }
    });
  } catch (error) {
    console.error('Create guest session error:', error);
    return res.status(500).json({
      message: 'Failed to create guest session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get restaurant info for customer UI
 * Public endpoint - no auth required
 * GET /api/customer/restaurant/:slug
 */
const getRestaurantForCustomer = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        message: 'Restaurant slug is required'
      });
    }

    const restaurant = await Restaurant.findOne({
      slug: slug.toLowerCase(),
      isActive: true
    });

    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found or inactive'
      });
    }

    // Return only customer-facing info
    return res.status(200).json({
      message: 'Restaurant info retrieved successfully',
      data: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl,
        themeColor: restaurant.themeColor,
        currency: restaurant.currency,
        tablesCount: restaurant.tablesCount
      }
    });
  } catch (error) {
    console.error('Get restaurant error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate guest session
 * Used to check if session is still valid
 * GET /api/customer/session/:sessionId
 */
const validateGuestSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        message: 'Invalid session ID'
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      });
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return res.status(401).json({
        message: 'Session expired'
      });
    }

    return res.status(200).json({
      message: 'Session is valid',
      data: {
        sessionId: session._id,
        restaurantId: session.restaurantId,
        tableNo: session.tableNo,
        cartItems: session.cart.length,
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    console.error('Validate session error:', error);
    return res.status(500).json({
      message: 'Failed to validate session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Clear guest session (customer leaves table)
 * DELETE /api/customer/session/:sessionId
 */
const clearGuestSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        message: 'Invalid session ID'
      });
    }

    const session = await Session.findByIdAndDelete(sessionId);

    if (!session) {
      return res.status(404).json({
        message: 'Session not found'
      });
    }

    return res.status(200).json({
      message: 'Session cleared successfully'
    });
  } catch (error) {
    console.error('Clear session error:', error);
    return res.status(500).json({
      message: 'Failed to clear session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createGuestSession,
  getRestaurantForCustomer,
  validateGuestSession,
  clearGuestSession
};

const express = require('express');
const router = express.Router();
const {
  createGuestSession,
  getRestaurantForCustomer,
  validateGuestSession,
  clearGuestSession
} = require('./controllers/customerController');

/**
 * Public Routes (No Authentication Required)
 */

/**
 * @route   POST /api/customer/session
 * @desc    Create or resume guest session when customer scans QR
 * @access  Public
 * @body    { restaurantSlug, tableNo }
 * @response { sessionId, restaurantId, tableNo, sessionToken, expiresAt, resumed }
 */
router.post('/session', createGuestSession);

/**
 * @route   GET /api/customer/restaurant/:slug
 * @desc    Get restaurant info for customer UI
 * @access  Public
 * @params  slug: restaurant slug from QR code
 * @response { id, name, slug, logoUrl, themeColor, currency, tablesCount }
 */
router.get('/restaurant/:slug', getRestaurantForCustomer);

/**
 * @route   GET /api/customer/session/:sessionId
 * @desc    Validate guest session (check if still active)
 * @access  Public
 * @params  sessionId: MongoDB session ID
 * @response { sessionId, restaurantId, tableNo, cartItems, expiresAt }
 */
router.get('/session/:sessionId', validateGuestSession);

/**
 * @route   DELETE /api/customer/session/:sessionId
 * @desc    Clear guest session when customer leaves
 * @access  Public
 * @params  sessionId: MongoDB session ID
 */
router.delete('/session/:sessionId', clearGuestSession);

module.exports = router;

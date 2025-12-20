const express = require('express');
const router = express.Router();
const {
  getRestaurantProfile,
  updateRestaurantProfile,
  setupRestaurant,
  deleteRestaurant,
  getRestaurantBySlug
} = require('./controllers/restaurantController');
const { authenticateAdmin } = require('../middleware/auth');
const { attachRestaurantContext, verifyRestaurantAccess } = require('../middleware/tenantContext');

/**
 * @route   GET /api/restaurant/profile
 * @desc    Get authenticated admin's restaurant profile
 * @access  Private (admin only)
 */
router.get(
  '/profile',
  authenticateAdmin,
  attachRestaurantContext,
  verifyRestaurantAccess,
  getRestaurantProfile
);

/**
 * @route   PUT /api/restaurant/profile
 * @desc    Update authenticated admin's restaurant profile
 * @access  Private (admin only)
 */
router.put(
  '/profile',
  authenticateAdmin,
  attachRestaurantContext,
  verifyRestaurantAccess,
  updateRestaurantProfile
);

/**
 * @route   POST /api/restaurant/setup
 * @desc    Create a new restaurant for authenticated admin
 * @access  Private (admin only)
 */
router.post(
  '/setup',
  authenticateAdmin,
  setupRestaurant
);

/**
 * @route   DELETE /api/restaurant/:restaurantId
 * @desc    Delete restaurant (soft delete)
 * @access  Private (admin only, owner)
 */
router.delete(
  '/:restaurantId',
  authenticateAdmin,
  attachRestaurantContext,
  verifyRestaurantAccess,
  deleteRestaurant
);

/**
 * @route   GET /api/restaurant/public/:slug
 * @desc    Get restaurant by slug (public endpoint for customer interface)
 * @access  Public
 */
router.get(
  '/public/:slug',
  getRestaurantBySlug
);

module.exports = router;

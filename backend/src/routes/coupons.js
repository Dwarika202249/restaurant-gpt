const express = require('express');
const router = express.Router();
const {
  createCoupon,
  validateCoupon,
  getRestaurantCoupons
} = require('./controllers/couponController');
const { authenticateAdmin } = require('../middleware/auth');
const { attachRestaurantContext } = require('../middleware/tenantContext');

/**
 * @route   POST /api/restaurant/coupons
 * @desc    Create a new coupon for the restaurant
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticateAdmin,
  attachRestaurantContext,
  createCoupon
);

/**
 * @route   GET /api/restaurant/coupons
 * @desc    Get all coupons for the restaurant
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticateAdmin,
  attachRestaurantContext,
  getRestaurantCoupons
);

/**
 * @route   POST /api/restaurant/coupons/validate
 * @desc    Validate a coupon code
 * @access  Public
 */
router.post(
  '/validate',
  validateCoupon
);

module.exports = router;

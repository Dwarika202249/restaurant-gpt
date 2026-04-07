const express = require('express');
const router = express.Router();
const { 
  getGlobalStats, 
  getAllRestaurants, 
  toggleRestaurantStatus,
  getSubscribers,
  getGlobalConfig,
  updateGlobalConfig
} = require('./controllers/superAdminController');
const { authenticateSuperAdmin } = require('../middleware/auth');

// All routes here require Super Admin authentication
router.use(authenticateSuperAdmin);

/**
 * @route   GET /api/superadmin/stats
 * @desc    Get global platform stats
 * @access  Private (Super Admin)
 */
router.get('/stats', getGlobalStats);

/**
 * @route   GET /api/superadmin/restaurants
 * @desc    Get all restaurants
 * @access  Private (Super Admin)
 */
router.get('/restaurants', getAllRestaurants);

/**
 * @route   PATCH /api/superadmin/restaurants/:restaurantId/status
 * @desc    Toggle restaurant status (active/inactive)
 * @access  Private (Super Admin)
 */
router.patch('/restaurants/:restaurantId/status', toggleRestaurantStatus);

/**
 * @route   GET /api/superadmin/subscribers
 * @desc    Get all premium subscribers
 * @access  Private (Super Admin)
 */
router.get('/subscribers', getSubscribers);

/**
 * @route   GET /api/superadmin/config
 * @desc    Get global platform configuration
 * @access  Private (Super Admin)
 */
router.get('/config', getGlobalConfig);

/**
 * @route   PATCH /api/superadmin/config
 * @desc    Update global platform configuration
 * @access  Private (Super Admin)
 */
router.patch('/config', updateGlobalConfig);

module.exports = router;

const express = require('express');
const router = express.Router();
const { 
  getGlobalStats, 
  getAllRestaurants, 
  toggleRestaurantStatus 
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

module.exports = router;

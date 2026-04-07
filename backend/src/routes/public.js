const express = require('express');
const router = express.Router();
const menuController = require('./controllers/menuController');
const { getRestaurantForCustomer } = require('./controllers/customerController');
const { GlobalConfig } = require('../models');

/**
 * Public Data Portal
 * These routes are accessible without any authentication (for guests/customers)
 */

// --- Menu Routes ---
// @route   GET /api/public/menu/:restaurantSlug
// @desc    Get the full printable/viewable menu for a restaurant
router.get('/menu/:restaurantSlug', menuController.getPublicMenu);

// --- Restaurant Info Routes ---
// @route   GET /api/public/restaurant/:slug
// @desc    Get branding and identity (logo, name, theme)
router.get('/restaurant/:slug', getRestaurantForCustomer);

// --- Platform Configuration Route ---
// @route   GET /api/public/config
// @desc    Get public platform configuration (maintenance mode, broadcast)
router.get('/config', async (req, res) => {
  try {
    let config = await GlobalConfig.findOne();
    if (!config) {
      config = await GlobalConfig.create({});
    }
    return res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Public Get Config Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

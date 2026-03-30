const express = require('express');
const router = express.Router();
const menuController = require('./controllers/menuController');
const { getRestaurantForCustomer } = require('./controllers/customerController');

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

module.exports = router;

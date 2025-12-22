const express = require('express');
const router = express.Router();
const {
  getAdminMenu,
  createCategory,
  updateCategory,
  deleteCategory,
  createItem,
  updateItem,
  deleteItem,
  updateItemAvailability,
  getPublicMenu
} = require('./controllers/menuController');
const { authenticateAdmin } = require('../middleware/auth');
const { attachRestaurantContext } = require('../middleware/tenantContext');

/**
 * Admin Routes (Protected)
 */


/**
 * @route   POST /api/menu/category
 * @desc    Create a new category
 * @access  Private (Admin)
 */
router.post('/category', authenticateAdmin, attachRestaurantContext, createCategory);

/**

/**
 * @route   GET /api/menu/category
 * @desc    Get all categories for the authenticated restaurant
 * @access  Private (Admin)
 */
router.get('/category', authenticateAdmin, attachRestaurantContext, require('./controllers/menuController').getCategories);

/**
 
**

/**
 * @route   GET /api/menu/:restaurantId
 * @desc    Get full menu for admin
 * @access  Private (Admin)
 */
router.get('/:restaurantId', authenticateAdmin, attachRestaurantContext, getAdminMenu);

/**

/**
 * @route   PUT /api/menu/category/:categoryId
 * @desc    Update category
 * @access  Private (Admin)
 */
router.put('/category/:categoryId', authenticateAdmin, attachRestaurantContext, updateCategory);

/**

/**
 * @route   DELETE /api/menu/category/:categoryId
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete('/category/:categoryId', authenticateAdmin, attachRestaurantContext, deleteCategory);

/**

/**
 * @route   POST /api/menu/item
 * @desc    Create a new menu item
 * @access  Private (Admin)
 */
router.post('/item', authenticateAdmin, attachRestaurantContext, createItem);

/**

/**
 * @route   PUT /api/menu/item/:itemId
 * @desc    Update menu item
 * @access  Private (Admin)
 */
router.put('/item/:itemId', authenticateAdmin, attachRestaurantContext, updateItem);

/**

/**
 * @route   DELETE /api/menu/item/:itemId
 * @desc    Delete menu item
 * @access  Private (Admin)
 */
router.delete('/item/:itemId', authenticateAdmin, attachRestaurantContext, deleteItem);

/**

/**
 * @route   PATCH /api/menu/item/:itemId/availability
 * @desc    Update item availability status
 * @access  Private (Admin)
 */
router.patch('/item/:itemId/availability', authenticateAdmin, attachRestaurantContext, updateItemAvailability);

/**
 * Public Routes (No Auth Required)
 */

/**
 * @route   GET /api/public/menu/:restaurantSlug
 * @desc    Get public menu by restaurant slug
 * @access  Public
 */
router.get('/public/:restaurantSlug', getPublicMenu);

module.exports = router;

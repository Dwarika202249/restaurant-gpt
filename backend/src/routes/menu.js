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

/**
 * Admin Routes (Protected)
 */

/**
 * @route   GET /api/menu/:restaurantId
 * @desc    Get full menu for admin
 * @access  Private (Admin)
 */
router.get('/:restaurantId', authenticateAdmin, getAdminMenu);

/**
 * @route   POST /api/menu/category
 * @desc    Create a new category
 * @access  Private (Admin)
 */
router.post('/category', authenticateAdmin, createCategory);

/**
 * @route   PUT /api/menu/category/:categoryId
 * @desc    Update category
 * @access  Private (Admin)
 */
router.put('/category/:categoryId', authenticateAdmin, updateCategory);

/**
 * @route   DELETE /api/menu/category/:categoryId
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete('/category/:categoryId', authenticateAdmin, deleteCategory);

/**
 * @route   POST /api/menu/item
 * @desc    Create a new menu item
 * @access  Private (Admin)
 */
router.post('/item', authenticateAdmin, createItem);

/**
 * @route   PUT /api/menu/item/:itemId
 * @desc    Update menu item
 * @access  Private (Admin)
 */
router.put('/item/:itemId', authenticateAdmin, updateItem);

/**
 * @route   DELETE /api/menu/item/:itemId
 * @desc    Delete menu item
 * @access  Private (Admin)
 */
router.delete('/item/:itemId', authenticateAdmin, deleteItem);

/**
 * @route   PATCH /api/menu/item/:itemId/availability
 * @desc    Update item availability status
 * @access  Private (Admin)
 */
router.patch('/item/:itemId/availability', authenticateAdmin, updateItemAvailability);

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

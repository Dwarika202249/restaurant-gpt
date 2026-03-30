const express = require('express');
const router = express.Router();
const menuController = require('./controllers/menuController');
const { authenticateAdmin } = require('../middleware/auth');
const { attachRestaurantContext } = require('../middleware/tenantContext');

// --- 1. Public Routes ---
router.get('/public/:restaurantSlug', menuController.getPublicMenu);

// --- 2. Specific Admin Category Routes ---
router.post('/category', authenticateAdmin, attachRestaurantContext, menuController.createCategory);
router.get('/category', authenticateAdmin, attachRestaurantContext, menuController.getCategories);
router.put('/category/:categoryId', authenticateAdmin, attachRestaurantContext, menuController.updateCategory);
router.delete('/category/:categoryId', authenticateAdmin, attachRestaurantContext, menuController.deleteCategory);

// --- 3. Specific Admin Item Routes ---
router.post('/item', authenticateAdmin, attachRestaurantContext, menuController.createItem);
router.put('/item/:itemId', authenticateAdmin, attachRestaurantContext, menuController.updateItem);
router.delete('/item/:itemId', authenticateAdmin, attachRestaurantContext, menuController.deleteItem);
router.patch('/item/:itemId/availability', authenticateAdmin, attachRestaurantContext, menuController.updateItemAvailability);

// --- 4. Generic ID Routes (MUST BE LAST) ---
/**
 * This route is the most "greedy". 
 * If placed higher, it would intercept "/category" as an ID.
 */
router.get('/:restaurantId', authenticateAdmin, attachRestaurantContext, menuController.getAdminMenu);

module.exports = router;

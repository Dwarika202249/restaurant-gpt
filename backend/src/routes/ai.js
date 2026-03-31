const express = require('express');
const router = express.Router();
const aiController = require('./controllers/aiController');
const customerAiController = require('./controllers/customerAiController');
const { authenticateAdmin } = require('../middleware/auth');

// All AI routes require admin authentication
router.post('/describe-item', authenticateAdmin, aiController.describeItem);
router.post('/analyze-stats', authenticateAdmin, aiController.analyzeStats);

// Public AI routes for guests
router.post('/chat/:restaurantSlug', customerAiController.chat);
router.post('/cart-suggestions/:restaurantSlug', customerAiController.getSuggestions);

module.exports = router;

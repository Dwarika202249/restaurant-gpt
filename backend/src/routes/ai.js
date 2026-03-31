const express = require('express');
const router = express.Router();
const aiController = require('./controllers/aiController');
const { authenticateAdmin } = require('../middleware/auth');

// All AI routes require admin authentication
router.post('/describe-item', authenticateAdmin, aiController.describeItem);
router.post('/analyze-stats', authenticateAdmin, aiController.analyzeStats);

module.exports = router;

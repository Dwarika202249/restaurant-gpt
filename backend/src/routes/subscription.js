const express = require('express');
const router = express.Router();
const subscriptionController = require('./controllers/subscriptionController');
const { authenticateAdmin } = require('../middleware/auth');

// All subscription routes require admin authentication
router.post('/upgrade', authenticateAdmin, subscriptionController.upgradeToPremium);

module.exports = router;

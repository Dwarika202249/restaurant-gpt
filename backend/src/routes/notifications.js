const express = require('express');
const router = express.Router();
const notificationController = require('./controllers/notificationController');
const { authenticateAdmin } = require('../middleware/auth');

// Public route for customers
router.post('/call-waiter', notificationController.callWaiter);

// Protected admin routes
router.use(authenticateAdmin);
router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;

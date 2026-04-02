const Notification = require('../../models/Notification');
const socketService = require('../../services/socketService');

/**
 * Fetch all notifications for a restaurant
 */
exports.getNotifications = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const notifications = await Notification.find({ restaurantId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.user.restaurantId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark all-notifications as read for a restaurant
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    await Notification.updateMany(
      { restaurantId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Handle Call Waiter request (Public - No Auth)
 */
exports.callWaiter = async (req, res) => {
  try {
    const { restaurantId, tableNo } = req.body;

    if (!restaurantId || !tableNo) {
      return res.status(400).json({ success: false, message: 'Restaurant ID and Table Number are required' });
    }

    const notification = await Notification.create({
      restaurantId,
      type: 'CALL_WAITER',
      title: 'Waiter Requested!',
      message: `Table #${tableNo} is asking for a waiter.`,
      metadata: { tableNo }
    });

    // Emit real-time socket event
    socketService.emitToRestaurant(restaurantId, 'new-notification', notification);

    res.status(201).json({
      success: true,
      message: 'Waiter on the way!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

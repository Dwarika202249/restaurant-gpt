const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['NEW_ORDER', 'PAYMENT_SUCCESS', 'CALL_WAITER', 'LOW_STOCK', 'SYSTEM'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: String,
    tableNo: String,
    amount: Number
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Automatically delete notifications after 7 days (7 * 24 * 60 * 60)
  }
});

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  tableNo: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'preparing', 'ready', 'completed'],
    default: 'new'
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    nameSnapshot: {
      type: String,
      required: true
    },
    priceSnapshot: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    customizations: [{
      key: String,
      value: String
    }],
    itemTotal: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cash', 'card'],
    default: 'razorpay'
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null
  },
  orderedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Indexes (orderNumber has unique: true which creates an index automatically)
orderSchema.index({ restaurantId: 1, orderedAt: 1 });
orderSchema.index({ status: 1, restaurantId: 1 });

module.exports = mongoose.model('Order', orderSchema);

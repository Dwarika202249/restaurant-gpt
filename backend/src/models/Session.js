const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  tableNo: {
    type: Number,
    required: true
  },
  cart: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
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
    }]
  }],
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index (4 hours managed by application)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes (sessionId has unique: true and expiresAt has index property which creates indexes automatically)

module.exports = mongoose.model('Session', sessionSchema);

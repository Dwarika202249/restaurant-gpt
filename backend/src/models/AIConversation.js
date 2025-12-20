const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    tokensUsed: {
      type: Number,
      default: 0
    },
    itemsRecommended: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu.items'
    }]
  }],
  totalTokensUsed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index (7 days)
  }
});

// Indexes (expiresAt has index property which creates TTL index automatically)
aiConversationSchema.index({ restaurantId: 1, createdAt: 1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);

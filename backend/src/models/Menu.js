const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  categories: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: true,
      trim: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    icon: {
      type: String,
      default: null
    }
  }],
  items: [{
    _id: mongoose.Schema.Types.ObjectId,
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true
    },
    imageUrl: {
      type: String,
      default: null
    },
    tags: [{
      type: String,
      trim: true
    }],
    allergens: [{
      type: String,
      trim: true
    }],
    isAvailable: {
      type: Boolean,
      default: true
    },
    ordersCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
menuSchema.index({ restaurantId: 1 });
menuSchema.index({ 'items.name': 'text' });
menuSchema.index({ 'items.tags': 1 });

module.exports = mongoose.model('Menu', menuSchema);

const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logoUrl: {
    type: String,
    default: null
  },
  themeColor: {
    type: String,
    default: '#ff9500' // Orange as per spec
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tablesCount: {
    type: Number,
    default: 10
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  subscriptionExpiresAt: {
    type: Date,
    default: null
  },
  trialActivatedAt: {
    type: Date,
    default: Date.now
  },
  loyaltySettings: {
    enabled: { type: Boolean, default: true },
    earnRate: { type: Number, default: 10 }, // 10 points per 100 spent
    redeemRate: { type: Number, default: 1 }, // 1 currency unit per 10 points
    minPointsToRedeem: { type: Number, default: 100 },
    maxRedemptionPercentage: { type: Number, default: 50 }, // Points can cover max 50% of bill
    perks: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      points: { type: Number, required: true },
      icon: { type: String, default: 'Gift' },
      color: { type: String, default: 'text-brand-500 bg-brand-500/10' },
      description: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes (unique: true on slug already creates an index)
restaurantSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);

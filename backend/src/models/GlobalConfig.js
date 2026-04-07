const mongoose = require('mongoose');

const globalConfigSchema = new mongoose.Schema({
  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: 'Platform is currently undergoing maintenance. Please try again later.' }
  },
  announcement: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: '' },
    type: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' }
  },
  features: {
    aiChatEnabled: { type: Boolean, default: true },
    loyaltySystemEnabled: { type: Boolean, default: true },
    globalMaxTables: { type: Number, default: 50 }
  },
  platformInfo: {
    supportEmail: { type: String, default: 'support@dineos.com' },
    contactPhone: { type: String, default: '' },
    version: { type: String, default: '1.0.0' }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GlobalConfig', globalConfigSchema);

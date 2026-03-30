const mongoose = require('mongoose');
const crypto = require('crypto');

const tableSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  tableNo: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    trim: true,
    default: function() {
      return `Table ${this.tableNo}`;
    }
  },
  qrId: {
    type: String,
    unique: true,
    index: true,
    default: function() {
      // Generate a unique 8-character string for the QR URL
      return crypto.randomBytes(4).toString('hex');
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastScannedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index to ensure table number is unique per restaurant
tableSchema.index({ restaurantId: 1, tableNo: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);

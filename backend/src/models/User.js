const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    sparse: true,
    trim: true
  },
  passwordHash: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null // Only set for admin users
  },
  loyaltyPoints: [{
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  refreshTokens: [{
    token: String,
    expiresAt: Date
  }],
  lastLoginAt: {
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
});

// Indexes (email and phone have sparse: true which creates indexes automatically)
userSchema.index({ restaurantId: 1 });
userSchema.index({ role: 1 });

// Password hashing middleware
userSchema.pre('save', async function() {
  // Skip hashing if passwordHash is not modified or is null (OTP login)
  if (!this.isModified('passwordHash') || !this.passwordHash) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);

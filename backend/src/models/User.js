const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
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
  role: {
    type: String,
    enum: ['admin', 'customer', 'superadmin'],
    default: 'customer'
  },
  password: {
    type: String,
    select: false // Don't return password in queries by default
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
  profileComplete: {
    type: Boolean,
    default: false
  },
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


// Pre-save hook: Hash password if it's modified or new
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

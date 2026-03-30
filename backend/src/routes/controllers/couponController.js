const { Coupon, Order } = require('../../models');
const mongoose = require('mongoose');

/**
 * Create a new coupon (Admin only)
 */
const createCoupon = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { code, discountType, value, minOrderAmount, expiryDate, maxUses, targetUserId, description } = req.body;

    if (!code || !discountType || value === undefined) {
      return res.status(400).json({ message: 'Code, discount type, and value are required' });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      restaurantId,
      discountType,
      value,
      minOrderAmount,
      expiryDate,
      maxUses,
      targetUserId: targetUserId ? new mongoose.Types.ObjectId(targetUserId) : null,
      description
    });

    await newCoupon.save();

    return res.status(201).json({
      message: 'Coupon created successfully',
      data: newCoupon
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists for this restaurant' });
    }
    console.error('Create coupon error:', error);
    return res.status(500).json({ message: 'Failed to create coupon' });
  }
};

/**
 * Validate a coupon for customer checkout
 * POST /api/public/coupons/validate
 */
const validateCoupon = async (req, res) => {
  try {
    const { code, restaurantId, orderAmount, customerId } = req.body;

    if (!code || !restaurantId) {
      return res.status(400).json({ message: 'Code and restaurant ID are required' });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      status: 'active'
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      coupon.status = 'expired';
      await coupon.save();
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check target user
    if (coupon.targetUserId && (!customerId || customerId.toString() !== coupon.targetUserId.toString())) {
      return res.status(403).json({ message: 'This coupon is not valid for your account' });
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount of ${coupon.minOrderAmount} required for this coupon` });
    }

    return res.status(200).json({
      message: 'Coupon is valid',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        discountAmount: coupon.discountType === 'percentage' 
          ? (orderAmount * coupon.value / 100) 
          : Math.min(orderAmount, coupon.value)
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({ message: 'Failed to validate coupon' });
  }
};

/**
 * Get all available coupons for a restaurant (Admin)
 */
const getRestaurantCoupons = async (req, res) => {
  try {
    const { restaurantId } = req;
    const coupons = await Coupon.find({ restaurantId }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      message: 'Coupons retrieved successfully',
      data: coupons
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    return res.status(500).json({ message: 'Failed to retrieve coupons' });
  }
};

module.exports = {
  createCoupon,
  validateCoupon,
  getRestaurantCoupons
};

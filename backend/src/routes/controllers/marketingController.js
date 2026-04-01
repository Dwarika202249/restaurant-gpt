const { Coupon, Order, Restaurant, User } = require('../../models');
const mongoose = require('mongoose');

// --- Coupon Logic (Previously in couponController.js) ---

/**
 * [ADMIN] Create a new coupon
 */
const createCoupon = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { code, discountType, value, minOrderAmount, expiryDate, maxUses, targetUserId, description, maxDiscountAmount } = req.body;

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
      description,
      maxDiscountAmount
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
 * [PUBLIC] Validate a coupon for customer checkout
 * POST /api/marketing/validate-coupon
 */
const validateCoupon = async (req, res) => {
  try {
    const { code, restaurantId, orderAmount, customerId } = req.body;

    console.log(`[Coupon Validation] Code: ${code}, RestaurantId: ${restaurantId}, Amount: ${orderAmount}, Customer: ${customerId}`);

    if (!code || !restaurantId) {
      return res.status(400).json({ message: 'Coupon code and Restaurant ID are required' });
    }

    let searchId;
    try {
      searchId = new mongoose.Types.ObjectId(restaurantId);
    } catch (e) {
      console.error(`[Coupon Error] Invalid RestaurantId format: ${restaurantId}`);
      return res.status(400).json({ message: 'Invalid Restaurant identification' });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      restaurantId: searchId,
      status: 'active'
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      if (coupon.status !== 'expired') {
        coupon.status = 'expired';
        await coupon.save();
      }
      return res.status(400).json({ message: 'This special offer has expired' });
    }

    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit reached for this campaign' });
    }

    // Check target user (Safe check for guest users)
    if (coupon.targetUserId) {
      if (!customerId) {
        return res.status(403).json({ message: 'This is an exclusive offer. Please login to claim.' });
      }
      if (customerId.toString() !== coupon.targetUserId.toString()) {
        return res.status(403).json({ message: 'This coupon is not valid for your account' });
      }
    }

    // Check minimum order amount (The most likely 400 cause)
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Min. order amount of ₹${coupon.minOrderAmount} required (Current: ₹${orderAmount.toFixed(0)})`,
        requiredAmount: coupon.minOrderAmount,
        currentAmount: orderAmount
      });
    }

    const discountAmount = coupon.discountType === 'percentage' 
      ? (orderAmount * coupon.value / 100) 
      : Math.min(orderAmount, coupon.value);

    console.log(`[Coupon] Successfully validated ${code} for order ₹${orderAmount}`);

    return res.status(200).json({
      message: 'Coupon successfully applied',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        discountAmount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        description: coupon.description
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({ message: 'Failed to validate coupon' });
  }
};

/**
 * [ADMIN] Get all available coupons for a restaurant
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

/**
 * [PUBLIC] Get all available coupons for a restaurant
 * GET /api/marketing/coupons/public/:restaurantId
 */
const getPublicCoupons = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { customerId } = req.query;

    const query = {
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      status: 'active',
      $or: [
        { targetUserId: null }, // Public coupons
        { targetUserId: customerId ? new mongoose.Types.ObjectId(customerId) : null } // Exclusive coupons
      ]
    };

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Available offers retrieved',
      data: coupons.map(c => ({
        ...c.toObject(),
        isEligible: true // Simplified for now
      }))
    });
  } catch (error) {
    console.error('Get public coupons error:', error);
    return res.status(500).json({ message: 'Failed to retrieve available offers' });
  }
};

/**
 * [ADMIN] Delete a coupon
 */
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurantId } = req;

    const coupon = await Coupon.findOneAndDelete({ _id: id, restaurantId });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({ message: 'Failed to delete coupon' });
  }
};

// --- Loyalty Logic (New) ---

/**
 * [ADMIN] Update Loyalty Settings for a restaurant
 */
const updateLoyaltySettings = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { enabled, earnRate, redeemRate, minPointsToRedeem, maxRedemptionPercentage } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.loyaltySettings = {
      enabled: enabled ?? restaurant.loyaltySettings.enabled,
      earnRate: earnRate ?? restaurant.loyaltySettings.earnRate,
      redeemRate: redeemRate ?? restaurant.loyaltySettings.redeemRate,
      minPointsToRedeem: minPointsToRedeem ?? restaurant.loyaltySettings.minPointsToRedeem,
      maxRedemptionPercentage: maxRedemptionPercentage ?? restaurant.loyaltySettings.maxRedemptionPercentage
    };

    await restaurant.save();

    return res.status(200).json({
      message: 'Loyalty settings updated successfully',
      data: restaurant.loyaltySettings
    });
  } catch (error) {
    console.error('Update loyalty settings error:', error);
    return res.status(500).json({ message: 'Failed to update loyalty settings' });
  }
};

/**
 * [PUBLIC] Get customer loyalty balance for a restaurant
 * GET /api/marketing/loyalty-balance/:restaurantId/:customerId
 */
const getLoyaltyBalance = async (req, res) => {
  try {
    const { restaurantId, customerId } = req.params;

    const user = await User.findById(customerId);
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const restaurantLoyalty = user.loyaltyPoints.find(
      l => l.restaurantId.toString() === restaurantId.toString()
    );

    const restaurant = await Restaurant.findById(restaurantId);

    return res.status(200).json({
      message: 'Loyalty balance retrieved',
      data: {
        points: restaurantLoyalty ? restaurantLoyalty.points : 0,
        settings: restaurant ? restaurant.loyaltySettings : null,
        perks: restaurant?.loyaltySettings?.perks || []
      }
    });
  } catch (error) {
    console.error('Get loyalty balance error:', error);
    return res.status(500).json({ message: 'Failed to retrieve loyalty balance' });
  }
};

/**
 * [PUBLIC] Claim a loyalty perk (Redeem points)
 * POST /api/marketing/claim-perk
 */
const claimPerk = async (req, res) => {
  try {
    const { restaurantId, customerId, perkId } = req.body;

    if (!restaurantId || !customerId || !perkId) {
      return res.status(400).json({ message: 'Restaurant ID, Customer ID, and Perk ID are required' });
    }

    const user = await User.findById(customerId);
    const restaurant = await Restaurant.findById(restaurantId);

    if (!user || !restaurant) {
      return res.status(404).json({ message: 'User or Restaurant not found' });
    }

    const perk = restaurant.loyaltySettings.perks.find(p => p.id === perkId);
    if (!perk) {
      return res.status(404).json({ message: 'Perk not found' });
    }

    const userPointsObj = user.loyaltyPoints.find(
      l => l.restaurantId.toString() === restaurantId.toString()
    );

    const userBalance = userPointsObj ? userPointsObj.points : 0;
    if (userBalance < perk.points) {
      return res.status(400).json({ message: 'Insufficient points capital to claim this experience' });
    }

    // 1. Deduct Points
    userPointsObj.points -= perk.points;
    user.markModified('loyaltyPoints');
    await user.save();

    // 2. Issue Personalized Coupon
    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const couponCode = `REWARD-${perk.title.split(' ')[0].toUpperCase()}-${uniqueSuffix}`;

    const newCoupon = new Coupon({
      code: couponCode,
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      discountType: 'fixed',
      value: 0, // Perk is a physical reward/experience, not a cash discount
      targetUserId: user._id,
      description: `REDEEMED: ${perk.title} (${perk.description || 'Special Member Benefit'})`,
      maxUses: 1,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days validity
    });

    await newCoupon.save();

    return res.status(200).json({
      message: 'Experience unlocked successfully!',
      data: {
        code: couponCode,
        newBalance: userPointsObj.points
      }
    });
  } catch (error) {
    console.error('Claim perk error:', error);
    return res.status(500).json({ message: 'Failed to claim experience' });
  }
};

/**
 * [ADMIN] Add a new loyalty perk
 * POST /api/marketing/loyalty-perks
 */
const addLoyaltyPerk = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { title, points, icon, color, description } = req.body;

    if (!title || !points) {
      return res.status(400).json({ message: 'Title and points requirement are required' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const newPerk = {
      id: new mongoose.Types.ObjectId().toString(),
      title,
      points,
      icon: icon || 'Gift',
      color: color || 'text-brand-500 bg-brand-500/10',
      description
    };

    restaurant.loyaltySettings.perks.push(newPerk);
    await restaurant.save();

    return res.status(201).json({
      message: 'Perk added successfully',
      data: newPerk
    });
  } catch (error) {
    console.error('Add loyalty perk error:', error);
    return res.status(500).json({ message: 'Failed to add perk' });
  }
};

/**
 * [ADMIN] Delete a loyalty perk
 * DELETE /api/marketing/loyalty-perks/:perkId
 */
const deleteLoyaltyPerk = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { perkId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    restaurant.loyaltySettings.perks = restaurant.loyaltySettings.perks.filter(
      p => p.id !== perkId
    );
    
    await restaurant.save();

    return res.status(200).json({ message: 'Perk deleted successfully' });
  } catch (error) {
    console.error('Delete loyalty perk error:', error);
    return res.status(500).json({ message: 'Failed to delete perk' });
  }
};

const { generateCouponDescription, generatePerkDescription } = require('../../services/aiService');

/**
 * [ADMIN] Generate AI description for a coupon
 */
const generateAICouponDescription = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { code, discountType, value, minOrderAmount } = req.body;

    if (!code || !discountType || value === undefined) {
      return res.status(400).json({ message: 'Code, discount type, and value are required to generate AI text' });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    const description = await generateCouponDescription({
      code,
      discountType,
      value,
      minOrderAmount,
      restaurantName: restaurant?.name
    });

    return res.status(200).json({
      message: 'AI description generated',
      data: description
    });
  } catch (error) {
    console.error('AI Coupon Generator error:', error);
    return res.status(500).json({ message: 'Failed to generate AI description' });
  }
};

/**
 * [ADMIN] Generate AI description for a loyalty perk
 */
const generateAIPerkDescription = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { title, points } = req.body;

    if (!title || !points) {
      return res.status(400).json({ message: 'Title and points are required to generate AI text' });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    const description = await generatePerkDescription({
      title,
      points,
      restaurantName: restaurant?.name
    });

    return res.status(200).json({
      message: 'AI description generated',
      data: description
    });
  } catch (error) {
    console.error('AI Perk Generator error:', error);
    return res.status(500).json({ message: 'Failed to generate AI description' });
  }
};

module.exports = {
  // Coupons
  createCoupon,
  validateCoupon,
  getRestaurantCoupons,
  getPublicCoupons,
  deleteCoupon,
  // Loyalty
  updateLoyaltySettings,
  getLoyaltyBalance,
  claimPerk,
  addLoyaltyPerk,
  deleteLoyaltyPerk,
  // AI
  generateAICouponDescription,
  generateAIPerkDescription
};

const express = require('express');
const router = express.Router();
const marketingController = require('./controllers/marketingController');
const { authenticateAdmin } = require('../middleware/auth');

// Public Marketing Routes (For Guest checkout)
router.post('/validate-coupon', marketingController.validateCoupon);
router.get('/loyalty-balance/:restaurantId/:customerId', marketingController.getLoyaltyBalance);
router.get('/public-coupons/:restaurantId', marketingController.getPublicCoupons);
router.post('/claim-perk', marketingController.claimPerk);

// Admin Marketing Routes
router.get('/coupons', authenticateAdmin, marketingController.getRestaurantCoupons);
router.post('/coupons/create', authenticateAdmin, marketingController.createCoupon);
router.delete('/coupons/:id', authenticateAdmin, marketingController.deleteCoupon);
router.put('/loyalty-settings', authenticateAdmin, marketingController.updateLoyaltySettings);
router.post('/perks', authenticateAdmin, marketingController.addLoyaltyPerk);
router.delete('/perks/:perkId', authenticateAdmin, marketingController.deleteLoyaltyPerk);
router.post('/generate-description', authenticateAdmin, marketingController.generateAICouponDescription);
router.post('/generate-perk-description', authenticateAdmin, marketingController.generateAIPerkDescription);

module.exports = router;

const { getAdminMe } = require('./controllers/getAdminMe');
const express = require('express');
const router = express.Router();
const { updateAdminProfile } = require('./controllers/updateAdminProfile');
const { updateCustomerProfile } = require('./controllers/updateCustomerProfile');
const {
  sendOTP,
  verifyOTP,
  refreshAccessToken,
  logout,
  generateGuestSession
} = require('./controllers/authController');
const { authenticateAdmin, authenticateAny, verifyRefresh } = require('../middleware/auth');

/**
 * @route   GET /api/auth/admin/me
 * @desc    Get current admin user profile
 * @access  Private (admin only)
 */
router.get('/admin/me', authenticateAdmin, getAdminMe);

/**
 * @route   PUT /api/auth/admin/profile
 * @desc    Update admin profile (name, email)
 * @access  Private (admin only)
 */
router.put('/admin/profile', authenticateAdmin, updateAdminProfile);

/**
 * @route   POST /api/auth/admin/send-otp
 * @desc    Send OTP to admin phone number
 * @access  Public
 */
router.post('/admin/send-otp', sendOTP);

/**
 * @route   POST /api/auth/admin/verify-otp
 * @desc    Verify OTP and return JWT tokens
 * @access  Public
 */
router.post('/admin/verify-otp', verifyOTP);

/**
 * @route   POST /api/auth/customer/send-otp
 * @desc    Send OTP to customer phone number
 * @access  Public
 */
router.post('/customer/send-otp', sendOTP);

/**
 * @route   POST /api/auth/customer/verify-otp
 * @desc    Verify OTP and return JWT tokens for customer
 * @access  Public
 */
router.post('/customer/verify-otp', verifyOTP);

/**
 * @route   PUT /api/auth/customer/profile
 * @desc    Update customer profile (name, email)
 * @access  Private (customer)
 */
router.put('/customer/profile', authenticateAny, updateCustomerProfile);

/**
 * @route   POST /api/auth/admin/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (but requires valid refresh token)
 */
router.post('/admin/refresh', verifyRefresh, refreshAccessToken);

/**
 * @route   POST /api/auth/admin/logout
 * @desc    Logout - invalidate refresh token
 * @access  Private (requires valid access token)
 */
router.post('/admin/logout', authenticateAdmin, logout);

/**
 * @route   POST /api/auth/guest-session
 * @desc    Generate guest session token for customer
 * @access  Public
 */
router.post('/guest-session', generateGuestSession);

module.exports = router;

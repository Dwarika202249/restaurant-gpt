const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  refreshAccessToken,
  logout,
  generateGuestSession
} = require('./controllers/authController');
const { authenticateAdmin, verifyRefresh } = require('../middleware/auth');

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

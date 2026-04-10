const { getAdminMe } = require('./controllers/getAdminMe');
const { getStaffMe } = require('./controllers/getStaffMe');
const express = require('express');
const router = express.Router();
const { updateAdminProfile } = require('./controllers/updateAdminProfile');
const { updateCustomerProfile } = require('./controllers/updateCustomerProfile');
const {
  sendOTP,
  sendStaffOTP,
  verifyOTP,
  refreshAccessToken,
  logout,
  generateGuestSession,
  superAdminLogin,
  superAdminSignup,
  changeSuperAdminPassword,
  verifyFirebaseToken
} = require('./controllers/authController');
const { authenticateAdmin, authenticateStaff, authenticateAny, verifyRefresh, authenticateSuperAdmin } = require('../middleware/auth');

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

// NEW: Firebase Verification Routes
router.post('/firebase-verify', verifyFirebaseToken);
router.post('/firebase-verify/customer', verifyFirebaseToken);

/**
 * @route   POST /api/auth/staff/send-otp
 * @desc    Send OTP to staff phone (Waiter/Chef only)
 * @access  Public (Registration checked)
 */
router.post('/staff/send-otp', sendStaffOTP);

/**
 * @route   GET /api/auth/staff/me
 * @desc    Get current staff user profile
 * @access  Private (waiter/chef only)
 */
router.get('/staff/me', authenticateStaff, getStaffMe);

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
 * @route   POST /api/auth/superadmin/change-password
 * @desc    Change Supreme Admin password
 * @access  Private (superadmin only)
 */
router.post('/superadmin/change-password', authenticateSuperAdmin, changeSuperAdminPassword);

/**
 * @route   POST /api/auth/superadmin/login
 * @desc    Supreme Admin login with email and password
 * @access  Public
 */
router.post('/superadmin/login', superAdminLogin);

/**
 * @route   POST /api/auth/superadmin/signup
 * @desc    Create a new Supreme Admin profile (requires manual promotion)
 * @access  Public
 */
router.post('/superadmin/signup', superAdminSignup);

/**
 * @route   POST /api/auth/guest-session
 * @desc    Generate guest session token for customer
 * @access  Public
 */
router.post('/guest-session', generateGuestSession);

module.exports = router;

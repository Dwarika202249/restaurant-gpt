const express = require('express');
const router = express.Router();
const {
  getRestaurantProfile,
  updateRestaurantProfile,
  setupRestaurant,
  deleteRestaurant,
  getRestaurantBySlug
} = require('./controllers/restaurantController');
const {
  generateTableQRCodes,
  getTableQRPreview
} = require('./controllers/qrController');
const {
  getTables,
  addTable,
  updateTable,
  deleteTable,
  resolveScan
} = require('./controllers/tableController');
const { getRestaurantCustomers } = require('./controllers/crmController');
const { authenticateAdmin } = require('../middleware/auth');
const { attachRestaurantContext, verifyRestaurantAccess } = require('../middleware/tenantContext');

/**
 * @route   GET /api/restaurant/profile
 * @desc    Get authenticated admin's restaurant profile
 * @access  Private (admin only)
 */
router.get(
  '/profile',
  authenticateAdmin,
  attachRestaurantContext,
  verifyRestaurantAccess,
  getRestaurantProfile
);

/**
 * @route   PUT /api/restaurant/profile
 * @desc    Update authenticated admin's restaurant profile
 * @access  Private (admin only)
 */
router.put(
  '/profile',
  authenticateAdmin,
  attachRestaurantContext,
  verifyRestaurantAccess,
  updateRestaurantProfile
);

/**
 * @route   POST /api/restaurant/setup
 * @desc    Create a new restaurant for authenticated admin
 * @access  Private (admin only)
 */
router.post(
  '/setup',
  authenticateAdmin,
  setupRestaurant
);

/**
 * @route   DELETE /api/restaurant/:restaurantId
 * @desc    Delete restaurant (soft delete)
 * @access  Private (admin only, owner)
 */
router.delete(
  '/:restaurantId',
  authenticateAdmin,
  attachRestaurantContext,
  verifyRestaurantAccess,
  deleteRestaurant
);

/**
 * @route   GET /api/restaurant/public/:slug
 * @desc    Get restaurant by slug (public endpoint for customer interface)
 * @access  Public
 */
router.get(
  '/public/:slug',
  getRestaurantBySlug
);

/**
 * @route   GET /api/restaurant/scan/:qrId
 * @desc    Resolve QR scan to restaurant/table context
 * @access  Public
 */
router.get(
  '/scan/:qrId',
  resolveScan
);

/**
 * QR Code Routes
 */

/**
 * @route   POST /api/restaurant/qr-generate
 * @desc    Generate QR codes for all restaurant tables
 * @access  Private (Admin)
 * @body    { format: 'preview' | 'svg' | 'pdf' }
 * @response
 *   - preview: Array of SVG strings for UI preview
 *   - svg: Array of individual SVG files for download
 *   - pdf: PDF file with all QR codes (2 columns x 4 rows layout)
 */
router.post(
  '/qr-generate',
  authenticateAdmin,
  attachRestaurantContext,
  generateTableQRCodes
);

/**
 * @route   GET /api/restaurant/qr-preview/:restaurantId/:tableNo
 * @desc    Get QR code preview for a specific table
 * @access  Private (Admin)
 */
router.get(
  '/qr-preview/:restaurantId/:tableNo',
  authenticateAdmin,
  getTableQRPreview
);

/**
 * Table Management Routes
 */

/**
 * @route   GET /api/tables
 * @desc    Get all tables for a restaurant
 * @access  Private (Admin)
 */
router.get(
  '/tables',
  authenticateAdmin,
  attachRestaurantContext,
  getTables
);

/**
 * @route   POST /api/tables
 * @desc    Add a new table
 * @access  Private (Admin)
 */
router.post(
  '/tables',
  authenticateAdmin,
  attachRestaurantContext,
  addTable
);

/**
 * @route   PATCH /api/tables/:id
 * @desc    Update table details
 * @access  Private (Admin)
 */
router.patch(
  '/tables/:id',
  authenticateAdmin,
  attachRestaurantContext,
  updateTable
);

/**
 * @route   DELETE /api/tables/:id
 * @desc    Delete a table
 * @access  Private (Admin)
 */
router.delete(
  '/tables/:id',
  authenticateAdmin,
  attachRestaurantContext,
  deleteTable
);

/**
 * CRM Routes
 */

/**
 * @route   GET /api/restaurant/customers
 * @desc    Get customers who have ordered from this restaurant
 * @access  Private (Admin)
 */
router.get(
  '/customers',
  authenticateAdmin,
  attachRestaurantContext,
  verifyRestaurantAccess,
  getRestaurantCustomers
);

module.exports = router;

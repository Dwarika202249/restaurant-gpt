const mongoose = require('mongoose');
const { Table, Restaurant } = require('../../models');

/**
 * Get all tables for a restaurant
 * GET /api/tables
 */
const getTables = async (req, res) => {
  try {
    const { restaurantId } = req;
    const tables = await Table.find({ restaurantId }).sort({ tableNo: 1 });

    return res.status(200).json({
      message: 'Tables retrieved successfully',
      data: tables
    });
  } catch (error) {
    console.error('Get tables error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve tables',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add a new table
 * POST /api/tables
 * Body: { tableNo (optional), label (optional) }
 */
const addTable = async (req, res) => {
  try {
    // 1. Precise Context Extraction
    const restaurantId = req.restaurantId || (req.user && req.user.restaurantId);
    
    if (!restaurantId) {
      console.error('[CRITICAL] No restaurantId found in request');
      return res.status(400).json({ message: 'Restaurant identity not found in your session.' });
    }

    const { label } = req.body;

    // 2. Guaranteed Next Number Logic
    const lastTable = await Table.findOne({ restaurantId }).sort({ tableNo: -1 });
    const finalTableNo = (lastTable && typeof lastTable.tableNo === 'number') ? lastTable.tableNo + 1 : 1;

    // 3. Entity Creation
    const newTable = new Table({
      restaurantId,
      tableNo: finalTableNo,
      label: label || `Table ${finalTableNo}`,
      status: 'active'
    });

    await newTable.save();

    // 4. Backward Sync
    try {
      await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { tablesCount: 1 } });
    } catch (syncErr) {
      console.warn('[WARN] TablesCount sync failed, but table was created.', syncErr);
    }

    return res.status(201).json({
      message: 'Table identity successfully added to fleet',
      data: newTable
    });
  } catch (error) {
    console.error('Add table error [DEBUG]:', error);
    return res.status(500).json({
      message: 'Failed to add table identity to fleet',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Update table details
 * PATCH /api/tables/:id
 * Body: { label, status, tableNo }
 */
const updateTable = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { id } = req.params;
    const { label, status, tableNo } = req.body;

    const table = await Table.findOneAndUpdate(
      { _id: id, restaurantId },
      { label, status, tableNo, updatedAt: new Date() },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    return res.status(200).json({
      message: 'Table updated successfully',
      data: table
    });
  } catch (error) {
    console.error('Update table error:', error);
    return res.status(500).json({
      message: 'Failed to update table',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a table (soft delete)
 * DELETE /api/tables/:id
 */
const deleteTable = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { id } = req.params;

    const table = await Table.findOneAndDelete({ _id: id, restaurantId });

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Sync restaurant tablesCount
    await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { tablesCount: -1 } });

    return res.status(200).json({
      message: 'Table deleted successfully'
    });
  } catch (error) {
    console.error('Delete table error:', error);
    return res.status(500).json({
      message: 'Failed to delete table',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Smart Scan Resolver (Public)
 * GET /api/public/scan/:qrId
 */
const resolveScan = async (req, res) => {
  try {
    const { qrId } = req.params;

    const table = await Table.findOne({ qrId, isActive: true })
      .populate('restaurantId', 'name slug themeColor logoUrl');

    if (!table || !table.restaurantId) {
      return res.status(404).json({ message: 'Invalid or deactivated QR code' });
    }

    if (table.status === 'maintenance') {
      return res.status(403).json({ 
        message: 'This table is currently under maintenance. Please contact staff.',
        data: { restaurant: table.restaurantId }
      });
    }

    // Update last scanned timestamp
    table.lastScannedAt = new Date();
    await table.save();

    return res.status(200).json({
      message: 'Scan resolved successfully',
      data: {
        restaurant: table.restaurantId,
        tableNo: table.tableNo,
        tableLabel: table.label
      }
    });
  } catch (error) {
    console.error('Resolve scan error:', error);
    return res.status(500).json({
      message: 'Failed to resolve scan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getTables,
  addTable,
  updateTable,
  deleteTable,
  resolveScan
};

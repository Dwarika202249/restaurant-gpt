const { User } = require('../../models');
const mongoose = require('mongoose');

/**
 * Add new staff member to restaurant
 * POST /api/restaurant/staff
 * Body: { name, phone, role }
 */
const addStaff = async (req, res) => {
  try {
    const { name, phone, role } = req.body;
    const { restaurantId } = req;

    if (!name || !phone || !role) {
      return res.status(400).json({ message: 'Name, phone, and role are required' });
    }

    const validRoles = ['waiter', 'chef'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be waiter or chef.' });
    }

    // Check if user with this phone already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const staff = new User({
      name,
      phone,
      role,
      restaurantId,
      profileComplete: true
    });

    await staff.save();

    return res.status(201).json({
      message: 'Staff member added successfully',
      data: staff
    });
  } catch (error) {
    console.error('Add staff error:', error);
    return res.status(500).json({
      message: 'Failed to add staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all staff for a restaurant
 * GET /api/restaurant/staff
 */
const getStaffList = async (req, res) => {
  try {
    const { restaurantId } = req;
    
    const staff = await User.find({ 
      restaurantId, 
      role: { $in: ['waiter', 'chef'] } 
    }).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Staff list retrieved successfully',
      data: staff
    });
  } catch (error) {
    console.error('Get staff list error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve staff list',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a staff member
 * DELETE /api/restaurant/staff/:id
 */
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurantId } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    const staff = await User.findOneAndDelete({ 
      _id: id, 
      restaurantId,
      role: { $in: ['waiter', 'chef'] } 
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    return res.status(200).json({
      message: 'Staff member removed successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    return res.status(500).json({
      message: 'Failed to remove staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update table assignments for a staff member
 * PUT /api/restaurant/staff/:id/assignments
 * Body: { assignedTables: [Number] }
 */
const updateStaffAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTables } = req.body;
    const { restaurantId } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    if (!Array.isArray(assignedTables)) {
      return res.status(400).json({ message: 'Assignments must be an array of table numbers' });
    }

    const staff = await User.findOneAndUpdate(
      { _id: id, restaurantId, role: { $in: ['waiter', 'chef'] } },
      { $set: { assignedTables } },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    return res.status(200).json({
      message: 'Assignments updated successfully',
      });
  } catch (error) {
    console.error('Update assignments error:', error);
    return res.status(500).json({
      message: 'Failed to update assignments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update staff member details
 * PUT /api/restaurant/staff/:id
 * Access: Private (Admin)
 */
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role } = req.body;
    const { restaurantId } = req;

    if (!name || !phone || !role) {
      return res.status(400).json({ message: 'Name, phone, and role are required' });
    }

    const validRoles = ['waiter', 'chef'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be waiter or chef.' });
    }

    // Check if another user with this phone already exists (excluding current staff)
    const existingUser = await User.findOne({ phone, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Another user with this phone number already exists' });
    }

    const staff = await User.findOneAndUpdate(
      { _id: id, restaurantId },
      { $set: { name, phone, role } },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found or access denied' });
    }

    return res.status(200).json({
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    console.error('Update staff error:', error);
    return res.status(500).json({
      message: 'Failed to update staff member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Toggle on-duty status for staff
 * PATCH /api/restaurant/staff/on-duty
 * Access: Private (Staff only)
 */
const toggleStaffServiceStatus = async (req, res) => {
  try {
    const { _id: staffId, restaurantId } = req.user;
    const { onDuty } = req.body;
    let newStatus = onDuty;
    
    // Auto-toggle if not provided or wrong type
    if (typeof onDuty !== 'boolean') {
      const currentUser = await User.findById(staffId);
      newStatus = !currentUser.onDuty;
    }

    const staff = await User.findOneAndUpdate(
      { _id: staffId, restaurantId, role: { $in: ['waiter', 'chef'] } },
      { $set: { onDuty: newStatus } },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff identity not verified' });
    }

    // Emit live update to admin dashboard
    const socketService = require('../../services/socketService');
    socketService.emitToRestaurant(restaurantId, 'staff-duty-changed', {
      userId: staffId,
      onDuty: staff.onDuty,
      role: staff.role
    });

    return res.status(200).json({
      message: `Station status updated: ${newStatus ? 'ON DUTY' : 'OFF DUTY'}`,
      data: {
        onDuty: staff.onDuty
      }
    });
  } catch (error) {
    console.error('Toggle duty status error:', error);
    return res.status(500).json({
      message: 'Failed to update service status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Auto-Pilot: Assign staff to a guest session
 * Logic: Priority to dedicated table assignment -> least busy on-duty waiter
 */
const assignStaffToSession = async (restaurantId, tableNo, sessionId) => {
  try {
    const { Session, User, Restaurant } = require('../../models');

    // 0. Check if Auto-Pilot is enabled for this restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || restaurant.autoPilot === false) {
      console.log(`[Auto-Pilot] Manual Mode active for ${restaurant?.name || restaurantId}. Skipping assignment.`);
      return null;
    }

    // 1. Check for dedicated staff (explicitly assigned to this table)
    let assignedStaff = await User.findOne({
      restaurantId,
      role: 'waiter',
      onDuty: true,
      assignedTables: tableNo
    });

    // 2. Fallback: Load balancing (on-duty staff with least active sessions)
    if (!assignedStaff) {
      const onDutyStaff = await User.find({
        restaurantId,
        role: 'waiter',
        onDuty: true
      });

      if (onDutyStaff.length > 0) {
        // Calculate workload for each staff (counts active sessions assigned to them)
        const staffWorkloads = await Promise.all(onDutyStaff.map(async (s) => ({
          staff: s,
          workload: await Session.countDocuments({ assignedStaff: s._id, expiresAt: { $gt: new Date() } })
        })));

        // Sort by workload ascending
        staffWorkloads.sort((a, b) => a.workload - b.workload);
        assignedStaff = staffWorkloads[0].staff;
      }
    }

    // 3. Update session if staff found
    if (assignedStaff) {
      await Session.findByIdAndUpdate(sessionId, { assignedStaff: assignedStaff._id });
      console.log(`[Auto-Pilot] Assigned ${assignedStaff.name} to Table ${tableNo} (Session: ${sessionId})`);
      return assignedStaff;
    }

    return null;
  } catch (error) {
    console.error('Auto-Pilot Assignment Error:', error);
    return null;
  }
};

module.exports = {
  addStaff,
  getStaffList,
  deleteStaff,
  updateStaff,
  updateStaffAssignments,
  toggleStaffServiceStatus,
  assignStaffToSession
};

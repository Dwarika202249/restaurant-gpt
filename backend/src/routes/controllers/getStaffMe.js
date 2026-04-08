const { User } = require('../../models');

const getStaffMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user || !['waiter', 'chef'].includes(user.role)) {
      return res.status(401).json({ message: 'User authorization failed or identity lost' });
    }
    return res.status(200).json({ user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      restaurantId: user.restaurantId,
      onDuty: user.onDuty,
      staffColor: user.staffColor,
      assignedTables: user.assignedTables,
      createdAt: user.createdAt
    }});
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch staff user' });
  }
};

module.exports = { getStaffMe };

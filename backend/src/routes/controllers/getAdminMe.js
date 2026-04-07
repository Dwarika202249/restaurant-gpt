const { User } = require('../../models');

const getAdminMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(401).json({ message: 'User authorization failed or identity lost' });
    }
    return res.status(200).json({ user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      restaurantId: user.restaurantId,
      profileComplete: user.profileComplete,
      createdAt: user.createdAt
    }});
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
};

module.exports = { getAdminMe };

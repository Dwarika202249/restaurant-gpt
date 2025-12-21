const { User } = require('../../models');

const getAdminMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    return res.status(200).json({ user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      restaurantId: user.restaurantId,
      profileComplete: user.profileComplete
    }});
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
};

module.exports = { getAdminMe };

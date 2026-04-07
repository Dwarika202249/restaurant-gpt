// Update admin profile (name, email)
const { User } = require('../../models');

const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const user = await User.findById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(404).json({ message: 'User not found or insufficient privileges' });
    }

    user.name = name;
    user.email = email;
    user.profileComplete = true;
    await user.save();

    return res.status(200).json({
      message: 'Profile updated',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileComplete: user.profileComplete,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = { updateAdminProfile };

const { User } = require('../../models');

/**
 * Update customer profile (name, email)
 * PUT /api/auth/customer/profile
 * Access: Private (Customer)
 */
const updateCustomerProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Basic validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          name: name || undefined, 
          email: email || undefined 
        } 
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          phone: updatedUser.phone,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          loyaltyPoints: updatedUser.loyaltyPoints || 0
        }
      }
    });
  } catch (error) {
    console.error('Update customer profile error:', error);
    return res.status(500).json({
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { updateCustomerProfile };

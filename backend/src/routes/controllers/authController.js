const { User, Restaurant } = require('../../models');
const { generateTokens, generateGuestToken } = require('../../utils/tokenGenerator');
const mongoose = require('mongoose');
const firebaseAdmin = require('../../utils/firebaseAdmin');

/**
 * Send OTP to admin phone number
 * In production, integrate with SMS service (Twilio, AWS SNS, etc.)
 * For now, we generate a 6-digit OTP and store it in session/memory
 */
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.trim().length === 0) {
      return res.status(400).json({
        message: 'Phone number is required'
      });
    }

    // Check for Demo Phone Number
    const DEMO_PHONE = '9999999999';
    const isDemo = phone.replace(/\D/g, '') === DEMO_PHONE;

    // Validate phone format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        message: 'Invalid phone number format. Please provide a 10-digit number.'
      });
    }

    // Generate 6-digit OTP
    const otp = isDemo ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // TODO: In production, store in Redis with TTL or database
    // For now, storing in memory (will be lost on server restart)
    if (!global.otpStore) {
      global.otpStore = {};
    }
    global.otpStore[phone] = {
      otp,
      expiresAt: otpExpiry,
      attempts: 0
    };

    // TODO: Send OTP via SMS service
    // Example: await twilioClient.messages.create({ to: phone, body: `Your OTP is ${otp}` });
    
    console.log(`[DEV] OTP for ${phone}: ${otp}`); // Development logging

    return res.status(200).json({
      message: 'OTP sent successfully',
      // Send OTP in response for demo number OR in development mode
      ...((isDemo || process.env.NODE_ENV === 'development') && { otp })
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      message: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send OTP to staff phone number (Waiters/Chefs)
 * Strictly verifies registration before sending OTP
 */
const sendStaffOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanedPhone = phone ? phone.replace(/\D/g, '') : '';

    if (!cleanedPhone || cleanedPhone.length !== 10) {
      return res.status(400).json({
        message: 'Valid 10-digit mobile number is required'
      });
    }

    // STRICT CHECK: Verify if phone is registered as staff (Waiter/Chef)
    const staffUser = await User.findOne({ 
      phone: cleanedPhone, 
      role: { $in: ['waiter', 'chef'] } 
    });

    if (!staffUser) {
      return res.status(403).json({
        message: 'Access Denied: This mobile number is not registered in our staff registry. Please contact your administrator.'
      });
    }

    // Check for Demo Phone Number
    const DEMO_PHONE = '9999999999';
    const isDemo = cleanedPhone === DEMO_PHONE;

    // Generate 6-digit OTP
    const otp = isDemo ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!global.otpStore) {
      global.otpStore = {};
    }
    global.otpStore[cleanedPhone] = {
      otp,
      expiresAt: otpExpiry,
      attempts: 0
    };

    console.log(`[STAFF-AUTH] OTP for ${cleanedPhone} (${staffUser.role}): ${otp}`);

    return res.status(200).json({
      message: 'Authentication key sent to your mobile',
      ...((isDemo || process.env.NODE_ENV === 'development') && { otp })
    });
  } catch (error) {
    console.error('Send Staff OTP error:', error);
    return res.status(500).json({
      message: 'Authentication service busy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify OTP and return JWT tokens
 */
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: 'Phone number and OTP are required'
      });
    }

    // Bypass for Demo Phone Number
    const DEMO_PHONE = '9999999999';
    const DEMO_OTP = '123456';
    const isDemo = phone.replace(/\D/g, '') === DEMO_PHONE && otp === DEMO_OTP;

    if (!isDemo) {
      // Verify OTP from store
      if (!global.otpStore || !global.otpStore[phone]) {
        return res.status(400).json({
          message: 'OTP not found or expired'
        });
      }

      const otpData = global.otpStore[phone];

      // Check expiry
      if (new Date() > otpData.expiresAt) {
        delete global.otpStore[phone];
        return res.status(400).json({
          message: 'OTP expired'
        });
      }

      // Check max attempts
      if (otpData.attempts >= 3) {
        delete global.otpStore[phone];
        return res.status(400).json({
          message: 'Maximum OTP verification attempts exceeded'
        });
      }

      // Verify OTP
      if (otpData.otp !== otp) {
        otpData.attempts += 1;
        return res.status(400).json({
          message: 'Invalid OTP'
        });
      }

      // OTP verified - clear from store
      delete global.otpStore[phone];
    }

    // Find user - handle multiple roles for staff (Admin, Waiter, Chef)
    const isCustomerPath = req.path.includes('customer');
    let user = await User.findOne({ phone });

    if (!user) {
      const userRole = isCustomerPath ? 'customer' : 'admin';
      // New user - create account
      user = new User({
        phone,
        role: userRole
      });
      await user.save();
    } else {
      // If user exists, verify they are using the correct login path
      // Relaxation: We allow staff (admin, waiter, chef) to login as customers.
      // We only block customers from trying to login to the staff/admin dashboard.
      if (!isCustomerPath && user.role === 'customer') {
        return res.status(403).json({ message: 'This phone is registered as customer. Use customer menu.' });
      }
    }

    // Migration Logic: If customer login and guestSessionId provided, link orders
    const { guestSessionId, restaurantId: sessionRestaurantId } = req.body;
    if (isCustomerPath && guestSessionId && sessionRestaurantId) {
      const { Order } = require('../../models');
      await Order.updateMany(
        { 
          guestSessionId: new mongoose.Types.ObjectId(guestSessionId), 
          restaurantId: new mongoose.Types.ObjectId(sessionRestaurantId),
          customerId: null 
        },
        { $set: { customerId: user._id } }
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.restaurantId || sessionRestaurantId);

    // Store refresh token in user's token list
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          restaurantId: user.restaurantId,
          profileComplete: user.profileComplete
        }
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      message: 'OTP verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify Firebase ID Token and return local JWT tokens
 */
const verifyFirebaseToken = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID Token is required' });
    }

    // 1. Verify token with Firebase Admin
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    let phone = decodedToken.phone_number;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number missing in verified token' });
    }

    // Normalize phone (remove + for internal consistency if needed, 
    // but our current registration uses phone string directly)
    // Most users provide 10 digits, Firebase provides E.164 (+91...)
    // Let's strip the '+' and country code if it matches our assumed 10-digit format
    phone = phone.replace('+', '');
    if (phone.startsWith('91') && phone.length > 10) {
      phone = phone.substring(2);
    }

    // 2. Find or Create User
    const isCustomerPath = req.path.includes('customer');
    let user = await User.findOne({ phone });

    if (!user) {
      const userRole = isCustomerPath ? 'customer' : 'admin';
      user = new User({
        phone,
        role: userRole,
        // Firebase users have already verified their phone
        profileComplete: false 
      });
      await user.save();
    } else {
      if (!isCustomerPath && user.role === 'customer') {
        return res.status(403).json({ message: 'This phone is registered as customer. Use customer menu.' });
      }
    }

    // 3. Handle Migration if Guest Session provided
    const { guestSessionId, restaurantId: sessionRestaurantId } = req.body;
    if (isCustomerPath && guestSessionId && sessionRestaurantId) {
      const { Order } = require('../../models');
      await Order.updateMany(
        { 
          guestSessionId: new mongoose.Types.ObjectId(guestSessionId), 
          restaurantId: new mongoose.Types.ObjectId(sessionRestaurantId),
          customerId: null 
        },
        { $set: { customerId: user._id } }
      );
    }

    // 4. Generate local tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.restaurantId || sessionRestaurantId);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      message: 'Login successful via Firebase',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          restaurantId: user.restaurantId,
          profileComplete: user.profileComplete
        }
      }
    });
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required'
      });
    }

    // User is already verified by verifyRefresh middleware
    const user = req.user;

    // Verify the refresh token exists and is not expired
    const tokenExists = user.refreshTokens.some(
      rt => rt.token === refreshToken && new Date(rt.expiresAt) > new Date()
    );

    if (!tokenExists) {
      return res.status(401).json({
        message: 'Invalid or expired refresh token'
      });
    }

    // Generate new access token
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id,
      user.restaurantId
    );

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    return res.status(200).json({
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      message: 'Token refresh failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Logout - invalidate refresh token
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token is required'
      });
    }

    // User is already verified by authenticateAdmin middleware
    const user = req.user;

    // Remove the refresh token
    user.refreshTokens = user.refreshTokens.filter(
      rt => rt.token !== refreshToken
    );
    await user.save();

    return res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate guest session token for customers
 */
const generateGuestSession = async (req, res) => {
  try {
    const { restaurantSlug, tableNo } = req.body;

    if (!restaurantSlug || !tableNo) {
      return res.status(400).json({
        message: 'Restaurant slug and table number are required'
      });
    }

    // Find restaurant by slug
    const restaurant = await Restaurant.findOne({
      slug: restaurantSlug.toLowerCase()
    });

    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    // Validate table number
    if (tableNo < 1 || tableNo > restaurant.tablesCount) {
      return res.status(400).json({
        message: `Invalid table number. Restaurant has ${restaurant.tablesCount} tables.`
      });
    }

    // Generate guest session token
    const sessionId = new Date().getTime().toString() + Math.random().toString(36).substr(2, 9);
    const guestToken = generateGuestToken(sessionId, restaurant._id, tableNo);

    return res.status(200).json({
      message: 'Guest session created',
      data: {
        guestToken,
        sessionId,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        tableNo,
        expiresAt: new Date(Date.now() + 45 * 60 * 1000)
      }
    });
  } catch (error) {
    console.error('Guest session generation error:', error);
    return res.status(500).json({
      message: 'Failed to generate guest session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Supreme Admin login with email and password
 */
const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user with password selected
    const user = await User.findOne({ email, role: 'superadmin' }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, null);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      message: 'Supreme Admin login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileComplete: user.profileComplete
        }
      }
    });
  } catch (error) {
    console.error('SuperAdmin login error:', error);
    return res.status(500).json({
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Supreme Admin Signup - Creates an admin user who can be promoted to superadmin
 */
const superAdminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email identifier already registered in the mesh'
      });
    }

    // Create new admin user (to be promoted manually)
    const user = new User({
      name,
      email,
      password,
      role: 'admin', // Starts as admin, promoted to superadmin manually
      profileComplete: true
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Supreme profile created. Please promote this user to "superadmin" in the database to activate access.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('SuperAdmin signup error:', error);
    return res.status(500).json({
      message: 'Profile creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Change Supreme Admin password
 */
const changeSuperAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current and new passwords are required'
      });
    }

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password key is incorrect'
      });
    }

    // Set and save new password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      message: 'Supreme Security Vault re-encrypted. Password updated successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      message: 'Password synchronization failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
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
};

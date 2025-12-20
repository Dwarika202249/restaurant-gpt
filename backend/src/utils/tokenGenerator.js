const jwt = require('jsonwebtoken');

/**
 * Generate JWT tokens for admin authentication
 * Returns access token (15min) and refresh token (7 days)
 */
const generateTokens = (userId, restaurantId) => {
  const accessToken = jwt.sign(
    {
      userId,
      restaurantId,
      type: 'access'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m'
    }
  );

  const refreshToken = jwt.sign(
    {
      userId,
      restaurantId,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d'
    }
  );

  return { accessToken, refreshToken };
};

/**
 * Generate guest session JWT for customers (4 hour expiry)
 */
const generateGuestToken = (sessionId, restaurantId, tableNo) => {
  const token = jwt.sign(
    {
      sessionId,
      restaurantId,
      tableNo,
      type: 'guest'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '4h'
    }
  );

  return token;
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error(`Access token verification failed: ${error.message}`);
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};

/**
 * Verify guest token
 */
const verifyGuestToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'guest') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error(`Guest token verification failed: ${error.message}`);
  }
};

module.exports = {
  generateTokens,
  generateGuestToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyGuestToken
};

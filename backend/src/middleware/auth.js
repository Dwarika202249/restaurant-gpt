const {
  verifyAccessToken,
  verifyRefreshToken,
  verifyGuestToken,
} = require("../utils/tokenGenerator");
const { User } = require("../models");

/**
 * Middleware to authenticate admin users
 * Verifies access token and attaches user to request
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.userId);

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({
        message: "Unauthorized: Administrative access required",
      });
    }

    // Attach user and restaurantId to request
    req.user = user;
    req.restaurantId = user.restaurantId;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired",
      });
    }

    return res.status(401).json({
      message: error.message || "Authentication failed",
    });
  }
};

/**
 * Middleware to verify refresh token
 * Used for token refresh endpoint
 */
const verifyRefresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Fetch user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Check if refresh token exists in user's token list
    const tokenExists = user.refreshTokens.some(
      (rt) => rt.token === refreshToken && new Date(rt.expiresAt) > new Date(),
    );

    if (!tokenExists) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Refresh token expired",
      });
    }

    return res.status(401).json({
      message: error.message || "Token refresh failed",
    });
  }
};

/**
 * Middleware to authenticate guest users
 * Verifies guest session token
 */
const authenticateGuest = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyGuestToken(token);

    // Attach guest info to request
    req.guestSession = {
      sessionId: decoded.sessionId,
      restaurantId: decoded.restaurantId,
      tableNo: decoded.tableNo,
    };

    // Explicitly set restaurantId for compatibility with context middlewares
    req.restaurantId = decoded.restaurantId;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Guest session expired",
      });
    }

    return res.status(401).json({
      message: error.message || "Guest authentication failed",
    });
  }
};

/**
 * Middleware to authenticate staff users (waiter, chef)
 */
const authenticateStaff = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.userId);

    if (!user || (user.role !== "waiter" && user.role !== "chef")) {
      return res.status(403).json({
        message: "Unauthorized: Staff access required",
      });
    }

    // Attach user and restaurantId to request
    req.user = user;
    req.restaurantId = user.restaurantId;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired",
      });
    }

    return res.status(401).json({
      message: error.message || "Authentication failed",
    });
  }
};

/**
 * Middleware to allow both admin and guest authentication
 */
const authenticateAny = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    // Try to verify as access token first (admin)
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = user;
        req.restaurantId = user.restaurantId;
        return next();
      }
    } catch (error) {
      // Not an access token, try guest token
    }

    // Try to verify as guest token
    try {
      const decoded = verifyGuestToken(token);
      req.guestSession = {
        sessionId: decoded.sessionId,
        restaurantId: decoded.restaurantId,
        tableNo: decoded.tableNo,
      };

      // Explicitly set restaurantId for compatibility with context middlewares
      req.restaurantId = decoded.restaurantId;

      return next();
    } catch (error) {
      // Not a guest token either
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message || "Authentication failed",
    });
  }
};

/**
 * Middleware to authenticate superadmin users
 */
const authenticateSuperAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({
        message: "Unauthorized: Supreme Admin access required",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired",
      });
    }

    return res.status(401).json({
      message: error.message || "Authentication failed",
    });
  }
};

module.exports = {
  authenticateAdmin,
  authenticateStaff,
  verifyRefresh,
  authenticateGuest,
  authenticateAny,
  authenticateSuperAdmin,
};

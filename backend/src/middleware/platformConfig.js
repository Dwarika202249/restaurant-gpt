const { GlobalConfig } = require('../models');

/**
 * Platform Configuration Middleware
 * Handles Maintenance Mode and Global Feature Enforcement
 */
const platformConfigMiddleware = async (req, res, next) => {
  try {
    // 1. Skip checks for SuperAdmin routes
    if (req.path.startsWith('/api/superadmin') || req.path.startsWith('/api/auth/superadmin')) {
      return next();
    }

    // 2. Fetch Global Config (Cached for 1 minute or per request for now)
    // For production, this should be cached in memory/Redis
    const config = await GlobalConfig.findOne();

    if (!config) return next();

    // 3. Maintenance Mode Check
    if (config.maintenanceMode && config.maintenanceMode.enabled) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: config.maintenanceMode.message || 'Platform is under maintenance.'
      });
    }

    // 4. Feature Integrity Checks
    // If AI Chat is globally disabled, block AI routes
    if (req.path.startsWith('/api/ai') && config.features && config.features.aiChatEnabled === false) {
      return res.status(403).json({
        success: false,
        message: 'Neural AI Engine is currently offline.'
      });
    }

    // Attach config to request for use in controllers if needed
    req.platformConfig = config;
    next();
  } catch (error) {
    console.error('Platform Config Middleware Error:', error);
    next(); // Fallback to allowing request
  }
};

module.exports = platformConfigMiddleware;

const { Restaurant, Table } = require('../../models');
const { buildRestaurantFilter } = require('../../middleware/tenantContext');

/**
 * Get restaurant profile
 * Retrieves the authenticated admin's restaurant details
 */
const getRestaurantProfile = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    return res.status(200).json({
      message: 'Restaurant profile retrieved',
      data: restaurant
    });
  } catch (error) {
    console.error('Get restaurant profile error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve restaurant profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update restaurant profile
 * Admins can update their restaurant details
 */
const updateRestaurantProfile = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const { name, logoUrl, themeColor, currency, tablesCount, isActive, loyaltyEnabled, autoPilot } = req.body;

    // Validate input
    const updateData = {};
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          message: 'Restaurant name must be a non-empty string'
        });
      }
      updateData.name = name.trim();
    }

    if (logoUrl !== undefined) {
      updateData.logoUrl = logoUrl;
    }

    if (themeColor !== undefined) {
      // Validate hex color format
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!colorRegex.test(themeColor)) {
        return res.status(400).json({
          message: 'Invalid color format. Please provide a valid hex color.'
        });
      }
      updateData.themeColor = themeColor;
    }

    if (currency !== undefined) {
      if (typeof currency !== 'string' || currency.length !== 3) {
        return res.status(400).json({
          message: 'Currency must be a 3-letter ISO code (e.g., INR, USD)'
        });
      }
      updateData.currency = currency.toUpperCase();
    }

    if (tablesCount !== undefined) {
      if (!Number.isInteger(tablesCount) || tablesCount < 1) {
        return res.status(400).json({
          message: 'Tables count must be a positive integer'
        });
      }
      updateData.tablesCount = tablesCount;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          message: 'isActive must be a boolean'
        });
      }
      updateData.isActive = isActive;
    }

    if (loyaltyEnabled !== undefined) {
      if (typeof loyaltyEnabled !== 'boolean') {
        return res.status(400).json({
          message: 'loyaltyEnabled must be a boolean'
        });
      }
      updateData['loyaltySettings.enabled'] = loyaltyEnabled;
    }

    if (autoPilot !== undefined) {
      if (typeof autoPilot !== 'boolean') {
        return res.status(400).json({
          message: 'autoPilot must be a boolean'
        });
      }
      updateData.autoPilot = autoPilot;
    }

    updateData.updatedAt = new Date();

    const currentRestaurant = await Restaurant.findById(restaurantId);
    if (!currentRestaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    // Capture tablesCount change
    const oldTablesCount = currentRestaurant.tablesCount;
    const newTablesCount = updateData.tablesCount;

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updateData,
      { new: true, runValidators: true }
    );

    // Sync Tables if count increased
    if (newTablesCount !== undefined && newTablesCount > oldTablesCount) {
      const tablesToCreate = [];
      for (let i = oldTablesCount + 1; i <= newTablesCount; i++) {
        // Check if table record already exists (to avoid duplicates if previously manually added)
        const existingTable = await Table.findOne({ restaurantId, tableNo: i });
        if (!existingTable) {
          tablesToCreate.push({
            restaurantId,
            tableNo: i,
            label: `Table ${i}`,
            status: 'active'
          });
        }
      }
      
      if (tablesToCreate.length > 0) {
        await Table.insertMany(tablesToCreate);
      }
    }

    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    return res.status(200).json({
      message: 'Restaurant profile updated successfully',
      data: restaurant
    });
  } catch (error) {
    console.error('Update restaurant profile error:', error);
    return res.status(500).json({
      message: 'Failed to update restaurant profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create/Setup restaurant
 * Called when a new admin registers their first restaurant
 */
const setupRestaurant = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, slug, logoUrl, themeColor, currency, tablesCount } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        message: 'Restaurant name is required'
      });
    }

    if (!slug || slug.trim().length === 0) {
      return res.status(400).json({
        message: 'Restaurant slug is required'
      });
    }

    // Validate slug format (alphanumeric, hyphens, lowercase)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        message: 'Slug must contain only lowercase letters, numbers, and hyphens'
      });
    }

    // Check if slug already exists
    const existingRestaurant = await Restaurant.findOne({ slug: slug.toLowerCase() });
    if (existingRestaurant) {
      return res.status(409).json({
        message: 'Restaurant slug already exists'
      });
    }

    // Validate color if provided
    if (themeColor) {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!colorRegex.test(themeColor)) {
        return res.status(400).json({
          message: 'Invalid color format. Please provide a valid hex color.'
        });
      }
    }

    // Create new restaurant
    const newRestaurant = new Restaurant({
      name: name.trim(),
      slug: slug.toLowerCase(),
      ownerId: req.user._id,
      logoUrl: logoUrl || null,
      themeColor: themeColor || '#ff9500', // Default orange
      currency: currency || 'INR',
      tablesCount: tablesCount || 10,
      isActive: true
    });

    await newRestaurant.save();

    // Update user's restaurantId
    req.user.restaurantId = newRestaurant._id;
    await req.user.save();

    return res.status(201).json({
      message: 'Restaurant created successfully',
      data: newRestaurant
    });
  } catch (error) {
    console.error('Setup restaurant error:', error);
    return res.status(500).json({
      message: 'Failed to create restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete restaurant (soft delete by setting isActive to false)
 * Only the restaurant owner can delete their restaurant
 */
const deleteRestaurant = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;

    // Verify ownership
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    if (restaurant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to delete this restaurant'
      });
    }

    // Soft delete - set isActive to false
    restaurant.isActive = false;
    restaurant.updatedAt = new Date();
    await restaurant.save();

    return res.status(200).json({
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    return res.status(500).json({
      message: 'Failed to delete restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get restaurant by slug (public endpoint for customer-facing pages)
 */
const getRestaurantBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({
      slug: slug.toLowerCase(),
      isActive: true
    });

    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    return res.status(200).json({
      message: 'Restaurant retrieved',
      data: restaurant
    });
  } catch (error) {
    console.error('Get restaurant by slug error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRestaurantProfile,
  updateRestaurantProfile,
  setupRestaurant,
  deleteRestaurant,
  getRestaurantBySlug
};

const { Menu, Restaurant, Category } = require("../../models");
const mongoose = require("mongoose");

/**
 * Get all categories for the authenticated restaurant
 * GET /api/menu/category
 */
const getCategories = async (req, res) => {
  try {
    console.log("[getCategories] req.user:", req.user);
    console.log("[getCategories] req.restaurantId:", req.restaurantId);
    const restaurantId = req.restaurantId;
    if (!restaurantId) {
      console.error(
        "[getCategories] 400: Missing restaurantId. req.user:",
        req.user
      );
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    const categories = await Category.find({ restaurantId }).sort({
      displayOrder: 1,
      name: 1,
    });
    return res.status(200).json({
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      message: "Failed to retrieve categories",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get menu for admin (full menu with all items and categories)
 * GET /api/menu/:restaurantId
 */
const getAdminMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Validate restaurantId
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find menu
    let menu = await Menu.findOne({ restaurantId });

    // If no menu exists, create empty one
    if (!menu) {
      menu = new Menu({
        restaurantId,
        categories: [],
        items: [],
      });
      await menu.save();
    }

    return res.status(200).json({
      message: "Menu retrieved successfully",
      data: menu,
    });
  } catch (error) {
    console.error("Get menu error:", error);
    return res.status(500).json({
      message: "Failed to retrieve menu",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Create category (normalized)
 * POST /api/menu/category
 * Body: { restaurantId, name, icon }
 */
const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const restaurantId = req.restaurantId;

    // Validation
    if (!restaurantId || !name || !name.trim()) {
      return res
        .status(400)
        .json({ message: "Restaurant ID and category name are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check for duplicate category name for this restaurant
    const existing = await Category.findOne({
      restaurantId,
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Determine displayOrder (count existing categories)
    const count = await Category.countDocuments({ restaurantId });

    // Create new category
    const category = new Category({
      restaurantId,
      name: name.trim(),
      icon: icon || null,
      displayOrder: count || 0,
    });
    await category.save();

    return res.status(201).json({
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(500).json({
      message: "Failed to create category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update category
 * PUT /api/menu/category/:categoryId
 * Body: { restaurantId, name, icon, displayOrder }
 */
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, icon, displayOrder } = req.body;
    const restaurantId = req.restaurantId;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid Category ID format" });
    }

    // Check if another category with the same name exists for this restaurant
    if (name) {
      const existing = await Category.findOne({
        restaurantId,
        name: { $regex: `^${name.trim()}$`, $options: "i" },
        _id: { $ne: categoryId }, // Not this one
      });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Another category with this name already exists" });
      }
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryId, restaurantId }, // Ensure admin owns this category
      {
        $set: {
          name: name?.trim(),
          icon,
          displayOrder,
        },
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({ message: "Failed to update category" });
  }
};

/**
 * Delete category
 * DELETE /api/menu/category/:categoryId
 * Query: restaurantId
 */
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const restaurantId = req.restaurantId;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid Category ID format" });
    }

    // 1. Find or create "Others" category
    let othersCategory = await Category.findOne({
      restaurantId,
      name: { $regex: /^Others$/i },
    });

    if (!othersCategory) {
      othersCategory = new Category({
        restaurantId,
        name: "Others",
        displayOrder: 999, // Push to end
      });
      await othersCategory.save();
    }

    // 2. Update all items in the Menu to point to "Others" category if they were in the deleted one
    const menu = await Menu.findOne({ restaurantId });
    if (menu) {
      let itemsUpdated = false;
      menu.items = menu.items.map((item) => {
        if (item.categoryId.toString() === categoryId) {
          item.categoryId = othersCategory._id;
          itemsUpdated = true;
        }
        return item;
      });

      if (itemsUpdated) {
        await menu.save();
      }
    }

    // 3. Delete the category
    const result = await Category.findOneAndDelete({
      _id: categoryId,
      restaurantId,
    });

    if (!result) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ 
      message: "Category deleted successfully. Items moved to 'Others'.",
      othersCategoryId: othersCategory._id 
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({ message: "Failed to delete category" });
  }
};

/**
 * Create menu item
 * POST /api/menu/item
 * Body: { restaurantId, categoryId, name, description, price, imageUrl, tags, allergens }
 */
const createItem = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      tags = [],
      allergens = [],
    } = req.body;

    // Validation
    if (
      !restaurantId ||
      !categoryId ||
      !name ||
      !name.trim() ||
      price === undefined
    ) {
      return res.status(400).json({
        message: "Restaurant ID, category ID, name, and price are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    if (typeof price !== "number" || price < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a non-negative number" });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Verify category exists
    const categoryExists = await Category.findOne({
      _id: categoryId,
      restaurantId,
    });
    if (!categoryExists) {
      return res
        .status(404)
        .json({ message: "Selected category does not exist" });
    }

    // Create new item
    const newItem = {
      _id: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(categoryId),
      name: name.trim(),
      description: description ? description.trim() : "",
      price,
      imageUrl: imageUrl || null,
      tags: Array.isArray(tags) ? tags.filter((t) => t.trim()) : [],
      allergens: Array.isArray(allergens)
        ? allergens.filter((a) => a.trim())
        : [],
      isAvailable: true,
      ordersCount: 0,
      createdAt: new Date(),
    };

    menu.items.push(newItem);

    await menu.save();

    return res.status(201).json({
      message: "Item created successfully",
      data: { item: newItem },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update menu item
 * PUT /api/menu/item/:itemId
 * Body: { restaurantId, name, description, price, imageUrl, tags, allergens, isAvailable }
 */
const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      tags,
      allergens,
      isAvailable,
    } = req.body;
    const restaurantId = req.restaurantId;

    // Validation
    if (!itemId || !restaurantId) {
      return res
        .status(400)
        .json({ message: "Item ID and Restaurant context are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(itemId) ||
      !mongoose.Types.ObjectId.isValid(restaurantId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // If categoryId is provided, validate it
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: "Invalid Category ID format" });
      }
      const categoryExists = await Category.findOne({
        _id: categoryId,
        restaurantId,
      });
      if (!categoryExists) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return res
        .status(400)
        .json({ message: "Price must be a non-negative number" });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Find item
    const item = menu.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update fields
    if (categoryId) item.categoryId = categoryId;
    if (name && name.trim()) item.name = name.trim();
    if (description !== undefined)
      item.description = description ? description.trim() : "";
    if (price !== undefined) item.price = price;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (tags !== undefined)
      item.tags = Array.isArray(tags) ? tags.filter((t) => t.trim()) : [];
    if (allergens !== undefined)
      item.allergens = Array.isArray(allergens)
        ? allergens.filter((a) => a.trim())
        : [];
    if (isAvailable !== undefined) item.isAvailable = Boolean(isAvailable);

    await menu.save();

    return res.status(200).json({
      message: "Item updated successfully",
      data: { item },
    });
  } catch (error) {
    console.error("Update item error:", error);
    return res.status(500).json({
      message: "Failed to update item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete menu item
 * DELETE /api/menu/item/:itemId
 * Query: restaurantId
 */
const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const restaurantId = req.restaurantId;

    // Validation
    if (!itemId || !restaurantId) {
      return res
        .status(400)
        .json({ message: "Item ID and Restaurant context are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(itemId) ||
      !mongoose.Types.ObjectId.isValid(restaurantId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Find item index
    const itemIndex = menu.items.findIndex((i) => i._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete item
    menu.items.splice(itemIndex, 1);
    await menu.save();

    return res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    return res.status(500).json({
      message: "Failed to delete item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update item availability
 * PATCH /api/menu/item/:itemId/availability
 * Body: { restaurantId, isAvailable }
 */
const updateItemAvailability = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isAvailable } = req.body;
    const restaurantId = req.restaurantId;

    // Validation
    if (!itemId || !restaurantId || isAvailable === undefined) {
      return res
        .status(400)
        .json({
          message:
            "Item ID, Restaurant context, and availability status are required",
        });
    }

    if (
      !mongoose.Types.ObjectId.isValid(itemId) ||
      !mongoose.Types.ObjectId.isValid(restaurantId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Find item
    const item = menu.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update availability
    item.isAvailable = Boolean(isAvailable);
    await menu.save();

    return res.status(200).json({
      message: "Item availability updated successfully",
      data: { item },
    });
  } catch (error) {
    console.error("Update item availability error:", error);
    return res.status(500).json({
      message: "Failed to update item availability",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get public menu by restaurant slug
 * GET /api/public/menu/:restaurantSlug
 */
const getPublicMenu = async (req, res) => {
  try {
    const { restaurantSlug } = req.params;

    // 1. Find restaurant by slug
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug.toLowerCase() });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // 2. Find Menu (Items) AND Categories in parallel
    const [menu, categories] = await Promise.all([
      Menu.findOne({ restaurantId: restaurant._id }),
      Category.find({ restaurantId: restaurant._id }).sort({ displayOrder: 1 })
    ]);

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    return res.status(200).json({
      message: 'Menu retrieved successfully',
      data: {
        categories: categories, 
        items: menu.items.filter((item) => item.isAvailable),
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          themeColor: restaurant.themeColor,
          logoUrl: restaurant.logoUrl,
          currency: restaurant.currency
        }
      }
    });
  } catch (error) {
    console.error('Get public menu error:', error);
    return res.status(500).json({ message: 'Failed to retrieve menu' });
  }
};

module.exports = {
  getAdminMenu,
  createCategory,
  updateCategory,
  deleteCategory,
  createItem,
  updateItem,
  deleteItem,
  updateItemAvailability,
  getPublicMenu,
  getCategories,
};

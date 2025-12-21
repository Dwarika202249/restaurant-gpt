const { Menu, Restaurant } = require('../../models');
const mongoose = require('mongoose');

/**
 * Get menu for admin (full menu with all items and categories)
 * GET /api/menu/:restaurantId
 */
const getAdminMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Validate restaurantId
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID' });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Find menu
    let menu = await Menu.findOne({ restaurantId });

    // If no menu exists, create empty one
    if (!menu) {
      menu = new Menu({
        restaurantId,
        categories: [],
        items: []
      });
      await menu.save();
    }

    return res.status(200).json({
      message: 'Menu retrieved successfully',
      data: menu
    });
  } catch (error) {
    console.error('Get menu error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve menu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create category
 * POST /api/menu/category
 * Body: { restaurantId, name, icon }
 */
const createCategory = async (req, res) => {
  try {
    const { restaurantId, name, icon } = req.body;

    // Validation
    if (!restaurantId || !name || !name.trim()) {
      return res.status(400).json({ message: 'Restaurant ID and category name are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant ID' });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Find or create menu
    let menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      menu = new Menu({
        restaurantId,
        categories: [],
        items: []
      });
    }

    // Check if category already exists
    const existingCategory = menu.categories.find(
      (cat) => cat.name.toLowerCase() === name.toLowerCase()
    );
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create new category
    const newCategory = {
      _id: new mongoose.Types.ObjectId(),
      name: name.trim(),
      displayOrder: menu.categories.length,
      icon: icon || null,
      createdAt: new Date()
    };

    menu.categories.push(newCategory);
    await menu.save();

    return res.status(201).json({
      message: 'Category created successfully',
      data: { category: newCategory }
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({
      message: 'Failed to create category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const { restaurantId, name, icon, displayOrder } = req.body;

    // Validation
    if (!categoryId || !restaurantId || !name || !name.trim()) {
      return res.status(400).json({ message: 'Category ID, restaurant ID, and name are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Find category
    const category = menu.categories.find((cat) => cat._id.toString() === categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check for duplicate name (excluding current category)
    const duplicateName = menu.categories.find(
      (cat) => cat.name.toLowerCase() === name.toLowerCase() && cat._id.toString() !== categoryId
    );
    if (duplicateName) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    // Update category
    category.name = name.trim();
    if (icon !== undefined) category.icon = icon;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;

    await menu.save();

    return res.status(200).json({
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({
      message: 'Failed to update category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    const { restaurantId } = req.query;

    // Validation
    if (!categoryId || !restaurantId) {
      return res.status(400).json({ message: 'Category ID and restaurant ID are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Find category index
    const categoryIndex = menu.categories.findIndex((cat) => cat._id.toString() === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has items
    const categoryHasItems = menu.items.some((item) => item.categoryId.toString() === categoryId);
    if (categoryHasItems) {
      return res.status(400).json({ message: 'Cannot delete category with items. Delete items first.' });
    }

    // Delete category
    menu.categories.splice(categoryIndex, 1);

    // Update displayOrder for remaining categories
    menu.categories.forEach((cat, index) => {
      cat.displayOrder = index;
    });

    await menu.save();

    return res.status(200).json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      message: 'Failed to delete category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create menu item
 * POST /api/menu/item
 * Body: { restaurantId, categoryId, name, description, price, imageUrl, tags, allergens }
 */
const createItem = async (req, res) => {
  try {
    const { restaurantId, categoryId, name, description, price, imageUrl, tags = [], allergens = [] } = req.body;

    // Validation
    if (!restaurantId || !categoryId || !name || !name.trim() || price === undefined) {
      return res.status(400).json({
        message: 'Restaurant ID, category ID, name, and price are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: 'Price must be a non-negative number' });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Verify category exists
    const categoryExists = menu.categories.some((cat) => cat._id.toString() === categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create new item
    const newItem = {
      _id: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(categoryId),
      name: name.trim(),
      description: description ? description.trim() : '',
      price,
      imageUrl: imageUrl || null,
      tags: Array.isArray(tags) ? tags.filter((t) => t.trim()) : [],
      allergens: Array.isArray(allergens) ? allergens.filter((a) => a.trim()) : [],
      isAvailable: true,
      ordersCount: 0,
      createdAt: new Date()
    };

    menu.items.push(newItem);
    await menu.save();

    return res.status(201).json({
      message: 'Item created successfully',
      data: { item: newItem }
    });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({
      message: 'Failed to create item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const { restaurantId, name, description, price, imageUrl, tags, allergens, isAvailable } = req.body;

    // Validation
    if (!itemId || !restaurantId) {
      return res.status(400).json({ message: 'Item ID and restaurant ID are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ message: 'Price must be a non-negative number' });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Find item
    const item = menu.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update fields
    if (name && name.trim()) item.name = name.trim();
    if (description !== undefined) item.description = description ? description.trim() : '';
    if (price !== undefined) item.price = price;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (tags !== undefined) item.tags = Array.isArray(tags) ? tags.filter((t) => t.trim()) : [];
    if (allergens !== undefined) item.allergens = Array.isArray(allergens) ? allergens.filter((a) => a.trim()) : [];
    if (isAvailable !== undefined) item.isAvailable = Boolean(isAvailable);

    await menu.save();

    return res.status(200).json({
      message: 'Item updated successfully',
      data: { item }
    });
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json({
      message: 'Failed to update item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const { restaurantId } = req.query;

    // Validation
    if (!itemId || !restaurantId) {
      return res.status(400).json({ message: 'Item ID and restaurant ID are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Find item index
    const itemIndex = menu.items.findIndex((i) => i._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete item
    menu.items.splice(itemIndex, 1);
    await menu.save();

    return res.status(200).json({
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({
      message: 'Failed to delete item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const { restaurantId, isAvailable } = req.body;

    // Validation
    if (!itemId || !restaurantId || isAvailable === undefined) {
      return res.status(400).json({ message: 'Item ID, restaurant ID, and availability status are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId) || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Find item
    const item = menu.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update availability
    item.isAvailable = Boolean(isAvailable);
    await menu.save();

    return res.status(200).json({
      message: 'Item availability updated successfully',
      data: { item }
    });
  } catch (error) {
    console.error('Update item availability error:', error);
    return res.status(500).json({
      message: 'Failed to update item availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    if (!restaurantSlug || !restaurantSlug.trim()) {
      return res.status(400).json({ message: 'Restaurant slug is required' });
    }

    // Find restaurant by slug
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug.toLowerCase() });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Find menu
    let menu = await Menu.findOne({ restaurantId: restaurant._id });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Return menu with restaurant info
    return res.status(200).json({
      message: 'Menu retrieved successfully',
      data: {
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          themeColor: restaurant.themeColor,
          logoUrl: restaurant.logoUrl,
          currency: restaurant.currency
        },
        menu: {
          categories: menu.categories.sort((a, b) => a.displayOrder - b.displayOrder),
          items: menu.items.filter((item) => item.isAvailable) // Only show available items
        }
      }
    });
  } catch (error) {
    console.error('Get public menu error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve menu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
  getPublicMenu
};

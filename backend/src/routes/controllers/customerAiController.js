const { Menu, Restaurant, Category } = require("../../models");
const aiService = require("../../services/aiService");

/**
 * Handle public AI Concierge chat for guests
 * POST /api/public/ai/chat/:restaurantSlug
 * Body: { message, history }
 */
const chat = async (req, res) => {
  try {
    const { restaurantSlug } = req.params;
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 1. Fetch Restaurant & Menu Context
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug.toLowerCase() });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [menu, categories] = await Promise.all([
      Menu.findOne({ restaurantId: restaurant._id }),
      Category.find({ restaurantId: restaurant._id }).sort({ displayOrder: 1 })
    ]);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // 2. Format Context for AI
    const menuContext = {
      categories,
      items: menu.items,
      restaurant: {
        name: restaurant.name,
        currency: restaurant.currency
      }
    };

    // 3. Get AI Response
    const response = await aiService.getAiConciergeResponse(message, menuContext, history);

    return res.status(200).json({
      message: "AI response generated",
      data: { response }
    });
  } catch (error) {
    console.error("Customer AI Chat Error:", error);
    return res.status(500).json({
      message: "Failed to communicate with AI Concierge",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Handle AI cart suggestions for guests
 * POST /api/public/ai/cart-suggestions/:restaurantSlug
 * Body: { cartItems }
 */
const getSuggestions = async (req, res) => {
  try {
    const { restaurantSlug } = req.params;
    const { cartItems = [] } = req.body;

    // 1. Fetch Restaurant & Menu Context
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug.toLowerCase() });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [menu, categories] = await Promise.all([
      Menu.findOne({ restaurantId: restaurant._id }),
      Category.find({ restaurantId: restaurant._id }).sort({ displayOrder: 1 })
    ]);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // 2. Get Suggestions
    const suggestions = await aiService.getCartSuggestions(
      cartItems, 
      { items: menu.items, categories },
      { name: restaurant.name, currency: restaurant.currency }
    );

    // 3. Map suggestion basic info back to full menu item info for frontend
    const enrichedSuggestions = suggestions.map(s => {
      const fullItem = menu.items.find(i => i._id.toString() === s.itemId || i.name === s.name);
      return {
        ...s,
        item: fullItem // Include full item details (image, price, etc.)
      };
    }).filter(s => s.item); // Only keep if item actually exists

    return res.status(200).json({
      message: "Cart suggestions generated",
      data: { suggestions: enrichedSuggestions }
    });
  } catch (error) {
    console.error("Cart Suggestions Error:", error);
    return res.status(500).json({ message: "Failed to get suggestions" });
  }
};

module.exports = {
  chat,
  getSuggestions
};

const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate an appetizing description for a menu item
 * @param {Object} item - { name, description, category, tags }
 * @returns {Promise<string>} - The AI-generated description
 */
const generateItemDescription = async (item) => {
  try {
    const prompt = `
      You are a professional food copywriter for a premium Indian restaurant called "RestaurantGPT".
      Generate a mouth-watering, descriptive, and appetizing description for the following dish:
      Dish Name: ${item.name}
      Current Description: ${item.description || 'No description provided'}
      Category: ${item.category || 'Main Course'}
      Tags: ${item.tags ? item.tags.join(', ') : 'none'}

      Rules:
      1. Use sensory words (smoky, aromatic, velvet, spice-infused, etc.).
      2. Keep it under 150 characters for mobile display.
      3. Focus on the authentic Indian flavors.
      4. DO NOT use emojis.
      5. Output ONLY the description text.
    `.trim();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a culinary expert specialized in Indian fine dining.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || item.description;
  } catch (error) {
    console.error('AI Description Error:', error);
    throw new Error('Failed to generate AI description');
  }
};

/**
 * Analyze business performance and provide predictive insights
 * @param {Array} orders - Historical order data
 * @param {Object} stats - Current aggregated stats
 * @param {Object} restaurant - Restaurant info
 * @returns {Promise<string>} - Markdown formatted analysis
 */
const analyzeBusinessInsights = async (orders, stats, restaurant, dateRange) => {
  try {
    const prompt = `
      You are an expert Restaurant Business Analyst for "${restaurant.name}".
      Analyze the following data for the period: ${dateRange.start} to ${dateRange.end}.
      
      ### Current Summary:
      - Total Revenue: ${restaurant.currency} ${stats.summary.totalRevenue}
      - Total Orders: ${stats.summary.totalOrders}
      - Top Selling Items: ${stats.topItems.map(i => `${i._id} (${i.count} units)`).join(', ')}
      
      ### Tasks:
      1. Identify the strongest sales trend (e.g., peak hours, popular categories).
      2. Predict demand for the next similar period.
      3. Suggest 2 operational optimizations (inventory or staff).
      4. Suggest a marketing strategy to boost the lowest-performing item.
      
      Format your response in clean Markdown with professional headers. Use bold text for key insights.
      Keep the tone professional, encouraging, and data-driven.
    `.trim();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a senior Business Intelligence agent for high-end restaurants.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate insights at this time.';
  } catch (error) {
    console.error('AI Insights Error:', error);
    throw new Error('Failed to analyze business data');
  }
};

/**
 * AI Concierge for guest menu interactions
 * @param {string} userMessage - Guest's question
 * @param {Object} menuContext - { categories: [], items: [], restaurant: {} }
 * @param {Array} history - Previous messages
 * @returns {Promise<string>} - AI response
 */
const getAiConciergeResponse = async (userMessage, menuContext, history = []) => {
  try {
    const { categories, items, restaurant } = menuContext;
    
    const systemPrompt = `
      You are "RestaurantGPT's AI Concierge", a sophisticated and welcoming digital Maître d' for "${restaurant.name}". 
      Your goal is to help guests navigate the menu, make flavor-accurate recommendations, and answer dietary questions.

      ## Restaurant Context:
      - Name: ${restaurant.name}
      - Theme: Indian Fine Dining
      - Categories: ${categories.map(c => c.name).join(', ')}
      - Full Menu Base: ${items.map(i => `${i.name} (${restaurant.currency}${i.price}) - ${i.description}. Tags: [${i.tags?.join(', ')}]. Allergens: [${i.allergens?.join(', ')}]`).join('; ')}

      ## Conversational Rules:
      1. Be polite, warm, and professional. Use "Namaste" occasionally.
      2. If asked for recommendations, suggest 2-3 specific dishes with a reason (e.g., "Our Butter Chicken is a guest favorite because of its velvet-smooth tomato gravy").
      3. Be 100% accurate about allergens. If unsure, tell the guest to consult the staff directly.
      4. Speak enthusiastically about the flavors (aromatic, spice-infused, etc.).
      5. Keep responses concise (max 3-4 sentences total) for quick mobile reading.
      6. Use clean Markdown for headers or lists if needed.
      7. NEVER mention competitors or other restaurants.
      8. Do not talk about politics, religion, or off-topic subjects.
    `.trim();

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6), // Keep last 3 exchanges
      { role: 'user', content: userMessage }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || "I'm having a bit of a kitchen slip-up. How else can I assist you?";
  } catch (error) {
    console.error('AI Concierge Error:', error);
    throw new Error('Failed to get AI concierge response');
  }
};

/**
 * Get AI-powered cart suggestions based on current items
 * @param {Array} cartItems - Currently selected items [{ name, price }]
 * @param {Object} menuContext - { categories: [], items: [] }
 * @param {Object} restaurant - { name, currency }
 * @returns {Promise<Array>} - List of suggestions [{ itemId, reason }]
 */
const getCartSuggestions = async (cartItems, menuContext, restaurant) => {
  try {
    const { items } = menuContext;
    
    const cartNames = cartItems.map(i => i.name).join(', ');
    const menuOptions = items
      .filter(i => !cartItems.some(c => c.name === i.name)) // Don't suggest what's already there
      .slice(0, 15) // Limit context but keep variety
      .map(i => `${i._id}: ${i.name} (${i.description})`)
      .join('\n');

    const prompt = `
      You are the AI Head Chef at "${restaurant.name}". A guest has added these items to their tray: [${cartNames}].
      
      Suggest exactly 2 **additional** items from our menu that would pair perfectly with their current selection to enhance their dining experience.
      
      ## Rules:
      1. Choose items that are complementary (e.g., sides for mains, drinks/desserts for heavy meals).
      2. Provide a 1-sentence "Chef's Reason" for each why they pair well.
      3. Output ONLY a raw JSON array in this format: 
         [{"itemId": "mongoDB_id", "name": "Item Name", "reason": "Reason text"}]
      
      ## Available Menu Options to Suggest:
      ${menuOptions}
    `.trim();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a culinary expert focused on food pairings and upselling.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '[]';
    // Handle Groq potentially wrapping in a generic object if it's too helpful
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.suggestions || []);
  } catch (error) {
    console.error('AI Cart Suggestions Error:', error);
    return [];
  }
};

/**
 * Generate a catchy marketing description for a restaurant coupon
 * @param {Object} data - { code, discountType, value, minOrderAmount, restaurantName }
 * @returns {Promise<string>} - The AI-generated coupon text
 */
const generateCouponDescription = async (data) => {
  try {
    const prompt = `
      You are a brilliant marketing copywriter for "${data.restaurantName || 'RestaurantGPT Platinum'}".
      Create a short, punchy, and exciting description for a NEW offer:
      Coupon Code: ${data.code}
      Discount: ${data.value}${data.discountType === 'percentage' ? '%' : ' OFF'}
      Condition: For orders above ₹${data.minOrderAmount || 0}
      
      Rules:
      1. Be persuasive and high-energy (e.g. "Feast mode on!", "Unlock your savings").
      2. Keep it under 100 characters for mobile display.
      3. DO NOT use hashtags or excessive emojis.
      4. Output ONLY the description text.
    `.trim();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert in restaurant promotional copywriting.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.85,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content || 'Enjoy this exclusive discount on your next meal!';
  } catch (error) {
    console.error('AI Coupon Description Error:', error);
    throw new Error('Failed to generate coupon description');
  }
};

/**
 * Generate a luxury description for a loyalty perk
 * @param {Object} data - { title, points, restaurantName }
 * @returns {Promise<string>} - The AI-generated perk text
 */
const generatePerkDescription = async (data) => {
  try {
    const prompt = `
      You are an expert luxury lifestyle copywriter for "${data.restaurantName || 'RestaurantGPT Platinum'}".
      Create a short, elegant, and alluring description for a LOYALTY REWARD (Perk):
      Reward Title: ${data.title}
      Required Points: ${data.points}
      
      Rules:
      1. Use sophisticated and premium language (e.g. "Exclusive access", "Indulgent experience", "Unlock the extraordinary").
      2. Keep it under 100 characters for mobile display.
      3. Focus on the value and the feeling of being a VIP.
      4. Output ONLY the description text.
      5. DO NOT use emojis.
    `.trim();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert in luxury restaurant loyalty copywriting.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content || 'Unleash your status with this unique reward.';
  } catch (error) {
    console.error('AI Perk Description Error:', error);
    throw new Error('Failed to generate perk description');
  }
};

module.exports = {
  generateItemDescription,
  analyzeBusinessInsights,
  getAiConciergeResponse,
  getCartSuggestions,
  generateCouponDescription,
  generatePerkDescription
};

# DineOS — AI Engine Documentation

> **Classification:** Internal Engineering Reference
> **Provider:** Groq Cloud | **Model:** `llama-3.3-70b-versatile`
> **Service File:** `backend/src/services/aiService.js`

---

## Overview

DineOS leverages **Groq's ultra-fast inference API** to power 7 specialized AI functions across 3 user roles. Each function uses a carefully crafted **system prompt** with role-specific behavior, output constraints, and context injection.

All AI functions are defined in a single service file (`aiService.js`) and called by controllers. They follow a consistent pattern:

```javascript
const completion = await groq.chat.completions.create({
  messages: [
    { role: 'system', content: systemPrompt },
    ...contextMessages,
    { role: 'user', content: userPrompt }
  ],
  model: 'llama-3.3-70b-versatile',
  temperature: <varies>,
  max_tokens: <varies>
});
```

---

## Function Reference

### 1. `getAiConciergeResponse` — Customer Dining Assistant

**Used by:** Customers (via AI Chat FAB)
**Controller:** `customerAiController.js`
**Temperature:** `0.7` | **Max Tokens:** `500`

#### Purpose

The flagship AI feature. A _contextual digital Maître d'_ that knows the restaurant's full menu, the customer's current cart, loyalty status, and available offers — in real-time.

#### System Prompt Personality

```
Role: "RestaurantGPT's AI Concierge" — a sophisticated and welcoming digital Maître d'
Style: Polite, warm, professional
Address: Customer by name (from loyalty) or "Guest"
Greeting: Uses "Namaste" occasionally
```

#### Context Injection

The system prompt is dynamically built with 4 context blocks:

| Context Block       | Source                   | Example                                                                |
| :------------------ | :----------------------- | :--------------------------------------------------------------------- |
| **Cart Context**    | `sessionContext.cart`    | `"Current Cart: Naan (x2), Butter Chicken (x1). Total: ₹630."`         |
| **Loyalty Context** | `sessionContext.loyalty` | `"Raj has 340 points available."` or `"Not logged in. Suggest login."` |
| **Offers Context**  | `sessionContext.offers`  | `"FEAST20 (20% OFF); WELCOME50 (₹50 OFF)."`                            |
| **Menu Context**    | Full item list           | All items with name, price, description, tags, and allergens           |

#### Behavioral Rules (from system prompt)

1. If guest asks about points but isn't logged in → suggest login
2. Recommendations limited to 2-3 specific dishes
3. Always include prices in recommendations
4. 100% accuracy on allergens — if unsure, direct to staff
5. Max 3-4 sentences for mobile readability
6. Conversation history limited to last 6 messages (3 exchanges)

#### Example Exchange

```
User: "What goes well with my Butter Chicken?"
AI:   "Namaste Raj! Your Butter Chicken pairs beautifully with our Garlic Naan
       (₹80) for the perfect scoop, and our Raita (₹60) to balance the rich
       gravy. With your FEAST20 code, you'll save 20% on the full order!"
```

---

### 2. `getCartSuggestions` — AI Food Pairing Engine

**Used by:** Customers (CartSuggestions component)
**Temperature:** `0.6` | **Max Tokens:** `300`
**Response format:** `json_object`

#### Purpose

Analyzes the customer's current cart and suggests 2 complementary items from the menu. Returns structured JSON with item IDs for direct "Add to Cart" functionality.

#### Logic

1. Filters out items already in the cart
2. Sends up to 15 menu options as context (with MongoDB `_id`)
3. Requests exactly 2 suggestions with pairing reasons

#### Output Format

```json
[
  {
    "itemId": "60f...",
    "name": "Roomali Roti",
    "reason": "The soft, thin bread complements your rich curry perfectly."
  },
  {
    "itemId": "60f...",
    "name": "Mango Lassi",
    "reason": "A cool, creamy contrast to balance the spice."
  }
]
```

#### Robustness

- Handles Groq returning wrapped objects (`parsed.suggestions || []`)
- Returns empty array `[]` on any error (graceful degradation)

---

### 3. `generateItemDescription` — Menu Copywriter

**Used by:** Admin (Menu Studio)
**Controller:** `menuController.js`
**Temperature:** `0.7` | **Max Tokens:** `150`

#### Purpose

Generates appetizing, sensory menu item descriptions for new or existing dishes.

#### Prompt Rules

1. Use sensory words: _smoky, aromatic, velvet, spice-infused_
2. Under **150 characters** for mobile display
3. Focus on authentic Indian flavors
4. No emojis
5. Output ONLY the description text

#### Input

```json
{
  "name": "Paneer Tikka",
  "description": "Grilled cottage cheese",
  "category": "Starters",
  "tags": ["veg", "spicy"]
}
```

#### Output Example

```
"Smoky cubes of cottage cheese, kissed by tandoor flames and dusted with aromatic spices — a vegetarian's delight."
```

---

### 4. `analyzeBusinessInsights` — Business Intelligence Analyst

**Used by:** Admin (Analytics Dashboard)
**Controller:** `aiController.js`
**Temperature:** `0.5` | **Max Tokens:** `1000`

#### Purpose

Full-scale business analysis with trend identification, demand prediction, and actionable recommendations.

#### Data Input

- Total Revenue and Total Orders
- Top-selling items (name + unit count)
- Date range for the analysis period

#### Output Tasks (from prompt)

1. Identify strongest sales trend (peak hours, popular categories)
2. Predict demand for the next similar period
3. Suggest 2 operational optimizations (inventory or staff)
4. Marketing strategy for the lowest-performing item

#### Output Format

Markdown with professional headers, bold text for key insights. Tone: professional, encouraging, data-driven.

---

### 5. `generateCouponDescription` — Marketing Copywriter

**Used by:** Admin (Marketing Hub → Coupon creation)
**Controller:** `marketingController.js`
**Temperature:** `0.85` | **Max Tokens:** `100`

#### Purpose

Creates punchy, high-energy promotional text for discount coupons.

#### Prompt Rules

1. Persuasive and high-energy (_"Feast mode on!"_, _"Unlock your savings"_)
2. Under **100 characters** for mobile display
3. No hashtags or excessive emojis
4. Output ONLY the description

#### Input

```json
{
  "code": "FEAST20",
  "discountType": "percentage",
  "value": 20,
  "minOrderAmount": 500,
  "restaurantName": "Tandoori Palace"
}
```

#### Output Example

```
"Feast mode activated! 20% OFF on orders above ₹500 — your table awaits."
```

---

### 6. `generatePerkDescription` — Luxury Copywriter

**Used by:** Admin (Marketing Hub → Loyalty Perks)
**Controller:** `marketingController.js`
**Temperature:** `0.8` | **Max Tokens:** `100`

#### Purpose

Crafts elegant, premium descriptions for loyalty reward tiers.

#### Prompt Rules

1. Sophisticated language (_"Exclusive access"_, _"Indulgent experience"_)
2. Under **100 characters**
3. Focus on VIP feeling
4. No emojis

#### Input

```json
{ "title": "Free Dessert", "points": 200, "restaurantName": "Tandoori Palace" }
```

#### Output Example

```
"Indulge in a complimentary dessert — your loyalty deserves nothing less than extraordinary."
```

---

### 7. `generateBroadcastMessage` — Platform Communications

**Used by:** Super Admin (Settings → Announcements)
**Controller:** `superAdminController.js`
**Temperature:** `0.7` | **Max Tokens:** `120`

#### Purpose

Generates professional, authoritative system announcements for the platform-wide broadcast bar.

#### Prompt Rules

1. Professional and authoritative (_"Attention Partners"_, _"System Notice"_)
2. Under **120 characters** for dashboard navbar display
3. No emojis
4. Output ONLY the broadcast text

#### Input

```json
{
  "context": "Server migration tonight at 2AM",
  "type": "warning",
  "target": "owners"
}
```

#### Output Example

```
"System Notice: Scheduled server migration tonight at 02:00 IST. Brief downtime expected. Normal operations to resume by 04:00 IST."
```

---

## Temperature Strategy

| Function           | Temperature | Rationale                                             |
| :----------------- | :---------- | :---------------------------------------------------- |
| Business Insights  | `0.5`       | Low creativity — accuracy and consistency matter most |
| Cart Suggestions   | `0.6`       | Moderate — needs reliability for JSON output          |
| Concierge          | `0.7`       | Balanced — conversational but accurate                |
| Item Description   | `0.7`       | Balanced — creative within food domain                |
| Broadcast          | `0.7`       | Balanced — professional yet natural                   |
| Perk Description   | `0.8`       | Higher creativity for luxury marketing tone           |
| Coupon Description | `0.85`      | Highest creativity — punchy, energetic marketing copy |

---

## Token Optimization

DineOS is designed to minimize Groq API costs:

| Strategy                   | Implementation                                                                               |
| :------------------------- | :------------------------------------------------------------------------------------------- |
| **Conversation pruning**   | Only last 6 messages sent to Concierge (3 exchanges)                                         |
| **Menu context filtering** | Cart suggestions limited to 15 items                                                         |
| **Character limits**       | Descriptions capped at 100-150 chars via prompt                                              |
| **Token caps**             | `max_tokens` set per function (100-1000 range)                                               |
| **JSON mode**              | `getCartSuggestions` uses `response_format: { type: 'json_object' }` to avoid parsing errors |
| **Graceful degradation**   | All functions return fallback strings on error — never crash                                 |

---

## Error Handling

Every AI function follows this pattern:

```javascript
try {
  const completion = await groq.chat.completions.create({ ... });
  return completion.choices[0]?.message?.content || "Fallback string";
} catch (error) {
  console.error('AI [Function] Error:', error);
  throw new Error('Failed to...');  // Or return [] for suggestions
}
```

- **Concierge failures:** Returns `"I'm having a bit of a kitchen slip-up. How else can I assist you?"`
- **Suggestion failures:** Returns empty array `[]` (component hides suggestions section)
- **Description failures:** Throws error (caught by controller, returned as 500)

---

## Integration Points

```
Frontend Component          →  API Endpoint      →  AI Function               →  Groq Model
─────────────────────────────────────────────────────────────────────────────────────────────
AiConcierge.tsx             →  POST /ai/chat      →  getAiConciergeResponse   →  llama-3.3-70b
CartSuggestions.tsx          →  POST /ai/suggest   →  getCartSuggestions       →  llama-3.3-70b
MenuPage.tsx (admin)         →  POST /ai/describe  →  generateItemDescription  →  llama-3.3-70b
AnalyticsPage.tsx            →  POST /ai/analyze   →  analyzeBusinessInsights  →  llama-3.3-70b
MarketingPage.tsx (coupon)   →  POST (inline)      →  generateCouponDescription→  llama-3.3-70b
MarketingPage.tsx (perk)     →  POST (inline)      →  generatePerkDescription  →  llama-3.3-70b
SuperAdminSettingsPage.tsx   →  POST /superadmin/.. →  generateBroadcastMessage →  llama-3.3-70b
```

---

_All AI function signatures, system prompts, and behavioral rules are sourced from `backend/src/services/aiService.js`._

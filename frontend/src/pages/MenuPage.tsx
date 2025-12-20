import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { CartSummary } from '@/components';
import { Plus, Star } from 'lucide-react';

// Mock menu items data
const MOCK_MENU_ITEMS = [
  {
    itemId: 'item-001',
    name: 'Margherita Pizza',
    price: 299,
    category: 'Pizza',
    imageUrl: 'https://via.placeholder.com/300x200?text=Margherita+Pizza',
    description: 'Fresh mozzarella, basil, and tomato sauce',
    rating: 4.5,
    reviews: 120,
  },
  {
    itemId: 'item-002',
    name: 'Pepperoni Pizza',
    price: 349,
    category: 'Pizza',
    imageUrl: 'https://via.placeholder.com/300x200?text=Pepperoni+Pizza',
    description: 'Crispy pepperoni with cheese and tomato sauce',
    rating: 4.7,
    reviews: 85,
  },
  {
    itemId: 'item-003',
    name: 'Garlic Bread',
    price: 149,
    category: 'Starters',
    imageUrl: 'https://via.placeholder.com/300x200?text=Garlic+Bread',
    description: 'Toasted bread with garlic butter and herbs',
    rating: 4.3,
    reviews: 45,
  },
  {
    itemId: 'item-004',
    name: 'Caesar Salad',
    price: 249,
    category: 'Salads',
    imageUrl: 'https://via.placeholder.com/300x200?text=Caesar+Salad',
    description: 'Fresh greens with caesar dressing and croutons',
    rating: 4.4,
    reviews: 62,
  },
  {
    itemId: 'item-005',
    name: 'Coca Cola',
    price: 99,
    category: 'Beverages',
    imageUrl: 'https://via.placeholder.com/300x200?text=Coca+Cola',
    description: 'Chilled Coca Cola 250ml',
    rating: 4.0,
    reviews: 200,
  },
  {
    itemId: 'item-006',
    name: 'Chocolate Cake',
    price: 199,
    category: 'Desserts',
    imageUrl: 'https://via.placeholder.com/300x200?text=Chocolate+Cake',
    description: 'Rich chocolate cake with whipped cream',
    rating: 4.6,
    reviews: 90,
  },
];

export const MenuPage = () => {
  const cart = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...new Set(MOCK_MENU_ITEMS.map((item) => item.category))];

  const filteredItems = MOCK_MENU_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: (typeof MOCK_MENU_ITEMS)[0]) => {
    cart.addItem({
      itemId: item.itemId,
      name: item.name,
      price: item.price,
      quantity: 1,
      category: item.category,
      imageUrl: item.imageUrl,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Menu</h1>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Categories & Cart */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white font-medium'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <CartSummary />
        </div>

        {/* Right Content - Menu Items */}
        <div className="lg:col-span-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No items found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => {
                const cartItem = cart.getItem(item.itemId);
                return (
                  <div key={item.itemId} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative h-48 bg-slate-200 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center space-x-1 shadow-md">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold text-slate-900">{item.rating}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{item.category}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-4">{item.description}</p>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-orange-600">₹{item.price}</p>
                          <p className="text-xs text-slate-500 mt-1">({item.reviews} reviews)</p>
                        </div>

                        {/* Add to Cart / Quantity Control */}
                        {!cartItem ? (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            <Plus size={18} />
                            <span>Add</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg">
                            <button
                              onClick={() => cart.decrementItem(item.itemId)}
                              className="px-3 py-2 hover:bg-slate-200 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold text-slate-900">{cartItem.quantity}</span>
                            <button
                              onClick={() => cart.incrementItem(item.itemId)}
                              className="px-3 py-2 hover:bg-slate-200 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

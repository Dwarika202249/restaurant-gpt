import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CustomerLayout } from '@/components';
import { Search, Star, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import axios from 'axios';

interface MenuItem {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  tags: string[];
  allergens: string[];
  isAvailable: boolean;
}

interface Category {
  _id: string;
  name: string;
  displayOrder: number;
  icon?: string;
}

interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

/**
 * Customer Menu Page
 * Route: /customer/:restaurantSlug/table/:tableNo
 * Displays real menu with categories, search, filtering, ratings, and cart
 */
export const CustomerMenuPage = () => {
  const { restaurantSlug, tableNo } = useParams<{
    restaurantSlug: string;
    tableNo: string;
  }>();

  const [guestSession, setGuestSession] = useState<any>(null);
  const [menu, setMenu] = useState<{ categories: Category[]; items: MenuItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemRatings, setItemRatings] = useState<{ [key: string]: number }>({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load guest session from localStorage
  useEffect(() => {
    const sessionData = localStorage.getItem('guestSession');
    if (sessionData) {
      try {
        setGuestSession(JSON.parse(sessionData));
      } catch (error) {
        console.error('Failed to parse guest session:', error);
      }
    }
  }, []);

  // Fetch menu from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/public/menu/${restaurantSlug}`);

        if (response.data.data) {
          setMenu(response.data.data);
          // Initialize with first category
          if (response.data.data.categories.length > 0) {
            setSelectedCategory(response.data.data.categories[0]._id);
          }
        } else {
          setError('Failed to load menu');
        }
      } catch (err: any) {
        console.error('Fetch menu error:', err);
        setError(err.response?.data?.message || 'Failed to load menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantSlug) {
      fetchMenu();
    }
  }, [restaurantSlug]);

  // Filter items based on category and search
  const getFilteredItems = () => {
    if (!menu) return [];

    return menu.items.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.categoryId === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch && item.isAvailable;
    });
  };

  // Add to cart
  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.itemId === item._id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.itemId === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [
        ...prevCart,
        {
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          imageUrl: item.imageUrl
        }
      ];
    });
  };

  // Remove from cart
  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.itemId !== itemId));
  };

  // Update quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.itemId === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Calculate total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem('guestSession');
    localStorage.removeItem('sessionToken');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <CustomerLayout
        restaurantName={guestSession?.restaurantName || 'Restaurant'}
        restaurantLogo={guestSession?.restaurantLogo}
        themeColor={guestSession?.themeColor || '#ff9500'}
        tableNo={parseInt(tableNo || '0')}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading menu...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout
        restaurantName={guestSession?.restaurantName || 'Restaurant'}
        restaurantLogo={guestSession?.restaurantLogo}
        themeColor={guestSession?.themeColor || '#ff9500'}
        tableNo={parseInt(tableNo || '0')}
        onLogout={handleLogout}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold mb-2">Error Loading Menu</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <CustomerLayout
      restaurantName={guestSession?.restaurantName || 'Restaurant'}
      restaurantLogo={guestSession?.restaurantLogo}
      themeColor={guestSession?.themeColor || '#ff9500'}
      tableNo={parseInt(tableNo || '0')}
      onLogout={handleLogout}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6 sticky top-0 bg-white z-10 py-4 rounded-lg shadow-sm border border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search dishes, ingredients, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-32">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Items
                </button>
                {menu?.categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedCategory === category._id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="lg:col-span-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  {searchQuery ? 'No items found matching your search.' : 'No items in this category.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Item Image */}
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-40 object-cover"
                      />
                    )}

                    {/* Item Details */}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h4>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{item.description}</p>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Rating & Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-700">
                            {(itemRatings[item._id] || 4.5).toFixed(1)}
                          </span>
                        </div>
                        <span className="font-bold text-orange-600">
                          {guestSession?.currency || '₹'} {item.price}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div
          className="fixed bottom-6 right-6 z-40"
          style={{ backgroundColor: guestSession?.themeColor || '#ff9500' }}
        >
          <button
            onClick={() => setShowCartPreview(!showCartPreview)}
            className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow flex-col"
          >
            <ShoppingCart size={24} />
            <span className="text-xs font-bold mt-1">{cart.length}</span>
          </button>
        </div>
      )}

      {/* Cart Preview Drawer */}
      {showCartPreview && cart.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowCartPreview(false)} />
      )}

      {showCartPreview && cart.length > 0 && (
        <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-lg z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Cart</h3>
            <button
              onClick={() => setShowCartPreview(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {cart.map((item) => (
              <div key={item.itemId} className="flex gap-3 border-b border-gray-200 pb-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                  <p className="text-orange-600 font-bold text-sm">
                    {guestSession?.currency || '₹'} {item.price}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-orange-600">
                {guestSession?.currency || '₹'} {cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CustomerMenuPage;


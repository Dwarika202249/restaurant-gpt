import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CustomerLayout } from '@/components';
import { Search, ShoppingCart, Plus, Minus, X, Info, Zap } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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

interface GuestSession {
  sessionId: string;
  restaurantId: string;
  restaurantSlug: string;
  tableNo: number;
  sessionToken: string;
  expiresAt: string;
  restaurantName: string;
  restaurantLogo?: string;
  themeColor: string;
  currency: string;
}

/**
 * Customer Menu Page (Themic & TS Fixed)
 */
export const CustomerMenuPage = () => {
  const { restaurantSlug, tableNo } = useParams<{
    restaurantSlug: string;
    tableNo: string;
  }>();

  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [menu, setMenu] = useState<{ categories: Category[]; items: MenuItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartPreview, setShowCartPreview] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const categoryScrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/public/menu/${restaurantSlug}`);
        if (response.data.data) {
          setMenu(response.data.data);
          if (response.data.data.categories.length > 0) {
            setSelectedCategory(response.data.data.categories[0]._id);
          }
        } else {
          setError('Failed to load menu');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantSlug) {
      fetchMenu();
    }
  }, [restaurantSlug]);

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

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.itemId === item._id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.itemId === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { itemId: item._id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) => prevCart.map((item) => item.itemId === itemId ? { ...item, quantity } : item));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemQuantity = (itemId: string) => {
    return cart.find(i => i.itemId === itemId)?.quantity || 0;
  };

  if (loading) {
     return (
       <CustomerLayout restaurantName="Loading..." themeColor="#000" tableNo={0} onLogout={() => {}}>
          <div className="flex items-center justify-center min-h-[60vh]">
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
               className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full"
               role="status"
               aria-label="Loading menu"
             />
          </div>
       </CustomerLayout>
     );
  }

  const filteredItems = getFilteredItems();
  const themeColor = guestSession?.themeColor || '#6366f1';

  return (
    <CustomerLayout
      restaurantName={guestSession?.restaurantName || 'Restaurant'}
      restaurantLogo={guestSession?.restaurantLogo}
      themeColor={themeColor}
      tableNo={parseInt(tableNo || '0')}
      onLogout={() => { window.location.href = '/'; }}
    >
      <div className="max-w-7xl mx-auto pb-32">
        
        {/* Modern Search & Title Section */}
        <section className="px-6 py-8">
           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
             <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">
                Fresh <span style={{ color: themeColor }}>Selection</span>
             </h2>
             <div 
               className="relative group"
               style={{ 
                 '--brand-color': themeColor,
                 '--brand-color-transparent': `${themeColor}15`
               } as React.CSSProperties & { [key: string]: string }}
             >
                <div className="absolute inset-0 bg-slate-200/50 dark:bg-white/5 rounded-3xl blur-xl group-focus-within:bg-[var(--brand-color-transparent)] transition-all" />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={22} />
                </div>
                <input
                  type="text"
                  placeholder="Craving something specific?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative w-full pl-16 pr-6 py-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-[var(--brand-color-transparent)] font-bold transition-all"
                  title="Search flavors"
                  aria-label="Search for menu items"
                />
             </div>
           </motion.div>
        </section>

        {/* Adaptive Horizontal Category Bar */}
        <section className="sticky top-20 z-50 bg-[#fcfaf8]/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 mb-8">
           <div ref={categoryScrollRef} className="flex overflow-x-auto no-scrollbar py-4 px-6 gap-3 scroll-smooth">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`flex-none px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-slate-900 text-white shadow-xl'
                    : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 border border-slate-200 dark:border-white/5'
                }`}
              >
                Explore All
              </button>
              {menu?.categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`flex-none px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    selectedCategory === category._id
                      ? 'text-white shadow-xl'
                      : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 border border-slate-200 dark:border-white/5'
                  }`}
                  style={selectedCategory === category._id ? { backgroundColor: themeColor } : {}}
                >
                  {category.name}
                </button>
              ))}
           </div>
        </section>

        {/* Dynamic Items Grid */}
        <section className="px-6">
          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Search size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold tracking-tight">No flavors found in this category</p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedCategory + searchQuery}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
              >
                {filteredItems.map((item) => (
                  <motion.div
                    key={item._id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="group relative bg-white dark:bg-slate-950 rounded-[2.5rem] p-4 border border-slate-100 dark:border-white/5 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
                  >
                    {/* Item Image Container */}
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6">
                       {item.imageUrl ? (
                         <img 
                           src={item.imageUrl} 
                           alt={item.name} 
                           title={item.name}
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                         />
                       ) : (
                         <div className="w-full h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                            <Zap size={32} className="text-slate-200" />
                         </div>
                       )}
                       {item.tags.includes('Popular') && (
                         <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full border border-white shadow-sm">
                            <span className="text-[9px] font-black uppercase text-slate-900 tracking-tighter">Bestseller</span>
                         </div>
                       )}
                    </div>

                    <div className="px-2 pb-2">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-tight">{item.name}</h4>
                          <span className="flex-none ml-2 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-xl text-sm font-black text-slate-900 dark:text-white">
                             {guestSession?.currency || '₹'}{item.price}
                          </span>
                       </div>
                       <p className="text-sm text-slate-400 font-medium mb-6 line-clamp-2 leading-relaxed">{item.description}</p>
                       
                       {/* Interactive Action Bar */}
                       <div className="flex items-center gap-2">
                          <AnimatePresence mode="wait">
                            {getItemQuantity(item._id) > 0 ? (
                               <motion.div 
                                 key="count-controls"
                                 initial={{ scale: 0.8, opacity: 0 }}
                                 animate={{ scale: 1, opacity: 1 }}
                                 className="flex-1 flex items-center justify-between p-1 bg-slate-900 rounded-2xl h-[52px]"
                               >
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item._id, getItemQuantity(item._id) - 1); }}
                                    className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                                    title="Decrease quantity"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={18} />
                                  </button>
                                  <span className="text-white font-black">{getItemQuantity(item._id)}</span>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item._id, getItemQuantity(item._id) + 1); }}
                                    className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                                    title="Increase quantity"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={18} />
                                  </button>
                               </motion.div>
                            ) : (
                               <motion.button
                                 key="add-btn"
                                 initial={{ scale: 0.95, opacity: 0 }}
                                 animate={{ scale: 1, opacity: 1 }}
                                 onClick={() => addToCart(item)}
                                 className="flex-1 py-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-900 dark:text-white transition-all flex items-center justify-center gap-2"
                               >
                                  <Plus size={14} /> Add Order
                               </motion.button>
                            )}
                          </AnimatePresence>
                          <button 
                            className="p-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
                            title="Item info"
                            aria-label="View item information"
                          >
                             <Info size={18} />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Floating Modern Cart */}
      <AnimatePresence>
        {cart.length > 0 && guestSession && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-3rem)] max-w-lg"
          >
            <button 
              onClick={() => setShowCartPreview(true)}
              className="w-full p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                 <div className="relative p-4 bg-white/10 dark:bg-slate-900/5 rounded-2xl">
                    <ShoppingCart size={20} />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Order</p>
                    <p className="font-black text-lg tracking-tight">
                       {guestSession.currency}{cartTotal.toFixed(2)}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                 <span className="font-black uppercase tracking-widest text-[10px]">Review Basket</span>
                 <Plus size={16} className="rotate-45" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Cart Drawer (Brief Overhaul) */}
      <AnimatePresence>
        {showCartPreview && guestSession && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowCartPreview(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300]" 
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-950 rounded-t-[3rem] z-[301] p-8 max-h-[85vh] overflow-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Your Picnic Basket</h3>
                 <button 
                  onClick={() => setShowCartPreview(false)} 
                  className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl"
                  title="Close preview"
                  aria-label="Close cart preview"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="space-y-6 mb-8">
                 {cart.map(item => (
                   <div key={item.itemId} className="flex gap-6 items-center">
                      <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-slate-100 flex-none">
                         {item.imageUrl && (
                           <img 
                             src={item.imageUrl} 
                             alt={item.name} 
                             title={item.name} 
                             className="w-full h-full object-cover" 
                           />
                         )}
                      </div>
                      <div className="flex-1">
                         <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{item.name}</h4>
                         <p className="text-sm font-bold opacity-60">{guestSession.currency}{item.price}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl">
                         <button 
                            onClick={() => updateQuantity(item.itemId, item.quantity - 1)} 
                            className="p-2"
                            title="Decrease quantity"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16}/>
                          </button>
                         <span className="font-black text-sm">{item.quantity}</span>
                         <button 
                            onClick={() => updateQuantity(item.itemId, item.quantity + 1)} 
                            className="p-2"
                            title="Increase quantity"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16}/>
                          </button>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                 <div className="flex justify-between items-center px-2">
                    <span className="font-bold text-slate-400">Subtotal</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{guestSession.currency}{cartTotal.toFixed(2)}</span>
                 </div>
                 <button 
                  style={{ backgroundColor: themeColor }}
                  className="w-full py-6 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all"
                 >
                   Confirm & Place Order
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </CustomerLayout>
  );
};

export default CustomerMenuPage;

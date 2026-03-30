import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CustomerLayout } from '@/components';
import { Search, ShoppingCart, Plus, Minus, X, Info, Zap, CheckCircle2, ChefHat, ShieldCheck, Wallet, Clock, ChevronRight, History } from 'lucide-react';
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
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStep, setOrderStep] = useState<'validating' | 'submitting' | 'processing' | 'success'>('validating');
  const [finalOrder, setFinalOrder] = useState<{ id: string; number: string } | null>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [showStatusDetails, setShowStatusDetails] = useState(false);
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

  useEffect(() => {
    const initSession = async () => {
      // If we have URL params but no local session state, initialize it
      if (!guestSession && restaurantSlug && tableNo) {
        try {
          console.log('Auto-initializing guest session...');
          
          // Try to get existing sessionId from localStorage to resume
          const savedSession = localStorage.getItem('guestSession');
          const localSession = savedSession ? JSON.parse(savedSession) : null;
          
          // 1. Get restaurant info (needed for theme color/currency)
          const resResponse = await axios.get(`${API_URL}/customer/restaurant/${restaurantSlug}`);
          const restaurant = resResponse.data.data;
          
          // 2. Create/Get session from backend
          const sessionResponse = await axios.post(`${API_URL}/customer/session`, {
            restaurantSlug,
            tableNo: parseInt(tableNo, 10),
            sessionId: localSession?.sessionId || localSession?.id // Use existing ID if available
          });
          const sessionData = sessionResponse.data.data;
          
          const fullSession = {
            ...sessionData,
            restaurantSlug,
            restaurantName: restaurant.name,
            restaurantLogo: restaurant.logoUrl,
            themeColor: restaurant.themeColor,
            currency: restaurant.currency
          };
          
          localStorage.setItem('guestSession', JSON.stringify(fullSession));
          setGuestSession(fullSession);
          console.log('Session initialized successfully:', fullSession.sessionId);
        } catch (err) {
          console.error("Failed to auto-init session:", err);
          setError("Session initialization failed. Try scanning the QR code again.");
        }
      }
    };
    initSession();
  }, [guestSession, restaurantSlug, tableNo, API_URL]);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      if (!guestSession) return;
      try {
        const response = await axios.get(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${guestSession.sessionToken}` }
        });
        setActiveOrders(response.data.data);
      } catch (err) {
        console.error('Failed to fetch active orders:', err);
      }
    };

    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [guestSession, API_URL]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemQuantity = (itemId: string) => {
    return cart.find(i => i.itemId === itemId)?.quantity || 0;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !guestSession) return;

    try {
      setIsOrdering(true);
      setOrderStep('validating');
      await new Promise(r => setTimeout(r, 1500));

      setOrderStep('submitting');
      const orderPayload = {
        restaurantId: guestSession.restaurantId,
        guestSessionId: guestSession.sessionId,
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          customizations: []
        })),
        tableNo: guestSession.tableNo || parseInt(tableNo || '0'),
        paymentMethod: 'card'
      };

      console.log('Placing Order with payload:', orderPayload);

      const createResponse = await axios.post(`${API_URL}/orders`, orderPayload);
      const orderData = createResponse.data.data;
      
      setOrderStep('processing');
      // Simulate "Dummy" Payment Success
      await new Promise(r => setTimeout(r, 2000));
      
      await axios.patch(`${API_URL}/orders/${orderData.order._id}/payment`, {
        paymentStatus: 'completed'
      }, {
        headers: { Authorization: `Bearer ${guestSession.sessionToken}` }
      });

      setFinalOrder({
        id: orderData.order._id,
        number: orderData.orderNumber
      });
      setOrderStep('success');
      setCart([]);
    } catch (err: any) {
      console.error('--- ORDER PLACEMENT FAILED ---');
      console.error('Error Object:', err);
      if (err.response) {
        console.error('Backend Message:', err.response.data.message);
        console.error('Full Backend Response:', err.response.data);
      }
      setError(err.response?.data?.message || 'Failed to place order. Please check your table connection.');
      setIsOrdering(false);
    }
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
                  onClick={handlePlaceOrder}
                  style={{ backgroundColor: themeColor }}
                  className="w-full py-6 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                 >
                   Confirm & Place Order
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOrdering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900 flex items-center justify-center p-6 text-center"
          >
            <div className="max-w-xs w-full">
               <AnimatePresence mode="wait">
                  {orderStep === 'validating' && (
                    <motion.div key="v" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                       <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full" />
                          <ShoppingCart className="text-white" size={32} />
                       </div>
                       <h3 className="text-white text-xl font-black uppercase tracking-tighter mb-2">Preparing Flavors</h3>
                       <p className="text-slate-400 text-sm font-medium">Gathering your selected items...</p>
                    </motion.div>
                  )}
                  {orderStep === 'submitting' && (
                    <motion.div key="s" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                       <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-white/10 rounded-full blur-xl" />
                          <ChefHat className="text-white" size={32} />
                       </div>
                       <h3 className="text-white text-xl font-black uppercase tracking-tighter mb-2">Sending to Kitchen</h3>
                       <p className="text-slate-400 text-sm font-medium">Notifying the chefs your order is coming...</p>
                    </motion.div>
                  )}
                  {orderStep === 'processing' && (
                    <motion.div key="p" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                       <div className="w-24 h-24 bg-white/5  rounded-full flex items-center justify-center mx-auto mb-8 relative">
                          <motion.div animate={{ strokeDashoffset: [0, 100] }} className="absolute inset-0 border-4 border-white/20 rounded-full border-t-white" />
                          <ShieldCheck className="text-white" size={32} />
                       </div>
                       <h3 className="text-white text-xl font-black uppercase tracking-tighter mb-2">Securing Order</h3>
                       <p className="text-slate-400 text-sm font-medium">Verifying payment details securely...</p>
                    </motion.div>
                  )}
                  {orderStep === 'success' && finalOrder && (
                    <motion.div key="su" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                       <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} >
                            <CheckCircle2 className="text-white" size={48} />
                          </motion.div>
                       </div>
                       <h3 className="text-white text-2xl font-black uppercase tracking-tighter mb-2">Order Confirmed!</h3>
                       <p className="text-slate-400 text-sm font-medium mb-8">Grab a seat, your meal is being prepared.</p>
                       
                       <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Receipt Number</p>
                          <p className="text-xl font-black text-white tracking-widest">{finalOrder.number}</p>
                       </div>

                       <button 
                        onClick={() => { setIsOrdering(false); setShowCartPreview(false); }}
                        className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
                       >
                         Enjoy your meal
                       </button>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Order Status Widget */}
      <AnimatePresence>
        {activeOrders.length > 0 && !isOrdering && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-[60] flex justify-center"
          >
            <motion.div 
              layout
              className="bg-slate-900 border border-white/10 shadow-2xl rounded-[2rem] overflow-hidden w-full max-w-sm"
            >
              <button 
                onClick={() => setShowStatusDetails(!showStatusDetails)}
                className="w-full p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                    <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <ChefHat className="text-white" size={20} />
                    </motion.div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 line-clamp-1">
                      {activeOrders.length} Order{activeOrders.length > 1 ? 's' : ''} in progress
                    </p>
                    <h4 className="text-white text-xs font-black uppercase tracking-widest">
                       {activeOrders[0].status === 'new' && 'Order Received'}
                       {activeOrders[0].status === 'preparing' && 'In the Kitchen'}
                       {activeOrders[0].status === 'ready' && 'Ready for Service'}
                       {activeOrders[0].status === 'completed' && 'Deliciously Done'}
                    </h4>
                  </div>
                </div>
                <div className={`p-2 rounded-xl bg-white/5 transition-transform duration-300 ${showStatusDetails ? 'rotate-90' : ''}`}>
                  <ChevronRight className="text-white" size={16} />
                </div>
              </button>

              <AnimatePresence>
                {showStatusDetails && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 px-5 pb-5"
                  >
                    <div className="space-y-4 pt-4 text-left">
                       {activeOrders.map((order) => (
                         <div key={order._id} className="flex items-start justify-between">
                            <div>
                               <p className="text-white text-[10px] font-black uppercase tracking-widest mb-1">Order #{order.orderNumber.split('-').pop()}</p>
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${order.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{order.status}</span>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-white text-[10px] font-black">{guestSession?.currency}{order.total.toFixed(2)}</p>
                               <p className="text-slate-500 text-[8px] font-bold">{new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
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

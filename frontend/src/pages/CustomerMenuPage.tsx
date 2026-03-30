import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CustomerLayout } from '@/components';
import { Search, ShoppingCart, Plus, Minus, X, Info, Zap, CheckCircle2, ChefHat, ShieldCheck, Wallet, Clock, ChevronRight, History, User as UserIcon, LogIn, UtensilsCrossed } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerAuthModal from '../components/CustomerAuthModal';
import OrderStatusWidget from '../components/OrderStatusWidget';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState<any>(null);
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponInfo, setCouponInfo] = useState<any>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('customerUser');
    if (storedUser) {
      try {
        setCustomerUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse customer user');
      }
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCustomerUser(user);
    if (guestSession) {
      fetchActiveOrders(guestSession.sessionToken);
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/public/menu/${restaurantSlug}`);
        if (response.data.data) {
          setMenu(response.data.data);
          if (response.data.data.categories.length > 0) {
            setSelectedCategory('All');
          }
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
  }, [restaurantSlug, API_URL]);

  useEffect(() => {
    const initSession = async () => {
      if (!guestSession && restaurantSlug && tableNo) {
        try {
          const savedSession = localStorage.getItem('guestSession');
          const localSession = savedSession ? JSON.parse(savedSession) : null;
          const resResponse = await axios.get(`${API_URL}/customer/restaurant/${restaurantSlug}`);
          const restaurant = resResponse.data.data;
          const sessionResponse = await axios.post(`${API_URL}/customer/session`, {
            restaurantSlug,
            tableNo: parseInt(tableNo, 10),
            sessionId: localSession?.sessionId || localSession?.id
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
        } catch (err) {
          console.error("Session init failed:", err);
        }
      }
    };
    initSession();
  }, [guestSession, restaurantSlug, tableNo, API_URL]);

  const fetchActiveOrders = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveOrders(response.data.data);
    } catch (err) {
      console.error('Failed to fetch active orders');
    }
  };

  useEffect(() => {
    // Check session expiry once on mount
    if (guestSession?.expiresAt && new Date() > new Date(guestSession.expiresAt)) {
      localStorage.removeItem('guestSession');
      window.location.reload();
    }
  }, [guestSession]);

  useEffect(() => {
    if (!guestSession) return;
    fetchActiveOrders(guestSession.sessionToken);
    const interval = setInterval(() => fetchActiveOrders(guestSession.sessionToken), 10000);
    return () => clearInterval(interval);
  }, [guestSession, API_URL]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode || !guestSession) return;
    setIsApplyingCoupon(true);
    try {
      const response = await axios.post(`${API_URL}/restaurant/coupons/validate`, {
        code: couponCode,
        restaurantId: guestSession.restaurantId,
        orderAmount: cartTotal
      });
      setCouponInfo(response.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Invalid coupon code');
      setCouponInfo(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const calculateDiscount = () => {
    if (!couponInfo) return 0;
    if (couponInfo.discountType === 'percentage') {
      return (cartTotal * couponInfo.value) / 100;
    }
    return Math.min(couponInfo.value, cartTotal);
  };

  const discount = calculateDiscount();
  const finalTotal = (cartTotal - discount) + (cartTotal * 0.05);

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

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.itemId !== itemId));
    } else {
      setCart(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity } : i));
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !guestSession) return;
    try {
      setIsOrdering(true);
      setOrderStep('validating');
      await new Promise(r => setTimeout(r, 1000));

      setOrderStep('submitting');
      const orderPayload = {
        restaurantId: guestSession.restaurantId,
        guestSessionId: guestSession.sessionId,
        customerId: customerUser?.id || null,
        items: cart.map(item => ({ itemId: item.itemId, quantity: item.quantity, customizations: [] })),
        tableNo: guestSession.tableNo,
        paymentMethod: 'card',
        couponCode: couponInfo?.code || null
      };

      const { data } = await axios.post(`${API_URL}/orders`, orderPayload);
      const order = data.data.order;
      
      setOrderStep('processing');
      await axios.patch(`${API_URL}/orders/${order._id}/payment`, { paymentStatus: 'completed' }, {
        headers: { Authorization: `Bearer ${guestSession.sessionToken}` }
      });

      setFinalOrder({ id: order._id, number: data.data.orderNumber });
      setOrderStep('success');
      setCart([]);
      setCouponInfo(null);
      setCouponCode('');
      fetchActiveOrders(guestSession.sessionToken);
    } catch (err) {
      alert('Order failed. Please try again.');
      setIsOrdering(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );

  const filteredItems = menu ? menu.items.filter(i => 
    (selectedCategory === 'All' || i.categoryId === selectedCategory) &&
    (i.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  return (
    <CustomerLayout 
      restaurantName={guestSession?.restaurantName || 'Restaurant'} 
      restaurantLogo={guestSession?.restaurantLogo}
      themeColor={guestSession?.themeColor}
      tableNo={guestSession?.tableNo || 0}
      onLogout={() => { localStorage.removeItem('guestSession'); window.location.reload(); }}
      onLoginClick={() => setIsAuthModalOpen(true)}
      customerUser={customerUser}
    >
      <div className="max-w-4xl mx-auto pb-40 px-4">
        {/* Subtle Branding Hero */}
        <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-10 text-center"
        >
           <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">Taste Perfection</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Crafted with passion for Table {tableNo}</p>
        </motion.div>

        {/* Advanced Search Bar */}
        <section className="mb-12 relative group">
           <div className="absolute inset-0 bg-brand-500/10 blur-2xl rounded-[3rem] opacity-0 group-focus-within:opacity-100 transition-opacity" />
           <div className="relative flex items-center">
              <Search className="absolute left-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Craving something specific?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                title="Search Menu"
                className="w-full pl-16 pr-6 py-6 bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none focus:outline-none font-bold text-slate-900 dark:text-white transition-all focus:ring-4 focus:ring-brand-500/10"
              />
           </div>
        </section>

        {/* Minimalist Category Navigation */}
        <div className="flex overflow-x-auto no-scrollbar py-2 mb-12 gap-4 sticky top-24 z-30">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex-none px-8 py-3.5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105' : 'bg-white dark:bg-slate-900/50 backdrop-blur-md text-slate-400 border border-slate-100 dark:border-white/5'}`}
            title="Show All"
          >
            All
          </button>
          {menu?.categories.map(c => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`flex-none px-8 py-3.5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all ${selectedCategory === c._id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105' : 'bg-white dark:bg-slate-900/50 backdrop-blur-md text-slate-400 border border-slate-100 dark:border-white/5'}`}
              title={c.name}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <motion.div 
                key={item._id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] p-5 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 group overflow-hidden"
              >
                 <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        title={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <UtensilsCrossed size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-5 right-5 flex flex-col gap-2">
                       {item.tags.map(tag => (
                         <span key={tag} className="px-3 py-1.5 bg-white/90 dark:bg-slate-900/95 backdrop-blur rounded-full text-[8px] font-black uppercase text-slate-900 dark:text-white border border-slate-100 dark:border-white/5 shadow-lg">#{tag}</span>
                       ))}
                    </div>
                 </div>
                 <div className="px-3">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter italic">{item.name}</h3>
                       <span className="font-black text-brand-500 text-lg">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8 line-clamp-2 leading-relaxed">{item.description}</p>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white transition-all shadow-xl active:scale-95"
                      title={`Select ${item.name}`}
                    >
                      Add To Cart
                    </button>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Floating Aesthetic Cart Button */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.button 
              initial={{ scale: 0, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 100 }}
              onClick={() => setShowCartPreview(true)}
              className="fixed bottom-10 right-10 z-[70] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-6 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 group"
              title="View Cart"
            >
              <div className="relative">
                 <ShoppingCart size={28} />
                 <span className="absolute -top-3 -right-3 w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-slate-900 dark:border-white animate-pulse">
                    {cart.length}
                 </span>
              </div>
              <div className="h-10 w-[1px] bg-white/20 dark:bg-slate-200" />
              <div className="text-left">
                <span className="block text-[8px] font-black uppercase opacity-60 tracking-widest mb-0.5">Total Bill</span>
                <span className="font-black text-xl italic tracking-tighter">₹{finalTotal.toFixed(0)}</span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Premium Cart Drawer (Enhanced) */}
        <AnimatePresence>
          {showCartPreview && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartPreview(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[80]" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-slate-950 z-[90] shadow-3xl flex flex-col">
                 <div className="p-10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div>
                       <h2 className="text-3xl font-black uppercase tracking-tighter italic">Your Curation</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Review items for Table {tableNo}</p>
                    </div>
                    <button onClick={() => setShowCartPreview(false)} className="w-12 h-12 bg-white dark:bg-slate-800 shadow-lg rounded-2xl flex items-center justify-center hover:rotate-90 transition-transform" title="Close"><X size={24} /></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-6">
                         <ShoppingCart size={80} strokeWidth={1} />
                         <p className="font-black uppercase tracking-widest text-[10px]">Your tray is empty</p>
                      </div>
                    ) : cart.map(item => (
                       <motion.div layout key={item.itemId} className="flex gap-6 items-center group">
                          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 shadow-inner">
                             {item.imageUrl && <img src={item.imageUrl} alt={item.name} title={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                          </div>
                          <div className="flex-1">
                             <p className="font-black uppercase italic text-sm tracking-tight text-slate-900 dark:text-white">{item.name}</p>
                             <p className="text-xs text-brand-500 font-black mt-1">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                             <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="p-1.5 hover:text-brand-500 transition-colors" title="Remove"><Minus size={16} /></button>
                             <span className="font-black text-sm min-w-[24px] text-center">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="p-1.5 hover:text-brand-500 transition-colors" title="Add"><Plus size={16} /></button>
                          </div>
                       </motion.div>
                    ))}
                 </div>

                 {/* Premium Checkout Zone */}
                 <div className="p-10 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md border-t dark:border-white/5 space-y-8">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Exclusive Offers</p>
                       <div className="flex gap-3">
                          <input 
                            type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-[2rem] px-8 py-5 text-xs font-black uppercase tracking-[0.2em] focus:ring-4 focus:ring-brand-500/10 focus:outline-none placeholder:text-slate-300"
                            placeholder="REWARD CODE"
                            title="Code Input"
                          />
                          <button 
                            onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode}
                            className="px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-xl"
                            title="Redeem"
                          >
                            Apply
                          </button>
                       </div>
                       {couponInfo && <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest pl-4 flex items-center gap-2">
                         <CheckCircle2 size={12} strokeWidth={3} /> {couponInfo.description} Valid!
                       </motion.p>}
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                       {discount > 0 && <div className="flex justify-between text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]"><span>Member Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                       <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]"><span>Service & Taxes (5%)</span><span>₹{(cartTotal * 0.05).toFixed(2)}</span></div>
                       <div className="h-[1px] bg-slate-200 dark:bg-white/10 w-full" />
                       <div className="flex justify-between items-center pt-2">
                          <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-1">Grant Total</span>
                             <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">₹{finalTotal.toFixed(2)}</span>
                          </div>
                          <button 
                            onClick={handlePlaceOrder}
                            disabled={cart.length === 0}
                            className="px-12 py-6 bg-brand-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 disabled:grayscale"
                            title="Checkout"
                          >
                            <Zap size={18} fill="currentColor" />
                            Finalize
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <OrderStatusWidget orders={activeOrders} onRefresh={() => guestSession && fetchActiveOrders(guestSession.sessionToken)} />
        <CustomerAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          restaurantId={guestSession?.restaurantId || ''}
          guestSessionId={guestSession?.sessionId || ''}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </CustomerLayout>
  );
};

export default CustomerMenuPage;

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CustomerLayout } from '@/components';
import { Search, ShoppingCart, Plus, Minus, X, Info, Zap, CheckCircle2, ChefHat, ShieldCheck, Wallet, Clock, ChevronRight, History, User as UserIcon, LogIn } from 'lucide-react';
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
            setSelectedCategory(response.data.data.categories[0]._id);
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
    <CustomerLayout 
      restaurantName="Loading..." 
      themeColor="#000" 
      tableNo={0} 
      onLogout={() => {}}
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    </CustomerLayout>
  );

  const themeColor = guestSession?.themeColor || '#6366f1';
  const filteredItems = menu ? menu.items.filter(i => 
    (selectedCategory === 'All' || i.categoryId === selectedCategory) &&
    (i.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  return (
    <CustomerLayout 
      restaurantName={guestSession?.restaurantName || 'Restaurant'} 
      restaurantLogo={guestSession?.restaurantLogo}
      themeColor={themeColor}
      tableNo={guestSession?.tableNo || 0}
      onLogout={() => window.location.reload()}
      onLoginClick={() => setIsAuthModalOpen(true)}
      customerUser={customerUser}
    >
      <div className="max-w-7xl mx-auto pb-32">
        {/* Simplified Header - Branding already in Layout */}
        <div className="px-6 py-6 pb-2">
           <div className="flex items-center gap-3">
              <ChefHat size={20} className="text-brand-500" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Our Digital Menu</h2>
           </div>
        </div>

        {/* Search */}
        <section className="px-6 py-4">
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search flavors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                title="Search flavours"
                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 focus:outline-none font-bold shadow-sm"
              />
           </div>
        </section>

        {/* Categories */}
        <div className="flex overflow-x-auto no-scrollbar py-4 px-6 gap-3">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex-none px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all ${selectedCategory === 'All' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'}`}
            title="All items"
          >
            All
          </button>
          {menu?.categories.map(c => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`flex-none px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all ${selectedCategory === c._id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5'}`}
              title={c.name}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 mt-8">
          {filteredItems.map(item => (
            <motion.div key={item._id} layout className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 group hover:shadow-xl hover:scale-[1.02] transition-all">
               <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      title={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                     {item.tags.map(tag => (
                       <span key={tag} className="px-2 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg text-[8px] font-black uppercase text-slate-900 dark:text-white border border-slate-100 dark:border-white/5">{tag}</span>
                     ))}
                  </div>
               </div>
               <div className="flex justify-between items-start mb-2 px-1">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight">{item.name}</h3>
                  <span className="font-black text-brand-500 text-sm">{guestSession?.currency}{item.price}</span>
               </div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 font-medium px-1 leading-relaxed">{item.description}</p>
               <button 
                 onClick={() => addToCart(item)}
                 className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white transition-all shadow-md"
                 title={`Add ${item.name} to order`}
               >
                 Add to Order
               </button>
            </motion.div>
          ))}
        </div>

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <button 
            onClick={() => setShowCartPreview(true)}
            className="fixed bottom-8 right-8 z-[70] bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-6 rounded-[2rem] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-4 border-2 border-brand-500/30"
            title="View Cart"
          >
            <ShoppingCart size={24} />
            <div className="text-left leading-none">
              <span className="block text-[8px] font-black uppercase opacity-60">Items</span>
              <span className="font-black text-base">{cart.length}</span>
            </div>
          </button>
        )}

        {/* Cart Drawer */}
        <AnimatePresence>
          {showCartPreview && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartPreview(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80]" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-950 z-[90] shadow-2xl flex flex-col">
                 <div className="p-8 flex justify-between items-center border-b dark:border-white/5">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Your Order</h2>
                    <button onClick={() => setShowCartPreview(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Close Panel"><X size={24} /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {cart.map(item => (
                       <div key={item.itemId} className="flex gap-4 items-center group">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/5">
                             {item.imageUrl && <img src={item.imageUrl} alt={item.name} title={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />}
                          </div>
                          <div className="flex-1">
                             <p className="font-black uppercase text-[10px] tracking-tight">{item.name}</p>
                             <p className="text-xs text-brand-500 font-black mt-1">{guestSession?.currency}{item.price}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-white/5">
                             <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="p-1 hover:text-brand-500 transition-colors" title="Decrease Quantity"><Minus size={14} /></button>
                             <span className="font-black text-xs min-w-[20px] text-center">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="p-1 hover:text-brand-500 transition-colors" title="Increase Quantity"><Plus size={14} /></button>
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Coupon & Total Sticky Area */}
                 <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t dark:border-white/5 space-y-6">
                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Promo Code</p>
                       <div className="flex gap-2">
                          <input 
                            type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            placeholder="CODE"
                            title="Coupon Entry"
                          />
                          <button 
                            onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode}
                            className="px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-md"
                            title="Submit Code"
                          >
                            Apply
                          </button>
                       </div>
                       {couponInfo && <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest pl-2 flex items-center gap-2 animate-bounce">
                         <CheckCircle2 size={12} /> {couponInfo.description}
                       </p>}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
                       <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest"><span>Subtotal</span><span>{guestSession?.currency}{cartTotal.toFixed(2)}</span></div>
                       {discount > 0 && <div className="flex justify-between text-xs font-black text-emerald-500 uppercase tracking-widest"><span>Loyalty Discount</span><span>-{guestSession?.currency}{discount.toFixed(2)}</span></div>}
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Total</span>
                          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{guestSession?.currency}{finalTotal.toFixed(2)}</span>
                       </div>
                    </div>
                    <button 
                      onClick={handlePlaceOrder}
                      className="w-full py-6 bg-brand-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                      title="Place Order"
                    >
                      <Zap size={16} className="fill-current" />
                      Complete Checkout
                    </button>
                 </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Order Success/Processing Overlay */}
        <AnimatePresence>
          {isOrdering && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-8">
               <div className="text-center max-w-sm w-full">
                  {orderStep === 'success' ? (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-6">
                       <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                          <CheckCircle2 size={48} className="text-emerald-500" />
                       </div>
                       <h2 className="text-4xl font-black text-white uppercase tracking-tighter">SUCCESS!</h2>
                       <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Order #{finalOrder?.number} is cooking.</p>
                       <button onClick={() => { setIsOrdering(false); setShowCartPreview(false); }} className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black uppercase text-[10px] shadow-xl hover:scale-105 transition-all">Back to Flavors</button>
                    </motion.div>
                  ) : (
                    <div className="space-y-10">
                       <div className="relative">
                          <div className="w-24 h-24 border-[6px] border-white/5 border-t-brand-500 rounded-full animate-spin mx-auto" role="status" />
                          <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" size={32} />
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic animate-pulse">{orderStep}...</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Preparing your experience</p>
                       </div>
                    </div>
                  )}
               </div>
            </motion.div>
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

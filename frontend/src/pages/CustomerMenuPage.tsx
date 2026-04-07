import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomerLayout, OrderStatusWidget, AiConcierge, CartSuggestions } from '@/components';
import { Search, ShoppingCart, Plus, Minus, X, Info, Zap, CheckCircle2, ChefHat, ShieldCheck, Wallet, Clock, ChevronRight, History, User as UserIcon, LogIn, UtensilsCrossed, Bot, Gift, ArrowRight, Tag } from 'lucide-react';
import { VITE_API_URL } from '@/config/env';
import { useTabTitle } from '@/hooks';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerAuthModal from '../components/CustomerAuthModal';
import { useLocation } from 'react-router-dom';
import { Shield, CreditCard, Loader2, CheckIcon, PartyPopper } from 'lucide-react';
import { CategoryIcon } from '@/utils/categoryIcons';
import { toast } from 'react-hot-toast';

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
  const statusRef = useRef<HTMLDivElement>(null);

  useTabTitle('Digital Menu', guestSession?.restaurantName ? ` | ${guestSession.restaurantName}` : undefined);

  const [orderStep, setOrderStep] = useState<'validating' | 'submitting' | 'processing' | 'success'>('validating');
  const [finalOrder, setFinalOrder] = useState<{ id: string; number: string } | null>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState<any>(null);

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponInfo, setCouponInfo] = useState<any>(null);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const [loyaltyData, setLoyaltyData] = useState<{ points: number; settings: any } | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [isOffersDrawerOpen, setIsOffersDrawerOpen] = useState(false);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);

    const API_URL = VITE_API_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem('customerUser');
    if (storedUser) {
      try {
        setCustomerUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse customer user');
      }
    }

    // Real-time Sync across tabs/pages
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customerUser') {
        setCustomerUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCallWaiter = async () => {
    if (!guestSession) return;
    setIsCallingWaiter(true);
    try {
      await axios.post(`${API_URL}/notifications/call-waiter`, {
        restaurantId: guestSession.restaurantId,
        tableNo: guestSession.tableNo
      });
      toast.success('Waiter is on the way!', {
        icon: '🔔',
        style: {
          borderRadius: '20px',
          background: '#334155',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        },
      });
    } catch (err) {
      console.error('Call waiter error:', err);
      toast.error('Failed to call waiter');
    } finally {
      setIsCallingWaiter(false);
    }
  };
  // Fetch loyalty balance on mount if user already logged in
  useEffect(() => {
    if (customerUser && guestSession?.restaurantId) {
      fetchLoyaltyBalance(customerUser.id || customerUser._id, guestSession.restaurantId);
    }
  }, [customerUser?.id, customerUser?._id, guestSession?.restaurantId]);

  const fetchLoyaltyBalance = async (customerId: string, restaurantId: string) => {
    try {
      const response = await axios.get(`${API_URL}/marketing/loyalty-balance/${restaurantId}/${customerId}`);
      setLoyaltyData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch loyalty balance');
    }
  };

  const fetchAvailableCoupons = async (restaurantId: string) => {
    try {
      const customerId = customerUser?.id || customerUser?._id;
      const response = await axios.get(`${API_URL}/marketing/public-coupons/${restaurantId}`, {
        params: { customerId }
      });
      setAvailableCoupons(response.data.data);
    } catch (err) {
      console.error('Failed to fetch available coupons');
    }
  };

  useEffect(() => {
    if (guestSession?.restaurantId) {
      fetchAvailableCoupons(guestSession.restaurantId);
    }
  }, [guestSession?.restaurantId, customerUser?.id]);

  const handleLoginSuccess = (user: any) => {
    setCustomerUser(user);
    const token = localStorage.getItem('customerToken') || guestSession?.sessionToken;
    if (token) {
      fetchActiveOrders(token);
    }
    if (guestSession) {
      fetchLoyaltyBalance(user.id || user._id, guestSession.restaurantId);
    }
  };

  useEffect(() => {
    if (guestSession?.restaurantId) {
      const savedCart = localStorage.getItem(`cart_${guestSession.restaurantId}`);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCart(parsed);
        } catch (e) {
          console.error('Failed to restore cart', e);
        }
      }

      const savedCoupon = localStorage.getItem(`coupon_${guestSession.restaurantId}`);
      if (savedCoupon) {
        try {
          const parsed = JSON.parse(savedCoupon);
          setCouponInfo(parsed);
          setCouponCode(parsed.code);
        } catch (e) { }
      }

      const savedPoints = localStorage.getItem(`points_${guestSession.restaurantId}`);
      if (savedPoints) {
        setPointsRedeemed(parseInt(savedPoints));
      }
    }
  }, [guestSession?.restaurantId]);

  useEffect(() => {
    if (guestSession?.restaurantId) {
      localStorage.setItem(`cart_${guestSession.restaurantId}`, JSON.stringify(cart));
      localStorage.setItem(`points_${guestSession.restaurantId}`, pointsRedeemed.toString());
      if (couponInfo) {
        localStorage.setItem(`coupon_${guestSession.restaurantId}`, JSON.stringify(couponInfo));
      } else {
        localStorage.removeItem(`coupon_${guestSession.restaurantId}`);
      }
    }
  }, [cart, pointsRedeemed, couponInfo, guestSession?.restaurantId]);

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
      const restaurantId = guestSession?.restaurantId;
      const sessionId = guestSession?.sessionId;
      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { restaurantId, sessionId } // Ensure context for global customer tokens
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
    
    // Check for customer token periodically to handle seamless account switching
    const getBestToken = () => localStorage.getItem('customerToken') || guestSession.sessionToken;
    
    fetchActiveOrders(getBestToken());
    const interval = setInterval(() => fetchActiveOrders(getBestToken()), 10000);
    return () => clearInterval(interval);
  }, [guestSession, customerUser, API_URL]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- Savings Sync Engine ---
  // Periodically re-validate savings when cart total changes
  useEffect(() => {
    // 1. Point-Coupon Mutual Exclusivity: Points win unless coupon is manually applied
    // If points are moved, we clear any auto-applied coupon
    if (pointsRedeemed > 0 && couponInfo) {
      setCouponInfo(null);
      setCouponCode('');
      toast.success('Points redeemed: Other offers removed', { id: 'mutual-exclusivity' });
    }

    // 2. Coupon Invalidation
    if (couponInfo && cartTotal < couponInfo.minOrderAmount) {
      setCouponInfo(null);
      setCouponCode('');
      toast.error(`Coupon removed: ₹${couponInfo.minOrderAmount} min. order required`);
    }

    // 3. Loyalty Points Adjustment (Capping)
    if (loyaltyData?.settings?.enabled && pointsRedeemed > 0) {
      const maxAllowedVal = cartTotal * (loyaltyData.settings.maxRedemptionPercentage / 100);
      const currentRedeemVal = pointsRedeemed * (loyaltyData.settings.redeemRate || 0);
      
      if (currentRedeemVal > maxAllowedVal) {
        const newMaxPoints = Math.floor(maxAllowedVal / (loyaltyData.settings.redeemRate || 1));
        setPointsRedeemed(Math.max(0, Math.min(newMaxPoints, loyaltyData.points)));
      }
    }

    // 4. Auto-Apply Best Coupon (Only if no points are redeemed)
    if (pointsRedeemed === 0 && !couponInfo && availableCoupons.length > 0) {
      const bestOffer = findBestOffer(availableCoupons, cartTotal);
      if (bestOffer) {
         handleApplyCoupon(bestOffer.code);
      }
    }
  }, [cartTotal, couponInfo, loyaltyData, pointsRedeemed, availableCoupons]);

  const findBestOffer = (coupons: any[], total: number) => {
    let best = null;
    let maxSaving = 0;

    for (const coupon of coupons) {
      if (total >= coupon.minOrderAmount) {
        let currentSaving = 0;
        if (coupon.discountType === 'percentage') {
          currentSaving = (total * coupon.value) / 100;
          if (coupon.maxDiscountAmount) {
            currentSaving = Math.min(currentSaving, coupon.maxDiscountAmount);
          }
        } else {
          currentSaving = Math.min(coupon.value, total);
        }

        if (currentSaving > maxSaving) {
          maxSaving = currentSaving;
          best = coupon;
        }
      }
    }
    return best;
  };

  const handleApplyCoupon = async (passedCode?: string) => {
    const codeToApply = passedCode || couponCode;
    if (!codeToApply || !guestSession) return;
    setIsApplyingCoupon(true);
    try {
      const response = await axios.post(`${API_URL}/marketing/validate-coupon`, {
        code: codeToApply,
        restaurantId: guestSession.restaurantId,
        orderAmount: cartTotal,
        customerId: customerUser?.id || customerUser?._id
      });
      setCouponInfo(response.data.data);
      if (passedCode) setCouponCode(passedCode);
      
      // Mutual Exclusivity: Clear points if coupon is applied
      if (pointsRedeemed > 0) {
         setPointsRedeemed(0);
         toast.success('Coupon applied: Points cleared', { id: 'mutual-exclusivity' });
      } else {
         toast.success('Offer applied!', { id: 'offer-applied' });
      }
    } catch (err: any) {
      if (!passedCode) toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponInfo(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const calculateDiscount = () => {
    if (!couponInfo) return 0;
    if (couponInfo.discountType === 'percentage') {
       let disc = (cartTotal * couponInfo.value) / 100;
       if (couponInfo.maxDiscountAmount) {
         disc = Math.min(disc, couponInfo.maxDiscountAmount);
       }
       return disc;
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
      setShowCartPreview(false);
      setIsOrdering(true);
      setOrderStep('validating');
      await new Promise(r => setTimeout(r, 1500)); // Simulating Securing Connection

      setOrderStep('submitting');
      const orderData = {
        restaurantId: guestSession.restaurantId,
        items: cart.map(i => ({ itemId: i.itemId, quantity: i.quantity, customizations: [] })),
        tableNo: parseInt(tableNo || '0'),
        paymentMethod: 'card',
        customerId: customerUser?.id || customerUser?._id,
        guestSessionId: guestSession.sessionId,
        couponCode: couponInfo?.code,
        pointsRedeemed
      };

      const { data } = await axios.post(`${API_URL}/orders`, orderData);
      const order = data.data.order;

      setOrderStep('processing');
      await new Promise(r => setTimeout(r, 2000)); // Simulating Bank Gateway

      await axios.patch(`${API_URL}/orders/${order._id}/payment`, { paymentStatus: 'completed' }, {
        headers: { Authorization: `Bearer ${guestSession.sessionToken}` }
      });

      setFinalOrder({ id: order._id, number: data.data.orderNumber });
      setOrderStep('success');

      // Clear data but wait before closing overlay
      setCart([]);
      setCouponInfo(null);
      setCouponCode('');
      const token = localStorage.getItem('customerToken') || guestSession.sessionToken;
      fetchActiveOrders(token);
      if (customerUser?.id || customerUser?._id) {
        fetchLoyaltyBalance(customerUser.id || customerUser._id, guestSession.restaurantId);
      }

      // Finish experience
      setTimeout(() => {
        setIsOrdering(false);
        // Scroll to status
        setTimeout(() => {
          statusRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }, 3000);

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
      onLogout={() => { 
        const rId = guestSession?.restaurantId;
        localStorage.removeItem('guestSession'); 
        localStorage.removeItem('customerUser');
        localStorage.removeItem('customerToken');
        if (rId) {
          localStorage.removeItem(`cart_${rId}`);
          localStorage.removeItem(`coupon_${rId}`);
          localStorage.removeItem(`points_${rId}`);
        }
        window.location.reload(); 
      }}
      onLoginClick={() => setIsAuthModalOpen(true)}
      customerUser={customerUser}
      cartCount={cart.length}
      onCartClick={() => setShowCartPreview(true)}
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
        <div className="flex overflow-x-auto no-scrollbar py-4 mb-12 gap-4 sticky top-24 z-30 px-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`flex-none px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 ${selectedCategory === 'All' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-[0_15px_30px_rgba(0,0,0,0.2)] scale-105' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-400 border border-slate-100 dark:border-white/5 hover:border-brand-500/30 font-bold'}`}
            title="Show All"
          >
            <UtensilsCrossed size={14} className={selectedCategory === 'All' ? 'text-brand-500' : 'opacity-40'} />
            All
          </button>
          {menu?.categories.map(c => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`flex-none px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-3 ${selectedCategory === c._id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-[0_15px_30px_rgba(0,0,0,0.2)] scale-105' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-400 border border-slate-100 dark:border-white/5 hover:border-brand-500/30'}`}
              title={c.name}
            >
              <CategoryIcon name={c.icon} size={14} className={selectedCategory === c._id ? 'text-brand-500' : 'opacity-40'} />
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
                      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${!item.isAvailable ? 'grayscale opacity-50' : ''}`}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-slate-300 ${!item.isAvailable ? 'grayscale opacity-30' : ''}`}>
                      <UtensilsCrossed size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  {!item.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="px-6 py-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                          <Clock size={12} className="text-amber-500" /> Available Soon
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-5 right-5 flex flex-col gap-2">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        style={{ backgroundColor: guestSession?.themeColor ? `${guestSession.themeColor}dd` : undefined, color: 'white' }}
                        className="px-3 py-1.5 backdrop-blur rounded-full text-[8px] font-black uppercase border border-white/10 shadow-lg"
                      >
                        #{tag}
                      </span>
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
                    onClick={() => item.isAvailable && addToCart(item)}
                    disabled={!item.isAvailable}
                    className={`w-full py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 theme-btn-hover ${item.isAvailable
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      }`}
                    style={{ '--theme-hover': guestSession?.themeColor } as any}
                    title={item.isAvailable ? `Select ${item.name}` : "Currently Unavailable"}
                  >
                    {item.isAvailable ? 'Add To Cart' : (
                      <>
                        <Clock size={14} /> Available Soon
                      </>
                    )}
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
              className="fixed bottom-10 left-10 z-[70] hidden sm:flex bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-6 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all items-center gap-6 group"
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCartPreview(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[120]" />
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed left-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-slate-950 z-[130] shadow-3xl flex flex-col">
                <div className="p-10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Your Curation</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Review items for Table {tableNo}</p>
                  </div>
                  <button onClick={() => setShowCartPreview(false)} className="w-12 h-12 bg-white dark:bg-slate-800 shadow-lg rounded-2xl flex items-center justify-center hover:rotate-90 transition-transform" title="Close"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
                  <div className="space-y-8">
                    {cart.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-6">
                        <ShoppingCart size={80} strokeWidth={1} />
                        <p className="font-black uppercase tracking-widest text-[10px]">Your tray is empty</p>
                      </div>
                    ) : cart.map(item => (
                      <motion.div layout key={item.itemId} className="flex gap-6 items-center group">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 shadow-sm">
                          {item.imageUrl && <img src={item.imageUrl} alt={item.name} title={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-black uppercase italic text-sm tracking-tight text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-brand-500 font-black mt-1">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-3xl border border-slate-100 dark:border-white/5">
                          <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)} className="p-1.5 hover:text-brand-500 transition-colors" title="Remove"><Minus size={16} /></button>
                          <span className="font-black text-sm min-w-[24px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)} className="p-1.5 hover:text-brand-500 transition-colors" title="Add"><Plus size={16} /></button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Contextual Recommendations & Controls */}
                  <div className="space-y-12 pt-10 border-t border-slate-100 dark:border-white/5">
                    <CartSuggestions
                      cartItems={cart}
                      restaurantSlug={guestSession?.restaurantSlug || ''}
                      onAdd={addToCart}
                      themeColor={guestSession?.themeColor}
                    />

                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Apply Savings</p>
                        <button 
                          onClick={() => setIsOffersDrawerOpen(true)}
                          className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                          style={{ color: guestSession?.themeColor }}
                        >
                          View Offers <ArrowRight size={12} />
                        </button>
                      </div>
                      <div className="relative group">
                        <input
                          type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] px-8 py-5 text-xs font-black uppercase tracking-[0.2em] focus:ring-8 focus:outline-none placeholder:text-slate-300 transition-all"
                          style={{ '--tw-ring-color': `${guestSession?.themeColor}10` } as React.CSSProperties}
                          placeholder="Enter Promo Code"
                          title="Coupon Code"
                        />
                        <button
                          onClick={() => handleApplyCoupon()} 
                          disabled={isApplyingCoupon || !couponCode || (couponInfo && couponCode === couponInfo.code)}
                          className="absolute right-2 top-2 bottom-2 px-8 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                          style={{ backgroundColor: guestSession?.themeColor || '#000' }}
                        >
                          {couponInfo && couponCode === couponInfo.code ? 'Applied' : 'Apply'}
                        </button>
                      </div>
                      {couponInfo && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest pl-4 flex items-center gap-2">
                        <CheckCircle2 size={12} strokeWidth={3} /> {couponInfo.description || 'Coupon Applied!'}
                      </motion.p>}
                    </div>

                    {loyaltyData?.settings?.enabled && customerUser && (
                      <div 
                        className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-5 space-y-4 relative overflow-hidden group/loyalty transition-all hover:border-amber-500/20"
                      >
                        <div className="flex justify-between items-center relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: guestSession?.themeColor || '#000' }}>
                              <Gift size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Reward Wallet</p>
                               <p className="text-sm font-black text-slate-900 dark:text-white italic tracking-tighter">{loyaltyData.points} <span className="text-[10px] text-slate-400 not-italic">Pts</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Saving</p>
                             <p className="text-sm font-black italic tracking-tighter" style={{ color: guestSession?.themeColor }}>₹{(pointsRedeemed * (loyaltyData.settings.redeemRate || 0)).toFixed(0)}</p>
                          </div>
                        </div>

                        {loyaltyData.points > 0 && (
                          <div className="relative pt-2">
                              <input
                                type="range" 
                                min="0" 
                                max={Math.min(loyaltyData.points, Math.floor((cartTotal * (loyaltyData.settings.maxRedemptionPercentage / 100)) / (loyaltyData.settings.redeemRate || 1)))}
                                value={pointsRedeemed} 
                                onChange={(e) => setPointsRedeemed(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full appearance-none cursor-pointer relative z-10 accent-current"
                                style={{ color: guestSession?.themeColor } as any}
                                title="Redeem points slider"
                              />
                          </div>
                        )}
                      </div>
                    )}

                    {loyaltyData?.settings?.enabled && !customerUser && (
                      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-8 text-center group transition-colors hover:bg-indigo-500/10" onClick={() => setIsAuthModalOpen(true)}>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-3">Loyalty Passport</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed mb-6">Login to earn points & unlock exclusive tier rewards on this visit.</p>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest group-hover:underline cursor-pointer">Verify Identity →</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Sticky Checkout Footer */}
                <div className="p-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border-t border-slate-100 dark:border-white/5 space-y-8 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                  <div className="grid grid-cols-2 gap-y-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    {couponInfo && (
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Coupon</span>
                        <span className="text-sm font-black text-emerald-500">-₹{couponInfo.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {pointsRedeemed > 0 && loyaltyData?.settings && (
                      <div className="flex flex-col col-span-2 mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Points Redeemed ({pointsRedeemed})</span>
                          <span className="text-sm font-black text-amber-500">-₹{(pointsRedeemed * loyaltyData.settings.redeemRate).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="h-[1px] bg-slate-100 dark:bg-white/10 w-full" />

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-1">Grant Total</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                          ₹{Math.max(0, (cartTotal - (couponInfo?.discountAmount || 0) - (pointsRedeemed * (loyaltyData?.settings?.redeemRate || 0))) * 1.05).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Incl. Tax</span>
                      </div>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={cart.length === 0}
                      className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                    >
                      Finalize Order <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Checkout & Payment Interactive Overlay - Museum Redesign */}
        <AnimatePresence>
          {isOrdering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-[100px] flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-slate-900/40 border border-white/5 rounded-[4rem] p-16 text-center relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              >
                {/* Dynamic Background Glows */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ repeat: Infinity, duration: 8 }}
                  className={`absolute -top-32 -right-32 w-96 h-96 blur-[120px] rounded-full transition-colors duration-2000 ${orderStep === 'success' ? 'bg-emerald-500' : 'bg-brand-500'}`}
                />
                <div className={`absolute -bottom-32 -left-32 w-64 h-64 blur-[100px] rounded-full opacity-10 transition-colors duration-2000 ${orderStep === 'success' ? 'bg-emerald-400' : 'bg-amber-500'}`} />

                <div className="relative z-10 flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    {orderStep === 'validating' && (
                      <motion.div key="validating" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-[3rem] bg-amber-500/5 flex items-center justify-center mb-14 relative group">
                          <Shield size={44} className="text-amber-500/80 group-hover:scale-110 transition-transform duration-700" />
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }} className="absolute inset-0 border-2 border-dashed border-amber-500/20 rounded-[3rem]" />
                          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }} className="absolute -inset-4 border border-amber-500/5 rounded-[4rem]" />
                        </div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-[-0.05em] italic mb-4 bg-gradient-to-br from-white via-white to-amber-500/50 bg-clip-text text-transparent">Securing</h3>
                        <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.4em] px-8 leading-loose">Authenticating with your lifestyle financial network</p>
                      </motion.div>
                    )}

                    {orderStep === 'submitting' && (
                      <motion.div key="submitting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-[3rem] bg-brand-500/5 flex items-center justify-center mb-14 relative shadow-[0_0_60px_rgba(59,130,246,0.1)]">
                          <CreditCard size={44} className="text-brand-400/80" />
                          {/* Sacred Geometry Loader */}
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="absolute -inset-2 border-t-2 border-brand-500/40 rounded-[3.5rem]" />
                          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }} className="absolute -inset-4 border-b-2 border-brand-500/10 rounded-[4.5rem]" />
                        </div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-[-0.05em] italic mb-4 bg-gradient-to-br from-white via-white to-brand-500/50 bg-clip-text text-transparent">Settling</h3>
                        <p className="text-[9px] font-black text-brand-400/60 uppercase tracking-[0.4em] px-8 leading-loose">Deducting ₹{finalTotal.toFixed(0)} through your digital vault</p>
                      </motion.div>
                    )}

                    {orderStep === 'processing' && (
                      <motion.div key="processing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center text-center">
                        <div className="w-28 h-28 rounded-[3rem] bg-emerald-500/5 flex items-center justify-center mb-14 relative">
                          <motion.div
                            animate={{
                              boxShadow: ['0 0 20px rgba(16,185,129,0)', '0 0 60px rgba(16,185,129,0.2)', '0 0 20px rgba(16,185,129,0)']
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-[3rem] border-2 border-emerald-500/20"
                          />
                          <CheckIcon size={44} className="text-emerald-500/80" />
                        </div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-[-0.05em] italic mb-4 bg-gradient-to-br from-white via-white to-emerald-500/50 bg-clip-text text-transparent">Verifying</h3>
                        <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.4em] px-8 leading-loose">Locking in your reservation with kitchen HQ</p>
                      </motion.div>
                    )}

                    {orderStep === 'success' && (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                        <div className="w-36 h-36 rounded-[4rem] bg-emerald-500 flex items-center justify-center mb-14 shadow-[0_0_80px_rgba(16,185,129,0.3)] group">
                          <PartyPopper size={64} className="text-white group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="mb-10 text-center">
                          <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-block px-5 py-2 bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6"
                          >
                            Order #{finalOrder?.number} Confirmed
                          </motion.span>
                          <h3 className="text-6xl font-black text-white uppercase tracking-tighter italic leading-none mb-4 bg-gradient-to-br from-white via-emerald-200 to-emerald-500 bg-clip-text text-transparent">Bon Appétit</h3>
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] leading-relaxed mb-12">Redirecting to live tracking console</p>

                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={statusRef}>
          <OrderStatusWidget orders={activeOrders} onRefresh={() => guestSession && fetchActiveOrders(guestSession.sessionToken)} />
        </div>
        <CustomerAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          restaurantId={guestSession?.restaurantId || ''}
          guestSessionId={guestSession?.sessionId || ''}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>

      <AiConcierge
        restaurantSlug={guestSession?.restaurantSlug || ''}
        restaurantName={guestSession?.restaurantName || 'Restaurant'}
        themeColor={guestSession?.themeColor}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .theme-btn-hover:hover {
          background-color: var(--theme-hover) !important;
          color: white !important;
          box-shadow: 0 20px 40px -15px var(--theme-hover);
        }
      `}} />
      {/* Offers Drawer */}
      <AnimatePresence>
        {isOffersDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsOffersDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[140]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-t-[3rem] p-10 z-[150] max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase">Exclusive Offers</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Unlock hand-picked deals from {guestSession?.restaurantName}</p>
                </div>
                <button 
                  onClick={() => setIsOffersDrawerOpen(false)}
                  className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white"
                  title="Close offers"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {availableCoupons.length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <Tag size={40} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No active offers available</p>
                  </div>
                ) : availableCoupons.map((coupon) => {
                  const isEligible = cartTotal >= coupon.minOrderAmount;
                  const discountText = coupon.discountType === 'percentage' 
                    ? `${coupon.value}% OFF` 
                    : `₹${coupon.value} FLAT OFF`;

                  return (
                    <div 
                      key={coupon._id}
                      className={`p-8 rounded-[2.5rem] border-2 transition-all ${isEligible ? 'border-slate-100 dark:border-white/5 bg-slate-50/30' : 'border-slate-100 dark:border-white/5 opacity-60'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] font-black px-4 py-1.5 rounded-full border-2 border-dashed border-slate-300 dark:border-white/10 uppercase tracking-widest">{coupon.code}</span>
                            <span className="text-xs font-black italic uppercase tracking-tight" style={{ color: guestSession?.themeColor }}>{discountText}</span>
                          </div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-2">{coupon.description}</p>
                        </div>
                        <button
                          disabled={!isEligible}
                          onClick={() => {
                            setCouponCode(coupon.code);
                            handleApplyCoupon(coupon.code);
                            setIsOffersDrawerOpen(false);
                          }}
                          className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isEligible ? 'text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}
                          style={isEligible ? { backgroundColor: guestSession?.themeColor } : {}}
                        >
                          {isEligible ? 'Apply' : 'Locked'}
                        </button>
                      </div>
                      
                      {!isEligible && (
                        <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                           <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full" 
                                style={{ 
                                  backgroundColor: guestSession?.themeColor, 
                                  width: `${Math.min(100, (cartTotal / coupon.minOrderAmount) * 100)}%` 
                                }} 
                              />
                           </div>
                           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Add ₹{(coupon.minOrderAmount - cartTotal).toFixed(0)} more</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Concierge */}
      {guestSession && (
        <AiConcierge 
          restaurantSlug={restaurantSlug!} 
          restaurantName={guestSession.restaurantName}
          themeColor={guestSession.themeColor}
          cartItems={cart}
          loyaltyData={loyaltyData}
          coupons={availableCoupons}
        />
      )}

      {/* Order Status Widget */}
      {activeOrders.length > 0 && (
        <OrderStatusWidget 
          orders={activeOrders} 
          onRefresh={() => {
            const token = localStorage.getItem('customerToken') || guestSession?.sessionToken;
            if (token) fetchActiveOrders(token);
          }} 
        />
      )}

      {/* Call Waiter Floating Button */}
      {!loading && guestSession && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCallWaiter}
          disabled={isCallingWaiter}
          className="fixed bottom-24 right-6 z-[100] bg-white dark:bg-slate-800 p-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5 text-brand-500 flex items-center justify-center group backdrop-blur-md"
          title="Call Waiter"
        >
          <UtensilsCrossed size={22} className={isCallingWaiter ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 whitespace-nowrap">
            {isCallingWaiter ? 'Calling...' : 'Call Waiter'}
          </span>
          
          {/* Subtle pulse effect */}
          {!isCallingWaiter && (
            <span className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping -z-10"></span>
          )}
        </motion.button>
      )}
    </CustomerLayout>
  );
};

export default CustomerMenuPage;

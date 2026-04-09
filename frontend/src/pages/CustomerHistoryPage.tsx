import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { VITE_API_URL } from '@/config/env';
import { 
  ChevronLeft, 
  History, 
  Calendar, 
  Tag, 
  ArrowRight, 
  Clock, 
  UtensilsCrossed, 
  CheckCircle2, 
  Timer,
  ShoppingBag
} from 'lucide-react';
import { CustomerLayout } from '@/components';
import { useTabTitle } from '@/hooks';
import axios from 'axios';

interface GuestSession {
  sessionId: string;
  restaurantId: string;
  restaurantSlug: string;
  tableNo: number;
  sessionToken: string;
  restaurantName: string;
  restaurantLogo?: string;
  themeColor: string;
  assignedStaff?: any;
}

interface OrderItem {
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  orderedAt: string;
  items: OrderItem[];
}

export const CustomerHistoryPage = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useTabTitle('Order History');

    const API_URL = VITE_API_URL;

  useEffect(() => {
    const init = async () => {
      try {
        const storedSession = localStorage.getItem('guestSession');
        const storedUser = localStorage.getItem('customerUser');
        
        if (!storedSession || !storedUser) {
           navigate(`/r/${restaurantSlug}/table/1`);
           return;
        }

        const session = JSON.parse(storedSession);
        const user = JSON.parse(storedUser);
        
        setGuestSession(session);
        setCustomerUser(user);
        
        // Fetch full history - prioritize customer account token
        const token = localStorage.getItem('customerToken') || session.sessionToken;
        const orderRes = await axios.get(`${API_URL}/orders/my-orders?history=true`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { restaurantId: session.restaurantId }
        });
        setOrders(orderRes.data.data);
      } catch (err) {
        console.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [restaurantSlug, navigate, API_URL]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-500 bg-blue-500/10';
      case 'preparing': return 'text-amber-500 bg-amber-500/10';
      case 'ready': return 'text-purple-500 bg-purple-500/10';
      case 'completed': return 'text-emerald-500 bg-emerald-500/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return Clock;
      case 'preparing': return Timer;
      case 'ready': return UtensilsCrossed;
      case 'completed': return CheckCircle2;
      default: return Clock;
    }
  };

  if (loading) return null;

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
        navigate(`/r/${restaurantSlug}/table/1`); 
      }}
      customerUser={customerUser}
    >
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Menu</span>
        </button>

        <div className="mb-12">
           <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">Order Timeline</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total {orders.length} culinary experiences at {guestSession?.restaurantName}</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
             <ShoppingBag size={64} className="text-slate-200 mx-auto mb-6" />
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No orders found yet</p>
             <button 
               onClick={() => navigate(-1)}
               className="mt-8 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest"
             >
               Start Your First Order
             </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, idx) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={order._id}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getStatusColor(order.status)}`}>
                        <StatusIcon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white">#{order.orderNumber}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                          <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.orderedAt).toLocaleDateString()}</div>
                          <div className="flex items-center gap-1"><Clock size={12} /> {new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-6 md:pt-0 border-slate-50 dark:border-white/5">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Bill Amount</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">₹{order.total.toFixed(0)}</p>
                      </div>
                      <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 pl-1">Order Manifest</p>
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center text-[10px] text-slate-500">{item.quantity}</span>
                            <span className="uppercase text-xs tracking-tight">{item.nameSnapshot}</span>
                          </div>
                          <span>₹{(item.priceSnapshot * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerHistoryPage;

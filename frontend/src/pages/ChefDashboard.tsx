import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VITE_API_URL } from '@/config/env';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, AlertTriangle, CheckCircle2, RotateCcw, Flame, Phone, LayoutGrid } from 'lucide-react';
import { useTabTitle } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { toggleDutyStatus } from '@/store/slices/authSlice';
import { fetchStaffUser } from '@/store/slices/fetchStaffUser';
import { socketService } from '@/services/socket';

interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface KitchenOrder {
  id: string;
  tableNo: string;
  items: OrderItem[];
  status: 'new' | 'preparing' | 'ready' | 'completed';
  timestamp: string;
  isUrgent?: boolean;
}

export const ChefDashboard: React.FC = () => {
  useTabTitle('Kitchen Hub');
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);

  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'preparing'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onDuty = user?.onDuty || false;

  const handleToggleDuty = () => {
    dispatch(toggleDutyStatus());
  };

  // Multi-color status map
  const statusColors = {
    new: 'from-rose-600 to-rose-900',
    preparing: 'from-amber-500 to-amber-800',
    ready: 'from-emerald-500 to-emerald-800',
    completed: 'from-slate-700 to-slate-900'
  };

  useEffect(() => {
    // If no user but we have a token, rehydrate the session
    if (!user && localStorage.getItem('accessToken')) {
      dispatch(fetchStaffUser());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user && user.restaurantId && user.id) {
      socketService.connect();
      socketService.joinStaffChannel(user.restaurantId, user.id, user.role);

      const socket = socketService.getSocket();
      if (socket) {
        socket.on('order:new', (payload: any) => {
          const newOrder: KitchenOrder = {
            id: payload.order._id || payload.orderNumber,
            tableNo: payload.order.tableNo.toString(),
            items: payload.order.items.map((i: any) => ({
              name: i.nameSnapshot,
              quantity: i.quantity,
              notes: i.customizations?.join(', ')
            })),
            status: payload.order.status || 'new',
            timestamp: payload.order.orderedAt || new Date().toISOString(),
            isUrgent: true
          };

          setOrders(prev => [newOrder, ...prev]);
          import('react-hot-toast').then(({ toast }) => {
            toast.success(`NEW ORDER: Table ${payload.order.tableNo}`, {
              icon: '🔥',
              style: {
                borderRadius: '10px',
                background: '#f97316',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold'
              },
            });
          });
        });
        socket.on('order:update', (order: any) => {
          setOrders(prev => prev.map(o => o.id === order._id ? {
            ...o,
            status: order.status
          } : o));
        });
      }

      return () => {
        if (socket) {
          socket.off('order:new');
          socket.off('order:update');
        }
      };
    }
  }, [user]);

  const fetchActiveOrders = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${VITE_API_URL}/orders`, {
        params: { status: activeFilter === 'all' ? undefined : activeFilter, date: 'today' },
        headers: { Authorization: `Bearer ${token}` }
      });

      const kitchenOrders: KitchenOrder[] = response.data.data.orders.map((o: any) => ({
        id: o._id,
        tableNo: String(o.tableNo),
        status: o.status,
        timestamp: o.orderedAt,
        items: o.items.map((i: any) => ({
          name: i.nameSnapshot,
          quantity: i.quantity,
          notes: i.customizations?.map((c: any) => c.value).join(', ')
        }))
      }));
      setOrders(kitchenOrders);
    } catch (err) {
      console.error('Failed to fetch chef orders');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActiveOrders();
    }
  }, [user, activeFilter]);

  const updateStatus = async (id: string, newStatus: KitchenOrder['status']) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`${VITE_API_URL}/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o =>
    activeFilter === 'all' ? (o.status !== 'completed' && o.status !== 'ready') : o.status === activeFilter
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-inter">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-orange-500/40">
            <LayoutGrid className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
              Kitchen <span className="text-orange-500">Hub</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Service Line - Live Sync</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              fetchActiveOrders();
              if (user && user.restaurantId && user.id) {
                socketService.joinStaffChannel(user.restaurantId, user.id, user.role);
              }
            }}
            className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-orange-500 shadow-xl border border-slate-100 dark:border-white/5 transition-all"
            title="Refresh Orders"
          >
            <RotateCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleDuty}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${onDuty ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${onDuty ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
            {onDuty ? 'Kitchen Active' : 'Go On Duty'}
          </motion.button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold shadow-lg text-lg italic">
            {user?.name?.charAt(0) || 'C'}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredOrders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-32 text-center"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest italic">No orders in queue</h3>
              </motion.div>
            ) : (
              filteredOrders.map(order => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative rounded-[2.5rem] p-8 shadow-2xl transition-all border-4 ${order.status === 'preparing'
                      ? 'bg-amber-500 border-amber-300 text-slate-950'
                      : 'bg-rose-600 border-rose-400 text-white shadow-rose-500/40'
                    }`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-5xl font-black tracking-tighter italic">#{order.tableNo}</h2>
                      <div className="flex items-center gap-2 mt-2 opacity-60">
                        <Clock size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">
                          {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${order.status === 'preparing' ? 'bg-black/10' : 'bg-white/20 animate-pulse'
                      }`}>
                      {order.status === 'preparing' ? 'Cooking' : 'New order'}
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 min-h-[140px]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start group">
                        <div className="flex gap-4">
                          <span className="text-2xl font-black opacity-40">x{item.quantity}</span>
                          <div>
                            <p className="text-2xl font-black uppercase tracking-tight leading-none mb-1">{item.name}</p>
                            {item.notes && (
                              <p className="text-[10px] font-bold opacity-60 italic bg-black/5 px-2 py-0.5 rounded-md inline-block">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-black/5">
                    {order.status === 'new' && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateStatus(order.id, 'preparing')}
                        className="flex-1 py-5 bg-white text-rose-600 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-slate-100 transition-all"
                      >
                        Start Preparation
                      </motion.button>
                    )}
                    {order.status === 'preparing' && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateStatus(order.id, 'ready')}
                        className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-black transition-all"
                      >
                        Mark as Ready
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ChefDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VITE_API_URL } from '@/config/env';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Bell, CheckCircle2, Coffee, Receipt, Clock, MapPin, Phone, User, RotateCcw, X, ShoppingBag } from 'lucide-react';
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

interface TableStatus {
  no: string;
  orderId?: string;
  status: 'available' | 'occupied' | 'preparing' | 'ready';
  orderStatus?: 'none' | 'new' | 'preparing' | 'ready' | 'completed';
  items?: OrderItem[];
  totalAmount?: number;
  lastActivity?: string;
  assignedToMe: boolean;
}

export const WaiterDashboard: React.FC = () => {
  useTabTitle('Service Hub');
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector(state => state.auth);
  
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'alerts'>('all');
  const [isSyncing, setIsSyncing] = useState(true);
  const onDuty = user?.onDuty;

  const handleToggleDuty = () => {
    dispatch(toggleDutyStatus());
  };

  useEffect(() => {
    if (!user && localStorage.getItem('accessToken')) {
      dispatch(fetchStaffUser());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user && user.restaurantId && user.id) {
      const socket = socketService.connect();
      if (socket) {
        socketService.joinStaffChannel(user.restaurantId, user.id, user.role);

        socket.on('order:new', (payload: any) => {
          console.log('[Socket] New Order Received:', payload);
          const tableNoStr = String(payload.order.tableNo).padStart(2, '0');
          setTables(prev => prev.map(t => 
            t.no === tableNoStr 
              ? { 
                  ...t, 
                  status: 'occupied', 
                  orderId: payload.order._id,
                  orderStatus: 'new', 
                  items: payload.order.items.map((i: any) => ({
                    name: i.nameSnapshot,
                    quantity: i.quantity,
                    notes: i.customizations?.join(', ')
                  })),
                  lastActivity: 'Just now' 
                } 
              : t
          ));
        });

        socket.on('order:update', (order: any) => {
          console.log('[Socket] Order Updated:', order);
          const tableNoStr = String(order.tableNo).padStart(2, '0');
          
          setTables(prev => prev.map(t => 
            t.no === tableNoStr 
              ? { 
                  ...t, 
                  status: order.status === 'completed' ? 'available' : 'occupied', 
                  orderStatus: order.status,
                  orderId: order.status === 'completed' ? undefined : order._id,
                  items: order.status === 'completed' ? undefined : order.items.map((i: any) => ({
                    name: i.nameSnapshot,
                    quantity: i.quantity
                  }))
                } 
              : t
          ));

          if (order.status === 'completed') {
            setCompletedOrders(prev => {
              // Avoid duplicates
              if (prev.find(o => o._id === order._id)) return prev;
              return [order, ...prev];
            });
          }

          if (order.status === 'ready') {
            import('react-hot-toast').then(({ toast }) => {
              toast.success(`Order Ready for Table ${order.tableNo}!`, {
                icon: '🍽️',
                style: { borderRadius: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold' }
              });
            });
          }
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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`${VITE_API_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      import('react-hot-toast').then(({ toast }) => {
        toast.success(`Order marked as ${newStatus}!`, {
          icon: '✅',
          style: { borderRadius: '10px', background: '#10b981', color: '#fff' }
        });
      });

      // Local update is handled by socket, but we can refresh floor status for safety
      fetchFloorStatus();
    } catch (err) {
      console.error('Failed to update order status');
    }
  };

  const { currentRestaurant } = useAppSelector(state => state.restaurant);

  const fetchFloorStatus = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${VITE_API_URL}/orders`, {
        params: { date: 'today' },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const orders: any[] = response.data.data.orders;
      console.log('[Floor] Fetched today\'s orders:', orders.length);
      const count = currentRestaurant?.tablesCount || 10;
      
      const initialTables: TableStatus[] = Array.from({ length: count }, (_, i) => ({
        no: String(i + 1).padStart(2, '0'),
        status: 'available',
        assignedToMe: false
      }));

      const activeOrders = orders.filter(order => ['pending', 'new', 'preparing', 'ready'].includes(order.status));
      const finishedOrders = orders.filter(order => order.status === 'completed');

      activeOrders.forEach(order => {
        // Robust comparison using Number conversion for both values
        const tIdx = initialTables.findIndex(t => Number(t.no) === Number(order.tableNo));
        if (tIdx !== -1) {
          initialTables[tIdx].status = 'occupied';
          initialTables[tIdx].orderStatus = order.status;
          initialTables[tIdx].orderId = order._id;
          initialTables[tIdx].totalAmount = order.total;
          initialTables[tIdx].items = order.items.map((i: any) => ({
            name: i.nameSnapshot,
            quantity: i.quantity,
            notes: i.customizations?.join(', ')
          }));
          initialTables[tIdx].lastActivity = 'Active';
        }
      });

      setTables(initialTables);
      setCompletedOrders(finishedOrders);
    } catch (err) {
      console.error('Failed to fetch floor status');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (user && currentRestaurant) {
      fetchFloorStatus();
    }
  }, [user, currentRestaurant]);

  const getStatusConfig = (table: TableStatus) => {
    if (table.orderStatus === 'ready') return { color: 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/40', label: 'READY', animate: true };
    if (table.orderStatus === 'preparing') return { color: 'bg-amber-500 text-white border-amber-300 shadow-amber-500/40', label: 'COOKING', animate: false };
    if (table.orderStatus === 'new') return { color: 'bg-rose-600 text-white border-rose-400 shadow-rose-500/40', label: 'NEW ORDER', animate: true };
    
    switch (table.status) {
      case 'available': return { color: 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-white/5', label: 'AVAILABLE', animate: false };
      case 'occupied': return { color: 'bg-blue-600 text-white border-blue-400 shadow-blue-500/30', label: 'OCCUPIED', animate: false };
      default: return { color: 'bg-slate-500', label: table.status.toUpperCase(), animate: false };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-inter">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-500 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-brand-500/20">
            <LayoutGrid className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
              Floor <span className="text-brand-500">Master</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Waiter Terminal - Active Order Sync</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              fetchFloorStatus();
              if (user && user.restaurantId && user.id) {
                socketService.joinStaffChannel(user.restaurantId, user.id, user.role);
              }
            }}
            className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-brand-500 shadow-xl border border-slate-100 dark:border-white/5 transition-all"
            title="Refresh Floor Plan"
          >
            <RotateCcw size={20} className={isSyncing ? 'animate-spin' : ''} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleDuty}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${
                onDuty ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${onDuty ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
            {onDuty ? 'On Duty' : 'Off Duty'}
          </motion.button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg">
            {user?.name?.charAt(0) || 'W'}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence>
            {tables.map(table => {
                const config = getStatusConfig(table);
                return (
                  <motion.div
                    key={table.no}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative rounded-[2.5rem] p-7 shadow-2xl transition-all cursor-pointer border-2 ${config.color} ${config.animate ? 'animate-pulse' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-5xl font-black tracking-tighter italic">#{table.no}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2 h-2 rounded-full ${config.animate ? 'bg-white animate-ping' : 'bg-current opacity-40'}`} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{config.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                        {table.orderStatus && table.orderStatus !== 'none' && (
                            <div className="space-y-4">
                               <div className="flex items-center justify-between p-3 rounded-2xl bg-black/10 backdrop-blur-md border border-white/5">
                                   <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Status</span>
                                   <span className="text-[9px] font-black uppercase tracking-widest">{table.orderStatus}</span>
                               </div>

                               <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                                  {table.items?.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                                          <span className="text-[10px] font-bold text-white/90 truncate mr-2">{item.name}</span>
                                          <span className="text-[10px] font-black text-white/60">x{item.quantity}</span>
                                      </div>
                                  ))}
                               </div>

                               {table.orderStatus === 'ready' && table.orderId && (
                                   <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateStatus(table.orderId!, 'completed');
                                      }}
                                      className="w-full py-4 bg-white text-emerald-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-100 transition-all border-2 border-emerald-400/20"
                                   >
                                      Mark as Served
                                   </motion.button>
                               )}
                            </div>
                        )}
                        
                        {table.status === 'available' && (
                            <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem]">
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Table Ready</span>
                            </div>
                        )}
                    </div>
                  </motion.div>
                );
            })}
          </AnimatePresence>
        </div>

        {/* Today's Completed Orders Section */}
        <section className="mt-20 border-t border-slate-200 dark:border-white/5 pt-12">
           <div className="flex items-center gap-3 mb-8">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Today's Served Orders</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {completedOrders.length === 0 ? (
                 <div className="p-10 text-center col-span-full opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-widest">No orders served yet today</p>
                 </div>
              ) : (
                completedOrders.map((order) => (
                  <motion.div 
                    key={order._id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOrder(order)}
                    className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:border-brand-500/30 hover:shadow-xl transition-all border-l-4 border-l-emerald-500"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black italic">
                        #{order.tableNo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order Served</p>
                           <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-1 uppercase tracking-tighter line-clamp-1">{order.orderNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-slate-900 dark:text-white">₹{order.total}</p>
                       <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">{order.items?.length} Items</p>
                    </div>
                  </motion.div>
                ))
              )}
           </div>
        </section>

        {/* Completed Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
                onClick={() => setSelectedOrder(null)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 30 }} 
                className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Table #{selectedOrder.tableNo}</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{selectedOrder.orderNumber}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    aria-label="Close"
                    title="Close"
                  >
                    <X />
                  </button>
                </div>

                <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-xs font-black text-slate-500">
                          {item.quantity}x
                        </div>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{item.nameSnapshot || item.name}</p>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">₹{item.itemTotal || (item.priceSnapshot * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-slate-50 dark:bg-white/5 mt-auto">
                   <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Grand Total</span>
                      <span className="text-3xl font-black italic text-brand-500">₹{selectedOrder.total}</span>
                   </div>
                   <button 
                     onClick={() => setSelectedOrder(null)}
                     className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                   >
                     Close Intelligence
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default WaiterDashboard;

import { fetchOrders, updateOrderStatus, Order, addNewOrder, updateExistingOrder } from '@/store/slices/orderSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  Bell,
  MoreVertical,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  X,
  History,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { socketService } from '@/services/socket';
import { useAppSelector as useSelector, useAppDispatch } from '@/hooks/useRedux';
import { useEffect, useState } from 'react';
import { useTabTitle } from '@/hooks/useTabTitle';

const STATUS_COLUMNS = [
  { id: 'new', label: 'New Orders', icon: Bell, color: 'bg-rose-500', lightColor: 'bg-rose-500/10', gradient: 'from-rose-500 to-rose-700' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-amber-500', lightColor: 'bg-amber-500/10', gradient: 'from-amber-400 to-amber-600' },
  { id: 'ready', label: 'Ready to Serve', icon: ShoppingBag, color: 'bg-emerald-500', lightColor: 'bg-emerald-500/10', gradient: 'from-emerald-500 to-emerald-700' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-slate-400', lightColor: 'bg-slate-400/10', gradient: 'from-slate-400 to-slate-600' },
];

export const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useTabTitle('Live Orders');

  const { user } = useSelector(state => state.auth);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchOrders({ date: 'today' }));
      if (user?.restaurantId) {
        socketService.joinRestaurantChannel(user.restaurantId);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    dispatch(fetchOrders({ date: 'today' }));

    // Real-time updates via Socket
    if (user && user.restaurantId) {
      socketService.connect();
      socketService.joinRestaurantChannel(user.restaurantId);

      const socket = socketService.getSocket();
      if (socket) {
        socket.on('order:new', (payload: any) => {
          dispatch(addNewOrder(payload.order));

          import('react-hot-toast').then(({ toast }) => {
            toast.success(`New order from Table ${payload.order.tableNo}`, {
              icon: '🚀',
              style: { borderRadius: '12px', background: '#0f172a', color: '#fff' }
            });
          });
        });
        socket.on('order:update', (payload: any) => {
          dispatch(updateExistingOrder(payload));
        });
      }

      return () => {
        if (socket) {
          socket.off('order:new');
          socket.off('order:update');
        }
      };
    }
  }, [dispatch, user]);

  const handleStatusUpdate = (orderId: string, nextStatus: string) => {
    dispatch(updateOrderStatus({ orderId, status: nextStatus }));
  };

  const ordersList = Array.isArray(orders) ? orders : [];

  const filteredOrders = ordersList.filter(
    (order) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchLower) ||
        String(order.tableNo).toLowerCase().includes(searchLower) ||
        order.items.some(item => item.nameSnapshot.toLowerCase().includes(searchLower));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'new': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const getStatusButtonLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'new': return 'Start Preparing';
      case 'preparing': return 'Mark as Ready';
      case 'ready': return 'Complete Order';
      default: return '';
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-50 dark:bg-slate-950 font-inter">
      {/* Header section with search and filter */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-3 italic">
            <span className="w-12 h-[3px] bg-brand-500 rounded-full" />
            <span>Live Command Center</span>
          </div>
          <h1 className="text-5xl font-black text-slate-950 dark:text-white tracking-tighter uppercase italic">Real-time <span className="text-brand-500 underline decoration-slate-900/10">Orders</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold text-sm uppercase tracking-widest opacity-80">Synchronized with Kitchen & Floor Staff</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleManualRefresh}
            className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-[1.5rem] text-slate-500 hover:text-brand-500 shadow-xl transition-all"
            title="Sync Orders"
          >
            <RotateCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/orders/all')}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all"
          >
            <History size={18} />
            <span>Archives</span>
          </motion.button>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="QUICK SEARCH..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all dark:text-white w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
        {STATUS_COLUMNS.map((column) => {
          const columnOrders = filteredOrders.filter((o) => o.status === column.id);
          const isNewColumn = column.id === 'new';

          return (
            <div key={column.id} className="flex flex-col h-full min-h-[600px]">
              <div className={`mb-8 p-5 rounded-[2rem] flex items-center justify-between border-2 ${isNewColumn && columnOrders.length > 0 ? 'bg-rose-600 text-white animate-pulse border-rose-400' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${isNewColumn && columnOrders.length > 0 ? 'bg-white/20' : column.lightColor}`}>
                    <column.icon className={`w-6 h-6 ${isNewColumn && columnOrders.length > 0 ? 'text-white' : column.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-[0.2em] text-xs italic">{column.label}</h3>
                    <p className={`text-[8px] font-black uppercase tracking-widest opacity-60 ${isNewColumn && columnOrders.length > 0 ? 'text-white' : 'text-slate-500'}`}>Queue: {columnOrders.length}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <AnimatePresence mode="popLayout">
                  {columnOrders.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] p-16 flex flex-col items-center justify-center text-slate-300 dark:text-slate-800"
                    >
                      <ShoppingBag size={48} className="mb-4 opacity-40" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Clear Station</p>
                    </motion.div>
                  ) : (
                    columnOrders.map((order) => (
                      <motion.div
                        key={order._id}
                        layout
                        initial={{ opacity: 0, x: isNewColumn ? -20 : 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={`relative p-8 shadow-2xl rounded-[3rem] border-4 transition-all group cursor-pointer bg-gradient-to-br ${column.gradient} text-white ${isNewColumn ? 'border-rose-300 animate-pulse' : 'border-white/10'}`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] font-mono italic">{order.orderNumber}</span>
                            <h4 className="text-4xl font-black text-white tracking-tighter italic">#{order.tableNo}</h4>
                          </div>
                          <button
                            title='view order details'
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/30 rounded-2xl text-white transition-all shadow-lg"
                          >
                            <MoreVertical size={20} />
                          </button>
                        </div>

                        <div className="space-y-3 mb-10 min-h-[80px]">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-white/10 last:border-0">
                              <span className="text-white font-black text-sm uppercase tracking-tight">
                                <span className="bg-black/20 px-2 py-1 rounded-lg text-[10px] mr-3">{item.quantity}</span> {item.nameSnapshot}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">+{order.items.length - 3} more items...</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/20">
                          <div className="flex items-center space-x-3 text-white/80 font-black text-[10px] uppercase tracking-[0.2em]">
                            <Clock size={16} />
                            <span>{formatDistanceToNow(new Date(order.orderedAt))}</span>
                          </div>
                          <span className="text-3xl font-black text-white italic tracking-tighter underline underline-offset-8 decoration-white/20">₹{order.total}</span>
                        </div>

                        {/* Action move button */}
                        {getNextStatus(order.status) && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order._id, getNextStatus(order.status)!);
                            }}
                            className="w-full mt-8 py-5 rounded-[1.5rem] flex items-center justify-center space-x-4 text-[11px] font-black uppercase tracking-[0.3em] bg-white text-slate-950 shadow-2xl hover:bg-slate-50 transition-all group/btn"
                          >
                            <span>{getStatusButtonLabel(order.status)}</span>
                            <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                          </motion.button>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
      {/* Order Details Modal */}
      <AnimatePresence mode="wait">
        {selectedOrder && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedOrder.orderNumber}</h2>
                  <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mt-1">
                    Table {selectedOrder.tableNo} • {selectedOrder.paymentStatus.toUpperCase()}
                    {selectedOrder.customerId?.name && ` • ${selectedOrder.customerId.name}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  title="Close Details"
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"
                >
                  <X />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/15 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500 text-xs font-black">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.nameSnapshot}</p>
                          <p className="text-[10px] font-bold text-slate-400">₹{item.priceSnapshot} / item</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase">₹{item.itemTotal}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    <span>Total Invoice</span>
                    <span className="text-brand-500">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                {getNextStatus(selectedOrder.status) && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder._id, getNextStatus(selectedOrder.status)!);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20"
                  >
                    Move to {getNextStatus(selectedOrder.status)}
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchOrders, updateOrderStatus, Order } from '@/store/slices/orderSlice';
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
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLUMNS = [
  { id: 'new', label: 'New Orders', icon: Bell, color: 'bg-orange-500', lightColor: 'bg-orange-500/10' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-amber-500', lightColor: 'bg-amber-500/10' },
  { id: 'ready', label: 'Ready to Serve', icon: ShoppingBag, color: 'bg-emerald-500', lightColor: 'bg-emerald-500/10' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-slate-400', lightColor: 'bg-slate-400/10' },
];

export const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchOrders({}));
    // Poll for new orders every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchOrders({}));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleStatusUpdate = (orderId: string, nextStatus: string) => {
    dispatch(updateOrderStatus({ orderId, status: nextStatus }));
  };

  const ordersList = Array.isArray(orders) ? orders : [];

  const filteredOrders = ordersList.filter(
    (order) => 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNo.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="p-6 md:p-10 min-h-screen overflow-x-hidden">
      {/* Header section with search and filter */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
            <span className="w-8 h-[2px] bg-brand-500" />
            <span>Live Feed</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Orders Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Real-time status tracking for your kitchen.</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search order or table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
            />
          </div>
          <button title="Quick Filters" className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 shadow-sm hover:border-brand-500 hover:text-brand-500 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {STATUS_COLUMNS.map((column) => {
          const columnOrders = filteredOrders.filter((o) => o.status === column.id);
          
          return (
            <div key={column.id} className="flex flex-col h-full min-h-[500px]">
              <div className="mb-6 flex items-center justify-between px-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 ${column.lightColor} rounded-xl`}>
                    <column.icon className={`w-5 h-5 ${column.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="font-black text-slate-700 dark:text-white uppercase tracking-wider text-sm">{column.label}</h3>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500">{columnOrders.length}</span>
              </div>

              <div className="space-y-4 flex-1">
                <AnimatePresence mode="popLayout">
                  {columnOrders.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-10 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700"
                    >
                      <ShoppingBag size={40} className="mb-4 opacity-50" />
                      <p className="text-xs font-bold uppercase tracking-widest">No active orders</p>
                    </motion.div>
                  ) : (
                    columnOrders.map((order) => (
                      <motion.div
                        key={order._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -4 }}
                        className="glass dark:glass-dark rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-white/5 relative group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">{order.orderNumber}</span>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Table {order.tableNo}</h4>
                          </div>
                          <button title="Order Details" className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        <div className="space-y-2 mb-6">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs items-center">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">
                                <span className="text-brand-500">{item.quantity}x</span> {item.nameSnapshot}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 mt-4">
                          <div className="flex items-center space-x-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <Clock size={12} className="text-slate-400" />
                            <span>{formatDistanceToNow(new Date(order.orderedAt))} ago</span>
                          </div>
                          <span className="text-sm font-black text-slate-900 dark:text-white">₹{order.total}</span>
                        </div>

                        {/* Action move button */}
                        {getNextStatus(order.status) && (
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status)!)}
                            className={`w-full mt-5 py-3.5 rounded-2xl flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all ${column.color} shadow-${column.color.split('-')[1]}-500/20 group/btn`}
                          >
                            <span>{getStatusButtonLabel(order.status)}</span>
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
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
    </div>
  );
};

export default OrdersPage;

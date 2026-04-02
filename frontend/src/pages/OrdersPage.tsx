import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useTabTitle } from '@/hooks';
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
  ArrowRight,
  X,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLUMNS = [
  { id: 'new', label: 'New Orders', icon: Bell, color: 'bg-orange-500', lightColor: 'bg-orange-500/10' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-amber-500', lightColor: 'bg-amber-500/10' },
  { id: 'ready', label: 'Ready to Serve', icon: ShoppingBag, color: 'bg-emerald-500', lightColor: 'bg-emerald-500/10' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-slate-400', lightColor: 'bg-slate-400/10' },
];

export const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useAppSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useTabTitle('Live Orders');

  useEffect(() => {
    dispatch(fetchOrders({ date: 'today' }));
    // Poll for new orders every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchOrders({ date: 'today' }));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

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

        <div className="flex flex-wrap items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/orders/all')}
            className="flex items-center gap-2 px-6 py-3.5 bg-brand-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20"
          >
            <History size={16} />
            <span>View History</span>
          </motion.button>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search table or order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filter by Status"
              className="px-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white appearance-none"
            >
              <option value="all">All Status</option>
              {STATUS_COLUMNS.map(col => (
                <option key={col.id} value={col.id}>{col.label}</option>
              ))}
            </select>
          </div>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            title="Order Details"
                            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 group-hover:text-brand-500 transition-all"
                          >
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

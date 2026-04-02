import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useTabTitle } from '@/hooks';
import { fetchOrders, Order } from '@/store/slices/orderSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Download, 
  ArrowLeft, 
  ChevronRight, 
  Filter, 
  X,
  Clock,
  CreditCard,
  User as UserIcon,
  Tag,
  LayoutGrid,
  FileDown,
  BarChart3,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const DATE_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'Last 7 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  preparing: 'Cooking',
  ready: 'Served',
  completed: 'Done',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-amber-500',
  preparing: 'bg-brand-500',
  ready: 'bg-emerald-500',
  completed: 'bg-slate-400',
};

export const AllOrdersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useAppSelector((state) => state.orders);
  const { currentRestaurant: restaurant } = useAppSelector((state) => state.restaurant);

  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Custom date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useTabTitle('Order History');

  useEffect(() => {
    loadOrders();
  }, [datePreset, statusFilter, paymentFilter, startDate, endDate]);

  const loadOrders = () => {
    const filters: any = {
      date: datePreset,
      status: statusFilter === 'all' ? undefined : statusFilter,
      paymentStatus: paymentFilter === 'all' ? undefined : paymentFilter,
    };

    if (datePreset === 'custom' && startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    dispatch(fetchOrders(filters));
  };

  // Local filtering for real-time search without API calls
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const lowerSearch = searchTerm.toLowerCase();
    return orders.filter(o => 
      o.orderNumber.toLowerCase().includes(lowerSearch) || 
      String(o.tableNo).includes(lowerSearch) ||
      (o as any).customerId?.name?.toLowerCase().includes(lowerSearch)
    );
  }, [orders, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const count = filteredOrders.length;
    const avg = count > 0 ? total / count : 0;
    return { total, count, avg };
  }, [filteredOrders]);

  const handleExportCSV = () => {
    setIsExporting(true);
    
    try {
      // 1. Prepare Header (Branded)
      const restaurantName = restaurant?.name || 'RestaurantGPT';
      const headerLines = [
        `"RESTAURANT ORDER REPORT"`,
        `"Restaurant","${restaurantName.replace(/"/g, '""')}"`,
        `"Export Generated","${format(new Date(), 'dd MMM yyyy, hh:mm a')}"`,
        `"Filter Period","${datePreset.toUpperCase()}"`,
        `"Total Orders","${stats.count}"`,
        `"Total Revenue","INR ${stats.total.toFixed(2)}"`,
        `""`, // Spacer
        `"Order ID","Date","Table","Customer","Items","Status","Payment","Amount (INR)"`
      ];

      // 2. Prepare Data Lines
      const dataLines = filteredOrders.map(order => {
        const date = format(new Date(order.orderedAt), 'dd/MM/yyyy HH:mm');
        const customer = order.customerId?.name || 'Guest';
        const items = order.items.map(i => `${i.quantity}x ${i.nameSnapshot}`).join('; ');
        
        return [
          `"${order.orderNumber}"`,
          `"${date}"`,
          `"${order.tableNo}"`,
          `"${customer}"`,
          `"${items}"`,
          `"${STATUS_LABELS[order.status] || order.status}"`,
          `"${order.paymentStatus.toUpperCase()}"`,
          `"${order.total.toFixed(2)}"`
        ].join(',');
      });

      const csvContent = headerLines.join('\n') + '\n' + dataLines.join('\n');
      
      // 3. Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Orders_Report_${restaurantName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-50 dark:bg-[#080c14]">
      {/* Top Navigation */}
      <div className="mb-10 flex items-center justify-between">
        <button 
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-500 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center border border-slate-200 dark:border-white/5 group-hover:bg-brand-500 group-hover:text-white transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back to Live Feed</span>
        </button>

        <div className="flex items-center gap-4">
           <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            disabled={isExporting || filteredOrders.length === 0}
            className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? 'Generating...' : 'Export Report'}</span>
          </motion.button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Orders Found', value: stats.count, icon: LayoutGrid, color: 'text-brand-500', bg: 'bg-brand-500/5' },
          { label: 'Revenue in Period', value: `₹${stats.total.toLocaleString()}`, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Avg Order Value', value: `₹${Math.round(stats.avg).toLocaleString()}`, icon: Tag, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass dark:glass-dark rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 flex items-center gap-6"
          >
            <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Filter Command Bar */}
      <div className="glass dark:glass-dark rounded-[2.5rem] p-8 mb-10 border border-slate-200 dark:border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Quick Search</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="ID, Table or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4 col-span-2">
            <div className="flex items-center justify-between pl-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Filtering</label>
              <div className="flex gap-2">
                {DATE_PRESETS.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setDatePreset(p.id)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${datePreset === p.id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            
            {datePreset === 'custom' ? (
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date"
                  value={startDate}
                  title="Start Date"
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold dark:text-white"
                />
                <input 
                  type="date"
                  value={endDate}
                  title="End Date"
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold dark:text-white"
                />
              </div>
            ) : (
              <div className="px-6 py-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 flex items-center gap-3">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500 italic">Predefined range: {DATE_PRESETS.find(p => p.id === datePreset)?.label} active</span>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Advanced</label>
            <div className="grid grid-cols-2 gap-4">
               <select
                value={statusFilter}
                title="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-black uppercase tracking-tighter dark:text-white focus:outline-none"
              >
                <option value="all">Any Status</option>
                {Object.entries(STATUS_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
              <select
                value={paymentFilter}
                title="Filter by Payment Status"
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-black uppercase tracking-tighter dark:text-white focus:outline-none"
              >
                <option value="all">Any Paid</option>
                <option value="completed">Confirmed</option>
                <option value="pending">Due</option>
                <option value="failed">Void</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass dark:glass-dark rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-white/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-400">Order ID & Date</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-400 text-center">Table</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-400">Customer</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-400">Items Summary</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-400">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-400">Revenue</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[2px] text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Clock size={40} className="animate-spin-slow" />
                      <p className="text-[10px] font-black uppercase tracking-widest italic">Syncing with digital vault...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <LayoutGrid size={40} />
                      <p className="text-[10px] font-black uppercase tracking-widest italic">No matching records found for this period</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr 
                  key={order._id} 
                  className="group hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{order.orderNumber}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} />
                        {format(new Date(order.orderedAt), 'dd MMM | hh:mm a')}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 inline-flex items-center justify-center text-sm font-black text-slate-900 dark:text-white">
                      {order.tableNo}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500">
                        <UserIcon size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.customerId?.name || 'Walk-in Guest'}</span>
                        <span className="text-[9px] font-black text-slate-400 tracking-widest">{order.customerId?.phone || 'ANONYMOUS'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 max-w-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {order.items.slice(0, 2).map((item, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-500 whitespace-nowrap">
                          {item.quantity}x {item.nameSnapshot.slice(0, 15)}...
                        </span>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-[9px] font-black text-brand-500 pl-1">+{order.items.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-sm ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 dark:text-white">₹{order.total.toLocaleString()}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${order.paymentStatus === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {order.paymentStatus === 'completed' ? 'PAID' : 'DUE'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
                       <ExternalLink size={16} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reused Order Details Modal */}
      <AnimatePresence>
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
              className="relative bg-white dark:bg-[#0c121e] rounded-[3rem] border border-white/5 w-full max-w-xl overflow-hidden shadow-2xl"
            >
              {/* Branded Header */}
              <div className="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-8 h-[2px] bg-brand-500" />
                       <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Digital Invoice</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{selectedOrder.orderNumber}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    title="Close Details"
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Intel</p>
                    <div className="space-y-2">
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200 flex justify-between">Table <span>#{selectedOrder.tableNo}</span></p>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200 flex justify-between">Status <span className={STATUS_COLORS[selectedOrder.status].replace('bg-', 'text-')}>{STATUS_LABELS[selectedOrder.status]}</span></p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">User Intel</p>
                    <div className="space-y-2">
                       <p className="text-xs font-black text-slate-700 dark:text-slate-200 line-clamp-1">{selectedOrder.customerId?.name || 'Walk-in Guest'}</p>
                       <p className="text-[10px] font-bold text-slate-400 italic">{selectedOrder.customerId?.phone || 'No phone record'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="p-10 max-h-[320px] overflow-y-auto space-y-4 pr-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                 {selectedOrder.items.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
                          {item.quantity}x
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200">{item.nameSnapshot}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Item Base: ₹{item.priceSnapshot}</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white tracking-widest italic">₹{item.itemTotal}</span>
                   </div>
                 ))}
              </div>

              {/* Final Settlement */}
              <div className="p-10 bg-slate-900 text-white rounded-b-[3rem]">
                 <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <span>Merchant Subtotal</span>
                       <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase tracking-widest">
                        <span>Savings Applied</span>
                        <span>-₹{selectedOrder.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-4xl font-black italic tracking-tighter uppercase">
                       <span>Payable</span>
                       <span className="text-brand-500">₹{selectedOrder.total}</span>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-4 pt-8 border-t border-white/5">
                    <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                       <CreditCard size={18} className="text-brand-500" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Method</span>
                          <span className="text-xs font-black uppercase italic">{selectedOrder.paymentMethod}</span>
                       </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                       <Clock size={18} className="text-slate-500" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recorded At</span>
                          <span className="text-xs font-black uppercase italic">{format(new Date(selectedOrder.orderedAt), 'hh:mm a')}</span>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

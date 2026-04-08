import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, AlertTriangle, CheckCircle2, RotateCcw, Flame, Phone } from 'lucide-react';
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
  status: 'pending' | 'preparing' | 'ready';
  timestamp: string;
  isUrgent?: boolean;
}

export const ChefDashboard: React.FC = () => {
  useTabTitle('Kitchen Hub');
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);

  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'preparing'>('all');

  const onDuty = user?.onDuty || false;

  const handleToggleDuty = () => {
    dispatch(toggleDutyStatus());
  };

  // Multi-color status map
  const statusColors = {
    pending: 'bg-rose-500',
    preparing: 'bg-amber-500',
    ready: 'bg-emerald-500'
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
        // Handle incoming new orders globally here later
      }
    }
  }, [user]);

  useEffect(() => {
    // Mock data for initial UI build
    const mockOrders: KitchenOrder[] = [
      {
        id: '101',
        tableNo: '04',
        status: 'pending',
        timestamp: new Date().toISOString(),
        isUrgent: true,
        items: [
          { name: 'Butter Chicken', quantity: 2, notes: 'Extra Spicy' },
          { name: 'Garlic Naan', quantity: 4 }
        ]
      },
      {
        id: '102',
        tableNo: '07',
        status: 'preparing',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        items: [
          { name: 'Paneer Tikka', quantity: 1 },
          { name: 'Dal Makhani', quantity: 1 }
        ]
      }
    ];
    setOrders(mockOrders);
  }, []);

  const updateStatus = (id: string, newStatus: KitchenOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const filteredOrders = orders.filter(o =>
    activeFilter === 'all' ? true : o.status === activeFilter
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-inter">
      {/* KDS Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-500/20 rounded-2xl flex items-center justify-center border border-brand-500/30">
            <Flame className="text-brand-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Kitchen <span className="text-brand-500">Live</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Station: Main Galley</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <button
            onClick={handleToggleDuty}
            disabled={loading}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl ${onDuty ? 'bg-orange-500 text-slate-950 shadow-orange-500/20' : 'bg-slate-900 text-slate-500 border border-white/5'}`}
          >
            <div className={`w-2 h-2 rounded-full ${onDuty ? 'bg-slate-950 animate-pulse' : 'bg-slate-700'}`} />
            {loading ? 'Syncing...' : onDuty ? 'Kitchen Active' : 'Go On Duty'}
          </button>

          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            {(['all', 'pending', 'preparing'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Station Identity Profile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-10 p-6 bg-slate-900 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-2xl"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-brand-500/10 border-2 border-brand-500/30 flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-brand-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-3xl font-black text-brand-500 relative z-10">{user?.name?.charAt(0) || 'C'}</span>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full border-4 border-slate-900 animate-pulse" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{user?.name || 'Executive Chef'}</h2>
            <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
              Station ID: #{user?.id?.slice(-6).toUpperCase() || 'KDS-01'}
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <Phone size={14} className="text-brand-500" />
              <span className="text-xs font-bold">{user?.phone || 'Emergency Contact Only'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Flame size={14} className="text-brand-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Post: Main Galley</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-16 bg-white/5" />

        <div className="text-center md:text-right px-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Session Load</p>
          <div className="flex items-center gap-2 justify-center md:justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-2xl font-black text-white italic">{orders.length} <span className="text-slate-600">Active</span></p>
          </div>
        </div>
      </motion.div>

      {/* Grid Layout for Kitchen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 text-center"
            >
              <ChefHat size={64} className="mx-auto text-slate-800 mb-6" />
              <h3 className="text-xl font-black text-slate-700 uppercase tracking-widest">Fire is out. No orders.</h3>
            </motion.div>
          ) : (
            filteredOrders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`relative bg-slate-900 border-t-8 ${order.isUrgent ? 'border-rose-500' : 'border-slate-800'} rounded-[2.5rem] p-6 shadow-2xl flex flex-col h-full`}
              >
                {/* Order Meta */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Table</span>
                    <h2 className="text-4xl font-black text-white leading-none tracking-tighter">#{order.tableNo}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">ID: {order.id}</span>
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs justify-end">
                      <Clock size={12} />
                      {Math.floor((Date.now() - new Date(order.timestamp).getTime()) / 60000)}m ago
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 space-y-4 mb-8">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                      <div className="flex items-start justify-between">
                        <div className="font-black text-lg text-slate-100 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-500 text-sm">{item.quantity}x</span>
                          {item.name}
                        </div>
                      </div>
                      {item.notes && (
                        <div className="mt-2 text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={10} />
                          {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(order.id, 'preparing')}
                      className="col-span-2 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Start Preparation
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, 'pending')}
                        className="py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={12} /> Reset
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'ready')}
                        className="py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={12} /> Finish
                      </button>
                    </>
                  )}
                  {order.status === 'ready' && (
                    <div className="col-span-2 py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center">
                      Ready for pickup
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg ${statusColors[order.status]} text-white`}>
                  {order.status}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChefDashboard;

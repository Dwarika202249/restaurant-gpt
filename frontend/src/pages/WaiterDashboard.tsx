import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Bell, CheckCircle2, Coffee, Receipt, Clock, MapPin, Phone, User } from 'lucide-react';
import { useTabTitle } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { toggleDutyStatus } from '@/store/slices/authSlice';
import { fetchStaffUser } from '@/store/slices/fetchStaffUser';

interface TableStatus {
  no: string;
  status: 'available' | 'occupied' | 'dirty' | 'reserved';
  orderStatus?: 'none' | 'pending' | 'preparing' | 'ready';
  alerts?: ('water' | 'bill')[];
  lastActivity?: string;
}

export const WaiterDashboard: React.FC = () => {
  useTabTitle('Service Hub');
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);
  
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'alerts'>('all');

  const onDuty = user?.onDuty || false;

  const handleToggleDuty = () => {
    dispatch(toggleDutyStatus());
  };

  useEffect(() => {
    // If no user but we have a token, rehydrate the session
    if (!user && localStorage.getItem('accessToken')) {
      dispatch(fetchStaffUser());
    }

    // Initial mock state
    const mockTables: TableStatus[] = [
      { no: '01', status: 'occupied', orderStatus: 'preparing', alerts: ['water'], lastActivity: '2m ago' },
      { no: '02', status: 'available' },
      { no: '03', status: 'dirty', lastActivity: '5m ago' },
      { no: '04', status: 'occupied', orderStatus: 'ready', lastActivity: '1m ago' },
      { no: '05', status: 'reserved' },
      { no: '06', status: 'occupied', orderStatus: 'pending', alerts: ['bill'] },
      { no: '07', status: 'available' },
      { no: '08', status: 'occupied', orderStatus: 'preparing' },
    ];
    setTables(mockTables);
  }, [user, dispatch]);

  const getStatusColor = (status: TableStatus['status']) => {
    switch (status) {
      case 'available': return 'bg-emerald-500';
      case 'occupied': return 'bg-blue-500';
      case 'dirty': return 'bg-amber-500';
      case 'reserved': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-inter">
      {/* Waiter Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-500 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-brand-500/20">
            <LayoutGrid className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Floor <span className="text-brand-500">Master</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Zone: Main Floor (T1-T20)</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <button
            onClick={handleToggleDuty}
            disabled={loading}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl ${onDuty ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
          >
            <div className={`w-2 h-2 rounded-full ${onDuty ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
            {loading ? 'Syncing...' : onDuty ? 'You are On Duty' : 'Go On Duty'}
          </button>

          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 backdrop-blur-xl">
            {(['all', 'orders', 'alerts'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 dark:bg-brand-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Staff Profile Identity */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row gap-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 items-center md:items-start"
      >
        <div className="w-20 h-20 rounded-[1.8rem] bg-brand-500/10 flex items-center justify-center border-2 border-brand-500/20 relative">
          <span className="text-2xl font-black text-brand-500">{user?.name?.charAt(0) || 'W'}</span>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.name || 'Service Staff'}</h2>
            <span className="inline-flex items-center px-3 py-1 bg-brand-500/10 text-brand-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-brand-500/20">
              Staff ID: #{user?.id?.slice(-6).toUpperCase() || 'STF001'}
            </span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-brand-500" />
              <span className="text-xs font-bold">{user?.phone || 'Not Registered'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Zone: Main Floor (T1-T20)</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-px h-px md:h-12 bg-slate-100 dark:bg-slate-800 mx-2" />
        <div className="text-center md:text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Station Activity</p>
          <p className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Active <span className="text-brand-500">12h</span></p>
        </div>
      </motion.div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence>
          {tables.map(table => (
            <motion.div
              key={table.no}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 hover:border-brand-500 transition-all cursor-pointer overflow-hidden"
            >
              {/* Table No & Status */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">#{table.no}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(table.status)}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{table.status}</span>
                  </div>
                </div>
                {table.lastActivity && (
                  <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {table.lastActivity}
                  </div>
                )}
              </div>

              {/* Table Alerts / Order Status */}
              <div className="space-y-3">
                {table.alerts?.map(alert => (
                  <div key={alert} className={`flex items-center justify-between p-3 rounded-2xl ${alert === 'bill' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'} border border-current/10`}>
                    <div className="flex items-center gap-2">
                       {alert === 'bill' ? <Receipt size={14} /> : <Coffee size={14} />}
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none">{alert} Request</span>
                    </div>
                  </div>
                ))}

                {table.orderStatus && table.orderStatus !== 'none' && (
                  <div className={`flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10`}>
                    <div className="flex items-center gap-2">
                       {table.orderStatus === 'ready' ? <CheckCircle2 className="text-emerald-500" size={14} /> : <MapPin className="text-brand-500" size={14} />}
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none text-slate-600 dark:text-slate-400">Order: {table.orderStatus}</span>
                    </div>
                  </div>
                )}

                {!table.orderStatus && table.status === 'occupied' && (
                   <div className="p-3 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-bold text-slate-300 dark:text-slate-700 text-center uppercase tracking-widest">
                     No Order yet
                   </div>
                )}
              </div>

              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/[0.02] transition-colors pointer-events-none" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Action Menu placeholder */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button className="w-16 h-16 bg-brand-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <Bell size={28} />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center text-[10px] font-black">
            3
          </div>
        </button>
      </div>
    </div>
  );
};

export default WaiterDashboard;

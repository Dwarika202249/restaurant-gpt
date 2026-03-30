import { useState, useEffect, useMemo } from 'react';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { Sidebar, Navbar } from '@/components';
import { TrendingUp, Users, ShoppingCart, Clock, ArrowUpRight, Plus, ExternalLink, Settings } from 'lucide-react';
import { fetchRestaurantProfile } from '@/store/slices/restaurantSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const restaurant = useAppSelector((state) => state.restaurant.currentRestaurant);
  const loading = useAppSelector((state) => state.restaurant.loading);
  const navigate = useNavigate();

  // Greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  useEffect(() => {
    if (!user && isAuthenticated) {
      dispatch(fetchAdminUser());
    }
  }, [user, isAuthenticated, dispatch]);

  useEffect(() => {
    if (!restaurant && user?.restaurantId) {
      dispatch(fetchRestaurantProfile());
    }
  }, [user?.restaurantId, restaurant, dispatch]);

  useEffect(() => {
    if (user?.role === 'admin' && user.profileComplete === false) {
      navigate('/admin-profile');
    }
  }, [user, navigate]);

  const stats = [
    { icon: ShoppingCart, label: 'Today\'s Orders', value: '38', trend: '+14%', color: 'from-orange-500 to-amber-500' },
    { icon: Users, label: 'Active Customers', value: '214', trend: '+8%', color: 'from-blue-500 to-indigo-500' },
    { icon: TrendingUp, label: 'Revenue Today', value: '₹24,850', trend: '+22%', color: 'from-emerald-500 to-teal-500' },
    { icon: Clock, label: 'Avg. Readiness', value: '14 min', trend: '-2 min', color: 'from-rose-500 to-pink-500' },
  ];

  const recentOrders = [
    { id: 'ORD-7721', customer: 'Table 04', items: '3 items', amount: '₹1,240', status: 'Preparing', time: '2m ago' },
    { id: 'ORD-7720', customer: 'Table 12', items: '1 item', amount: '₹450', status: 'Ready', time: '8m ago' },
    { id: 'ORD-7719', customer: 'Table 09', items: '5 items', amount: '₹2,100', status: 'Completed', time: '15m ago' },
    { id: 'ORD-7718', customer: 'Table 02', items: '2 items', amount: '₹890', status: 'Completed', time: '22m ago' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: 'spring' as const, 
        stiffness: 100 
      }
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />
        
        <Navbar />

        <main className="flex-1 p-6 md:p-10 relative z-10 scrollbar-hide">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
                <span className="w-8 h-[2px] bg-brand-500" />
                <span>Overview Dashboard</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {greeting}, <span className="text-brand-500">Partner!</span> 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Here's what's happening at <span className="text-slate-900 dark:text-slate-200 font-bold">{restaurant?.name || 'your restaurant'}</span> today.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-5 py-2.5 glass dark:glass-dark border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Clock size={18} />
                <span>Last 24 Hours</span>
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative group overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full -mr-10 -mt-10 transition-opacity`} />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-brand-500/10 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-black px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                      <ArrowUpRight size={12} />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">{stat.label}</h3>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders Table */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Active Orders</h2>
                <a href="/orders" className="text-xs font-bold text-brand-500 border-b-2 border-brand-500/20 hover:border-brand-500 transition-all pb-0.5">
                  View Management
                </a>
              </div>
              
              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">
                      <th className="px-6 py-5 text-left">Order Details</th>
                      <th className="px-6 py-5 text-left">Customer</th>
                      <th className="px-6 py-5 text-left">Ticket</th>
                      <th className="px-6 py-5 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors uppercase tracking-tight">{order.id}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{order.items} • {order.time}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                              {order.customer.slice(-2)}
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.customer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white">{order.amount}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${
                            order.status === 'Ready'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : order.status === 'Preparing'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Quick Actions & Profile */}
            <div className="space-y-8">
              {/* Restaurant Info */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-brand-500 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-brand-500/20"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24 pointer-events-none" />
                <Settings className="absolute top-6 right-6 opacity-20" size={48} />
                
                <h3 className="text-lg font-black uppercase tracking-widest mb-6 opacity-80">Store Vital</h3>
                <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Active Store</span>
                    <span className="text-sm font-black text-white">{restaurant?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Table Fleet</span>
                    <span className="text-sm font-black text-white">{restaurant?.tablesCount || 0} Tables</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Region Mode</span>
                    <span className="text-sm font-black text-white uppercase">{restaurant?.currency || 'INR'}</span>
                  </div>
                </div>
                
                <button className="w-full mt-8 py-3.5 bg-white text-brand-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg">
                  Control Panel
                </button>
              </motion.div>

              {/* Action Cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm flex flex-col space-y-4"
              >
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">Fast Tracks</h3>
                <button 
                  onClick={() => navigate('/menu')}
                  className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 rounded-2xl transition-all group"
                  title="New Menu Item"
                >
                  <div className="flex items-center space-x-3">
                    <Plus size={20} className="text-brand-500 group-hover:text-white" />
                    <span className="text-sm font-bold">New Menu Item</span>
                  </div>
                  <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <button 
                  onClick={() => navigate('/qr-management')}
                  className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <Plus size={20} className="text-brand-500 group-hover:text-white" />
                    <span className="text-sm font-bold">Manage QR Fleet</span>
                  </div>
                  <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Modern Loader */}
      {loading && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Data</p>
          </div>
        </div>
      )}
    </div>
  );
};

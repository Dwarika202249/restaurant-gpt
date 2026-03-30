import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Calendar,
  Store,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { fetchRestaurantProfile } from '@/store/slices/restaurantSlice';

/**
 * DashboardPage
 * The main overview for Restaurant Admins.
 * Rendered inside DashboardLayout.
 */
export const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentRestaurant: restaurant } = useAppSelector((state) => state.restaurant);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!restaurant) {
      dispatch(fetchRestaurantProfile());
    }
  }, [dispatch, restaurant]);

  const stats = [
    { title: 'Total Revenue', value: '₹42,850', change: '+12.5%', isPositive: true, icon: TrendingUp },
    { title: 'Total Orders', value: '156', change: '+18.2%', isPositive: true, icon: ShoppingBag },
    { title: 'Active Tables', value: '14/20', change: '-2.4%', isPositive: false, icon: Users },
    { title: 'Avg. Serving Time', value: '18m', change: '+4.1%', isPositive: true, icon: Clock },
  ];

  const recentOrders = [
    { id: 'ORD-7721', customer: 'Table 04', items: '3 items', amount: '₹1,240', status: 'Preparing', time: '2m ago' },
    { id: 'ORD-7720', customer: 'Table 12', items: '1 item', amount: '₹450', status: 'Ready', time: '8m ago' },
    { id: 'ORD-7719', customer: 'Table 09', items: '5 items', amount: '₹2,100', status: 'Completed', time: '15m ago' },
    { id: 'ORD-7718', customer: 'Table 02', items: '2 items', amount: '₹890', status: 'Completed', time: '22m ago' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="p-6 md:p-10 scrollbar-hide">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
            <span className="w-8 h-[2px] bg-brand-500" />
            <span>Overview</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Namaste, {restaurant?.name || user?.name || 'Restaurateur'}!
            <Sparkles className="inline-block ml-3 text-brand-500 animate-pulse" size={32} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Here's what's happening with your restaurant today.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <Calendar size={18} className="text-brand-500 ml-2" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 pr-4">March 30, 2026</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="glass dark:glass-dark p-6 rounded-[2rem] relative overflow-hidden group transition-all duration-500"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-150`} />
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 rounded-2xl">
                <stat.icon className="text-brand-500" size={24} />
              </div>
              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                stat.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{stat.change}</span>
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders - Spanning 2 columns */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass dark:glass-dark rounded-[2.5rem] overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent Live Orders</h3>
              <p className="text-sm text-slate-500 mt-1">Real-time update from tables</p>
            </div>
            <button 
              title="Filter Orders" 
              aria-label="Filter Orders"
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            >
              <Filter size={20} className="text-brand-500" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Table</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors uppercase tracking-tight">{order.id}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{order.time}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-brand-500" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{order.amount}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        order.status === 'Completed' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' :
                        order.status === 'Preparing' ? 'bg-amber-500/5 text-amber-600 border-amber-500/20' :
                        'bg-blue-500/5 text-blue-500 border-blue-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        title="Order Options"
                        aria-label="Order Options"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <MoreVertical size={18} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-slate-50 dark:border-slate-800 text-center">
            <button className="text-sm font-black text-brand-500 uppercase tracking-widest hover:tracking-[0.2em] transition-all flex items-center justify-center w-full group">
              <span>View All Intelligence Data</span>
              <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Quick Actions & AI Insights Card */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="orange-gradient rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-brand-500/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="text-white" size={24} />
              </div>
              
              <h3 className="text-2xl font-black mb-4 leading-tight tracking-tight">AI Insights Available</h3>
              <p className="text-white/80 text-sm font-medium mb-8 flex-grow">
                RestaurantGPT AI has noticed that your <span className="font-bold underline decoration-white/40 italic">Margherita Pizza</span> sales are 24% higher on weekends.
              </p>
              
              <button className="w-full bg-white text-brand-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                Apply Suggestion
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass dark:glass-dark rounded-[2.5rem] p-8 flex flex-col space-y-4"
          >
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">Fast Tracks</h3>
            <button 
              onClick={() => navigate('/menu')}
              className="flex items-center justify-between w-full p-4 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-brand-500 hover:text-white rounded-2xl transition-all group"
            >
              <div className="flex items-center space-x-3">
                <Plus size={20} className="text-brand-500 group-hover:text-white" />
                <span className="text-sm font-bold">New Menu Item</span>
              </div>
              <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

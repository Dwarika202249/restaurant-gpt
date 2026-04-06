import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { VITE_API_URL } from '@/config/env';
import { useTabTitle } from '@/hooks';
import { fetchOrderStats } from '@/store/slices/orderSlice';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  Sparkles,
  ChefHat,
  Calendar,
  Lock,
  ArrowRight,
  Loader2,
  Gem,
  Zap
} from 'lucide-react';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const AnalyticsPage = () => {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.orders);
  const { currentRestaurant } = useAppSelector((state) => state.restaurant);

  const [dateRange, setDateRange] = useState('week');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  // Trial Logic: 30 days from trialActivatedAt or createdAt
  const trialStart = currentRestaurant?.trialActivatedAt || currentRestaurant?.createdAt;
  const isTrialActive = trialStart
    ? (Date.now() - new Date(trialStart).getTime()) < (30 * 24 * 60 * 60 * 1000)
    : true;

  const hasPremiumAccess = currentRestaurant?.isPremium || isTrialActive;

  useTabTitle('Analytics');

  useEffect(() => {
    dispatch(fetchOrderStats({ dateRange }));
  }, [dispatch, dateRange]);

  const handleAskAI = async () => {
    if (!hasPremiumAccess) {
      setIsSubModalOpen(true);
      return;
    }

    setAiLoading(true);
    setAiInsights(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      // For AI, we'll use a slightly longer window if not custom
      const response = await axios.post(
        `${VITE_API_URL}/ai/analyze-stats`,
        { dateRange },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setAiInsights(response.data.data);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Data transformations for Recharts
  const revenueTrends = stats?.byHour?.map(item => ({
    hour: `${item._id}:00`,
    amount: item.revenue
  })) || [];

  const topItemsData = stats?.topItems?.map(item => ({
    name: item._id,
    count: item.count,
    revenue: item.revenue
  })) || [];

  const statusDistribution = stats?.byStatus?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen">
      {/* Header section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
            <span className="w-8 h-[2px] bg-brand-500" />
            <span>Business Intelligence</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Performance insights and AI-driven growth metrics.</p>
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          title="Select Date Range"
          className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Primary Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <motion.div variants={itemVariants} className="glass dark:glass-dark p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-8 -mt-8" />
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-brand-500/10 rounded-2xl">
              <DollarSign size={24} className="text-brand-500" />
            </div>
            <div className="flex items-center text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp size={12} className="mr-1" />
              12.5%
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Total Revenue</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">₹{stats?.summary?.totalRevenue?.toLocaleString() || '0'}</h3>
        </motion.div>

        <motion.div variants={itemVariants} className="glass dark:glass-dark p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <ShoppingBag size={24} className="text-blue-500" />
            </div>
            <div className="flex items-center text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp size={12} className="mr-1" />
              8.2%
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Orders Handled</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.summary?.totalOrders || '0'}</h3>
        </motion.div>

        <motion.div variants={itemVariants} className="glass dark:glass-dark p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <Users size={24} className="text-emerald-500" />
            </div>
            <div className="flex items-center text-rose-500 font-bold text-xs bg-rose-500/10 px-2 py-1 rounded-full">
              <TrendingDown size={12} className="mr-1" />
              2.4%
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Store Footfall</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.summary?.completedOrders || '0'}</h3>
        </motion.div>

        <motion.div variants={itemVariants} className="orange-gradient p-6 rounded-[2rem] text-white shadow-xl shadow-brand-500/20">
          <div className="flex items-center justify-between mb-4">
            <Sparkles size={24} className="text-white/80 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">AI Ready</span>
          </div>
          <p className="text-white/70 text-xs font-black uppercase tracking-widest">Conversion Rate</p>
          <h3 className="text-3xl font-black mt-1">
            {stats?.summary?.totalOrders
              ? `${Math.round((stats.summary.completedOrders / stats.summary.totalOrders) * 100)}%`
              : '0%'}
          </h3>
        </motion.div>
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass dark:glass-dark p-8 rounded-[2.5rem] min-h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-brand-500/10 rounded-xl">
                <BarChart3 size={20} className="text-brand-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Revenue Analytics</h3>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
            {revenueTrends && revenueTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrends}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#F97316', fontWeight: 900 }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#F97316" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300">
                <BarChart3 size={48} className="mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-widest">No revenue data for this period</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Selling Items Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass dark:glass-dark p-8 rounded-[2.5rem] min-h-[450px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <ShoppingBag size={20} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Top Performance</h3>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
            {topItemsData && topItemsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItemsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#64748B' }} width={100} />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 12, 12, 0]} barSize={24}>
                    {topItemsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300">
                <ShoppingBag size={48} className="mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-widest">No item stats captured yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom section: Distribution and AI Analyst */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 glass dark:glass-dark p-8 rounded-[2.5rem]">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <PieChartIcon size={20} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Order Status</h3>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center">
            {statusDistribution && statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300">
                <PieChartIcon size={48} className="mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-widest text-center px-6">No order status metrics</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {statusDistribution && statusDistribution.length > 0 && statusDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] font-black text-slate-500 uppercase">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Business Insights Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 relative orange-gradient rounded-[2.5rem] p-8 text-white overflow-hidden group shadow-2xl shadow-brand-500/30"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32 animate-pulse-slow" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <span className="font-black text-sm uppercase tracking-widest text-white/80 block leading-none mb-1">AI Business Analyst</span>
                  {!hasPremiumAccess && (
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full w-fit">
                      <Lock size={8} /> Pro Feature
                    </span>
                  )}
                  {isTrialActive && !currentRestaurant?.isPremium && (
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase bg-emerald-500/40 px-2 py-0.5 rounded-full w-fit">
                      Trial Active
                    </span>
                  )}
                </div>
              </div>

              {!aiInsights && (
                <button
                  onClick={handleAskAI}
                  disabled={aiLoading}
                  className="px-6 py-3 bg-white text-brand-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl"
                >
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <ChefHat size={14} />}
                  {aiLoading ? 'Generating...' : 'Analyze Now'}
                </button>
              )}
            </div>

            <div className="flex-grow">
              {aiInsights ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 max-h-[400px] overflow-y-auto custom-scrollbar prose prose-invert prose-sm max-w-none"
                >
                  <ReactMarkdown>{aiInsights}</ReactMarkdown>
                  <button
                    onClick={() => setAiInsights(null)}
                    className="mt-6 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                  >
                    Clear Analysis
                  </button>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-2xl font-black mb-6 leading-tight tracking-tight italic uppercase">Unlock High-Performance Intelligence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-4 bg-white/10 p-5 rounded-3xl border border-white/10 group-hover:bg-white/20 transition-colors">
                      <div className="p-2 bg-white/20 rounded-xl"><Gem size={18} /></div>
                      <div>
                        <p className="text-sm font-bold">Predictive Engines</p>
                        <p className="text-[10px] text-white/70 mt-1 font-medium leading-relaxed">Forecast weekend demand and optimize staff schedules automatically.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 bg-white/10 p-5 rounded-3xl border border-white/10 group-hover:bg-white/20 transition-colors">
                      <div className="p-2 bg-white/20 rounded-xl"><Zap size={18} /></div>
                      <div>
                        <p className="text-sm font-bold">Menu Profit Audit</p>
                        <p className="text-[10px] text-white/70 mt-1 font-medium leading-relaxed">Identify low-margin items and get AI pricing suggestions to boost ROI.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!hasPremiumAccess && !aiInsights && (
              <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Trial expired. Upgrade to keep insights.
                </p>
                <button
                  onClick={() => setIsSubModalOpen(true)}
                  className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all"
                >
                  Upgrade to Pro <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        restaurantName={currentRestaurant?.name || 'Restaurant'}
      />
    </div>
  );
};

export default AnalyticsPage;

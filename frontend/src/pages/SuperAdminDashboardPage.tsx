import { useState, useEffect } from 'react';
import { 
  Users, 
  Store, 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ChevronRight,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API } from '@/services/api';
import { Error as ErrorComp } from '@/components';

interface Stats {
  restaurants: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  orders: {
    total: number;
    thisMonth: number;
  };
  revenue: {
    thisMonth: number;
  };
}

export const SuperAdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.superAdmin.getStats();
        setStats(response.data.data);
      } catch (err: any) {
        setError('Failed to fetch platform metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Global Restaurants',
      value: stats?.restaurants.total || 0,
      subValue: `+${stats?.restaurants.newThisMonth || 0} this month`,
      icon: Store,
      color: 'text-brand-500',
      bg: 'bg-brand-500/10',
    },
    {
      title: 'Active Fleet',
      value: stats?.restaurants.active || 0,
      subValue: 'Live operations',
      icon: Globe,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Current Orders',
      value: stats?.orders.thisMonth || 0,
      subValue: 'Monthly traffic',
      icon: ShoppingBag,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Platform Rev.',
      value: `₹${stats?.revenue.thisMonth.toLocaleString() || 0}`,
      subValue: 'Est. GMV this month',
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter supreme-text-gradient mb-3">
            Platform Alpha
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Core Infrastructure Hub
          </p>
        </div>
        
        <div className="flex items-center gap-6 p-4 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-3xl">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
            <p className="text-white font-black text-sm uppercase">Nominal</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Globe className="text-white" size={20} />
          </div>
        </div>
      </div>

      {error && <ErrorComp message={error} onClose={() => setError(null)} />}

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            className="group supreme-card p-8 relative overflow-hidden"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className={`absolute top-0 right-0 w-40 h-40 ${card.bg.replace('bg-', 'bg-indigo-500')} blur-[80px] rounded-full -mr-20 -mt-20 opacity-20 group-hover:opacity-40 transition-all duration-700`} />
            
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-500`}>
                <card.icon size={28} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>

              <div className="space-y-1">
                <h3 className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">{card.title}</h3>
                <div className="text-4xl font-black text-white tracking-tighter">{card.value}</div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                  <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">{card.subValue}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="supreme-card h-[400px] relative">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white">Platform Throughput</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time data stream</p>
              </div>
              <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                Full Audit
              </button>
            </div>
            
            <div className="absolute inset-x-0 bottom-0 top-[100px] flex items-center justify-center p-20">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-500/5 rounded-full flex items-center justify-center mx-auto border border-indigo-500/10 mb-6">
                  <TrendingUp className="text-indigo-500 animate-bounce" size={32} />
                </div>
                <h4 className="text-white font-black uppercase tracking-widest text-sm">Visualizing Analytics</h4>
                <p className="text-slate-600 text-xs max-w-xs mx-auto">Neural processing engine is aggregating platform metrics...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="supreme-card p-10">
            <h2 className="text-lg font-black uppercase tracking-tight text-white mb-10">Core Mesh Status</h2>
            <div className="space-y-8">
                {[
                    { label: 'API Cluster', status: 'Healthy', load: '14%' },
                    { label: 'Global DB', status: 'Optimal', load: '32%' },
                    { label: 'AI Inference', status: 'Active', load: '89%' },
                    { label: 'Asset CDN', status: 'Synced', load: '02%' },
                ].map((node) => (
                    <div key={node.label} className="group cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{node.label}</span>
                            <span className="text-indigo-500 text-[10px] font-black">{node.load}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: node.load }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600"
                            />
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

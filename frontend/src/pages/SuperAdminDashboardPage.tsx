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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Platform Overview</h1>
          <p className="text-slate-500 font-medium">Monitoring DineOS global operations and performance.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-xl border border-white/5 p-2 rounded-2xl">
          <div className="px-4 py-2 bg-brand-500/10 rounded-xl">
            <span className="text-brand-500 text-xs font-black uppercase tracking-widest">Real-time Sync</span>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <ErrorComp message={error} onClose={() => setError(null)} />}

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-slate-900/40 backdrop-blur-lg border border-white/5 p-6 rounded-[2.5rem] hover:bg-slate-900/60 hover:border-white/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="relative z-10">
              <div className={`${card.bg} ${card.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                <card.icon size={24} />
              </div>
              <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">{card.title}</h3>
              <div className="text-3xl font-black text-white mb-2">{card.value}</div>
              <div className="flex items-center gap-1.5">
                <div className="text-emerald-500 text-xs font-black flex items-center">
                  <ArrowUpRight size={14} />
                </div>
                <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{card.subValue}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity / System Health placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-lg border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight">System Throughput</h2>
              <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Operational
              </div>
            </div>
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={32} className="text-brand-500" />
              </div>
              <p className="text-slate-500 font-medium">Traffic data visualization will appear here.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/50 border border-white/5 rounded-[2.5rem] p-8">
            <h2 className="text-lg font-black uppercase tracking-tight mb-8">Node Awareness</h2>
            <div className="space-y-6">
                {[
                    { label: 'API Cluster', status: 'Healthy', latency: '24ms' },
                    { label: 'Database Mesh', status: 'Optimal', latency: '12ms' },
                    { label: 'AI Inference', status: 'Active', latency: '450ms' },
                    { label: 'Socket Bridge', status: 'Connected', latency: '8ms' },
                ].map((node) => (
                    <div key={node.label} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex flex-col gap-1">
                            <span className="text-brand-500 text-[10px] font-black uppercase tracking-widest leading-none">{node.label}</span>
                            <span className="text-white font-black text-sm">{node.status}</span>
                        </div>
                        <span className="text-slate-500 text-xs font-mono">{node.latency}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

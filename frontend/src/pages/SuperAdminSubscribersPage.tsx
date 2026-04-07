import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  Zap,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminApi } from '@/services/api';
import { Error as ErrorComp } from '@/components';
import { useTabTitle } from '@/hooks';

interface Subscriber {
  _id: string;
  name: string;
  slug: string;
  isPremium: boolean;
  subscriptionExpiresAt: string | null;
  trialActivatedAt: string;
  themeColor: string;
  owner?: {
    name: string;
    email: string;
  };
}

export const SuperAdminSubscribersPage = () => {
  useTabTitle('System Subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'premium' | 'trial'>('all');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getSubscribers();
      setSubscribers(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync with subscriber node');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) || 
                         sub.slug.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'premium') return matchesSearch && sub.isPremium;
    if (activeTab === 'trial') return matchesSearch && !sub.isPremium;
    return matchesSearch;
  });

  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Subscriber Mesh...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter supreme-text-gradient mb-4">
            Revenue Mesh
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px]">
            Premium Tiers & Ecosystem Monetization
          </p>
        </div>

        <div className="flex items-center gap-4 p-2 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem]">
          {(['all', 'premium', 'trial'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'all' ? 'All Nodes' : tab === 'premium' ? 'Premium Hubs' : 'Active Trials'}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorComp message={error} onClose={() => setError(null)} />}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="supreme-card p-10 flex items-center gap-8 group">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Zap className="text-indigo-500" size={32} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">PRO ADOPTION</p>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              {subscribers.filter(s => s.isPremium).length}
            </h2>
          </div>
        </div>

        <div className="supreme-card p-10 flex items-center gap-8 group">
          <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Clock className="text-violet-500" size={32} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">EXPERIMENTAL (TRIAL)</p>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              {subscribers.filter(s => !s.isPremium).length}
            </h2>
          </div>
        </div>

        <div className="supreme-card p-10 flex items-center gap-8 group">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <CreditCard className="text-blue-500" size={32} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">PLATFORM MMR</p>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase tabular-nums">
              ₹{subscribers.filter(s => s.isPremium).length * 1999}
            </h2>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="supreme-card overflow-hidden">
        <div className="p-10 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="relative w-96 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="SEARCH BY NODE NAME..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-16 pr-6 text-white text-[10px] font-black tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Node Hub</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Owner</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Plan Alignment</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Time to Void</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredSubscribers.map((sub, idx) => {
                  const daysLeft = getDaysRemaining(sub.subscriptionExpiresAt);
                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={sub._id} 
                      className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500 bg-indigo-500"
                          >
                            <div className="absolute inset-0 bg-black/20" />
                            <span className="relative z-10">{sub.name.charAt(0)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-black text-lg tracking-tight group-hover:supreme-text-gradient transition-all">{sub.name}</span>
                            <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">{sub.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <UserIcon size={18} className="text-slate-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-300 font-bold text-sm">{sub.owner?.name || 'UNKNOWN'}</span>
                            <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">{sub.owner?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                          sub.isPremium 
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                            : 'bg-slate-500/10 text-slate-500 border border-white/5'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${sub.isPremium ? 'bg-indigo-500 animate-pulse' : 'bg-slate-500'}`} />
                          {sub.isPremium ? 'Supreme Pro' : 'Free Trial'}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                daysLeft > 15 ? 'bg-indigo-500' : daysLeft > 5 ? 'bg-amber-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}
                            />
                          </div>
                          <span className={`${daysLeft < 5 ? 'text-red-500 font-black animate-pulse' : 'text-slate-400 font-bold'} text-xs font-mono`}>
                            {daysLeft}D
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredSubscribers.length === 0 && (
          <div className="py-40 text-center">
             <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShieldAlert size={40} className="text-slate-700" />
            </div>
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-2xl mb-3">Void Detected</h3>
            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No active subscribers in this data segment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

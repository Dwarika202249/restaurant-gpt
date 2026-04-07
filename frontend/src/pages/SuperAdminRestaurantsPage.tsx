import { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Calendar,
  User as UserIcon,
  Phone,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '@/services/api';
import { Error as ErrorComp } from '@/components';

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  themeColor: string;
  createdAt: string;
  owner?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const SuperAdminRestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await API.superAdmin.getRestaurants();
      setRestaurants(response.data.data);
    } catch (err) {
      setError('Failed to load restaurant fleet');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await API.superAdmin.toggleStatus(id, nextStatus as any);
      setRestaurants(restaurants.map(r => r._id === id ? { ...r, status: nextStatus as any } : r));
    } catch (err) {
      setError('Failed to update restaurant status');
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                         r.slug.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter supreme-text-gradient mb-4">
            Fleet Control
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px]">
            Master Node Directory & System Integrity
          </p>
        </div>
      </div>

      {error && <ErrorComp message={error} onClose={() => setError(null)} />}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-[500px] group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
          </div>
          <input 
            type="text"
            placeholder="FILTER NODES BY NAME OR SLUG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white text-xs font-black tracking-widest focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all placeholder:text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-3xl border border-white/5">
          {['all', 'active', 'inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                filter === f 
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-600 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Table */}
      <div className="supreme-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Instance Node</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Identity Matrix</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Status</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">Access</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredRestaurants.map((restro, idx) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={restro._id} 
                    className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500"
                          style={{ backgroundColor: restro.themeColor || '#6366f1' }}
                        >
                          <div className="absolute inset-0 bg-black/20" />
                          <span className="relative z-10">{restro.name.charAt(0)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-black text-lg tracking-tight group-hover:supreme-text-gradient transition-all">{restro.name}</span>
                          <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">UUID: {restro.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-slate-300 font-bold text-sm">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <UserIcon size={14} className="text-indigo-400" />
                          </div>
                          {restro.owner?.name || 'NULL_IDENTITY'}
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest ml-11">
                          {restro.owner?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <button 
                        onClick={() => handleToggleStatus(restro._id, restro.status)}
                        className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                          restro.status === 'active' 
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${restro.status === 'active' ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'}`} />
                        {restro.status}
                      </button>
                    </td>
                    <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                            <button 
                                title="Audit Logs"
                                className="p-4 bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 border border-transparent rounded-2xl transition-all"
                            >
                                <Search size={20} />
                            </button>
                            <button 
                                title="Visit Node"
                                className="p-4 bg-white/5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/30 border border-transparent rounded-2xl transition-all"
                            >
                                <ExternalLink size={20} />
                            </button>
                        </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredRestaurants.length === 0 && (
          <div className="py-40 text-center">
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <ShieldAlert size={40} className="text-slate-700" />
            </div>
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-2xl mb-3">Void Detected</h3>
            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No active nodes match your filter parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

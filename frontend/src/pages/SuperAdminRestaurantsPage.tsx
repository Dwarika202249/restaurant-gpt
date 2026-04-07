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
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Restaurant Fleet</h1>
        <p className="text-slate-500 font-medium">Manage and audit all restaurants onboarded to the DineOS ecosystem.</p>
      </div>

      {error && <ErrorComp message={error} onClose={() => setError(null)} />}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-600 font-bold"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
          {['all', 'active', 'inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Table */}
      <div className="bg-slate-900/40 backdrop-blur-lg border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Restaurant</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Owner Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredRestaurants.map((restro) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={restro._id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl"
                          style={{ backgroundColor: restro.themeColor || '#EF4444' }}
                        >
                          {restro.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-black text-base">{restro.name}</span>
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">/{restro.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                          <UserIcon size={14} className="text-slate-600" />
                          {restro.owner?.name || 'Incomplete Profile'}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <Mail size={12} />
                          {restro.owner?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(restro._id, restro.status)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          restro.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${restro.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`} />
                        {restro.status}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                title="View Details"
                                aria-label="View restaurant details"
                                className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <Search size={18} />
                            </button>
                            <button 
                                title="Visit Restaurant"
                                aria-label="Visit restaurant website"
                                className="p-3 bg-white/5 text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 rounded-xl transition-all"
                            >
                                <ExternalLink size={18} />
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
          <div className="p-32 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} className="text-slate-600" />
            </div>
            <h3 className="text-white font-black uppercase text-xl mb-2">No Nodes Found</h3>
            <p className="text-slate-500 font-medium">Clear your search or filters to see the restaurant fleet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

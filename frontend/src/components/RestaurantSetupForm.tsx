import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { setupRestaurant } from '@/store/slices/restaurantSlice';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { motion } from 'framer-motion';
import { 
  Store, 
  Link as LinkIcon, 
  Hash, 
  Sparkles, 
  ShieldCheck,
  ArrowRight,
  UtensilsCrossed
} from 'lucide-react';
import { Error as ErrorMessage } from './Error';

interface RestaurantSetupFormProps {
  onComplete?: () => void;
}

export const RestaurantSetupForm: React.FC<RestaurantSetupFormProps> = ({ onComplete }) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    tablesCount: 10 as number | ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug when name changes
  const [autoSlugMode, setAutoSlugMode] = useState(true);

  useEffect(() => {
    if (autoSlugMode) {
      const generated = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setForm(prev => ({ ...prev, slug: generated }));
    }
  }, [form.name, autoSlugMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'tablesCount') {
      setForm({ ...form, [name]: parseInt(value) || '' });
    } else if (name === 'slug') {
      setAutoSlugMode(false); // User manually edited the slug
      const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setForm({ ...form, [name]: cleanSlug });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (typeof form.tablesCount !== 'number' || form.tablesCount < 1) {
        throw new Error('You must have at least 1 table.');
      }
      
      // Dispatch thunk and unwrap directly to catch rejections instantly
      await dispatch(setupRestaurant({
         name: form.name,
         slug: form.slug,
         tablesCount: form.tablesCount
      })).unwrap();

      // Ensure local admin object knows about the new restaurantId
      await dispatch(fetchAdminUser()).unwrap();

      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="glass dark:glass-dark p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-brand-500/10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-brand-500/10 rounded-[2rem] flex items-center justify-center mb-6 border-2 border-brand-500/20">
            <UtensilsCrossed size={32} className="text-brand-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Workspace Setup</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Define your restaurant's digital presence to complete onboarding.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="restaurantName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Restaurant Name *</label>
            <div className="relative group">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input
                id="restaurantName"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                required
                placeholder="e.g. The Prime Cafe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="urlSlug" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique URL Slug *</label>
            <div className="relative group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input
                id="urlSlug"
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                required
                placeholder="the-prime-cafe"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium ml-1">Customers will visit: <span className="text-brand-500 font-bold bg-brand-500/10 px-1 rounded">/r/{form.slug || '...'}/table/1</span></p>
          </div>

          <div className="space-y-2">
            <label htmlFor="tablesCount" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Number of Tables *</label>
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input
                id="tablesCount"
                type="number"
                name="tablesCount"
                min="1"
                max="500"
                value={form.tablesCount}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                required
                placeholder="10"
                aria-label="Number of Tables"
              />
            </div>
          </div>

          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          <button
            type="submit"
            disabled={loading || !form.name || !form.slug}
            className="w-full relative group overflow-hidden py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Launch Restaurant</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="pt-6 flex items-center justify-center space-x-2 text-slate-400 opacity-60">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Workspace Registration</span>
            <Sparkles size={14} className="text-brand-500" />
          </div>
        </form>
      </div>
    </motion.div>
  );
};

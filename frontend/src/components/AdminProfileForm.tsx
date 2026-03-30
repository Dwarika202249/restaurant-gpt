import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateAdminProfile } from '@/store/slices/authSlice';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  ShieldCheck,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { Error } from './Error';

interface AdminProfileFormProps {
  onComplete?: () => void;
}

export const AdminProfileForm: React.FC<AdminProfileFormProps> = ({ onComplete }) => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await dispatch(updateAdminProfile({ ...form, phone: user?.phone || '' }) as any);
      const res = await dispatch(fetchAdminUser() as any);
      const updatedUser = res?.payload?.user;
      if (updatedUser?.profileComplete && onComplete) {
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="glass dark:glass-dark p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-brand-500/10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-brand-500/10 rounded-[2rem] flex items-center justify-center mb-6 border-2 border-brand-500/20">
            <UserPlus size={32} className="text-brand-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Initialize Profile</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Complete your administrative identity to access the restaurant workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity *</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                required
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Email *</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                required
                placeholder="name@restaurant.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorized Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                value={user?.phone || ''}
                disabled
                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-slate-900/50 border border-transparent rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
                placeholder="Phone number"
              />
            </div>
          </div>

          {error && <Error message={error} onClose={() => setError(null)} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Onboarding</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="pt-6 flex items-center justify-center space-x-2 text-slate-400 opacity-60">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Server Environment</span>
            <Sparkles size={14} className="text-brand-500" />
          </div>
        </form>
      </div>
    </motion.div>
  );
};

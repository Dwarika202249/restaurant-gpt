import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateAdminProfile } from '@/store/slices/authSlice';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Error, Success } from '@/components';

const AdminPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user && isAuthenticated) {
      dispatch(fetchAdminUser());
    }
  }, [user, isAuthenticated, dispatch]);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await dispatch(updateAdminProfile({ ...form, phone: user?.phone ?? '' }) as any);
      setSuccess('Profile synchronized successfully!');
      setEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto scrollbar-hide">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
            <span className="w-8 h-[2px] bg-brand-500" />
            <span>Identity</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Admin Profile
            <ShieldCheck className="text-brand-500" size={32} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Manage your personal administrative credentials and contact info.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!editMode && (
            <motion.button
              key="edit-toggle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setEditMode(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Edit3 size={16} />
              <span>Modify Details</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {error && <Error message={error} onClose={() => setError(null)} className="mb-6" />}
      {success && <Success message={success} className="mb-6" />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Quick Peek */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-1"
        >
          <div className="glass dark:glass-dark p-8 rounded-[2.5rem] flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-brand-500/10 rounded-[2rem] flex items-center justify-center mb-6 border-4 border-white dark:border-slate-900 shadow-xl">
              <UserCheck size={36} className="text-brand-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{user.name}</h3>
            <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">Verified Administrator</p>
            
            <div className="w-full mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4 text-left">
              <div className="flex items-center space-x-3 text-slate-500">
                <Mail size={14} className="text-brand-500" />
                <span className="text-xs font-bold truncate">{user.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-500">
                <Phone size={14} className="text-brand-500" />
                <span className="text-xs font-bold">{user.phone}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2"
        >
          <div className="glass dark:glass-dark p-8 md:p-10 rounded-[2.5rem]">
            <AnimatePresence mode="wait">
              {!editMode ? (
                <motion.div 
                  key="view-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <User size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Full Name</span>
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{user.name}</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Mail size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Email Address</span>
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Phone size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Phone Number (Secure)</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{user.phone}</p>
                  </div>

                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-brand-500/5 p-4 rounded-2xl flex items-start space-x-3">
                      <ShieldCheck className="text-brand-500 mt-0.5" size={16} />
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest">
                        Administrative access granted. Your credentials are used for secure notifications and restaurant management validation.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form 
                  key="edit-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label htmlFor="admin-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                      <input
                        id="admin-name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                        required
                        placeholder="Enter your administrative name"
                        title="Administrative Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="admin-email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address *</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                      <input
                        id="admin-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                        required
                        placeholder="Email for notifications"
                        title="Email Address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="admin-phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone (Protected)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        id="admin-phone"
                        type="text"
                        value={user.phone}
                        disabled
                        className="w-full pl-12 pr-4 py-4 bg-slate-100/50 dark:bg-slate-900/50 border border-transparent rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
                        placeholder="Phone number"
                        title="Admin Phone Number (Protected)"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center space-x-2 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Sync Changes</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      disabled={loading}
                      className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;

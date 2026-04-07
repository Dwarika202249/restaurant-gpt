import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Save,
  Edit3,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Activity,
  Server,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { useTabTitle } from '@/hooks';
import { updateAdminProfile, changeSuperAdminPassword } from '@/store/slices/authSlice';
import { Error as ErrorComp } from '@/components';

export const SuperAdminProfilePage = () => {
  useTabTitle('Supreme Identity');
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await dispatch(updateAdminProfile(form) as any).unwrap();
      setSuccess('Supreme Identity Synchronized');
      setEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New keys do not match');
      return;
    }

    setPassLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await dispatch(changeSuperAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }) as any).unwrap();
      
      setSuccess(result.message || 'Security Vault Re-encrypted');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Security update failed');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-black uppercase tracking-tighter supreme-text-gradient mb-3">
            Supreme Profile
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Verified Command Authority
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 p-4 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-3xl"
        >
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Rank</p>
            <p className="text-indigo-400 font-black text-sm uppercase">Prime Architect</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="text-white" size={24} />
          </div>
        </motion.div>
      </div>

      {error && <ErrorComp message={error} onClose={() => setError(null)} />}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-4 text-emerald-400 font-black uppercase tracking-widest text-xs"
        >
          <CheckCircle2 size={20} />
          {success}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="supreme-card p-10 text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-white/5 flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                <User size={56} className="text-indigo-500" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white border-4 border-[#020617] shadow-lg">
                  <Zap size={18} fill="currentColor" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 truncate">{user?.name}</h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">
                <Server size={12} className="text-indigo-500" />
                System Identifier: {user?._id?.slice(-8).toUpperCase()}
              </div>

              <div className="space-y-4 text-left border-t border-white/5 pt-8">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><Mail size={14} /> Email</span>
                  <span className="text-white font-bold">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><Phone size={14} /> Contact</span>
                  <span className="text-white font-bold">{user?.phone || 'Not Linked'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> Authority Since</span>
                  <span className="text-white font-bold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Initial Era'}</span>
                </div>
              </div>

              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full mt-10 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={14} /> Edit Identity
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Identity Details & Security */}
        <div className="lg:col-span-2 space-y-10">
          <AnimatePresence mode="wait">
            {editMode ? (
              <motion.div
                key="edit-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="supreme-card p-10"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                    <User className="text-indigo-500" size={20} />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Modify Identity</h3>
                </div>

                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Supreme Name</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="supreme-input pl-14"
                        placeholder="Admin Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Supreme Email</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="supreme-input pl-14"
                        placeholder="admin@system.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Secure Contact</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="supreme-input pl-14"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-5 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Synchronize Profile</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-10 py-5 bg-slate-900 border border-white/5 text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:text-white transition-all"
                    >
                      Abort
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="security-vault"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="supreme-card p-10"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center">
                    <Lock className="text-violet-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Security Vault</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Re-encrypt Supreme Identifier</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-violet-400 ml-1">Current Pass Key</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input
                          title='password'
                          type={showCurrentPass ? 'text' : 'password'}
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="supreme-input pr-12 pl-14"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                        >
                          {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div></div> {/* Spacer */}

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-violet-400 ml-1">New Supreme Key</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                          <Zap size={18} />
                        </div>
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="supreme-input pr-12 pl-14"
                          placeholder="••••••••"
                          title="New Supreme Key"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                        >
                          {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-violet-400 ml-1">Verify New Key</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors">
                          <ShieldCheck size={18} />
                        </div>
                        <input
                          type="password"
                          title='confirm password'
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="supreme-input pl-14"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passLoading}
                    className="w-full py-5 bg-violet-600/10 border border-violet-500/20 text-violet-400 font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-violet-600/20 transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {passLoading ? <Loader2 className="animate-spin" size={18} /> : 'Update Supreme Encryption'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* System Intel & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="supreme-card p-8 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                  <Activity className="text-indigo-500" size={18} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Active Influence</h4>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-white tracking-tighter">NOMINAL</p>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[94%] bg-emerald-500" />
                </div>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">System Load Awareness: 94% Accuracy</p>
              </div>
            </div>

            <div className="supreme-card p-8 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
                  <Server className="text-violet-500" size={18} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Mesh Node Status</h4>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white tracking-tighter uppercase">STABLE</p>
                <span className="text-purple-500 font-black text-[10px] animate-pulse">● LIVE</span>
              </div>
              <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Sync cycle completed 2m ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

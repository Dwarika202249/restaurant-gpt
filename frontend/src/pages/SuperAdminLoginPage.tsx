import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useRedux';
import { useTabTitle } from '@/hooks';
import { superAdminLogin } from '@/store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Error as ErrorComp } from '@/components';

export const SuperAdminLoginPage = () => {
  useTabTitle('Supreme Access');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await dispatch(superAdminLogin({ email, password }) as any).unwrap();
      if (result.user.role === 'superadmin') {
        navigate('/superadmin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Supreme Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-20 h-20 bg-brand-500/10 border border-brand-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6"
          >
            <ShieldCheck size={40} className="text-brand-500" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Supreme Access</h1>
          <p className="text-slate-500 mt-2 font-medium">Verify your administrative identity to proceed.</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <ErrorComp message={error} onClose={() => setError(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Identifier</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supreme@dineos.com"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 p-1 rounded-lg transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-2xl shadow-white/5"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Unlock Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Authorized personnel only</p>
          <Link to="/supreme/init" className="text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-400 transition-colors flex items-center gap-2">
            <Sparkles size={12} />
            Create Supreme Profile
          </Link>
        </div>

        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-widest text-slate-700">
          DineOS Supreme Control • Vault Access v1.2
        </p>
      </motion.div>
    </div>
  );
};

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldPlus, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useTabTitle } from '@/hooks';
import { API } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Error as ErrorComp } from '@/components';

export const SuperAdminSignupPage = () => {
  useTabTitle('Supreme Initialization');
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Security keys do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await API.superAdmin.signup({ name, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/supremeadmin'), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Supreme profile initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

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
            className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6"
          >
            <ShieldPlus size={40} className="text-indigo-500" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Supreme Identity</h1>
          <p className="text-slate-500 mt-2 font-medium italic">Initialize your administrative profile in the ecosystem.</p>
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

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-emerald-500 font-black uppercase tracking-widest text-xs">Profile Initialized</h3>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Your profile has been created. Please manually promote this account to <span className="text-white">superadmin</span> in the database to enable Supreme Access.
                </p>
              </div>
              <p className="text-[9px] text-slate-500 font-bold animate-pulse">Redirecting to Vault in 5s...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 font-mono">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Supreme Admin"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 font-mono">Email Identifier</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="supreme@dineos.com"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 font-mono">Pass Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 p-1 rounded-lg transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 font-mono">Verify Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 p-1 rounded-lg transition-colors"
                    aria-label={showConfirmPassword ? "Hide verify key" : "Show verify key"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-2xl shadow-white/5 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Initialize Profile
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Already have a key?</p>
          <Link to="/supremeadmin" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 transition-colors">
            Access Vault
          </Link>
        </div>

        <p className="text-center mt-12 text-[10px] font-black uppercase tracking-widest text-slate-700">
          AUTHORIZED REGISTRATION ONLY • DINEOS SUPREME CONTROL
        </p>
      </motion.div>
    </div>
  );
};

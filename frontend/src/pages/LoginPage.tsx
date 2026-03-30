import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Copy, Check, ChevronLeft, ArrowRight, Sparkles, Utensils, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useTabTitle } from '@/hooks';
import { sendOTP, verifyOTP, clearError, resetOTPSent } from '@/store/slices/authSlice';
import { Error as ErrorComp, Success } from '@/components';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { motion, AnimatePresence } from 'framer-motion';

type AuthStep = 'phone' | 'otp';

export const LoginPage = () => {
  useTabTitle('Login');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redux state
  const { loading, error, isAuthenticated, otpSent, demoOTP } = useAppSelector(
    (state) => state.auth
  );

  // Local state
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchAndRedirect = async () => {
        const res = await dispatch(fetchAdminUser() as any);
        const user = res?.payload?.user;
        if (user?.profileComplete === false) navigate('/admin-profile');
        else navigate('/dashboard');
      };
      fetchAndRedirect();
    }
  }, [isAuthenticated, dispatch, navigate]);

  useEffect(() => {
    if (otpSent && step === 'phone') {
      setStep('otp');
      setSuccessMessage('Welcome back! OTP is on its way.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [otpSent, step]);

  useEffect(() => {
    if (step === 'otp') {
      // Auto-focus first digit on step transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setPhoneError('Please enter a valid 10-digit number');
      return;
    }
    dispatch(clearError());
    await dispatch(sendOTP(cleaned));
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpArray.join('');
    if (otp.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP');
      return;
    }
    dispatch(clearError());
    await dispatch(verifyOTP({ phone: phone.replace(/\D/g, ''), otp }));
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers or empty string (for backspace)
    if (value !== '' && !/^[0-9]$/.test(value.slice(-1))) return;
    
    const newOtpArray = [...otpArray];
    const val = value.slice(-1);
    newOtpArray[index] = val;
    setOtpArray(newOtpArray);
    setOtpError('');
    
    // Auto-focus next box
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const currentOtp = useMemo(() => otpArray.join(''), [otpArray]);

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      {/* Left Side: Hero Section */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-slate-950 z-10" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay opacity-40 transition-transform duration-[10s] group-hover:scale-110" />
        </div>

        <div className="relative z-20 p-16 flex flex-col justify-between w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 rounded-2xl orange-gradient flex items-center justify-center shadow-glow-orange">
              <Utensils className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">RestaurantGPT</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-black text-white leading-none tracking-tighter"
            >
              FUTURE OF <br />
              <span className="text-brand-500">DINING</span> IS HERE.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-lg max-w-md font-medium leading-relaxed"
            >
              Elevate your restaurant experience with AI-powered hospitality. Seamless ordering, smart analytics, and premium growth toolkit.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-8"
          >
            {[
              { icon: Sparkles, label: 'AI Powered' },
              { icon: ShieldCheck, label: 'Secure' },
              { icon: Phone, label: '24/7 Support' }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <feature.icon className="text-brand-500" size={20} />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full translate-x-1/2" />
      </div>

      {/* Right Side: Form Section */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative">
        <div className="max-w-md w-full mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="mb-10 lg:hidden flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center">
                    <Utensils className="text-white" size={20} />
                  </div>
                  <span className="text-xl font-black text-slate-950 dark:text-white tracking-tight">RestaurantGPT</span>
                </div>

                <div className="mb-10">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Welcome Back</h1>
                  <p className="text-slate-500 font-medium">Enter your credentials to access the console.</p>
                </div>

                {error && <div className="mb-6"><ErrorComp message={error} onClose={() => dispatch(clearError())} /></div>}

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 block pl-1">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setPhoneError('');
                        }}
                        placeholder="+91 00000 00000"
                        className={`w-full bg-slate-50 dark:bg-slate-900 border ${phoneError ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-[1.25rem] py-4 pl-12 pr-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all`}
                      />
                    </div>
                    {phoneError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest pl-1">{phoneError}</p>}
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full orange-gradient p-4 rounded-[1.25rem] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <button 
                  onClick={() => {
                    dispatch(resetOTPSent());
                    setStep('phone');
                    setOtpArray(['', '', '', '', '', '']);
                  }}
                  className="flex items-center space-x-2 text-brand-500 font-bold text-sm mb-10 hover:translate-x-[-4px] transition-transform"
                >
                  <ChevronLeft size={18} />
                  <span>Use different number</span>
                </button>

                <div className="mb-10">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Security Check</h1>
                  <p className="text-slate-500 font-medium">We've sent a 6-digit code to <span className="text-brand-500 font-bold">{phone}</span>.</p>
                </div>

                {successMessage && <div className="mb-6"><Success message={successMessage} /></div>}
                {error && <div className="mb-6"><ErrorComp message={error} onClose={() => dispatch(clearError())} /></div>}

                <form onSubmit={handleVerifyOTP} className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 block">
                        OTP Code
                      </label>
                      {demoOTP && (
                        <button 
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(demoOTP);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className={`flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest ${copied ? 'text-emerald-500' : 'text-brand-500'}`}
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copied ? 'Copied' : `Test: ${demoOTP}`}</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="flex justify-between gap-3">
                      {otpArray.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpInputRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          autoFocus={i === 0 && step === 'otp'}
                          title={`OTP digit ${i + 1}`}
                          aria-label={`OTP digit ${i + 1}`}
                          onChange={(e) => handleOtpChange(e.target.value, i)}
                          onKeyDown={(e) => handleKeyDown(e, i)}
                          onFocus={(e) => e.target.select()}
                          className={`w-full aspect-square text-center text-2xl font-black rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 ${otpError ? 'border-red-500' : 'border-slate-100 dark:border-slate-800 focus:border-brand-500'} transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/10 text-slate-900 dark:text-white`}
                        />
                      ))}
                    </div>
                    {otpError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest pl-1">{otpError}</p>}
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || currentOtp.length < 6}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-[1.25rem] font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Validate and Login</span>
                        <ShieldCheck size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-900 flex justify-between items-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2026 ResGPT.ai</p>
            <div className="flex space-x-4">
               <button onClick={() => navigate('/help')} className="text-[10px] text-slate-400 hover:text-brand-500 transition-colors font-bold uppercase tracking-widest outline-none">Help</button>
               <button onClick={() => navigate('/privacy')} className="text-[10px] text-slate-400 hover:text-brand-500 transition-colors font-bold uppercase tracking-widest outline-none">Privacy</button>
            </div>
          </div>
        </div>

        {/* Subtle Decorative elements for form side */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/[0.02] blur-[120px] rounded-full -ml-64 -mt-64 pointer-events-none" />
      </div>
    </div>
  );
};

export default LoginPage;

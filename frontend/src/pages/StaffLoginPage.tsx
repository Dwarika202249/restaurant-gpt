import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronLeft, ArrowRight, Sparkles, ChefHat, Users, ShieldCheck, Check, Copy } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useTabTitle } from '@/hooks';
import { sendStaffOTP, verifyOTP, clearError, resetOTPSent } from '@/store/slices/authSlice';
import { Error as ErrorComp, Success } from '@/components';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { verifyFirebaseToken } from '@/store/slices/authSlice';
import { toast } from 'react-hot-toast';

type AuthStep = 'phone' | 'otp';

export const StaffLoginPage = () => {
  useTabTitle('Staff Login');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { loading, error, isAuthenticated, otpSent, demoOTP, user } = useAppSelector(
    (state) => state.auth
  );

  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'chef') navigate('/chef/dashboard');
      else if (user.role === 'waiter') navigate('/waiter/dashboard');
      else navigate('/dashboard'); // Fallback for admin
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (otpSent && step === 'phone') {
      setStep('otp');
      setSuccessMessage('Staff Authenticator: OTP Sent.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [otpSent, step]);

  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-staff-container', {
        size: 'invisible',
        callback: () => {
          console.log('Staff Recaptcha verified');
        }
      });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setPhoneError('Enter valid 10-digit staff mobile');
      return;
    }

    try {
      dispatch(clearError());
      setupRecaptcha();
      const appVerifier = recaptchaVerifierRef.current!;
      const formatPhone = `+91${cleaned}`;

      const result = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      setSuccessMessage('Staff Authenticator: Security Code Sent.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Firebase Staff Auth Error:', error);
      toast.error(error.message || 'Access denied: Staff verification failed');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpArray.join('');
    if (otp.length !== 6) {
      setOtpError('Enter 6-digit code');
      return;
    }

    if (!confirmationResult) {
      setOtpError('Session expired. Please request a new code.');
      return;
    }

    try {
      dispatch(clearError());
      // 1. Verify with Firebase
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      // 2. Exchange for local JWT tokens
      await dispatch(verifyFirebaseToken({ idToken }) as any);

    } catch (error: any) {
      console.error('Staff OTP Verification Error:', error);
      setOtpError(error.message || 'Invalid authentication key');
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value !== '' && !/^[0-9]$/.test(value.slice(-1))) return;
    const newOtpArray = [...otpArray];
    const val = value.slice(-1);
    newOtpArray[index] = val;
    setOtpArray(newOtpArray);
    if (val && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white overflow-hidden font-inter">
      {/* Visual background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl">
            <ChefHat className="text-brand-500" size={32} />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Staff <span className="text-brand-500">Hub</span></h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Professional Access Only</p>
          </div>
        </motion.div>

        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-black tracking-tight mb-2">Login to Station</h3>
                  <p className="text-xs text-slate-400 font-medium italic">Enter your registered mobile number to receive security code.</p>
                </div>

                {error && <ErrorComp message={error} onClose={() => dispatch(clearError())} />}

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mobile Identity</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-500 transition-colors" size={18} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          if (e.target.value.length <= 10) setPhone(e.target.value);
                          setPhoneError('');
                        }}
                        placeholder="00000 00000"
                        className="w-full bg-slate-900 shadow-inner border border-white/5 rounded-2xl py-4 pl-14 pr-4 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-white placeholder:text-slate-700"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full py-5 bg-brand-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 overflow-hidden"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Get Access Key</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-8 border-t border-white/5 flex flex-col items-center space-y-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck size={12} />
                    Back to Admin Login
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <button
                  onClick={() => {
                    dispatch(resetOTPSent());
                    setStep('phone');
                    setOtpArray(['', '', '', '', '', '']);
                  }}
                  className="flex items-center space-x-2 text-brand-500 font-bold text-xs hover:translate-x-[-4px] transition-transform"
                >
                  <ChevronLeft size={16} />
                  <span>Use different identity</span>
                </button>

                <div>
                  <h3 className="text-xl font-black tracking-tight mb-2">Verify ID</h3>
                  <p className="text-xs text-slate-400 font-medium">Authentication code sent to <span className="text-white font-bold tracking-widest">{phone}</span></p>
                </div>

                {successMessage && <Success message={successMessage} />}
                {error && <ErrorComp message={error} onClose={() => dispatch(clearError())} />}

                <form onSubmit={handleVerifyOTP} className="space-y-8">
                  <div className="flex justify-between gap-2 md:gap-3">
                    {otpArray.map((digit, i) => (
                      <input
                        title='verify otp'
                        key={i}
                        ref={(el) => { otpInputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        className="w-full aspect-square text-center text-xl font-black rounded-xl bg-slate-900 border border-white/5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-white"
                        required
                      />
                    ))}
                  </div>

                  {demoOTP && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(demoOTP);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`flex items-center space-x-1 text-[10px] font-black tracking-widest uppercase ${copied ? 'text-emerald-500' : 'text-slate-500 hover:text-brand-500'}`}
                      >
                        {copied ? <Check size={10} /> : <Copy size={10} />}
                        <span>{copied ? 'Copied' : `Test Key: ${demoOTP}`}</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otpArray.join('').length < 6}
                    className="w-full py-5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {loading ? 'Validating...' : 'Unlock Station'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center space-x-8 text-white/20">
          <div className="flex flex-col items-center gap-2">
            <Users size={16} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Waiters</span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-2">
            <ChefHat size={16} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Chefs</span>
          </div>
        </div>
      </div>
      <div id="recaptcha-staff-container"></div>
    </div>
  );
};

export default StaffLoginPage;

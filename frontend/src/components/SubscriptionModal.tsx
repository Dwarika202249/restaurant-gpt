import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  ArrowRight,
  Gem
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { upgradeToPremium } from '@/store/slices/restaurantSlice';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose,
  restaurantName 
}) => {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<'plan' | 'processing' | 'success'>('plan');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('plan');
      setLoading(false);
    }
  }, [isOpen]);

  const handleUpgrade = async () => {
    setStep('processing');
    setLoading(true);
    
    // Simulate payment sequence
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      await dispatch(upgradeToPremium()).unwrap();
      setStep('success');
    } catch (error) {
      console.error('Upgrade failed:', error);
      setStep('plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              title="Close Modal"
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-20"
            >
              <X size={24} />
            </button>

            {step === 'plan' && (
              <div className="p-10 md:p-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                    <Gem size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">AI Growth Engine</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Subscription for {restaurantName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap size={64} />
                    </div>
                    <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-4">Core AI</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span>Menu Description Generator</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span>Marketing Copy Hub</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 opacity-40">
                         <span>Business Analyst</span>
                      </li>
                    </ul>
                    <p className="mt-6 text-xl font-black text-slate-900 dark:text-white">FREE <span className="text-xs font-bold text-slate-400 ml-1">Included</span></p>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-2 border-brand-500 shadow-2xl shadow-brand-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles size={64} />
                    </div>
                    <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-4">AI Business Analyst</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-xs font-bold opacity-80">
                        <CheckCircle2 size={14} className="text-brand-500" />
                        <span>Predictive Revenue Engine</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs font-bold opacity-80">
                        <CheckCircle2 size={14} className="text-brand-500" />
                        <span>Inventory Optimization AI</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs font-bold opacity-80">
                        <CheckCircle2 size={14} className="text-brand-500" />
                        <span>Menu Profitability Audit</span>
                      </li>
                    </ul>
                    <p className="mt-6 text-xl font-black italic tracking-tighter uppercase whitespace-nowrap">₹999 <span className="text-[8px] font-black opacity-40 ml-1 italic">/ MONTH</span></p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <button 
                    onClick={handleUpgrade}
                    className="w-full h-20 bg-brand-500 hover:bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] italic text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20"
                  >
                    Activate AI Pro Tier <ArrowRight size={20} />
                  </button>
                  <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                     <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure NexaPay</div>
                     <div className="w-1 h-1 rounded-full bg-slate-300" />
                     <div className="flex items-center gap-1.5"><CreditCard size={14} /> Global Access</div>
                  </div>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="p-20 text-center">
                <div className="relative w-32 h-32 mx-auto mb-10">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-slate-100 dark:border-white/5 border-t-brand-500 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-brand-500">
                    <Loader2 size={48} className="animate-spin" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight mb-4">Verifying Transaction</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">Connecting to NexaPay secure tunnels... Your AI Business Analyst is almost ready.</p>
              </div>
            )}

            {step === 'success' && (
              <div className="p-20 text-center relative">
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-32 h-32 bg-emerald-500 text-white rounded-full mx-auto mb-10 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                >
                  <CheckCircle2 size={64} strokeWidth={3} />
                </motion.div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight mb-4">AI PRO ACTIVATED</h3>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-12">Congratulations! Your restaurant now has full access to predictive intelligence and business optimization tools.</p>
                <button 
                  onClick={onClose}
                  className="px-12 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Start Deep Analysis
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

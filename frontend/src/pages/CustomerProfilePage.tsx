import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, ShieldCheck, ArrowRight, Save, ChevronLeft, Loader2 } from 'lucide-react';
import { CustomerLayout } from '@/components';
import { useTabTitle } from '@/hooks';
import axios from 'axios';

interface GuestSession {
  sessionId: string;
  restaurantId: string;
  restaurantSlug: string;
  tableNo: number;
  sessionToken: string;
  restaurantName: string;
  restaurantLogo?: string;
  themeColor: string;
}

export const CustomerProfilePage = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useTabTitle('My Profile');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const init = async () => {
      try {
        const storedSession = localStorage.getItem('guestSession');
        const storedUser = localStorage.getItem('customerUser');
        
        if (!storedSession || !storedUser) {
           navigate(`/r/${restaurantSlug}/table/1`); // Fallback
           return;
        }

        const session = JSON.parse(storedSession);
        const user = JSON.parse(storedUser);
        
        setGuestSession(session);
        setCustomerUser(user);
        setName(user.name || '');
        setEmail(user.email || '');
      } catch (err) {
        console.error('Failed to init profile page');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [restaurantSlug, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestSession) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const customerToken = localStorage.getItem('customerToken');
      
      const response = await axios.put(`${API_URL}/auth/customer/profile`, 
        { name, email },
        { 
          headers: { 
            Authorization: `Bearer ${customerToken || guestSession.sessionToken}` 
          } 
        }
      );

      const updatedUser = response.data.data.user;
      localStorage.setItem('customerUser', JSON.stringify(updatedUser));
      setCustomerUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <CustomerLayout
      restaurantName={guestSession?.restaurantName || 'Restaurant'}
      restaurantLogo={guestSession?.restaurantLogo}
      themeColor={guestSession?.themeColor}
      tableNo={guestSession?.tableNo || 0}
      onLogout={() => { localStorage.removeItem('guestSession'); navigate(`/r/${restaurantSlug}/table/1`); }}
      customerUser={customerUser}
    >
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Menu</span>
        </button>

        <div className="mb-12">
           <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">Member Profile</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Manage your digital identity at {guestSession?.restaurantName}</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5"
        >
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            {/* Phone (ReadOnly) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">Verified Phone</label>
              <div className="relative group">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={customerUser?.phone} 
                  disabled
                  title="Verified Phone Number"
                  placeholder="Not provided"
                  className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 rounded-3xl font-bold text-slate-400 cursor-not-allowed"
                />
                <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">Display Name</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="How should we address you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-3xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="For invoices and rewards"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-3xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>
            </div>

            {message.text && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
              >
                {message.text}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Update Profile Information
            </button>
          </form>
        </motion.div>

        {/* Security Info Card */}
        <div className="mt-12 p-8 bg-brand-500/5 rounded-[2.5rem] border border-brand-500/10">
           <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Your Data is Secure</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">We use your information only to personalize your dining experience and manage your rewards. Your phone number is verified via OTP for maximum security.</p>
              </div>
           </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfilePage;

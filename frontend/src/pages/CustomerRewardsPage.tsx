import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Star,
  Gift,
  Ticket,
  ArrowRight,
  Sparkles,
  Zap,
  Flame,
  Medal,
  Gem,
  Trophy,
  CheckCircle2,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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

export const CustomerRewardsPage = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loyaltyData, setLoyaltyData] = useState<{ points: number; perks: any[] }>({ points: 0, perks: [] });
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimedReward, setClaimedReward] = useState<any>(null);

  useTabTitle('Rewards & Loyalty');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const init = async () => {
      try {
        const storedSession = localStorage.getItem('guestSession');
        const storedUser = localStorage.getItem('customerUser');

        if (!storedSession || !storedUser) {
          navigate(`/r/${restaurantSlug}/table/1`);
          return;
        }

        const session = JSON.parse(storedSession);
        const user = JSON.parse(storedUser);

        setGuestSession(session);
        setCustomerUser(user);
      } catch (err) {
        console.error('Failed to init rewards page');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [restaurantSlug, navigate]);

  useEffect(() => {
    if (guestSession && customerUser) {
      fetchLoyalty();
    }
  }, [guestSession, customerUser]);

  const fetchLoyalty = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/marketing/loyalty-balance/${guestSession?.restaurantId}/${customerUser?.id || customerUser?._id}`);
      setLoyaltyData({
        points: data.data.points,
        perks: data.data.perks || []
      });
    } catch (err) {
      console.error('Failed to fetch loyalty balance');
    }
  };

  const handleClaimPerk = async (perk: any) => {
    if (loyaltyData.points < perk.points) return;
    
    setClaiming(perk.id);
    try {
      const response = await axios.post(`${API_URL}/marketing/claim-perk`, {
        restaurantId: guestSession?.restaurantId,
        customerId: customerUser?.id || customerUser?._id,
        perkId: perk.id
      });
      
      setClaimedReward({
        ...perk,
        code: response.data.data.code
      });
      
      // Update local points
      setLoyaltyData(prev => ({
        ...prev,
        points: response.data.data.newBalance
      }));
      
      toast.success('Experience unlocked!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Gift, Ticket, Medal, Gem, Trophy, Star, Flame, Zap
    };
    return icons[iconName] || Gift;
  };

  if (loading) return null;

  return (
    <CustomerLayout
      restaurantName={guestSession?.restaurantName || 'Restaurant'}
      restaurantLogo={guestSession?.restaurantLogo}
      themeColor={guestSession?.themeColor}
      tableNo={guestSession?.tableNo || 0}
      onLogout={() => { 
        const rId = guestSession?.restaurantId;
        localStorage.removeItem('guestSession'); 
        localStorage.removeItem('customerUser');
        localStorage.removeItem('customerToken');
        if (rId) {
          localStorage.removeItem(`cart_${rId}`);
          localStorage.removeItem(`coupon_${rId}`);
          localStorage.removeItem(`points_${rId}`);
        }
        navigate(`/r/${restaurantSlug}/table/1`); 
      }}
      customerUser={customerUser}
    >
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Menu</span>
        </button>

        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">Member Rewards</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Exquisite benefits curated for you at {guestSession?.restaurantName}</p>
        </div>

        {/* Loyalty Points Hero */}
        <div className="relative group mb-12">
          <div className="absolute inset-0 bg-brand-500 blur-3xl opacity-20 dark:opacity-40 rounded-[3rem]" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white text-center shadow-2xl shadow-brand-500/20"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--brand-50)] blur-[120px] rounded-full -mr-40 -mt-40 transition-colors duration-1000" aria-hidden="true" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-[2rem] bg-brand-500 flex items-center justify-center mb-10 shadow-2xl shadow-brand-500/40">
                <Star size={40} strokeWidth={3} className="text-white animate-pulse" />
              </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50 mb-4">Total Loyalty Capital</h3>
                  <div className="flex items-baseline gap-4 mb-4">
                     <span className="text-8xl font-black italic tracking-tighter">{loyaltyData.points}</span>
                     <span className="text-xl font-black uppercase text-brand-500 italic tracking-widest">Points</span>
                  </div>
              <p className="text-sm font-medium text-white/40 max-w-xs leading-relaxed">You're making history! Every visit gets you closer to exclusive culinary rewards.</p>
            </div>
          </motion.div>
        </div>

        {/* Available Rewards Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] italic flex items-center gap-3">
              <Sparkles size={18} className="text-brand-500" /> Unlockable Experiences
            </h4>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {loyaltyData.perks.length > 0 ? loyaltyData.perks.map((reward, i) => {
                 const Icon = getIcon(reward.icon);
                 return (
                   <motion.div 
                     key={reward.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-lg group hover:scale-[1.02] transition-all"
                   >
                      <div className="flex items-center justify-between mb-8">
                         <div className={`p-4 rounded-2xl ${reward.color}`}>
                            <Icon size={24} />
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requirement</p>
                            <p className="text-xl font-black text-brand-500 italic uppercase">{reward.points} Pts</p>
                         </div>
                      </div>
                      <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none mb-6">{reward.title}</h5>
                      
                      <div className="flex items-center justify-between gap-4">
                         <div className="flex-1 h-3 bg-slate-50 dark:bg-slate-950/50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${Math.min(100, (loyaltyData.points / reward.points) * 100)}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-brand-500 rounded-full"
                            />
                         </div>
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                           {Math.min(100, Math.round((loyaltyData.points / reward.points) * 100))}%
                         </span>
                      </div>
                      
                      <button 
                        disabled={loyaltyData.points < reward.points || !!claiming}
                        onClick={() => handleClaimPerk(reward)}
                        className="w-full mt-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 bg-brand-500 text-white shadow-xl hover:scale-105 active:scale-95"
                      >
                        {claiming === reward.id ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : loyaltyData.points >= reward.points ? (
                          <>Claim & Unlock <ArrowRight size={14} /></>
                        ) : (
                          <><Flame size={14} /> {(reward.points - loyaltyData.points)} Pts Needed</>
                        )}
                      </button>
                   </motion.div>
                 );
               }) : (
                 <div className="col-span-2 py-20 text-center bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                   <Star size={40} className="mx-auto mb-4 text-slate-300 animate-pulse" />
                   <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No exclusive perks available at this moment.</p>
                 </div>
               )}
            </div>
        </div>

        {/* Perks Banner */}
        <div className="p-10 bg-slate-950 rounded-[3rem] text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-500/5 transition-opacity opacity-0 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="shrink-0 w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Zap size={40} className="text-brand-500" fill="currentColor" />
            </div>
            <div>
              <h4 className="text-2xl font-black uppercase tracking-tighter italic mb-2">Member Priority Access</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed max-w-sm mb-6">Gold tier members get exclusive priority in our seating queue and specialized monthly menu previews.</p>
              <div className="flex gap-4">
                <span className="px-4 py-2 bg-brand-500 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em]">Queue Priority</span>
                <span className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em]">Event Invites</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {claimedReward && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setClaimedReward(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-0 m-auto w-[90%] max-w-lg h-fit bg-slate-900 border border-white/10 rounded-[4rem] p-12 text-center text-white z-[101] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-500" />
              <div className="absolute -top-24 -left-24 w-60 h-60 bg-brand-500/20 blur-[100px] rounded-full" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-10">
                  <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={3} />
                </div>
                
                <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Experience Unlocked</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10">Your culinary reward is now ready</p>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 group transition-all hover:bg-white/10">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Exclusive Reward Code</p>
                  <div className="text-4xl font-black italic tracking-tighter text-brand-500 mb-3">{claimedReward.code}</div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{claimedReward.description}</p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => navigate(`/r/${restaurantSlug}/menu`)}
                    className="w-full py-6 bg-brand-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 transition-all"
                  >
                    Go Use Reward →
                  </button>
                  <button 
                    onClick={() => setClaimedReward(null)}
                    className="w-full py-6 bg-white/5 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                  >
                    Close for now
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </CustomerLayout>
  );
};

export default CustomerRewardsPage;

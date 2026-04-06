import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Gift, 
  Settings, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Users, 
  Sparkles,
  TrendingUp,
  RefreshCw,
  X,
  Target,
  Layout,
  Clock,
  CheckCircle,
  Info,
  Star,
  Trophy,
  Medal,
  Gem,
  Zap,
  Flame,
  PlusCircle,
  Save,
  ArrowRight
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { VITE_API_URL } from '@/config/env';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTabTitle } from '@/hooks';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  expiryDate?: string;
  status: 'active' | 'inactive' | 'expired';
  usedCount: number;
  description: string;
}

interface LoyaltySettings {
  enabled: boolean;
  earnRate: number;
  redeemRate: number;
  minPointsToRedeem: number;
  maxRedemptionPercentage: number;
}

interface LoyaltyPerk {
  id: string;
  title: string;
  points: number;
  icon: string;
  color: string;
  description: string;
}

export const MarketingPage = () => {
  useTabTitle('Marketing Hub | Studio');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [isSavingLoyalty, setIsSavingLoyalty] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingPerkAI, setIsGeneratingPerkAI] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [showPerkDeleteModal, setShowPerkDeleteModal] = useState(false);
  const [perkDeleteTarget, setPerkDeleteTarget] = useState<LoyaltyPerk | null>(null);

  // Loyalty State
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>({
    enabled: true,
    earnRate: 10,
    redeemRate: 1,
    minPointsToRedeem: 100,
    maxRedemptionPercentage: 50
  });
  const [perks, setPerks] = useState<LoyaltyPerk[]>([]);
  const [showPerkModal, setShowPerkModal] = useState(false);
  const [newPerk, setNewPerk] = useState<Partial<LoyaltyPerk>>({
    title: '',
    points: 100,
    icon: 'Gift',
    color: 'text-brand-500 bg-brand-500/10',
    description: ''
  });

  // Form State for New Coupon
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minOrderAmount: 0,
    expiryDate: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      const API_URL = VITE_API_URL;
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [couponRes, restaurantRes] = await Promise.all([
        axios.get(`${API_URL}/marketing/coupons`, { headers }),
        axios.get(`${API_URL}/restaurant/profile`, { headers })
      ]);
      setCoupons(couponRes.data.data);
      if (restaurantRes.data.data.loyaltySettings) {
        setLoyaltySettings(restaurantRes.data.data.loyaltySettings);
        setPerks(restaurantRes.data.data.loyaltySettings.perks || []);
      }
    } catch (error) {
      toast.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchData();
    
    // Auto-open modal if redirected from Admin with action=new
    if (searchParams.get('action') === 'new') {
      setShowCouponModal(true);
    }
  }, [searchParams]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_URL = VITE_API_URL;
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_URL}/marketing/coupons/create`, newCoupon, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Coupon created successfully!');
      setShowCouponModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    setDeleteTarget(coupon);
    setShowDeleteModal(true);
  };

  const confirmDeleteCoupon = async () => {
    if (!deleteTarget) return;
    try {
      const API_URL = VITE_API_URL;
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/marketing/coupons/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Coupon deleted');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleSaveLoyaltySettings = async () => {
    setIsSavingLoyalty(true);
    try {
      const API_URL = VITE_API_URL;
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_URL}/marketing/loyalty-settings`, loyaltySettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Loyalty rules updated');
    } catch (error) {
      toast.error('Failed to update loyalty settings');
    } finally {
      setIsSavingLoyalty(false);
    }
  };

  const handleAddPerk = async () => {
    if (!newPerk.title || !newPerk.points) {
      toast.error('Title and points are required');
      return;
    }
    try {
      const API_URL = VITE_API_URL;
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_URL}/marketing/perks`, newPerk, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerks([...perks, response.data.data]);
      setShowPerkModal(false);
      setNewPerk({
        title: '',
        points: 100,
        icon: 'Gift',
        color: 'text-brand-500 bg-brand-500/10',
        description: ''
      });
      toast.success('Perk created successfully');
    } catch (error) {
      toast.error('Failed to create perk');
    }
  };

  const handleDeletePerk = (perk: LoyaltyPerk) => {
    setPerkDeleteTarget(perk);
    setShowPerkDeleteModal(true);
  };

  const confirmDeletePerk = async () => {
    if (!perkDeleteTarget) return;
    try {
      const API_URL = VITE_API_URL;
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/marketing/perks/${perkDeleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerks(perks.filter(p => p.id !== perkDeleteTarget.id));
      toast.success('Perk removed from vault');
      setShowPerkDeleteModal(false);
      setPerkDeleteTarget(null);
    } catch (error) {
      toast.error('Failed to delete perk');
    }
  };

  const handleGenerateAI = async () => {
    if (!newCoupon.code || !newCoupon.value) {
      toast.error('Please enter a code and value first');
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const API_URL = VITE_API_URL;
      const token = localStorage.getItem('accessToken');
      const { data } = await axios.post(`${API_URL}/marketing/generate-description`, {
        code: newCoupon.code,
        discountType: newCoupon.discountType,
        value: newCoupon.value,
        minOrderAmount: newCoupon.minOrderAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCoupon(prev => ({ ...prev, description: data.data }));
      toast.success('Magic Write complete!');
    } catch (error) {
      toast.error('Failed to generate AI description');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGeneratePerkAI = async () => {
    if (!newPerk.title || !newPerk.points) {
      toast.error('Title and points are required to generate AI text');
      return;
    }
    
    setIsGeneratingPerkAI(true);
    try {
      const API_URL = VITE_API_URL;
      const token = localStorage.getItem('accessToken');
      const { data } = await axios.post(`${API_URL}/marketing/generate-perk-description`, {
        title: newPerk.title,
        points: newPerk.points
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPerk(prev => ({ ...prev, description: data.data }));
      toast.success('Perk essence captured!');
    } catch (error) {
      toast.error('Failed to generate AI description');
    } finally {
      setIsGeneratingPerkAI(false);
    }
  };

  const PERK_ICONS = [
    { name: 'Gift', icon: Gift },
    { name: 'Ticket', icon: Ticket },
    { name: 'Medal', icon: Medal },
    { name: 'Gem', icon: Gem },
    { name: 'Trophy', icon: Trophy },
    { name: 'Star', icon: Star },
    { name: 'Flame', icon: Flame },
    { name: 'Zap', icon: Zap }
  ];

  const PERK_COLORS = [
    { name: 'Brand Orange', class: 'text-brand-500 bg-brand-500/10' },
    { name: 'Emerald Green', class: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Vivid Blue', class: 'text-blue-500 bg-blue-500/10' },
    { name: 'Royal Purple', class: 'text-purple-500 bg-purple-500/10' },
    { name: 'Rose Red', class: 'text-rose-500 bg-rose-500/10' },
    { name: 'Amber Gold', class: 'text-amber-500 bg-amber-500/10' }
  ];

  if (loading) return <div className="flex h-96 items-center justify-center"><RefreshCw className="animate-spin text-brand-500" /></div>;

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              Marketing Hub <Sparkles className="text-amber-500 h-8 w-8" />
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Grow your business with rewards and offers</p>
          </div>
          <button 
            onClick={() => setShowCouponModal(true)}
            title="Create a new promotional coupon"
            aria-label="New Coupon"
            className="px-8 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2"
          >
            <Plus size={16} /> New Coupon
          </button>
        </div>

        {/* Loyalty Studio Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-10"
        >
          {/* Points Rules Configuration */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-[2px] bg-amber-500 rounded-full" />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Loyalty Studio</h3>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Economics</h2>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-2xl space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Earn Rate</label>
                  <span className="text-xs font-black text-amber-500 italic uppercase">₹100 = {loyaltySettings.earnRate} Pts</span>
                </div>
                <input 
                  type="range" min="1" max="50" step="1"
                  value={loyaltySettings.earnRate}
                  onChange={(e) => setLoyaltySettings({...loyaltySettings, earnRate: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-amber-500 cursor-pointer"
                  title="Earn Rate Slider"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redeem Value</label>
                  <span className="text-xs font-black text-emerald-500 italic uppercase">100 Pts = ₹{loyaltySettings.redeemRate * 10}</span>
                </div>
                <input 
                  type="range" min="0.1" max="5" step="0.1"
                  value={loyaltySettings.redeemRate}
                  onChange={(e) => setLoyaltySettings({...loyaltySettings, redeemRate: parseFloat(e.target.value)})}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-emerald-500 cursor-pointer"
                  title="Redeem Rate Slider"
                />
              </div>

              <button 
                onClick={handleSaveLoyaltySettings}
                disabled={isSavingLoyalty}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSavingLoyalty ? 'Saving Rules...' : <><Save size={14} /> Update Rules</>}
              </button>
            </div>
          </div>

          {/* Dynamic Perks Manager */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Active Perks</h2>
              <button 
                onClick={() => setShowPerkModal(true)}
                className="flex items-center gap-2 text-brand-500 hover:text-brand-600 transition-colors py-2 px-1 rounded-xl"
              >
                <PlusCircle size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Forge New Experience</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {perks.length > 0 ? perks.map((perk) => (
                <motion.div 
                  key={perk.id}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-white/5 shadow-xl relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeletePerk(perk)}
                      className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                      title="Delete this loyalty perk"
                      aria-label="Delete loyalty perk"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${perk.color} shadow-inner`}>
                      {(() => {
                        const Icon = PERK_ICONS.find(i => i.name === perk.icon)?.icon || Gift;
                        return <Icon size={24} />;
                      })()}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-brand-500 uppercase tracking-[0.2em]">{perk.points} Points Req</p>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{perk.title}</h4>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-2 leading-relaxed">{perk.description}</p>
                </motion.div>
              )) : (
                <div className="col-span-2 py-12 text-center bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                  <Star size={32} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No loyalty perks defined yet.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Coupons List */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-10">
            <span className="w-8 h-[2px] bg-brand-500 rounded-full" />
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Campaigns</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 shadow-2xl">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {coupons.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-300 space-y-4">
                  <AlertCircle size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest">No coupons created yet</p>
                </div>
              ) : coupons.map(coupon => (
                <motion.div 
                  layout key={coupon._id}
                  className="group flex gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl"
                >
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/5 shadow-sm text-brand-500 font-black text-xl italic group-hover:rotate-12 transition-transform">
                    {coupon.discountType === 'percentage' ? '%' : '₹'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-xs uppercase tracking-[0.2em]">{coupon.code}</span>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        coupon.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {coupon.status}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 mt-2">{coupon.description || `Get ${coupon.value}${coupon.discountType === 'percentage' ? '%' : ''} OFF on orders above ₹${coupon.minOrderAmount}`}</p>
                    <div className="mt-4 flex items-center gap-8 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><RefreshCw size={10} /> {coupon.usedCount} Uses</span>
                      {coupon.expiryDate && <span className="flex items-center gap-2"><Calendar size={10} /> Valid until {new Date(coupon.expiryDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteCoupon(coupon)}
                    className="self-center p-3 text-slate-300 hover:text-rose-500 transition-colors"
                    title="Delete this coupon"
                    aria-label="Delete Coupon"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Coupon Modal */}
        <AnimatePresence>
          {showCouponModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-10 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowCouponModal(false)} 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl pointer-events-auto" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-3xl pointer-events-auto max-h-[90vh] overflow-y-auto scrollbar-hide"
              >
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest italic">Forge New Offer</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Create a custom discount code</p>
                  </div>
                  <button 
                    onClick={() => setShowCouponModal(false)} 
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl"
                    title="Close"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateCoupon} className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Coupon Code</label>
                    <input 
                      required type="text"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] px-6 py-4 text-xs font-black uppercase tracking-widest placeholder:opacity-30 focus:ring-4 focus:ring-brand-500/10"
                      placeholder="e.g. WELCOME10"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Type</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] px-6 py-4 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-500/10 appearance-none"
                      value={newCoupon.discountType}
                      onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                      title="Select discount type (Percentage or Fixed)"
                      aria-label="Discount Type"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Value</label>
                    <input 
                      required type="number"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] px-6 py-4 text-xs font-black focus:ring-4 focus:ring-brand-500/10"
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({...newCoupon, value: parseFloat(e.target.value)})}
                      title="Enter discount amount or percentage"
                      placeholder="e.g. 10"
                      aria-label="Discount Value"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Min Order (₹)</label>
                    <input 
                      required type="number"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] px-6 py-4 text-xs font-black focus:ring-4 focus:ring-brand-500/10"
                      value={newCoupon.minOrderAmount}
                      onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: parseFloat(e.target.value)})}
                      title="Minimum amount required to use this coupon"
                      placeholder="0"
                      aria-label="Minimum Order Amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Expiry Date</label>
                    <input 
                      type="date"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] px-6 py-4 text-xs font-black focus:ring-4 focus:ring-brand-500/10"
                      value={newCoupon.expiryDate}
                      onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                      title="Optional expiry date for the coupon"
                      aria-label="Expiry Date"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                      <button 
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={isGeneratingAI}
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors disabled:opacity-50"
                      >
                        {isGeneratingAI ? (
                          <RefreshCw size={10} className="animate-spin" />
                        ) : (
                          <Sparkles size={10} />
                        )}
                        {isGeneratingAI ? 'Generating...' : 'Magic Write'}
                      </button>
                    </div>
                    <textarea 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-brand-500/10 h-24 resize-none"
                      placeholder="Brief note for the offer..."
                      value={newCoupon.description}
                      onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="col-span-2 py-5 bg-brand-500 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Launch Campaign
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && deleteTarget && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl pointer-events-auto" 
                onClick={() => setShowDeleteModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md overflow-hidden shadow-3xl pointer-events-auto p-10 border border-slate-100 dark:border-white/5"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-rose-500">
                    <Trash2 size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Abolish Campaign?</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-8 leading-relaxed">
                    Are you sure you want to end <span className="text-rose-500 italic">"{deleteTarget.code}"</span>? This action is permanent and cannot be undone.
                  </p>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={confirmDeleteCoupon}
                      className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      End Campaign
                    </button>
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Wait, Keep It
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Perk Delete Confirmation Modal */}
        <AnimatePresence>
          {showPerkDeleteModal && perkDeleteTarget && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm pointer-events-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={() => setShowPerkDeleteModal(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md overflow-hidden shadow-3xl pointer-events-auto p-10 border border-slate-100 dark:border-white/5"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-rose-500">
                    <Trash2 size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Abolish Perk?</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="text-rose-500 italic">"{perkDeleteTarget.title}"</span>? Customers will no longer be able to claim this experience.
                  </p>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={confirmDeletePerk}
                      className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Abolish Perk
                    </button>
                    <button 
                      onClick={() => setShowPerkDeleteModal(false)}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Keep Perk
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Perk Selection Modal */}
        <AnimatePresence>
          {showPerkModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setShowPerkModal(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                className="relative bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-3xl p-10 border border-slate-100 dark:border-white/5"
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Forge Perk</h2>
                  <button onClick={() => setShowPerkModal(false)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Close modal" aria-label="Close modal">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8 max-h-[65vh] overflow-y-auto no-scrollbar pr-2">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience Title *</label>
                      <input 
                        type="text" 
                        value={newPerk.title}
                        onChange={(e) => setNewPerk({...newPerk, title: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        placeholder="e.g. Vintage Vine"
                        title="Experience Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Points Needed *</label>
                      <input 
                        type="number" 
                        value={newPerk.points}
                        onChange={(e) => setNewPerk({...newPerk, points: parseInt(e.target.value)})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        placeholder="500"
                        title="Points Requirement"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Signature Icon</label>
                    <div className="grid grid-cols-8 gap-3">
                      {PERK_ICONS.map((i) => (
                        <button 
                          key={i.name}
                          onClick={() => setNewPerk({...newPerk, icon: i.name})}
                          className={`p-3 rounded-xl flex items-center justify-center transition-all ${newPerk.icon === i.name ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-500'}`}
                          title={i.name}
                        >
                          <i.icon size={18} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Palette</label>
                    <div className="grid grid-cols-3 gap-3">
                      {PERK_COLORS.map((c) => (
                        <button 
                          key={c.name}
                          onClick={() => setNewPerk({...newPerk, color: c.class})}
                          className={`py-3 px-4 rounded-xl flex items-center gap-2 text-[8px] font-black uppercase tracking-widest transition-all ${newPerk.color === c.class ? 'border-2 border-brand-500 bg-brand-500/5 text-brand-500' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}
                        >
                          <div className={`w-3 h-3 rounded-full ${c.class.split(' ')[1]}`} />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="perk-essence" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience Essence (Description)</label>
                      <button 
                        onClick={handleGeneratePerkAI}
                        disabled={isGeneratingPerkAI}
                        className="flex items-center gap-1.5 text-[9px] font-black text-brand-500 uppercase tracking-widest hover:text-brand-600 transition-colors disabled:opacity-50"
                        title="Generate AI Description"
                      >
                        {isGeneratingPerkAI ? (
                          <RefreshCw size={10} className="animate-spin" />
                        ) : (
                          <Sparkles size={10} />
                        )}
                        Magic Write
                      </button>
                    </div>
                    <textarea 
                      id="perk-essence"
                      value={newPerk.description}
                      onChange={(e) => setNewPerk({...newPerk, description: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all h-24"
                      placeholder="Describe the magical moment customers will unlock..."
                      title="Perk Description"
                    />
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={handleAddPerk}
                    className="flex-1 py-5 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                    title="Finish and create this perk"
                    aria-label="Forge Experience"
                  >
                    Forge Experience <ArrowRight size={14} />
                  </button>
                  <button 
                    onClick={() => setShowPerkModal(false)}
                    className="px-10 py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                  >
                    Discard
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
};

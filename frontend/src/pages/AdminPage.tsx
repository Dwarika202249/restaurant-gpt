import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { VITE_API_URL } from '@/config/env';
import { useTabTitle } from '@/hooks';
import { updateAdminProfile } from '@/store/slices/authSlice';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { socketService } from '@/services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Edit3,
  Save,
  ShieldCheck,
  UserCheck,
  Users,
  Ticket,
  TrendingUp,
  Clock,
  Plus,
  Palette,
  Image as ImageIcon,
  Store,
  CheckCircle2,
  ChefHat,
  Trash2,
  Zap,
  LayoutGrid,
  Activity,
  Pencil,
  XCircle
} from 'lucide-react';
import { Error, Success } from '@/components';
import axios from 'axios';

const AdminPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  useTabTitle('Restaurant Settings');

  useEffect(() => {
    if (!user && isAuthenticated) {
      dispatch(fetchAdminUser());
    }
  }, [user, isAuthenticated, dispatch]);

  useEffect(() => {
    if (user && user.restaurantId) {
      socketService.connect();
      socketService.joinRestaurantChannel(user.restaurantId);

      const socket = socketService.getSocket();
      if (socket) {
        socket.on('staff-duty-changed', ({ userId, onDuty }) => {
          setStaff((prevStaff) => 
            prevStaff.map((member) => 
              member._id === userId ? { ...member, onDuty } : member
            )
          );
        });
      }

      return () => {
        if (socket) {
          socket.off('staff-duty-changed');
        }
      };
    }
  }, [user]);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'customers' | 'coupons' | 'branding' | 'staff'>('profile');

  // CRM & Branding Data
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [restaurantProfile, setRestaurantProfile] = useState<any>(null);
  const [isLoadingCrm, setIsLoadingCrm] = useState(false);
  const [autoPilot, setAutoPilot] = useState(true);

  // Assignment Modal State
  const [assigningStaff, setAssigningStaff] = useState<any>(null);
  const [newAssignments, setNewAssignments] = useState<number[]>([]);

  // Branding Form
  const [brandingForm, setBrandingForm] = useState({
    name: '',
    logoUrl: '',
    themeColor: '#ff9500',
    currency: 'INR',
    tablesCount: 10
  });

  // Staff Form
  const [staffForm, setStaffForm] = useState({
    name: '',
    phone: '',
    role: 'waiter' as 'waiter' | 'chef'
  });
  const [editingStaff, setEditingStaff] = useState<any>(null);

  const API_URL = VITE_API_URL;

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    } else if (activeTab === 'branding') {
      fetchRestaurantProfile();
    } else if (activeTab === 'staff') {
      fetchStaff();
    }
  }, [activeTab]);

  const fetchRestaurantProfile = async () => {
    setIsLoadingCrm(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/restaurant/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data;
      setRestaurantProfile(data);
      setAutoPilot(data.autoPilot ?? true);
      setBrandingForm({
        name: data.name || '',
        logoUrl: data.logoUrl || '',
        themeColor: data.themeColor || '#ff9500',
        currency: data.currency || 'INR',
        tablesCount: data.tablesCount || 10
      });
    } catch (err) {
      console.error('Failed to fetch restaurant profile');
    } finally {
      setIsLoadingCrm(false);
    }
  };

  const handleUpdateBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { updateRestaurantProfile } = await import('@/store/slices/restaurantSlice');
      await dispatch(updateRestaurantProfile(brandingForm) as any).unwrap();
      setSuccess('Restaurant branding and fleet capacity updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update branding');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoPilot = async () => {
    setLoading(true);
    try {
      const { updateRestaurantProfile } = await import('@/store/slices/restaurantSlice');
      const response = await dispatch(updateRestaurantProfile({ autoPilot: !autoPilot }) as any).unwrap();
      setAutoPilot(response.autoPilot);
      setSuccess(`Load Balancing: ${response.autoPilot ? 'AUTO-PILOT' : 'MANUAL'}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to sync Auto-Pilot preference');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setIsLoadingCrm(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/restaurant/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch customers');
    } finally {
      setIsLoadingCrm(false);
    }
  };

  const fetchStaff = async () => {
    setIsLoadingCrm(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/restaurant/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data.data);
    } catch (err) {
      console.error('Failed to fetch staff');
    } finally {
      setIsLoadingCrm(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (editingStaff) {
        await axios.put(`${API_URL}/restaurant/staff/${editingStaff._id}`, staffForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Staff details updated successfully');
      } else {
        await axios.post(`${API_URL}/restaurant/staff`, staffForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Staff member registered successfully');
      }

      setStaffForm({ name: '', phone: '', role: 'waiter' });
      setEditingStaff(null);
      fetchStaff();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync staff identity');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (member: any) => {
    setEditingStaff(member);
    setStaffForm({
      name: member.name,
      phone: member.phone,
      role: member.role
    });
    // Scroll to form on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/restaurant/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
      setSuccess('Staff member removed.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to remove staff');
    }
  };

  const handleUpdateAssignments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStaff) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_URL}/restaurant/staff/${assigningStaff._id}/assignments`, {
        assignedTables: newAssignments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Assignments updated for ${assigningStaff.name}`);
      setAssigningStaff(null);
      fetchStaff();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to update assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setIsLoadingCrm(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/restaurant/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(response.data.data);
    } catch (err) {
      console.error('Failed to fetch coupons');
    } finally {
      setIsLoadingCrm(false);
    }
  };

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

  const tabClass = (tab: typeof activeTab) => `px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto scrollbar-hide">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
            <span className="w-8 h-[2px] bg-brand-500" />
            <span>Identity & Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Restaurant HQ
            <ShieldCheck className="text-brand-500" size={32} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Control your restaurant's digital presence, loyalty, and look.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('profile')} className={tabClass('profile')}>Profile</button>
          <button onClick={() => setActiveTab('branding')} className={tabClass('branding')}>Branding</button>
          <button onClick={() => setActiveTab('staff')} className={tabClass('staff')}>Staff</button>
          <button onClick={() => setActiveTab('customers')} className={tabClass('customers')}>CRM</button>
          <button onClick={() => setActiveTab('coupons')} className={tabClass('coupons')}>Coupons</button>
        </div>
      </motion.div>

      {error && <Error message={error} onClose={() => setError(null)} className="mb-6" />}
      {success && <Success message={success} className="mb-6" />}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Content (Keeping existing logic) */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-1">
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

              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-10 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-slate-200"
                >
                  <Edit3 size={12} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
            <div className="glass dark:glass-dark p-8 md:p-10 rounded-[2.5rem]">
              <AnimatePresence mode="wait">
                {!editMode ? (
                  <motion.div key="view-fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
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
                        <span className="text-[10px] font-black uppercase tracking-widest">Phone Number</span>
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{user.phone}</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="admin-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                      <input id="admin-name" name="name" value={form.name} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none" placeholder="Enter full name" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="admin-email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address *</label>
                      <input id="admin-email" name="email" value={form.email} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none" placeholder="Enter email address" required />
                    </div>
                    <div className="flex items-center space-x-4 pt-6">
                      <button type="submit" disabled={loading} className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        <Save size={16} /> Sync Changes
                      </button>
                      <button type="button" onClick={() => setEditMode(false)} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-all">Cancel</button>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-1">
            <div className="glass dark:glass-dark p-8 rounded-[2.5rem] flex flex-col items-center text-center">
              <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-8">Live Visual Preview</h3>
              <div
                className="w-full aspect-video rounded-3xl mb-6 shadow-2xl relative overflow-hidden flex items-center justify-center border-4 border-white dark:border-slate-800"
                style={{ backgroundColor: brandingForm.themeColor + '10' }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ background: `linear-gradient(45deg, ${brandingForm.themeColor}, transparent)` }}
                />
                {brandingForm.logoUrl ? (
                  <img src={brandingForm.logoUrl} alt="Logo Preview" className="w-20 h-20 object-contain relative z-10" />
                ) : (
                  <ImageIcon size={40} className="text-slate-300 relative z-10" />
                )}
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{brandingForm.name || 'Your Brand'}</h4>
              <button
                disabled
                style={{ backgroundColor: brandingForm.themeColor }}
                className="mt-6 w-full py-4 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg opacity-80"
              >
                Brand Button Style
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="glass dark:glass-dark p-8 md:p-10 rounded-[2.5rem]">
              <form onSubmit={handleUpdateBranding} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="brand-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Store size={12} /> Restaurant Name
                  </label>
                  <input
                    id="brand-name"
                    value={brandingForm.name}
                    onChange={(e) => setBrandingForm({ ...brandingForm, name: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none"
                    placeholder="e.g. Dwar Da Dhaba"
                    title="Enter Restaurant Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="brand-logo" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <ImageIcon size={12} /> Logo URL
                  </label>
                  <input
                    id="brand-logo"
                    value={brandingForm.logoUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none"
                    placeholder="https://example.com/logo.png"
                    title="Enter Logo URL"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="brand-color-picker" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Palette size={12} /> Brand Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="brand-color-picker"
                        type="color"
                        value={brandingForm.themeColor}
                        onChange={(e) => setBrandingForm({ ...brandingForm, themeColor: e.target.value })}
                        className="w-14 h-14 bg-transparent border-none p-0 cursor-pointer rounded-xl overflow-hidden"
                        title="Pick Theme Color"
                      />
                      <input
                        id="brand-color-text"
                        value={brandingForm.themeColor}
                        onChange={(e) => setBrandingForm({ ...brandingForm, themeColor: e.target.value })}
                        className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black uppercase tracking-widest text-xs focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none"
                        placeholder="#FF9500"
                        title="Enter Hex Color Code"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="brand-currency" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <TrendingUp size={12} /> Currency
                    </label>
                    <select
                      id="brand-currency"
                      value={brandingForm.currency}
                      onChange={(e) => setBrandingForm({ ...brandingForm, currency: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none"
                      title="Select Currency"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="brand-tables" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Users size={12} /> Total Tables
                    </label>
                    <input
                      id="brand-tables"
                      type="number"
                      min="1"
                      max="100"
                      value={brandingForm.tablesCount}
                      onChange={(e) => setBrandingForm({ ...brandingForm, tablesCount: parseInt(e.target.value) || 1 })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none"
                      title="Total Number of Tables"
                    />
                  </div>
                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" /> : <><Save size={18} /> Update Visual Identity</>}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass dark:glass-dark p-6 rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Members</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{customers.length}</p>
                </div>
              </div>
            </div>
            <div className="glass dark:glass-dark p-6 rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loyalty Volume</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    ₹{customers.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="glass dark:glass-dark p-6 rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                  <Ticket className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retention Rate</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {Math.round((customers.filter(c => c.orderCount > 1).length / (customers.length || 1)) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass dark:glass-dark rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Member Registry</h3>
              <button onClick={fetchCustomers} className="text-xs font-black text-brand-500 uppercase tracking-widest hover:underline">Refresh List</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Customer</th>
                    <th className="px-8 py-4 text-center">Visit Frequency</th>
                    <th className="px-8 py-4 text-center">Lifetime Value</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoadingCrm ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Member Data...</td></tr>
                  ) : customers.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No members found yet.</td></tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500 font-black">
                              {customer.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{customer.name}</p>
                              <p className="text-[10px] font-bold text-slate-500">{customer.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">
                            <Clock size={10} />
                            {customer.orderCount} Orders
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center font-black text-slate-900 dark:text-white tracking-tight">₹{customer.totalSpent.toLocaleString()}</td>
                        <td className="px-8 py-6 text-right">
                          <button
                            title="Award Coupon"
                            className="p-2 text-slate-400 hover:text-brand-500 transition-colors"
                          >
                            <Ticket size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="space-y-6">
          {/* Coupons Content (Keeping existing logic but slightly polished) */}
          <div className="flex justify-between items-center bg-brand-500 p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-brand-500/20">
            <div className="relative z-10">
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2">Campaign Manager</h3>
              <p className="text-white/80 font-bold max-w-md">Create high-impact discount codes for global or targeted loyalty campaigns.</p>
              <Link
                to="/marketing?action=new"
                className="mt-6 inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl"
              >
                <Plus size={16} />
                New Campaign
              </Link>
            </div>
            <Ticket className="absolute -right-8 -bottom-8 text-white/10 w-64 h-64 rotate-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingCrm ? (
              <div className="col-span-full p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Syncing active campaigns...</div>
            ) : coupons.length === 0 ? (
              <div className="col-span-full p-20 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                No active campaigns. Start one to boost sales!
              </div>
            ) : (
              coupons.map((coupon) => (
                <motion.div key={coupon._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass dark:glass-dark p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 group hover:border-brand-500 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${coupon.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {coupon.status}
                    </span>
                  </div>
                  <div className="space-y-1 mb-6">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{coupon.code}</h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                      {coupon.description || `Valid on orders above ₹${coupon.minOrderAmount}`}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-1"><Users size={12} /> {coupon.usedCount || 0} Uses</div>
                    <div className="flex items-center gap-1"><Clock size={12} /> {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Forever'}</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-1">
            <div className="glass dark:glass-dark p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Recruit Staff</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Waiters & Chefs</p>
                </div>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="staff-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    id="staff-name"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none"
                    placeholder="e.g. Rahul Kumar"
                    title="Enter Staff Full Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="staff-phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <input
                    id="staff-phone"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none"
                    placeholder="10-digit number"
                    title="Enter Staff Mobile Number"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="staff-role" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Role</label>
                  <select
                    id="staff-role"
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold focus:ring-2 focus:ring-brand-500 transition-all dark:text-white border-none"
                    title="Select Staff Role"
                  >
                    <option value="waiter">Waiter (Floor Staff)</option>
                    <option value="chef">Chef (Kitchen Staff)</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {loading ? (editingStaff ? 'Updating...' : 'Adding...') : (editingStaff ? 'Save Changes' : 'Register Staff Member')}
                  </button>
                  {editingStaff && (
                    <button
                      title='Cancel Editing'
                      type="button"
                      onClick={() => {
                        setEditingStaff(null);
                        setStaffForm({ name: '', phone: '', role: 'waiter' });
                      }}
                      className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="glass dark:glass-dark rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Team</h3>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {staff.length} Members
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleAutoPilot}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${autoPilot ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                  >
                    <Zap size={14} className={autoPilot ? 'animate-pulse' : ''} />
                    {autoPilot ? 'Auto-Pilot On' : 'Manual Mode'}
                  </button>
                  <button
                    onClick={fetchStaff}
                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                    title="Refresh Team Status"
                  >
                    <Activity size={16} />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Staff Member</th>
                      <th className="px-8 py-4 text-center">Status & Zone</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoadingCrm ? (
                      <tr><td colSpan={3} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Syncing Team...</td></tr>
                    ) : staff.length === 0 ? (
                      <tr><td colSpan={3} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No staff registered yet. Add your first waiter or chef.</td></tr>
                    ) : (
                      staff.map((member) => (
                        <tr key={member._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg"
                                style={{ backgroundColor: member.staffColor || '#3B82F6' }}
                              >
                                {member.name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{member.name}</p>
                                <p className="text-[10px] font-bold text-slate-500">{member.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${member.role === 'chef' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                {member.role === 'chef' ? <ChefHat size={10} /> : <Users size={10} />}
                                {member.role === 'chef' ? 'Chef' : 'Waiter'}
                              </span>
                              {member.onDuty && (
                                <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                                  Live at Station
                                </span>
                              )}
                              {member.assignedTables?.length > 0 && (
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                  Zone: {member.assignedTables.join(', ')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditClick(member)}
                                className="p-2 text-slate-400 hover:text-brand-500 transition-colors"
                                title="Edit Staff Member"
                              >
                                <Pencil size={18} />
                              </button>
                              {member.role === 'waiter' && (
                                <button
                                  onClick={() => {
                                    setAssigningStaff(member);
                                    setNewAssignments(member.assignedTables || []);
                                  }}
                                  className="p-2 text-slate-400 hover:text-brand-500 transition-colors"
                                  title="Assign Tables"
                                >
                                  <LayoutGrid size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteStaff(member._id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                title="Delete Staff member"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assignment Modal */}
      <AnimatePresence>
        {assigningStaff && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass dark:glass-dark w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Assign Station Zone</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Dedicated Tables for {assigningStaff.name}</p>
                </div>
                <button
                  onClick={() => setAssigningStaff(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="Close modal"
                >
                  <Trash2 size={20} className="text-slate-400 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {Array.from({ length: brandingForm.tablesCount || 10 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        if (newAssignments.includes(num)) {
                          setNewAssignments(newAssignments.filter(n => n !== num));
                        } else {
                          setNewAssignments([...newAssignments, num].sort((a, b) => a - b));
                        }
                      }}
                      className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all ${newAssignments.includes(num) ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <button
                    onClick={handleUpdateAssignments}
                    disabled={loading}
                    className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-500/20 hover:scale-[1.02] transition-all"
                  >
                    {loading ? 'Syncing...' : 'Confirm Zone'}
                  </button>
                  <button
                    onClick={() => setAssigningStaff(null)}
                    className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminPage;

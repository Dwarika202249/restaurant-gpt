import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchRestaurantProfile,
  updateRestaurantProfile,
  setupRestaurant,
  clearError
} from '@/store/slices/restaurantSlice';
import { Error, Success } from '@/components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
  Globe, 
  Hash, 
  Palette, 
  CircleDollarSign, 
  Users, 
  Edit3, 
  Save, 
  X,
  Zap,
  CheckCircle2
} from 'lucide-react';

type PageMode = 'view' | 'edit' | 'setup';

/**
 * RestaurantProfilePage
 * Premium UI for managing restaurant identity and settings.
 */
export const RestaurantProfilePage = () => {
  const dispatch = useAppDispatch();
  const { currentRestaurant: restaurant, loading, error } = useAppSelector(
    (state) => state.restaurant
  );

  const [mode, setMode] = useState<PageMode>('view');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    themeColor: '#F97316',
    currency: 'INR',
    tablesCount: 10
  });

  useEffect(() => {
    if (!restaurant) {
      dispatch(fetchRestaurantProfile());
    } else {
      setFormData({
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl || '',
        themeColor: restaurant.themeColor || '#F97316',
        currency: restaurant.currency || 'INR',
        tablesCount: restaurant.tablesCount || 10
      });
    }
  }, [dispatch, restaurant]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(setupRestaurant(formData) as any);
    if (result.payload) {
      setSuccessMessage('Restaurant created successfully!');
      setMode('view');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const updateData = {
      name: formData.name,
      logoUrl: formData.logoUrl,
      themeColor: formData.themeColor,
      currency: formData.currency,
      tablesCount: formData.tablesCount
    };
    const result = await dispatch(updateRestaurantProfile(updateData) as any);
    if (result.payload) {
      setSuccessMessage('Restaurant updated successfully!');
      setMode('view');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'tablesCount' ? parseInt(value) : value
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto scrollbar-hide">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
            <span className="w-8 h-[2px] bg-brand-500" />
            <span>Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Restaurant Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Manage your brand identity and operational settings.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'view' && restaurant && (
            <motion.button
              key="edit-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setMode('edit')}
              className="flex items-center space-x-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Notifications */}
      <div className="mb-8 space-y-4">
        {error && <Error message={error} onClose={() => dispatch(clearError())} />}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex items-center space-x-3"
          >
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm uppercase tracking-wider">{successMessage}</span>
          </motion.div>
        )}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Left Column: Visual Identity */}
        <motion.div variants={cardVariants} className="md:col-span-1 space-y-8">
          <div className="glass dark:glass-dark p-8 rounded-[2.5rem] flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl group-hover:scale-105 transition-transform duration-500">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store size={48} className="text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 cursor-pointer">
                <Zap size={18} className="fill-current" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize leading-tight">
              {restaurant?.name || 'New Restaurant'}
            </h3>
            <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mt-2">@{restaurant?.slug || 'pending'}</p>
          </div>

          <div className="glass dark:glass-dark p-8 rounded-[2.5rem]">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Visual Theme</h4>
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-2xl shadow-lg border-4 border-white dark:border-slate-800"
                style={{ backgroundColor: formData.themeColor }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{formData.themeColor}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Brand Color</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Settings Form */}
        <motion.div variants={cardVariants} className="md:col-span-2">
          <div className="glass dark:glass-dark p-8 md:p-10 rounded-[2.5rem]">
            {!restaurant && mode === 'view' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Zap size={32} className="text-brand-500 fill-current" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Restaurant Found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">You're almost there! Setup your restaurant profile to start generating QR codes and orders.</p>
                <button
                  onClick={() => setMode('setup')}
                  className="px-10 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 hover:scale-105 transition-all"
                >
                  Create Restaurant
                </button>
              </div>
            ) : mode === 'view' && restaurant ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Store size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Store Name</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{restaurant.name}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Globe size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Web Identifier</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{restaurant.slug}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Users size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Table Capacity</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{restaurant.tablesCount} Tables</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <CircleDollarSign size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Trading Currency</span>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{restaurant.currency}</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-4 opacity-50 italic">
                  <Hash size={16} />
                  <p className="text-xs font-medium text-slate-500">Restaurant ID: {restaurant._id}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={mode === 'setup' ? handleSetupSubmit : handleUpdateSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="res-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Restaurant Name *</label>
                    <div className="relative group">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                      <input
                        id="res-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. The Grand Bistro"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                        required
                        title="Restaurant Name"
                      />
                    </div>
                  </div>

                  {mode === 'setup' && (
                    <div className="space-y-2">
                      <label htmlFor="res-slug" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identifier (Slug) *</label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <input
                          id="res-slug"
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          placeholder="grand-bistro"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                          required
                          title="Restaurant Slug"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="res-tables" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tables Count</label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                      <input
                        id="res-tables"
                        type="number"
                        name="tablesCount"
                        value={formData.tablesCount}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                        title="Number of Tables"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="res-currency" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                    <div className="relative group">
                      <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                      <input
                        id="res-currency"
                        type="text"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        placeholder="INR"
                        maxLength={3}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                        title="Currency Code"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="res-theme" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-14 h-14 group">
                      <input
                        id="res-theme"
                        type="color"
                        name="themeColor"
                        value={formData.themeColor}
                        onChange={handleInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Choose Theme Color"
                      />
                      <div 
                        className="w-full h-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                        style={{ backgroundColor: formData.themeColor }}
                        title={`Color: ${formData.themeColor}`}
                      />
                    </div>
                    <input
                      type="text"
                      name="themeColor"
                      value={formData.themeColor}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all dark:text-white"
                      title="Theme Color Hex Code"
                      placeholder="#F97316"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300 dark:disabled:bg-slate-800 transition-all"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Configuration</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    disabled={loading}
                    className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RestaurantProfilePage;

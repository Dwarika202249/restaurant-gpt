import { Outlet } from 'react-router-dom';
import { X, Phone, User, LogOut, Heart } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerLayoutProps {
  restaurantName: string;
  restaurantLogo?: string;
  themeColor: string;
  tableNo: number;
  onLogout: () => void;
  children: React.ReactNode; 
}

/**
 * CustomerLayout Component
 * Wrapper for all customer-facing pages
 * Shows restaurant info, table number, and quick actions
 */
export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  restaurantName,
  restaurantLogo,
  themeColor,
  tableNo,
  onLogout,
  children,
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  return (
    <div 
      className="flex flex-col min-h-screen bg-[#fcfaf8] dark:bg-slate-950 transition-colors duration-500"
      style={{ 
        ['--brand-color' as any]: themeColor,
        ['--brand-color-transparent' as any]: `${themeColor}15`
      }}
    >
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-[100] w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Left: Branding & Identity */}
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div 
                className="absolute -inset-1 blur-sm rounded-full opacity-20 bg-[var(--brand-color)]"
              />
              {restaurantLogo ? (
                <img
                  src={restaurantLogo}
                  alt={restaurantName}
                  className="relative h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-md"
                />
              ) : (
                <div className="relative h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500">
                  {restaurantName.charAt(0)}
                </div>
              )}
            </motion.div>
            
            <div className="flex flex-col">
              <h1 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                {restaurantName}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--brand-color)]" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Table {tableNo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              title="Profile and Actions"
              aria-label="Open profile and actions menu"
              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5 relative group"
            >
              <User size={20} className="text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform" />
            </button>

            <AnimatePresence>
              {showActionsMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowActionsMenu(false)}
                    className="fixed inset-0 z-10"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-white/5 z-20 overflow-hidden p-2"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-white/5 mb-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal Account</p>
                       <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">GUEST_{Math.random().toString(36).substr(2, 5).toUpperCase()}</p>
                    </div>
                    
                    <button className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group">
                      <div className="p-2 bg-pink-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <Heart size={16} className="text-pink-500 fill-pink-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Claim Rewards</span>
                    </button>

                    <button className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group">
                      <div className="p-2 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <Phone size={16} className="text-blue-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Call Waiter</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setShowActionsMenu(false);
                      }}
                      className="w-full p-4 flex items-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-500/5 rounded-2xl transition-all group"
                    >
                      <div className="p-2 bg-rose-500/10 rounded-xl group-hover:rotate-12 transition-transform">
                        <LogOut size={16} className="text-rose-500" />
                      </div>
                      <span className="text-sm font-bold text-rose-600">Leave Table</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
        {children}
      </main>

      {/* Background Themic Decorations */}
      <div className="fixed bottom-0 left-0 w-full h-96 -z-10 opacity-[0.03] pointer-events-none">
        <div 
          className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-[var(--brand-color)] to-transparent"
        />
      </div>
    </div>
  );
};

export default CustomerLayout;

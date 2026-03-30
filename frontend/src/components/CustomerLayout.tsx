import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  ChevronDown, 
  LogOut, 
  Ticket, 
  History, 
  MapPin, 
  Table as TableIcon,
  LogIn,
  UserPlus, 
  Settings,
  Star
} from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';

interface CustomerLayoutProps {
  children: React.ReactNode;
  restaurantName: string;
  restaurantLogo?: string;
  themeColor?: string;
  tableNo: number;
  onLogout: () => void;
  onLoginClick?: () => void;
  customerUser?: any;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ 
  children, 
  restaurantName, 
  restaurantLogo, 
  themeColor = '#ff9500',
  tableNo,
  onLogout,
  onLoginClick,
  customerUser
}) => {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();

  // Brand Sync: Inject theme color as a CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-500', themeColor);
    // Also generate a "subtle" version for backgrounds
    document.documentElement.style.setProperty('--brand-50', `${themeColor}15`);
  }, [themeColor]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-brand-500/20 selection:text-brand-500">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 transition-colors duration-1000"
          style={{ backgroundColor: themeColor }}
        />
        <div 
          className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 transition-colors duration-1000"
          style={{ backgroundColor: themeColor }}
        />
      </div>

      {/* Premium Glass Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-white/20 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link 
          to={`/customer/${restaurantSlug}/table/${tableNo}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          title="Back to Menu"
        >
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-slate-100 dark:border-white/5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
            {restaurantLogo ? (
              <img src={restaurantLogo} alt={restaurantName} className="w-full h-full object-contain" />
            ) : (
              <span className="font-black text-brand-500 text-lg uppercase">{restaurantName.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{restaurantName}</h1>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Table {tableNo}</p>
            </div>
          </div>
        </Link>

        {/* Profile / Auth Section */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-white/20 hover:bg-white dark:hover:bg-white/10 transition-all group"
            title="Account Information"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
               <UserIcon size={16} strokeWidth={3} />
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onClick={() => setIsProfileOpen(false)}
                  className="fixed inset-0 z-[-1]" 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-72 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 p-4 overflow-hidden"
                >
                  <div className="px-4 py-6 border-b border-slate-50 dark:border-white/5 mb-2">
                    {customerUser ? (
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-brand-500 uppercase tracking-[0.2em]">Signed in as</p>
                        <h4 className="font-black text-lg text-slate-900 dark:text-white truncate">{customerUser.name || customerUser.phone}</h4>
                        {customerUser.loyaltyPoints !== undefined && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="px-2.5 py-1 bg-brand-500 text-white rounded-lg text-[9px] font-black uppercase">
                              {customerUser.loyaltyPoints} Points
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Private Dining</p>
                        <h4 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter">Guest Session</h4>
                        <p className="text-xs text-slate-500 font-medium leading-tight mt-1">Unlock rewards and track orders by logging in.</p>
                      </div>
                    )}
                  </div>

                    <div className="space-y-1">
                      {!customerUser ? (
                        <button 
                          onClick={() => { setIsProfileOpen(false); onLoginClick?.(); }}
                          className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <LogIn size={20} />
                          </div>
                          <div className="text-left">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Login / Sign Up</p>
                             <p className="text-[9px] font-bold text-slate-400">Join our rewards program</p>
                          </div>
                        </button>
                      ) : (
                        <>
                          <Link 
                            to={`/r/${restaurantSlug}/rewards`} 
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                              <Star size={20} />
                            </div>
                            <div className="text-left">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">My Rewards</p>
                               <p className="text-[9px] font-bold text-slate-400">View loyalty benefits</p>
                            </div>
                          </Link>
                          
                          <Link 
                            to={`/r/${restaurantSlug}/history`} 
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                              <History size={20} />
                            </div>
                            <div className="text-left">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Order History</p>
                               <p className="text-[9px] font-bold text-slate-400">Reorder your favorites</p>
                            </div>
                          </Link>

                          <Link 
                            to={`/r/${restaurantSlug}/profile`} 
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                              <Settings size={20} />
                            </div>
                            <div className="text-left">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Settings</p>
                               <p className="text-[9px] font-bold text-slate-400">Manage your profile</p>
                            </div>
                          </Link>
                        </>
                      )}
                    
                    <button 
                      onClick={() => { setIsProfileOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all group mt-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <LogOut size={20} />
                      </div>
                      <div className="text-left">
                         <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500">Leave Table</p>
                         <p className="text-[9px] font-bold text-red-400">End your current session</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <main className="pt-24 min-h-screen">
        {children}
      </main>

      {/* Global CSS for Brand Variable Sync */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --brand-500: ${themeColor};
        }
        .text-brand-500 { color: var(--brand-500); }
        .bg-brand-500 { background-color: var(--brand-500); }
        .border-brand-500 { border-color: var(--brand-500); }
        .ring-brand-500 { --tw-ring-color: var(--brand-500); }
      `}} />
    </div>
  );
};

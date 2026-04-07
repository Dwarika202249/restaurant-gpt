import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/store/slices/authSlice';
import { motion } from 'framer-motion';

interface SuperAdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SuperAdminSidebar = ({ isOpen, setIsOpen }: SuperAdminSidebarProps) => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/superadmin/dashboard' },
    { name: 'Restaurants', icon: Store, path: '/superadmin/restaurants' },
    { name: 'Subscribers', icon: CreditCard, path: '/superadmin/subscribers' },
    { name: 'Global Settings', icon: Settings, path: '/superadmin/settings' },
  ];

  return (
    <div 
      className={`fixed lg:relative z-50 flex flex-col h-full bg-black/40 backdrop-blur-3xl border-r border-white/10 transition-all duration-500 ease-in-out ${
        isOpen ? 'w-80' : 'w-24'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-24 px-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative group">
            <ShieldCheck className="text-white" size={26} />
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-white font-black uppercase tracking-tighter text-2xl leading-none">
                SUPREME
              </span>
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                DineOS Core
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-5 px-5 py-4 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden
              ${isActive 
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-500/30' 
                : 'text-slate-500 hover:bg-white/5 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`relative z-10 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-white' : 'group-hover:text-indigo-400'}`}>
                  <item.icon size={24} strokeWidth={2.5} />
                </div>
                {isOpen && (
                  <span className="font-black whitespace-nowrap text-[11px] tracking-[0.1em] uppercase relative z-10">
                    {item.name}
                  </span>
                )}
                {isActive && isOpen && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] relative z-10"
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-4 top-28 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white border-4 border-[#020617] hover:scale-110 active:scale-90 transition-all shadow-2xl lg:flex hidden z-20"
      >
        {isOpen ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
      </button>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-white/5 bg-black/40">
        <button
          onClick={() => dispatch(logout() as any)}
          className={`flex items-center gap-5 w-full px-5 py-4 rounded-[1.5rem] text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group`}
        >
          <LogOut size={24} strokeWidth={2.5} />
          {isOpen && <span className="font-black text-[11px] uppercase tracking-[0.1em]">Terminate Session</span>}
        </button>
      </div>
    </div>
  );
};

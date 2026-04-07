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
      className={`fixed lg:relative z-50 flex flex-col h-full bg-slate-950 border-r border-white/5 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-72' : 'w-20'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <ShieldCheck className="text-white" size={24} />
          </div>
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white font-black uppercase tracking-tighter text-xl"
            >
              Supreme<span className="text-brand-500 text-xs align-top ml-1">OS</span>
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
              ${isActive 
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                : 'text-slate-500 hover:bg-white/5 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className={isActive ? 'text-white' : 'group-hover:text-brand-400 text-slate-500'} />
                {isOpen && (
                  <span className="font-bold whitespace-nowrap text-sm tracking-wide uppercase">
                    {item.name}
                  </span>
                )}
                {isActive && isOpen && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-24 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white border-4 border-slate-950 hover:scale-110 mb-transition shadow-xl lg:flex hidden"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <button
          onClick={() => dispatch(logout() as any)}
          className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group`}
        >
          <LogOut size={22} />
          {isOpen && <span className="font-bold text-sm uppercase tracking-wide">Secure Logout</span>}
        </button>
      </div>
    </div>
  );
};

import { useState, useMemo } from 'react';
import { Menu, X, Home, UtensilsCrossed, ShoppingCart, BarChart3, LogOut, QrCode, Settings } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/store/slices/authSlice';
import { useNavigate, useLocation, NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const restaurant = useAppSelector((state) => state.restaurant.currentRestaurant);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const navItems = useMemo(() => [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: UtensilsCrossed, label: 'Menu', href: '/menu' },
    { icon: ShoppingCart, label: 'Orders', href: '/orders' },
    { icon: QrCode, label: 'QR Codes', href: '/qr-management' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  ], []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass dark:glass-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} className="text-brand-500" /> : <Menu size={24} className="text-slate-600 dark:text-slate-400" />}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20" 
            onClick={() => setIsOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative md:translate-x-0 top-0 left-0 h-screen w-64 bg-slate-950 text-white transition-all duration-500 ease-in-out z-30 flex flex-col border-r border-white/5 shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Restaurant Header */}
        <Link to="/dashboard" className="p-8 relative overflow-hidden group block">
          <div className="absolute top-0 left-0 w-full h-full bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl orange-gradient flex items-center justify-center mb-4 shadow-glow-orange animate-pulse-slow">
              <span className="font-black text-xl">{restaurant?.name?.charAt(0).toUpperCase() || 'R'}</span>
            </div>
            <h1 className="text-xl font-bold truncate tracking-tight">{restaurant?.name || 'Restaurant'}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] leading-none">Admin Hub</p>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) => `relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                isActive 
                  ? 'bg-brand-500/10 text-brand-500 font-bold shadow-sm border-l-4 border-brand-500' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-brand-500/5 z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon size={20} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand-500' : 'group-hover:text-white'}`} />
                  <span className="relative z-10 flex-1">{item.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-glow-orange" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 space-y-1.5 border-t border-white/5 bg-slate-900/30 backdrop-blur-xl">
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white group"
          >
            <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-slate-400 hover:text-red-500 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="p-6 text-[10px] text-slate-600 bg-black/20">
          <div className="flex justify-between items-center mb-1">
            <span className="uppercase font-bold tracking-widest">v1.2.0</span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded uppercase">{restaurant?.slug || 'PRIME'}</span>
          </div>
          <p className="opacity-50">Powered by RestaurantGPT AI</p>
        </div>
      </aside>
    </>
  );
};

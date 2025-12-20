import { useState } from 'react';
import { Menu, X, Home, UtensilsCrossed, ShoppingCart, BarChart3, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const restaurant = useAppSelector((state) => state.restaurant.currentRestaurant);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: UtensilsCrossed, label: 'Menu', href: '/menu' },
    { icon: ShoppingCart, label: 'Orders', href: '/orders' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  ];

  return (
    <>
      {/* Mobile Menu Button - shown only on small screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for mobile */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative md:translate-x-0 top-0 left-0 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 z-30 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Restaurant Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold truncate">{restaurant?.name || 'Restaurant'}</h1>
          <p className="text-sm text-slate-400 mt-1">Admin Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <item.icon size={20} className="text-slate-400 group-hover:text-white" />
              <span className="font-medium group-hover:text-white">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div className="border-t border-slate-700 p-4 space-y-2">
          <a
            href="/profile"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <span className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-xs font-bold text-slate-900 group-hover:bg-white">
              {restaurant?.name?.charAt(0).toUpperCase() || 'R'}
            </span>
            <span className="font-medium group-hover:text-white">Settings</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-left"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-700 text-xs text-slate-500 space-y-1">
          <p>Slug: {restaurant?.slug || 'N/A'}</p>
          <p>Tables: {restaurant?.tablesCount || 0}</p>
        </div>
      </aside>
    </>
  );
};

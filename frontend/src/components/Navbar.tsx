import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { logout } from '@/store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const profileRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Rehydrate user if missing but authenticated
  useEffect(() => {
    if (!user && isAuthenticated) {
      dispatch(fetchAdminUser());
    }
  }, [user, isAuthenticated, dispatch]);
  const restaurant = useAppSelector((state) => state.restaurant.currentRestaurant);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center justify-end px-6 py-4">

        {/* Right Section */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="User Profile"
            >
              <div className="w-9 h-9 rounded-xl orange-gradient flex items-center justify-center text-white font-bold shadow-glow-orange transition-transform hover:scale-105 uppercase">
                {user?.name ? user.name.charAt(0) : (user?.phone ? user.phone.slice(-1) : 'A')}
              </div>
              <div className="hidden sm:block text-left pr-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none mb-1">{user?.name || user?.phone || 'Admin'}</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{restaurant?.name || 'Restaurant'}</p>
              </div>
            </button>

            {/* Profile Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-surface-light dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'Admin'}</p>
                  {user?.name && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{user.phone}</p>}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Prime {user?.role}</p>
                </div>

                <div className="p-2">
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-colors text-sm text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    <User size={18} className="text-slate-400 group-hover:text-inherit" />
                    <span>Admin Profile</span>
                  </Link>

                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-sm text-red-600 font-medium"
                  >
                    <LogOut size={18} />
                    <span>Logout Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, LogOut, Settings } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log('Search:', searchQuery);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center space-x-6 ml-6">
          {/* Notifications */}
          <button 
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.phone?.slice(-2).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-900">{user?.phone || 'Admin'}</p>
                <p className="text-xs text-slate-500">{restaurant?.name || 'Restaurant'}</p>
              </div>
            </button>

            {/* Profile Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.phone}</p>
                  <p className="text-xs text-slate-500 mt-1">{user?.role === 'admin' ? 'Admin User' : 'Customer'}</p>
                </div>

                {user?.role === 'admin' && (
                  <a
                    href="/admin"
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-slate-50 transition-colors text-sm text-slate-700"
                  >
                    <User size={16} />
                    <span>Admin Profile</span>
                  </a>
                )}

                <a
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-3 hover:bg-slate-50 transition-colors text-sm text-slate-700"
                >
                  <Settings size={16} />
                  <span>Restaurant Profile</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-red-50 transition-colors text-sm text-red-600 border-t border-slate-100"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

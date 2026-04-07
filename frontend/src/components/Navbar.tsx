import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Bell, User, LogOut, Settings, Sun, Moon,
  Zap, X, Info, AlertTriangle, AlertOctagon,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { logout } from '@/store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { VITE_API_URL, VITE_SOCKET_URL } from '@/config/env';
import { useConfig } from '@/context/ConfigContext';

const API_URL = VITE_API_URL;

export const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const restaurant = useAppSelector((state) => state.restaurant.currentRestaurant);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { config } = useConfig();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const announcement = config?.announcement?.enabled && (config?.announcement?.target === 'owners' || config?.announcement?.target === 'both')
    ? config.announcement
    : null;

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

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

  // Initialize audio for waiter ping
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Socket Connection & Notification Fetching
  useEffect(() => {
    if (isAuthenticated && restaurant?._id) {
      // 1. Fetch existing notifications
      const fetchInitialNotifs = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(response.data.data);
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
      };

      fetchInitialNotifs();

      // 2. Setup Socket
      const socket = io(VITE_SOCKET_URL);

      socket.on('connect', () => {
        socket.emit('join-restaurant', restaurant._id);
      });

      socket.on('new-notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);

        // Play sound ONLY for CALL_WAITER as per USER request
        if (notif.type === 'CALL_WAITER' && audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio playback prevented:', e));
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, restaurant?._id]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
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
      {/* Desktop Banner */}
      <AnimatePresence>
        {announcement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="hidden md:block overflow-hidden"
          >
            <div className={`px-6 py-2.5 flex items-center justify-center gap-3 border-b transition-all bg-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.2)]`}>
              {announcement.type === 'critical' ? <AlertOctagon size={14} className="text-white animate-pulse" /> :
                announcement.type === 'warning' ? <AlertTriangle size={14} className="text-white" /> :
                  <Info size={14} className="text-white" />}
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                <span className="opacity-60 mr-2 text-[9px]">Supreme System:</span>
                {announcement.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end px-6 py-4">
        {/* Real-time Broadcast Trigger (Mobile) */}
        {announcement && (
          <div className="md:hidden mr-auto flex items-center">
            <button
              onClick={() => setShowBroadcastModal(true)}
              title='Platform Mesh'
              className={`relative p-2.5 rounded-xl border border-white/5 bg-slate-100 dark:bg-white/5 transition-all active:scale-95 group overflow-hidden`}
            >
              <div className="absolute inset-0 bg-indigo-500/10 animate-pulse group-hover:bg-indigo-500/20" />
              <Zap size={18} className="text-indigo-500 relative z-10 fill-indigo-500/20" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce" />
            </button>
          </div>
        )}

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
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-white dark:border-surface-dark animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-surface-light dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Alert Hub</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('accessToken');
                        await axios.patch(`${API_URL}/notifications/read-all`, {}, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                      }}
                      className="text-[10px] font-bold text-brand-500 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center opacity-20">
                      <Bell size={32} className="mx-auto mb-3" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No active alerts</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-brand-500/[0.02]' : ''}`}
                          onClick={async () => {
                            if (!notif.isRead) {
                              const token = localStorage.getItem('accessToken');
                              await axios.patch(`${API_URL}/notifications/${notif._id}/read`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                            }
                            if (notif.metadata?.orderId) {
                              navigate('/orders/all'); // Or a specific order page if available
                            }
                            setIsNotificationsOpen(false);
                          }}
                        >
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'NEW_ORDER' ? 'bg-brand-500/10 text-brand-500' :
                                notif.type === 'PAYMENT_SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                                  'bg-amber-500/10 text-amber-500'
                              }`}>
                              <Bell size={16} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className={`text-xs font-bold leading-tight ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                {notif.title}
                              </p>
                              <p className="text-[10px] text-slate-400 line-clamp-2">{notif.message}</p>
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          {!notif.isRead && (
                            <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-brand-500 rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link to="/orders/all" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-500 transition-colors">
                    View Audit Log
                  </Link>
                </div>
              </div>
            )}
          </div>

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

      {/* Mobile Broadcast Modal */}
      <AnimatePresence>
        {showBroadcastModal && announcement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBroadcastModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className={`p-6 bg-indigo-500 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap size={18} className="text-white fill-white/20" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white leading-none mb-1 text-left">Platform Mesh</h3>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-indigo-100 leading-none text-left">Supreme Broadcast</p>
                  </div>
                </div>
                <button
                  title='Close'
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6 text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${announcement.type === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        announcement.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                          'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                      }`}>
                      {announcement.type} announcement
                    </div>
                  </div>
                  <p className="text-slate-800 dark:text-white/90 text-sm font-bold leading-relaxed">
                    {announcement.message}
                  </p>
                </div>

                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="w-full py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Insight <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

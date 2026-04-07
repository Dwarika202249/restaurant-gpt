import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  Menu, 
  X,
  Sun,
  Moon,
  ArrowRight
} from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
import { MaintenanceGuard } from './MaintenanceGuard';
import { GlobalAnnouncement } from './GlobalAnnouncement';
import { useConfig } from '@/context/ConfigContext';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { config } = useConfig();

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const hasAnnouncement = config?.announcement?.enabled && (config?.announcement?.target === 'customers' || config?.announcement?.target === 'both');

  return (
    <MaintenanceGuard>
      <GlobalAnnouncement />
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col relative w-full overflow-x-hidden ${hasAnnouncement ? 'pt-10' : ''}`}>
        
        <nav className={`fixed ${hasAnnouncement ? 'top-10' : 'top-0'} left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 shadow-sm' : 'py-6 bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform duration-300">
                <ChefHat className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">Dine<span className="text-amber-500">OS</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${location.pathname === link.path ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400'}`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 transition-all font-bold group"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon size={18} className="group-active:rotate-12 transition-transform" /> : <Sun size={18} className="group-active:rotate-12 transition-transform" />}
              </button>
              <button 
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
              >
                {isAuthenticated ? 'Launch Dashboard' : 'Sign In'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <button title="Open menu" aria-label="Open menu" className="md:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col p-6"
            >
              <div className="flex justify-between items-center mb-16 pt-2">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <span className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">Dine<span className="text-amber-500">OS</span></span>
                </Link>
                <div className="flex items-center gap-4">
                  <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-amber-500" title="Toggle Theme">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  </button>
                  <button title="Close menu" aria-label="Close menu" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full" onClick={() => setMobileMenuOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-8 text-center text-3xl font-black uppercase italic tracking-tight">
                {navLinks.map((link) => (
                   <Link key={link.path} to={link.path} className={`transition-colors ${location.pathname === link.path ? 'text-amber-500' : 'hover:text-amber-500 text-slate-800 dark:text-white'}`} onClick={() => setMobileMenuOpen(false)}>
                     {link.name}
                   </Link>
                ))}
              </div>

              <div className="mt-auto">
                <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')} className="w-full py-5 rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-600 text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-2">
                  {isAuthenticated ? 'Launch Dashboard' : 'Sign In'} <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full relative z-10 flex flex-col">
          <Outlet />
        </main>

        <footer className="relative z-10 bg-slate-900 dark:bg-slate-950 pt-16 pb-10 border-t border-slate-800 w-full mt-auto">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <ChefHat className="text-amber-500" size={32} />
                <span className="text-3xl font-black italic tracking-tighter text-white">Dine<span className="text-amber-500">OS</span></span>
              </div>
              <p className="text-slate-400 max-w-sm">The intelligent restaurant operating system. Forged by foodies, driven by tech.</p>
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Navigation</h4>
              <div className="flex flex-col gap-4 text-slate-400">
                <Link to="/services" className="hover:text-amber-500 transition-colors">Services</Link>
                <Link to="/about" className="hover:text-amber-500 transition-colors">About Us</Link>
                <Link to="/contact" className="hover:text-amber-500 transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Legal & Support</h4>
              <div className="flex flex-col gap-4 text-slate-400">
                <Link to="/help" className="hover:text-amber-500 transition-colors">Help Center</Link>
                <Link to="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-amber-500 transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 gap-6">
             <p className="text-xs font-bold text-slate-500">© 2026 DineOS Incorporated. All rights reserved.</p>
             <div className="flex gap-6 text-slate-500">
               <Link to="/help" className="text-xs font-bold hover:text-white transition-colors">Help</Link>
               <Link to="/privacy" className="text-xs font-bold hover:text-white transition-colors">Privacy</Link>
               <Link to="/terms" className="text-xs font-bold hover:text-white transition-colors">Terms</Link>
             </div>
          </div>
        </footer>
      </div>
    </MaintenanceGuard>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  ChefHat, 
  QrCode, 
  Sparkles, 
  BarChart3, 
  Clock, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  Menu, 
  X,
  MapPin,
  Mail,
  Phone,
  Sun,
  Moon,
  Coffee,
  Flame,
  UtensilsCrossed,
  Star
} from 'lucide-react';
import { useTabTitle } from '@/hooks';
import { useAppSelector } from '@/hooks/useRedux';

export const HomePage: React.FC = () => {
  useTabTitle('DineOS | The Intelligent Restaurant Operating System');
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-amber-500/20 selection:text-amber-600 dark:selection:text-amber-500 overflow-x-hidden text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* --- Ambient Background Glows --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ y: yPos }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-amber-400/30 dark:bg-amber-500/10 blur-[150px] mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
          className="absolute top-[40%] -left-[20%] w-[50%] h-[50%] rounded-full bg-orange-500/20 dark:bg-orange-600/10 blur-[150px] mix-blend-multiply dark:mix-blend-screen" 
        />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-amber-500/5 to-transparent blur-[120px] mix-blend-overlay"
        />
      </div>

      {/* --- Intelligent Navbar --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 shadow-sm' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo('hero')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform duration-300">
              <ChefHat className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">Dine<span className="text-amber-500">OS</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('services')} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors">Services</button>
            <button onClick={() => scrollTo('about')} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors">About</button>
            <button onClick={() => scrollTo('contact')} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors">Contact</button>
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

          {/* Mobile Menu Toggle */}
          <button title="Open menu" aria-label="Open menu" className="md:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-16 pt-2">
              <span className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">Dine<span className="text-amber-500">OS</span></span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleTheme} 
                  className="p-2 text-slate-400 hover:text-amber-500"
                  title="Toggle Theme"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button title="Close menu" aria-label="Close menu" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full" onClick={() => setMobileMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-8 text-center text-3xl font-black uppercase italic tracking-tight">
              <button onClick={() => scrollTo('services')} className="hover:text-amber-500 transition-colors">Services</button>
              <button onClick={() => scrollTo('about')} className="hover:text-amber-500 transition-colors">About</button>
              <button onClick={() => scrollTo('contact')} className="hover:text-amber-500 transition-colors">Contact</button>
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="w-full py-5 rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-600 text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-2"
              >
                {isAuthenticated ? 'Launch Dashboard' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HERO SECTION --- */}
      <section id="hero" className="relative z-10 pt-48 pb-20 px-6 min-h-[90vh] flex items-center justify-center overflow-hidden">
        <FloatingBackground />
        
        <div className="max-w-5xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 20 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-8 backdrop-blur-md"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={12} /> 
              </motion.div>
              The Future of Hospitality is Here
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.9] italic mb-8 relative">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="block"
              >
                Restaurant Management
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent inline-block"
              >
                Reimagined.
              </motion.span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-lg md:text-xl text-slate-600/90 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-12 backdrop-blur-sm"
            >
              DineOS unites smart QR menus, an AI-powered concierge, and seamless kitchen operations into one breathtaking digital orchestrator. Elevate your dining experience seamlessly.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isAuthenticated ? 'Launch Dashboard' : 'Start Your Journey'} <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => scrollTo('services')}
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white text-sm font-black uppercase tracking-widest hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
              >
                Explore Features
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section id="services" className="relative z-10 py-32 bg-white/50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-4">A Symphony of Features</h2>
             <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Everything you need to command your culinary empire</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<QrCode size={32} />}
              title="Smart QR Menus"
              desc="Contactless, dynamic menus that adapt to your stock layout instantly. Let guests order straight from their table without waiting."
              color="from-blue-400 to-blue-600"
            />
            <FeatureCard 
              icon={<Terminal size={32} />}
              title="AI Concierge"
              desc="A personalized virtual sommelier and guide. It answers guest queries, suggests pairings, and drives up-sells effortlessly."
              color="from-amber-400 to-orange-600"
            />
            <FeatureCard 
              icon={<BarChart3 size={32} />}
              title="Command Center"
              desc="A realtime dashboard tracking every table, order, and revenue stream. Predict trends before they even happen."
              color="from-emerald-400 to-teal-600"
            />
            <FeatureCard 
              icon={<ShieldCheck size={32} />}
              title="Secure Processing"
              desc="Bank-grade encryption for frictionless and secure table-side checkout. Zero hurdles between craving and paying."
              color="from-purple-400 to-pink-600"
            />
            <FeatureCard 
              icon={<Clock size={32} />}
              title="Kitchen Sync"
              desc="Eliminate chaos. Send orders directly to kitchen displays with prioritizing algorithms to ensure food goes out hot."
              color="from-rose-400 to-red-600"
            />
            <FeatureCard 
              icon={<Smartphone size={32} />}
              title="Loyalty Engine"
              desc="Turn walk-ins into regulars. Automatic point accruals, milestone rewards, and personalized offers sent straight to their phones."
              color="from-cyan-400 to-blue-500"
            />
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest">
              Our Vision
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
              Forged by Foodies. <br/> <span className="text-amber-500">Driven by Tech.</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              We started DineOS because we saw the disconnect between brilliant chefs and frustrated guests. Slow waiters, chaotic kitchens, and clunky POS systems ruin the magic of dining out. 
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              We've created an operating system that fades into the background, so your food and hospitality can shine in the foreground.
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-slate-800">
               <div>
                 <h4 className="text-4xl font-black text-slate-900 dark:text-white mb-2">99<span className="text-amber-500">%</span></h4>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Uptime Reliability</p>
               </div>
               <div>
                 <h4 className="text-4xl font-black text-slate-900 dark:text-white mb-2">3<span className="text-amber-500">x</span></h4>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Faster Table Turns</p>
               </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[600px] rounded-[3rem] overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 to-orange-400 opacity-90 transition-opacity group-hover:opacity-70 z-10 mix-blend-multiply" />
            <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Restaurant Interior" className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-x-0 bottom-0 p-10 z-20 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
              <span className="text-white text-3xl font-black uppercase italic tracking-tighter">Experience The Shift</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CONTACT / FOOTER --- */}
      <section id="contact" className="relative z-10 bg-slate-900 dark:bg-slate-950 pt-32 pb-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-8">Ready to Serve?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md">Let's elevate your restaurant's digital presence. Get in touch with our team of specialists.</p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-slate-300 group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-colors shrink-0">
                  <Mail size={20} className="group-hover:text-white text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Us</p>
                  <p className="text-lg font-bold">hello@dineos.app</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-300 group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-colors shrink-0">
                  <Phone size={20} className="group-hover:text-white text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Call Us</p>
                  <p className="text-lg font-bold">+1 (800) DINE-OS-PRO</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-300 group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-colors shrink-0">
                  <MapPin size={20} className="group-hover:text-white text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Headquarters</p>
                  <p className="text-lg font-bold">123 Culinary Valley, San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md">
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Drop a Line</h3>
             <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! We'll be in touch."); }}>
               <div>
                 <input type="text" placeholder="Your Name" required className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-sm" />
               </div>
               <div>
                 <input type="email" placeholder="Your Email" required className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-sm" />
               </div>
               <div>
                 <textarea placeholder="How can we help?" rows={4} required className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-sm resize-none"></textarea>
               </div>
               <button type="submit" className="w-full py-5 rounded-2xl bg-amber-500 text-slate-950 text-sm font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-colors">
                 Send Message
               </button>
             </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 gap-6">
           <div className="flex items-center gap-3">
             <ChefHat className="text-amber-500" size={24} />
             <span className="text-xl font-black italic tracking-tighter text-white">Dine<span className="text-amber-500">OS</span></span>
           </div>
           <p className="text-xs font-bold text-slate-500">© 2026 DineOS Incorporated. All rights reserved.</p>
           <div className="flex gap-6">
             <button onClick={() => navigate('/privacy')} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Privacy</button>
             <button onClick={() => navigate('/terms')} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Terms</button>
           </div>
        </div>
      </section>
    </div>
  );
};

// Subcomponent for Feature Cards
const FeatureCard = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 blur-[50px] group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-8 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
};

// Subcomponent for Advanced Animated Floating Background Elements
const FloatingBackground = () => {
  const elements = [
    { Icon: ChefHat, size: 40, x: '10%', y: '20%', delay: 0, duration: 15 },
    { Icon: Coffee, size: 30, x: '80%', y: '15%', delay: 2, duration: 18 },
    { Icon: UtensilsCrossed, size: 50, x: '85%', y: '70%', delay: 1, duration: 20 },
    { Icon: Flame, size: 35, x: '15%', y: '80%', delay: 3, duration: 16 },
    { Icon: Star, size: 25, x: '50%', y: '10%', delay: 0.5, duration: 12 },
    { Icon: Sparkles, size: 45, x: '45%', y: '85%', delay: 4, duration: 22 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1], 
            scale: [1, 1.2, 1],
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: el.duration, 
            repeat: Infinity, 
            delay: el.delay,
            ease: "easeInOut"
          }}
          style={{ 
            position: 'absolute', 
            left: el.x, 
            top: el.y,
            filter: 'blur(2px)'
          }}
          className="text-amber-500/20 dark:text-amber-400/10 blend-multiply dark:blend-screen"
        >
          <el.Icon size={el.size} strokeWidth={1.5} />
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-950/50 dark:to-slate-950" />
    </div>
  );
};

export default HomePage;

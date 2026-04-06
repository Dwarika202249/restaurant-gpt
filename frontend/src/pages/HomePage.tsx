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
  Coffee,
  Flame,
  UtensilsCrossed,
  Star,
  ArrowRight
} from 'lucide-react';
import { useTabTitle } from '@/hooks';
import { useAppSelector } from '@/hooks/useRedux';

export const HomePage: React.FC = () => {
  useTabTitle('DineOS | The Intelligent Restaurant Operating System');
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="w-full flex-col">

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

      {/* Background glow layers */}
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
                onClick={() => navigate('/services')}
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white text-sm font-black uppercase tracking-widest hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
              >
                Explore Features
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- PLATFORM FEATURES --- */}
      <section className="relative z-10 py-32 bg-white/50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-6">A Symphony of Features</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
              From contactless QR ordering and an autonomous AI Concierge to deeply integrated Kitchen Sync technology, DineOS has everything you need to run your restaurant on autopilot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <FeatureCard 
              icon={<QrCode size={32} />}
              title="Smart Menus"
              desc="Digital ordering that updates in realtime. Customers scan, order, and pay without waiting for staff."
              color="from-blue-400 to-blue-600"
            />
            <FeatureCard 
              icon={<Terminal size={32} />}
              title="AI Concierge"
              desc="A virtual sommelier that answers queries and upsells pairings perfectly every single time."
              color="from-amber-400 to-orange-600"
            />
            <FeatureCard 
              icon={<BarChart3 size={32} />}
              title="Command Center"
              desc="Live tracking of every table, dish, and dollar. Unprecedented restaurant oversight."
              color="from-emerald-400 to-teal-600"
            />
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/services')}
              className="px-10 py-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all outline-none inline-flex items-center gap-3"
            >
              Explore Full Arsenal <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* --- SHOWCASE / VISUAL SECTION --- */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest">
              The DineOS Experience
            </div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
              Forged by Foodies. <br /> <span className="text-amber-500">Driven by Tech.</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-lg">
              We eliminate the friction between brilliant chefs and frustrated guests. Slow waiters, chaotic kitchens, and clunky legacy POS systems are a thing of the past. Let our tech fade into the background so your hospitality can shine.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate('/about')}
                className="px-8 py-4 rounded-full bg-amber-500 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-500/30 hover:bg-amber-400 transition-colors outline-none"
              >
                Learn Our Story
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative h-[500px] lg:h-[600px] w-full rounded-[3rem] overflow-hidden group shadow-2xl border-4 border-white dark:border-slate-800"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/40 to-orange-400/20 z-10 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700" />
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
              alt="Premium Restaurant Experience" 
              className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 origin-center" 
            />
            <div className="absolute bottom-0 inset-x-0 p-8 z-20 bg-gradient-to-t from-slate-950 to-transparent">
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-glow-emerald">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="font-black italic text-xl uppercase tracking-tight">300% Faster</p>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Table Turnarounds</p>
                </div>
              </div>
            </div>
          </motion.div>
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

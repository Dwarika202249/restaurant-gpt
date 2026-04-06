import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import { useTabTitle } from '@/hooks';

export const ContactPage: React.FC = () => {
  useTabTitle('Contact | DineOS');

  return (
    <div className="w-full flex-col min-h-[90vh]">
      {/* Contact Hero */}
      <section className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight italic mb-8">
              Ready to <br/>
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">Serve.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Whether you need technical support, sales inquiries, or a custom deployment strategy, our team is standing by.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Info Side */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-8">Get In Touch</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-md leading-relaxed">
                We believe in rapid responses and personalized support. Choose the channel that works best for you.
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors shrink-0">
                  <Mail size={24} className="group-hover:text-white text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Email Us</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">hello@dineos.app</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors shrink-0">
                  <Phone size={24} className="group-hover:text-white text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Call Us</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">+1 (800) DINE-OS-PRO</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors shrink-0">
                  <MapPin size={24} className="group-hover:text-white text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Headquarters</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">123 Culinary Valley<br/>San Francisco, CA</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors shrink-0">
                  <Clock size={24} className="group-hover:text-white text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Support Hours</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">24/7 Availability</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
             <h3 className="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter mb-8 relative z-10">Drop a Line</h3>
             <form className="space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! We'll be in touch."); }}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2 pl-2">First Name</label>
                   <input type="text" id="firstName" placeholder="First Name" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-sm" />
                 </div>
                 <div>
                   <label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2 pl-2">Last Name</label>
                   <input type="text" id="lastName" placeholder="Last Name" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-sm" />
                 </div>
               </div>
               <div>
                 <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2 pl-2">Email Address</label>
                 <input type="email" id="email" placeholder="Your Email" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-sm" />
               </div>
               <div>
                 <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2 pl-2">How can we help?</label>
                 <textarea id="message" rows={5} placeholder="How can we help?" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-sm resize-none"></textarea>
               </div>
               <button type="submit" className="w-full py-5 rounded-2xl bg-amber-500 text-white dark:text-slate-950 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                 Send Message
               </button>
             </form>
          </div>
        </div>
      </section>
    </div>
  );
};

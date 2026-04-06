import React from 'react';
import { motion } from 'framer-motion';
import { useTabTitle } from '@/hooks';

export const AboutPage: React.FC = () => {
  useTabTitle('About | DineOS');

  return (
    <div className="w-full flex-col">
      <section className="relative z-10 py-32 px-6">
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
              We've created an operating system that fades into the background, so your food and hospitality can shine in the foreground. Our engineers and culinary experts worked side-by-side to ensure every feature actually makes sense on the restaurant floor.
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

      {/* Extended Mission Section */}
      <section className="relative z-10 py-20 bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-white/5">
         <div className="max-w-4xl mx-auto text-center px-6">
            <h3 className="text-3xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-6">Our Core Philosophy</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xl font-medium leading-relaxed italic">
              "Technology should never replace hospitality. It should empower it. We give waiters back their time so they can actually talk to guests, and we give chefs back their peace of mind so they can focus on the food."
            </p>
         </div>
      </section>
    </div>
  );
};

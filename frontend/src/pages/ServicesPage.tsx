import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  QrCode, 
  BarChart3, 
  Clock, 
  Smartphone, 
  ShieldCheck, 
  Plus,
  Minus
} from 'lucide-react';
import { useTabTitle } from '@/hooks';

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

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors pr-8">
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${isOpen ? 'bg-amber-500 border-amber-500 text-white rotate-180' : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 group-hover:border-amber-500 group-hover:text-amber-500'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ServicesPage: React.FC = () => {
  useTabTitle('Services | DineOS');

  const faqs = [
    {
      question: "How long does it take to deploy DineOS at my restaurant?",
      answer: "Setting up your digital layout, QR menus, and AI Concierge typically takes less than 24 hours. Once your menu CSV is uploaded and tables are mapped, you can activate the system instantly."
    },
    {
      question: "Do I need special hardware to run the system?",
      answer: "No. DineOS is entirely cloud-based. Your kitchen staff and waiters can use standard tablets or smartphones, and your customers use their own devices through the Smart QR Menus."
    },
    {
      question: "How does the AI Concierge integrate with my specific menu?",
      answer: "Our engine ingests your entire menu—including ingredients, allergens, and pairings—to build a localized knowledge base. It will confidently guide guests exactly as your best sommelier or waiter would."
    },
    {
      question: "Can guests pay through the app without calling the waiter?",
      answer: "Absolutely. Our Secure Processing feature enables 1-tap table-side checkout. Guests can split bills, apply loyalty discounts, and pay securely directly from their phones."
    },
    {
      question: "What happens if our internet connection drops?",
      answer: "DineOS ensures no data is lost. Background sync mechanisms hold pending orders and transmit them immediately once connection is restored, ensuring the kitchen never misses a beat."
    }
  ];

  return (
    <div className="w-full flex-col">
      {/* Services Hero */}
      <section className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight italic mb-8">
              A Symphony of <br/>
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">Capabilities.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Discover the full suite of tools designed to orchestrate your culinary empire.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="relative z-10 py-20 bg-white/50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
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
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-32 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Everything you need to know about implementation.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>
    </div>
  );
};

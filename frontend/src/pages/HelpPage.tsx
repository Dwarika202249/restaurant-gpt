import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, Book, MessageCircle, Settings, QrCode, ShoppingBag, BarChart3, ArrowRight, Mail, Phone, ExternalLink } from 'lucide-react';
import { useTabTitle } from '@/hooks';

export const HelpPage = () => {
  useTabTitle('Help Center');
  const navigate = useNavigate();

  const categories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of setting up your restaurant workspace and navigating the console.",
      links: ["Initial Setup", "Adding Staff", "Profile Management"]
    },
    {
      icon: ShoppingBag,
      title: "Order Management",
      description: "How to handle live orders, update statuses, and manage the kitchen flow efficiently.",
      links: ["Live Dashboard", "Order History", "Status Updates"]
    },
    {
      icon: Settings,
      title: "Menu Studio",
      description: "Comprehensive guide on building your digital menu, adding items, and categories.",
      links: ["Creating Categories", "Item Customization", "Availability"]
    },
    {
      icon: QrCode,
      title: "QR Assets",
      description: "Managing table-specific QR codes and printing assets for your establishment.",
      links: ["Generating Codes", "Table Management", "Print Guidelines"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Growth",
      description: "Understanding your restaurant's performance metrics and AI-driven insights.",
      links: ["Revenue Tracking", "Popular Items", "Customer Trends"]
    },
    {
      icon: MessageCircle,
      title: "AI Integration",
      description: "Maximize the potential of DineOS's AI features for smarter operations.",
      links: ["AI Personalized Menu", "Smart Notifications", "Data Insights"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Decorative background element */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-brand-500/5 blur-[120px] rounded-full -mr-96 -mt-96 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="flex justify-end items-center mb-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center shadow-lg shadow-brand-500/20">
              <HelpCircle className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Help Center</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            How can we <span className="text-brand-500">help</span> you?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium"
          >
            Search our documentation, tutorials, and community resources to make the most of your DineOS experience.
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass dark:glass-dark p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-brand-500/10 transition-all group cursor-pointer border border-transparent hover:border-brand-500/20"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <cat.icon className="text-brand-500" size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{cat.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
                {cat.description}
              </p>
              <ul className="space-y-3">
                {cat.links.map((link, lidx) => (
                  <li key={lidx} className="flex items-center space-x-2 text-xs font-bold text-slate-400 dark:text-slate-600 hover:text-brand-500 dark:hover:text-brand-500 transition-colors">
                    <ArrowRight size={14} className="text-brand-500/40" />
                    <span>{link}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="glass dark:glass-dark rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Need specialized assistance?</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-8"> Our dedicated support team is available 24/7 to help you with technical or operational queries.</p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-500">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Support</p>
                    <p className="text-slate-900 dark:text-white font-bold">support@dineos.app</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-500">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Line</p>
                    <p className="text-slate-900 dark:text-white font-bold">+1 (800) DINE-OS-PRO</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-transparent" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-[2rem] orange-gradient flex items-center justify-center mb-8 shadow-glow-orange">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">Enterprise Success</h3>
                <p className="text-slate-400 font-medium mb-8 text-sm">Facing complex scaling challenges? Our enterprise consultants are ready to build a custom solution for your chain.</p>
                <button className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
                  <span>Book a Session</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

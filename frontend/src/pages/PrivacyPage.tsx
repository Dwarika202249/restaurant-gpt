import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText, ChevronLeft, ArrowRight, ShieldAlert, Key, Globe, Database } from 'lucide-react';
import { useTabTitle } from '@/hooks';

export const PrivacyPage = () => {
  useTabTitle('Privacy Policy');
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: "Data We Collect",
      content: "We collect information you provide directly to us when you create an account, such as name, email, phone number, and restaurant details. For your customers, we collect order preferences, loyalty points, and transactional data required to fulfill the dining experience."
    },
    {
      icon: Eye,
      title: "How We Use Data",
      content: "Your data is used strictly to provide the RestaurantGPT services, including processing orders, generating analytics, and personalizing AI-driven menu recommendations. We do not sell your personal data or your customers' data to third-party advertisers."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement industry-standard encryption (AES-256) and secure socket layers (TLS) to protect your information. Access to your sensitive data is restricted to authorized personnel who require it to perform their specialized job functions."
    },
    {
      icon: ShieldAlert,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information at any time through your dashboard. For specific data portable requests or account deletions beyond self-service, please contact our support team."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      {/* Background decoration */}
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-brand-500/5 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-20">
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 text-slate-500 hover:text-brand-500 font-bold transition-all group"
          >
            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl shadow-sm group-hover:-translate-x-1 transition-transform">
              <ChevronLeft size={20} />
            </div>
            <span>Back to Login</span>
          </button>
          
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center">
               <ShieldCheck className="text-white dark:text-slate-950" size={20} />
             </div>
             <span className="text-xl font-black text-slate-950 dark:text-white tracking-tight">Privacy</span>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center space-x-2 bg-brand-500/10 text-brand-500 px-4 py-2 rounded-full mb-6"
          >
            <Lock size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Privacy First Culture</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-slate-950 dark:text-white leading-none tracking-tighter mb-8"
          >
            OUR COMMITMENT TO <br />
            <span className="text-brand-500">YOUR SECURITY.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed"
          >
            Last updated: October 2026. This policy outlines how RestaurantGPT handles your sensitive restaurant data and customer information with absolute transparency.
          </motion.p>
        </div>

        {/* Content Structure */}
        <div className="space-y-16 mb-24">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="group"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-[1.25rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-brand-500 transition-transform group-hover:scale-110 group-hover:rotate-6">
                  <section.icon size={22} />
                </div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">{section.title}</h2>
              </div>
              <div className="pl-16">
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-[1.8] max-w-3xl">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comprehensive Policy Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-950 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 blur-[100px] rounded-full -mr-40 -mt-40" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-10">
               <FileText className="text-brand-500" size={24} />
               <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Legacy Documentation</span>
            </div>
            
            <h3 className="text-3xl font-black mb-6 tracking-tight">Full Legal Framework</h3>
            <p className="text-white/60 font-medium mb-10 leading-relaxed max-w-xl">
              By using our platform, you also agree to our Terms of Service and Data Processing Agreement (DPA). These documents form the complete legal framework governing your usage of the RestaurantGPT platform.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <button className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:translate-x-1 group">
                 <div className="flex items-center space-x-3">
                   <Globe className="text-brand-500" size={18} />
                   <span className="font-bold text-sm">Data Processing Addendum</span>
                 </div>
                 <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
               </button>
               <button className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:translate-x-1 group">
                 <div className="flex items-center space-x-3">
                   <Key className="text-brand-500" size={18} />
                   <span className="font-bold text-sm">Security Whitepaper</span>
                 </div>
                 <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
               </button>
            </div>
          </div>
        </motion.div>

        {/* Contact info support */}
        <div className="mt-24 text-center">
          <p className="text-slate-400 font-bold mb-4 uppercase tracking-[0.2em] text-[10px]">Concerns or Questions?</p>
          <a href="mailto:privacy@restaurantgpt.ai" className="text-2xl font-black text-slate-950 dark:text-white hover:text-brand-500 transition-colors">privacy@restaurantgpt.ai</a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

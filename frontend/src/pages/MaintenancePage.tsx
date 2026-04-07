import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, ShieldAlert, Mail } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

export const MaintenancePage: React.FC = () => {
    const { config } = useConfig();

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_70%)]" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full text-center relative z-10 space-y-12"
            >
                {/* Icon Section */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center relative overflow-hidden group">
                            <Hammer className="text-white animate-bounce" size={40} />
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full border-4 border-[#020617] flex items-center justify-center font-black text-[10px] text-white">
                            !
                        </div>
                    </div>
                </div>

                {/* Text Section */}
                <div className="space-y-6">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                        System <span className="text-indigo-500">Recalibration</span>
                    </h1>
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
                        <p className="text-slate-400 font-bold leading-relaxed">
                            {config?.maintenanceMode?.message || 'The platform is currently undergoing a scheduled maintenance sequence. We will be back online shortly.'}
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex flex-col items-center gap-6 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/5 text-slate-500">
                        <ShieldAlert size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Supreme Control Active</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer">
                        <Mail size={14} />
                        <span className="text-[11px] font-bold underline underline-offset-4">
                            {config?.platformInfo?.supportEmail || 'support@dineos.com'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Version */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">
                    DineOS Core v{config?.platformInfo?.version || '1.0.0'}
                </span>
            </div>
        </div>
    );
};

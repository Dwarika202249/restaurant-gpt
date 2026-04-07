import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, AlertOctagon, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const GlobalAnnouncement: React.FC = () => {
  const { config } = useConfig();
  const location = useLocation();
  const [dismissed, setDismissed] = React.useState(false);

  if (!config || !config.announcement || !config.announcement.enabled || dismissed) return null;

  const { message, type, target } = config.announcement;

  // Determine if announcement should show for current route/user
  const isOwnerRoute = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const isCustomerRoute = location.pathname.startsWith('/r/') || location.pathname.startsWith('/customer');

  const shouldShow = 
    target === 'both' || 
    (target === 'owners' && isOwnerRoute) || 
    (target === 'customers' && isCustomerRoute);

  if (!shouldShow) return null;

  const styles = {
    info: 'bg-indigo-600 border-indigo-400 text-white',
    warning: 'bg-amber-500 border-amber-300 text-slate-950',
    critical: 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
  };

  const Icons = {
    info: Info,
    warning: AlertTriangle,
    critical: AlertOctagon
  };

  const Icon = Icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`fixed top-0 left-0 right-0 z-[100] border-b backdrop-blur-md ${styles[type]}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <Icon size={18} className="flex-shrink-0" />
            <p className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">
              {message}
            </p>
          </div>
          <button 
            onClick={() => setDismissed(true)}
            aria-label="Dismiss announcement"
            className="p-1 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

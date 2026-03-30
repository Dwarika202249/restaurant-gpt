import React from 'react';
import { AdminProfileForm, RestaurantSetupForm } from '@/components';
import { useNavigate } from 'react-router-dom';
import { useTabTitle } from '@/hooks';
import { useAppSelector } from '@/hooks/useRedux';
import { motion, AnimatePresence } from 'framer-motion';

const CreateAdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  useTabTitle('Profile Setup');
  
  const user = useAppSelector(state => state.auth.user);
  
  // Conditionally render the step based on user state
  const step = user?.profileComplete ? 'restaurant' : 'profile';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden p-6">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {step === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AdminProfileForm />
            </motion.div>
          ) : (
            <motion.div
              key="restaurant"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <RestaurantSetupForm onComplete={() => navigate('/dashboard')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateAdminProfilePage;

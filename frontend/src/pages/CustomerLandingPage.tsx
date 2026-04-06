import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VITE_API_URL } from '@/config/env';
import { useTabTitle } from '@/hooks';
import { Loading, Error } from '@/components';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ShieldAlert, Store, Clock } from 'lucide-react';

/**
 * Customer Landing Page (QR Scan Entry Point)
 * Route: /r/:restaurantSlug/table/:tableNo
 */
export const CustomerLandingPage = () => {
  const { restaurantSlug, tableNo } = useParams<{
    restaurantSlug: string;
    tableNo: string;
  }>();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [inactiveMode, setInactiveMode] = useState(false);

    const API_URL = VITE_API_URL;

  useTabTitle('Welcome & Verify', restaurantData?.name ? ` | ${restaurantData.name}` : undefined);

  useEffect(() => {
    const initializeCustomerSession = async () => {
      try {
        setLoading(true);
        setError(null);
        setMaintenanceMode(false);
        setInactiveMode(false);

        if (!restaurantSlug || !tableNo) {
          setError('Invalid QR code context');
          return;
        }

        const table = parseInt(tableNo, 10);
        
        // 1. Get restaurant info
        const restaurantResponse = await axios.get(
          `${API_URL}/customer/restaurant/${restaurantSlug}`
        );

        if (!restaurantResponse.data.data) {
          setError('Restaurant not found');
          return;
        }

        const restaurant = restaurantResponse.data.data;
        setRestaurantData(restaurant);

        // 2. Create session
        const sessionResponse = await axios.post(`${API_URL}/customer/session`, {
          restaurantSlug,
          tableNo: table
        });

        const sessionData = sessionResponse.data.data;

        localStorage.setItem('guestSession', JSON.stringify({
          ...sessionData,
          restaurantSlug,
          restaurantName: restaurant.name,
          restaurantLogo: restaurant.logoUrl,
          themeColor: restaurant.themeColor,
          currency: restaurant.currency
        }));

        localStorage.setItem('sessionToken', sessionData.sessionToken);

        // Professional redirect delay for animation to play out
        setTimeout(() => {
          navigate(`/customer/${restaurantSlug}/table/${table}`, { replace: true });
        }, 1500);
      } catch (err: any) {
        const msg = err.response?.data?.message;
        if (msg === 'TABLE_UNDER_MAINTENANCE') {
          setMaintenanceMode(true);
        } else if (msg === 'TABLE_INACTIVE') {
          setInactiveMode(true);
        } else {
          setError(msg || 'Failed to connect to restaurant');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeCustomerSession();
  }, [restaurantSlug, tableNo, navigate]);

  const themeColor = restaurantData?.themeColor || '#6366f1';

  // Maintenance View
  if (maintenanceMode || inactiveMode) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-[#fcfaf8] p-6 relative overflow-hidden"
        style={{ ['--brand-color' as any]: themeColor }}
      >
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,var(--brand-color)_0%,transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-sm w-full text-center"
        >
          <div className="glass p-10 rounded-[3rem] shadow-2xl border border-white/50 backdrop-blur-xl">
            <div className="w-20 h-20 bg-brand-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-brand-500">
               {maintenanceMode ? <Wrench size={40} /> : <ShieldAlert size={40} />}
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">
              {maintenanceMode ? 'Table Servicing' : 'Table Unavailable'}
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
              {maintenanceMode 
                ? "This table is currently being serviced to ensure the best experience. Please choose another table or consult our staff."
                : "This table is currently not accepting orders. Please reach out to our team for assistance."}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                style={{ backgroundColor: themeColor }}
                className="w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] transition-transform"
              >
                Refresh Status
              </button>
              <div className="flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-2xl">
                 <Store size={14} className="text-slate-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{restaurantData?.name || 'Restaurant'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full"
        >
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <Error message={error} />
            <button
              onClick={() => window.location.reload()}
              className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-[#fcfaf8] overflow-hidden relative"
      style={{ ['--brand-color' as any]: themeColor }}
    >
      {/* Themic Background Glow */}
      <div 
        className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_center,var(--brand-color)_0%,transparent_70%)]"
      />

      <div className="relative z-10 w-full max-w-sm px-8 text-center">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Authenticating</p>
            </motion.div>
          ) : (
            <motion.div
              key="branding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-8"
              >
                <div 
                  className="absolute -inset-4 blur-2xl opacity-20 rounded-full bg-[var(--brand-color)]"
                />
                {restaurantData?.logoUrl ? (
                  <img
                    src={restaurantData.logoUrl}
                    alt={restaurantData.name}
                    className="relative h-28 w-28 rounded-full object-cover shadow-2xl ring-4 ring-white"
                  />
                ) : (
                  <div className="relative h-28 w-28 rounded-full bg-white shadow-2xl flex items-center justify-center text-3xl font-black text-slate-900 ring-4 ring-white">
                    {restaurantData?.name?.charAt(0)}
                  </div>
                )}
              </motion.div>

              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
                {restaurantData?.name}
              </h1>
              <div className="flex items-center gap-2 mb-12">
                 <div className="px-3 py-1 bg-white shadow-sm border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Table {tableNo}
                    </span>
                 </div>
              </div>

              {/* Seamless Progress Loader */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner mb-4">
                 <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-[var(--brand-color)]"
                 />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">
                Setting your table
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Branding */}
      <div className="absolute bottom-10 left-10 flex items-center gap-3 opacity-20">
         <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <span className="text-white text-[10px] font-black">AI</span>
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">DineOS</span>
      </div>
    </div>
  );
};

export default CustomerLandingPage;

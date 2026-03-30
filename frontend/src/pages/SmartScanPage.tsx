import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { QrCode, Loader2, AlertCircle } from 'lucide-react';
import { useTabTitle } from '@/hooks';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SmartScanPage = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useTabTitle('Smart Scan');

  useEffect(() => {
    const resolveScan = async () => {
      try {
        const response = await axios.get(`${API_URL}/restaurant/scan/${qrId}`);
        const { restaurant, tableNo } = response.data.data;
        
        // Redirect to the regular customer landing page with the resolved slug
        navigate(`/r/${restaurant.slug}/table/${tableNo}`, { replace: true });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired QR code.');
      }
    };

    if (qrId) {
      resolveScan();
    }
  }, [qrId, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-12 rounded-[3rem] shadow-xl relative overflow-hidden"
        >
          {error ? (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-rose-500" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Oops!</h2>
              <p className="text-slate-500 font-medium mb-8">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <>
              <div className="relative w-24 h-24 mx-auto mb-8">
                 <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full" />
                 <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <QrCode className="text-brand-500" size={32} />
                 </div>
              </div>
              
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">RestaurantGPT</h1>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Table Identity...</p>
              </div>
              
              <p className="text-slate-500 text-sm font-medium">Please wait while we connect you to the restaurant's menu.</p>
            </>
          )}
          
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-1/3 h-full bg-brand-500"
            />
          </div>
        </motion.div>
        
        <p className="mt-10 text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Powered by AI-Driven Restaurant Experience
        </p>
      </div>
    </div>
  );
};

export default SmartScanPage;

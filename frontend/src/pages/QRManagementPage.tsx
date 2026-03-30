import { useState } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import { 
  Download, 
  Eye, 
  Printer, 
  RefreshCw, 
  QrCode as QrIcon, 
  Info,
  ChevronRight,
  FileDown,
  X,
  FileCheck
} from 'lucide-react';
import { Error, Success } from '@/components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

/**
 * QRManagementPage
 * Premium UI for generating and managing table QR codes.
 */
export const QRManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const restaurant = useAppSelector((state) => state.restaurant.currentRestaurant);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleGenerateQR = async (selectedFormat: 'preview' | 'svg' | 'pdf') => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post(
        `${API_URL}/restaurant/qr-generate`,
        { format: selectedFormat },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (selectedFormat === 'pdf') {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${restaurant?.slug}-table-qr-codes.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSuccess(`Premium PDF downloaded successfully!`);
      } else if (selectedFormat === 'svg') {
        const codes = response.data.data.qrCodes;
        codes.forEach((qrCode: any) => {
          const blob = new Blob([qrCode.svg], { type: 'image/svg+xml' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = qrCode.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        });
        setSuccess(`${codes.length} high-fidelity SVGs downloaded!`);
      } else {
        setQrCodes(response.data.data.qrCodes);
        setShowPreview(true);
        setSuccess('QR codes generated for preview.');
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const downloadIndividual = (tableNo: number, svg: string, ext: 'png' | 'svg') => {
    if (ext === 'svg') {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${restaurant?.slug}-table-${String(tableNo).padStart(2, '0')}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, 600, 600);
        canvas.toBlob((b) => {
          if (b) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(b);
            a.download = `${restaurant?.slug}-table-${String(tableNo).padStart(2, '0')}.png`;
            a.click();
          }
        });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto scrollbar-hide">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10"
      >
        <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
          <span className="w-8 h-[2px] bg-brand-500" />
          <span>Operational Assets</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          QR Fleet Management
          <QrIcon className="text-brand-500" size={32} />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Generate, preview, and deploy QR codes for your restaurant tables.
        </p>
      </motion.div>

      {error && <Error message={error} onClose={() => setError(null)} className="mb-6" />}
      {success && <Success message={success} className="mb-6" />}

      {/* Main Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left: Controls */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass dark:glass-dark p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-2xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-6">Fleet Control</h3>
            <div className="space-y-4">
              <button
                onClick={() => handleGenerateQR('preview')}
                disabled={loading}
                className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-brand-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-brand-500/10 rounded-2xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <Eye size={20} className="text-brand-500 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Interactive Preview</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verify all {restaurant?.tablesCount} codes</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-500" />
              </button>

              <button
                onClick={() => handleGenerateQR('pdf')}
                disabled={loading}
                className="w-full flex items-center justify-between p-5 bg-brand-500 text-white rounded-3xl shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Printer size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-tight">Bulk PDF Export</p>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Optimized for high-res print</p>
                  </div>
                </div>
                <FileDown size={16} />
              </button>

              <button
                onClick={() => handleGenerateQR('svg')}
                disabled={loading}
                className="w-full flex items-center justify-between p-5 bg-slate-900 dark:bg-brand-500/10 text-white dark:text-brand-500 border border-transparent dark:border-brand-500/20 rounded-3xl hover:bg-slate-800 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/10 dark:bg-brand-500/20 rounded-2xl">
                    <QrIcon size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-tight text-white dark:text-white">SVG Vector Pack</p>
                    <p className="text-[10px] font-bold opacity-60 text-white/70 dark:text-brand-500 uppercase tracking-widest">For designer toolkits</p>
                  </div>
                </div>
                <ChevronRight size={16} className="opacity-40" />
              </button>
            </div>
          </div>

          <div className="orange-gradient p-8 rounded-[2.5rem] text-white">
            <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={16} /> Quick Guide
            </h4>
            <ul className="text-xs font-medium space-y-3 opacity-90">
              <li className="flex items-start gap-2">
                <FileCheck size={14} className="mt-0.5 shrink-0" />
                <span>PDF is best for direct office printing.</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCheck size={14} className="mt-0.5 shrink-0" />
                <span>SVG allows scaling without quality loss.</span>
              </li>
              <li className="flex items-start gap-2">
                <FileCheck size={14} className="mt-0.5 shrink-0" />
                <span>Sync with table numbers at the venue.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Preview Grid */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {showPreview && qrCodes.length > 0 ? (
              <motion.div
                key="preview-grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass dark:glass-dark p-8 rounded-[2.5rem]"
              >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Fleet Preview</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Table 01 — {String(restaurant?.tablesCount).padStart(2, '0')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleGenerateQR('preview')} 
                      title="Refresh Preview"
                      aria-label="Refresh Preview"
                      className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                    >
                      <RefreshCw size={18} className="text-brand-500" />
                    </button>
                    <button 
                      onClick={() => setShowPreview(false)} 
                      title="Close Preview"
                      aria-label="Close Preview"
                      className="p-3 hover:bg-rose-500/10 rounded-2xl transition-colors"
                    >
                      <X size={18} className="text-rose-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {qrCodes.map((qr) => (
                    <motion.div
                      key={qr.tableNo}
                      whileHover={{ y: -4 }}
                      className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex flex-col items-center"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600 mb-4">Table {String(qr.tableNo).padStart(2, '0')}</span>
                      <div 
                        className="w-full aspect-square bg-white border border-slate-100 rounded-2xl p-2 mb-6 flex items-center justify-center transition-all group-hover:shadow-lg"
                        dangerouslySetInnerHTML={{ __html: qr.svg }}
                      />
                      <div className="flex gap-2 w-full mt-auto">
                        <button 
                          onClick={() => downloadIndividual(qr.tableNo, qr.svg, 'png')}
                          className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-brand-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          PNG
                        </button>
                        <button 
                          onClick={() => downloadIndividual(qr.tableNo, qr.svg, 'svg')}
                          className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          SVG
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] glass dark:glass-dark rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-200 dark:border-slate-800"
              >
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8">
                  <QrIcon size={40} className="text-slate-200 dark:text-slate-700" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Fleet Grid Empty</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">Generate a preview to inspect all table identity points before bulk deployment.</p>
                <button
                  onClick={() => handleGenerateQR('preview')}
                  className="px-10 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-500/20 hover:scale-105 transition-all"
                >
                  Generate Now
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center"
          >
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Processing Fleet Data</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRManagementPage;

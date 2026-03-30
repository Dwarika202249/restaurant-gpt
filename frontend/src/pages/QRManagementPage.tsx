import { useEffect, useState } from 'react';
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
  FileCheck,
  Plus,
  Settings2,
  AlertTriangle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Error, Success } from '@/components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Table {
  _id: string;
  tableNo: number;
  label: string;
  qrId: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export const QRManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [newTableLabel, setNewTableLabel] = useState('');

  const restaurant = useAppSelector((state) => state.restaurant.currentRestaurant);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/restaurant/tables`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setTables(response.data.data);
    } catch (err: any) {
      setError('Failed to load table fleet data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/restaurant/tables`,
        { label: newTableLabel },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSuccess('New table identity added to fleet.');
      setShowAddModal(false);
      setNewTableLabel('');
      fetchTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add table.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTable = async (id: string, updates: Partial<Table>) => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_URL}/restaurant/tables/${id}`,
        updates,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSuccess('Table updated successfully.');
      setEditingTable(null);
      fetchTables();
    } catch (err) {
      setError('Failed to update table.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!window.confirm('Retiring a table will deactivate its QR code. Continue?')) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/restaurant/tables/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSuccess('Table removed from fleet.');
      fetchTables();
    } catch (err) {
      setError('Failed to remove table.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (selectedFormat: 'preview' | 'svg' | 'pdf') => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/restaurant/qr-generate`,
        { format: selectedFormat },
        { 
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: selectedFormat === 'pdf' ? 'blob' : 'json'
        }
      );

      if (selectedFormat === 'pdf') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${restaurant?.slug}-live-qrs.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setSuccess('Bulk PDF Exported Successfully.');
      } else if (selectedFormat === 'svg') {
        const codes = response.data.data.qrCodes;
        // Trigger download for each SVG (or we could zip them, but individual is simpler for now)
        codes.forEach((qr: any) => {
          const blob = new Blob([qr.svg], { type: 'image/svg+xml' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Table-${qr.tableNo}-QR.svg`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        });
        setSuccess(`Exported ${codes.length} high-fidelity SVGs.`);
      } else {
        setQrCodes(response.data.data.qrCodes);
        setShowPreview(true);
        setSuccess('Live preview generated from permanent IDs.');
      }
    } catch (err: any) {
      setError('Generation failed. Ensure you have added tables first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      {/* Header section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-brand-500 font-bold text-sm tracking-widest uppercase mb-2">
            <span className="w-8 h-[2px] bg-brand-500" />
            <span>Operational Assets</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             Fleet & QR Intelligence
            <QrIcon className="text-brand-500" size={32} />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage permanent table identities and smart QR deployments.</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowAddModal(true)}
             className="flex items-center space-x-2 bg-brand-500 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-500/20 hover:scale-105 transition-all"
           >
             <Plus size={16} />
             <span>Add Table Identity</span>
           </button>
        </div>
      </div>

      {error && <Error message={error} onClose={() => setError(null)} className="mb-8" />}
      {success && <Success message={success} className="mb-8" />}

      {/* Main Grid: Management vs Controls */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Fleet List Management */}
        <div className="xl:col-span-3 space-y-6">
          <div className="glass dark:glass-dark rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50/50 dark:bg-white/5 text-[10px] uppercase font-black tracking-widest text-slate-400">
                   <th className="px-8 py-5"># Identity</th>
                   <th className="px-8 py-5">Label / Room</th>
                   <th className="px-8 py-5">Permanent ID</th>
                   <th className="px-8 py-5">Status</th>
                   <th className="px-8 py-5 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                 {tables.map((table) => (
                   <motion.tr key={table._id} layout className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                     <td className="px-8 py-6 font-black text-slate-900 dark:text-white">T-{String(table.tableNo).padStart(2, '0')}</td>
                     <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{table.label}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-brand-500 font-mono">/s/{table.qrId}</code>
                     </td>
                     <td className="px-8 py-6">
                        <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          table.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                          table.status === 'maintenance' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             table.status === 'active' ? 'bg-emerald-500' : 
                             table.status === 'maintenance' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                          <span>{table.status}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right space-x-2">
                        <button 
                          onClick={() => setEditingTable(table)}
                          title="Configure Table" 
                          className="p-2.5 text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 rounded-xl transition-all"
                        >
                          <Settings2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTable(table._id)}
                          title="Remove Table" 
                          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <X size={18} />
                        </button>
                     </td>
                   </motion.tr>
                 ))}
               </tbody>
             </table>
             {tables.length === 0 && !loading && (
               <div className="p-20 text-center flex flex-col items-center">
                 <QrIcon size={48} className="text-slate-200 mb-4" />
                 <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Your table fleet is empty.</p>
               </div>
             )}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="xl:col-span-1 space-y-6">
           <div className="glass dark:glass-dark p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-2xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-6 flex items-center gap-2">
                <Printer size={20} className="text-brand-500" />
                Deployment
              </h3>
              
              <div className="space-y-4">
                 <button
                   onClick={() => handleGenerateQR('preview')}
                   disabled={loading || tables.length === 0}
                   className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl hover:border-brand-500 hover:shadow-lg transition-all group disabled:opacity-50"
                 >
                   <div className="flex items-center space-x-4">
                     <div className="p-3 bg-brand-500/10 rounded-2xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
                       <Eye size={20} className="text-brand-500 group-hover:text-white" />
                     </div>
                     <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Live Fleet Preview</p>
                   </div>
                   <ChevronRight size={16} className="text-slate-300" />
                 </button>

                 <button
                   onClick={() => handleGenerateQR('pdf')}
                   disabled={loading || tables.length === 0}
                   className="w-full flex items-center justify-between p-5 orange-gradient text-white rounded-3xl shadow-xl shadow-brand-500/20 hover:scale-[1.02] transition-all group disabled:opacity-50"
                 >
                   <div className="flex items-center space-x-4">
                     <div className="p-3 bg-white/20 rounded-2xl">
                       <FileDown size={20} />
                     </div>
                     <p className="text-xs font-black uppercase tracking-tight">Bulk PDF Identity</p>
                   </div>
                 </button>
              </div>

              <div className="mt-8 p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10">
                 <div className="flex items-center gap-2 mb-2">
                   <Info size={14} className="text-brand-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fleet Strategy</span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                   Physical QR stickers are static. You can rename tables or move them without replacing stickers.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Preview Modal Overlay */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
             >
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Fleet Intelligence Preview</h3>
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Permanent Identity Grid — {qrCodes.length} Assets</p>
                  </div>
                   <button 
                     onClick={() => setShowPreview(false)} 
                     title="Close Fleet Preview"
                     aria-label="Close Fleet Preview"
                     className="p-4 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-all"
                   >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                      {qrCodes.map((qr) => (
                        <div key={qr.tableNo} className="flex flex-col items-center">
                           <div className="w-full aspect-square border-2 border-slate-100 dark:border-white/5 rounded-3xl p-3 bg-white mb-4 flex items-center justify-center shadow-sm"
                                dangerouslySetInnerHTML={{ __html: qr.svg }} />
                           <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{qr.label}</span>
                           <a 
                             href={qr.url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-[9px] font-mono text-brand-500 hover:text-brand-600 underline underline-offset-2 opacity-70 hover:opacity-100 transition-all flex items-center gap-1"
                           >
                            <ChevronRight size={8} />
                            {qr.url.split('/').slice(-2).join('/')}
                           </a>
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                         <div className="p-2 bg-emerald-500/10 rounded-lg">
                           <CheckCircle2 size={16} className="text-emerald-500" />
                         </div>
                         <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">All Identity Points Verified</span>
                      </div>
                      <div className="flex gap-4">
                         <button onClick={() => handleGenerateQR('pdf')} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Download Printed Set</button>
                      </div>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Table Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl"
             >
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">New Table Identity</h3>
                <p className="text-sm text-slate-500 mb-8 font-medium">Assign a label or room to your new table asset.</p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label 
                      htmlFor="table-label-input"
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 block"
                    >
                      Table Label / Name
                    </label>
                    <input 
                      id="table-label-input"
                      type="text" 
                      placeholder="e.g. Balcony 4, Window Side..." 
                      title="Enter table label"
                      aria-label="Table Label"
                      value={newTableLabel}
                      onChange={(e) => setNewTableLabel(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancel</button>
                    <button onClick={handleAddTable} className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-500/20">Create Entity</button>
                  </div>
                </div>
              </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Edit Table Modal */}
      <AnimatePresence>
        {editingTable && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl"
             >
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Configure T-{String(editingTable.tableNo).padStart(2, '0')}</h3>
                <p className="text-sm text-slate-500 mb-8 font-medium">Modify identity and operational status.</p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label 
                      htmlFor="edit-table-label"
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 block"
                    >
                      Identity Label
                    </label>
                    <input 
                      id="edit-table-label"
                      type="text" 
                      placeholder="Enter new label"
                      value={editingTable.label}
                      onChange={(e) => setEditingTable({...editingTable, label: (e.target as HTMLInputElement).value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Operational Status</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['active', 'maintenance'].map((s) => (
                         <button 
                           key={s}
                           onClick={() => setEditingTable({...editingTable, status: s as any})}
                           className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                             editingTable.status === s ? 'border-brand-500 text-brand-500 bg-brand-500/5' : 'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-400'
                           }`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setEditingTable(null)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancel</button>
                    <button onClick={() => handleUpdateTable(editingTable._id, editingTable)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Apply Changes</button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Pulse */}
      {loading && (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed bottom-10 right-10 z-[120] bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center space-x-4">
            <RefreshCw size={16} className="animate-spin text-brand-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing Fleet...</span>
         </motion.div>
      )}
    </div>
  );
};

export default QRManagementPage;

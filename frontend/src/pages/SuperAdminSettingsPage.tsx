import { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  AlertTriangle, 
  Bell, 
  Cpu, 
  Globe, 
  Save, 
  RefreshCcw,
  Hammer,
  Zap,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { superAdminApi } from '@/services/api';
import { Error as ErrorComp } from '@/components';
import { useTabTitle } from '@/hooks';

export const SuperAdminSettingsPage = () => {
  useTabTitle('Core Configuration');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getGlobalConfig();
      setConfig(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync with global config node');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updateData: any) => {
    try {
      setSaving(true);
      setError(null);
      const response = await superAdminApi.updateGlobalConfig(updateData);
      setConfig(response.data.data);
      setSuccessMsg('Platform mesh updated successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update global config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Accessing Core Config...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter supreme-text-gradient mb-4">
            Core Mesh
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px]">
            Global platform state & architecture control
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={fetchConfig}
            title="Refresh Sync"
            className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {error && <ErrorComp message={error} onClose={() => setError(null)} />}
      
      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center gap-4 text-indigo-400"
        >
          <CheckCircle2 size={24} />
          <span className="font-black uppercase tracking-widest text-xs">{successMsg}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Maintenance Mode Card */}
        <div className="supreme-card group">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                        <Hammer className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-white">Maintenance Mode</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Platform Lockdown</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleUpdate({ maintenanceMode: { ...config?.maintenanceMode, enabled: !config?.maintenanceMode?.enabled } })}
                    title="Toggle Maintenance Mode"
                    className={`w-16 h-8 rounded-full relative transition-all duration-500 ${config?.maintenanceMode?.enabled ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-slate-800'}`}
                >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${config?.maintenanceMode?.enabled ? 'left-9' : 'left-1'}`} />
                </button>
            </div>
            <div className="p-10 space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lockdown Broadcast Message</label>
                    <textarea 
                        value={config?.maintenanceMode?.message}
                        title="Maintenance Message"
                        placeholder="Platform lockdown message..."
                        onChange={(e) => setConfig({ ...config, maintenanceMode: { ...config.maintenanceMode, message: e.target.value } })}
                        className="w-full h-32 bg-white/5 border border-white/5 rounded-3xl p-6 text-white text-sm outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/30 transition-all resize-none"
                    />
                </div>
                <button 
                    disabled={saving}
                    onClick={() => handleUpdate({ maintenanceMode: config.maintenanceMode })}
                    className="w-full py-5 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update State</>}
                </button>
            </div>
        </div>

        {/* Announcement System Card */}
        <div className="supreme-card">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                        <Bell className="text-indigo-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-white">Broadcast System</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Ecosystem-wide Announcements</p>
                    </div>
                </div>
                <button 
                     onClick={() => handleUpdate({ announcement: { ...config?.announcement, enabled: !config?.announcement?.enabled } })}
                    title="Toggle Broadcast System"
                    className={`w-16 h-8 rounded-full relative transition-all duration-500 ${config?.announcement?.enabled ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-800'}`}
                >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ${config?.announcement?.enabled ? 'left-9' : 'left-1'}`} />
                </button>
            </div>
            <div className="p-10 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transmission Type</label>
                        <div className="flex gap-4">
                            {['info', 'warning', 'critical'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setConfig({ ...config, announcement: { ...config.announcement, type: t } })}
                                    className={`flex-1 py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all ${
                                        config?.announcement?.type === t 
                                            ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                                            : 'bg-white/5 border-white/5 text-slate-600'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Broadcast Content</label>
                        <input 
                            type="text"
                            value={config?.announcement?.message}
                            onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, message: e.target.value } })}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-white text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all font-bold"
                            placeholder="Type transmission content..."
                        />
                    </div>
                </div>
                <button 
                    disabled={saving}
                    onClick={() => handleUpdate({ announcement: config.announcement })}
                    className="w-full py-5 bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <><Zap size={18} /> Push Transmission</>}
                </button>
            </div>
        </div>

        {/* Feature Toggles & Platform Info */}
        <div className="supreme-card p-10 space-y-10 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-10">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center">
                        <Cpu className="text-violet-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-white">Mesh Features</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Global functionality states</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {[
                        { label: 'Neural AI Chat Engine', key: 'aiChatEnabled' },
                        { label: 'Platform Loyalty Protocol', key: 'loyaltySystemEnabled' }
                    ].map(f => (
                        <div key={f.key} className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                            <span className="text-white font-black uppercase text-[10px] tracking-widest">{f.label}</span>
                            <button 
                                onClick={() => handleUpdate({ features: { ...config?.features, [f.key]: !config?.features?.[f.key] } })}
                                title={`Toggle ${f.label}`}
                                className={`w-12 h-6 rounded-full relative transition-all duration-500 ${config?.features?.[f.key] ? 'bg-violet-500' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${config?.features?.[f.key] ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                        <span className="text-white font-black uppercase text-[10px] tracking-widest">Global Max Hub Capacity</span>
                        <input 
                            type="number" 
                            title="Global Max Hub Capacity"
                            aria-label="Global Max Hub Capacity"
                            className="w-20 bg-black outline-none border-b border-violet-500 text-center font-black text-violet-500"
                            value={config?.features?.globalMaxTables}
                            onChange={(e) => setConfig({ ...config, features: { ...config.features, globalMaxTables: parseInt(e.target.value) } })}
                            onBlur={() => handleUpdate({ features: config.features })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                        <Globe className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-white">Platform Identity</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Global metadata points</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="supportEmail" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Support Terminal</label>
                            <input 
                                id="supportEmail"
                                type="text"
                                value={config?.platformInfo?.supportEmail}
                                onChange={(e) => setConfig({ ...config, platformInfo: { ...config.platformInfo, supportEmail: e.target.value } })}
                                className="bg-transparent border-b border-white/10 text-white font-bold text-sm outline-none focus:border-blue-500 transition-all py-2"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="systemVersion" className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Version</label>
                            <input 
                                id="systemVersion"
                                type="text"
                                value={config?.platformInfo?.version}
                                onChange={(e) => setConfig({ ...config, platformInfo: { ...config.platformInfo, version: e.target.value } })}
                                className="bg-transparent border-b border-white/10 text-white font-bold text-sm outline-none focus:border-blue-500 transition-all py-2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

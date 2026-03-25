import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Download, ExternalLink, RefreshCw, Layers, ShieldCheck, Cpu, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Mods = () => {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installUrl, setInstallUrl] = useState('');
  const [installName, setInstallName] = useState('');

  const fetchMods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/mods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMods(response.data.plugins || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMods();
  }, []);

  const handleInstall = async (e) => {
    e.preventDefault();
    if (!installUrl || !installName) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/mods/install', {
        url: installUrl,
        fileName: installName.endsWith('.smx') ? installName : `${installName}.smx`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('SourceMod plugin successfully integrated into system.');
      setInstallUrl('');
      setInstallName('');
      fetchMods();
    } catch (err) {
      alert('Integration failed. Verify direct download link.');
    }
  };

  const handleDelete = async (fileName) => {
    if (!confirm(`Are you sure you want to de-register ${fileName}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/mods/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMods();
    } catch (err) {
      alert('Failed to remove plugin from filesystem.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Accessing SourceMod filesystem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight italic uppercase">Plugin Matrix</h2>
          <p className="text-slate-400 mt-1 font-medium tracking-tight">Manage SourceMod extensions and binary assets</p>
        </div>
        
        <button
          onClick={fetchMods}
          className="p-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-primary rounded-2xl border border-white/5 transition-all group"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plugin List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Active Modules</h3>
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-1 rounded-full border border-primary/20">
              {mods.length} Binary files
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {mods.length > 0 ? (
                mods.map((mod, idx) => (
                  <motion.div 
                    key={mod}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative p-6 bg-surface/40 backdrop-blur-md border border-white/5 rounded-3xl hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Cpu className="w-12 h-12" />
                    </div>
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 rounded-2xl transition-all">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold group-hover:text-primary transition-colors truncate max-w-[120px]">{mod}</span>
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Extension File</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDelete(mod)}
                        className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all group/del"
                      >
                        <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
                  <HardDrive className="w-12 h-12 text-slate-700" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No modules detected</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Installation Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl h-fit sticky top-8"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Module Uplink</h3>
          </div>

          <form onSubmit={handleInstall} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Direct Binary URL</label>
              <input
                type="url"
                required
                className="w-full px-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-xs"
                placeholder="https://sourcemod.net/plugin.smx"
                value={installUrl}
                onChange={(e) => setInstallUrl(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Local Designation</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-xs"
                placeholder="plugin_name.smx"
                value={installName}
                onChange={(e) => setInstallName(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={!installUrl || !installName}
              className="w-full py-5 bg-primary hover:bg-primary/90 disabled:bg-white/5 disabled:text-slate-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs mt-4"
            >
              <Plus className="w-5 h-5" />
              Commit Binary
            </button>
            
            <div className="mt-8 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-4 h-4 text-slate-500 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  SourceMod requires direct binary access. Ensure the provided URL points to a compiled <span className="text-slate-400 font-bold">.smx</span> resource.
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Mods;

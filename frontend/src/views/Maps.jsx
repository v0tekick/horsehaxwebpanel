import React, { useState } from 'react';
import axios from 'axios';
import { Map as MapIcon, Plus, ChevronRight, Globe, Box, Search, Play, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const Maps = () => {
  const [customMap, setCustomMap] = useState('');
  const [workshopId, setWorkshopId] = useState('');

  const handleChangeMap = async (mapName) => {
    if (!mapName) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/server/change-map', {
        map: mapName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // We could use a custom toast here, but keeping it simple with alert for now as requested to leave functions
      alert(`Map rotation initiated: ${mapName}`);
    } catch (err) {
      alert('Failed to rotate map. Check console for details.');
    }
  };

  const handleWorkshopMap = async (e) => {
    e.preventDefault();
    if (!workshopId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/mods/workshop-map', {
        workshop_id: workshopId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Workshop deployment scheduled for ID: ${workshopId}`);
      setWorkshopId('');
    } catch (err) {
      alert('Workshop deployment failed.');
    }
  };

  const officialMaps = [
    { id: 'de_dust2', name: 'Dust II', type: 'Active Duty' },
    { id: 'de_mirage', name: 'Mirage', type: 'Active Duty' },
    { id: 'de_inferno', name: 'Inferno', type: 'Active Duty' },
    { id: 'de_overpass', name: 'Overpass', type: 'Active Duty' },
    { id: 'de_nuke', name: 'Nuke', type: 'Active Duty' },
    { id: 'de_ancient', name: 'Ancient', type: 'Active Duty' },
    { id: 'de_anubis', name: 'Anubis', type: 'Active Duty' },
    { id: 'de_train', name: 'Train', type: 'Reserves' }
  ];

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Mission Control</h2>
        <p className="text-slate-400 mt-1 font-medium">Deploy official maps or workshop content</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Official Maps Grid */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Official Deployment</h3>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {officialMaps.length} Maps Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {officialMaps.map((map, idx) => (
              <motion.button
                key={map.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChangeMap(map.id)}
                className="group relative overflow-hidden p-6 bg-surface/40 backdrop-blur-md border border-white/5 rounded-3xl text-left transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-primary transition-all transform group-hover:scale-125 group-hover:rotate-12">
                  <Play className="w-8 h-8 fill-current" />
                </div>
                
                <div className="relative z-10 space-y-1">
                  <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors">{map.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{map.id}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{map.type}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Sidebar Controls */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Workshop Panel */}
          <div className="bg-surface/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl transition-all group-hover:bg-orange-500/20" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Workshop ID</h3>
            </div>

            <form onSubmit={handleWorkshopMap} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Collection Identity</label>
                <input
                  type="text"
                  placeholder="Enter Steam ID..."
                  className="w-full px-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                  value={workshopId}
                  onChange={(e) => setWorkshopId(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={!workshopId}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-slate-800 disabled:to-slate-900 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                <Plus className="w-5 h-5" />
                Initialize
              </button>
            </form>
          </div>

          {/* Custom Command Panel */}
          <div className="bg-surface/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-green-500/10 rounded-full blur-3xl transition-all group-hover:bg-green-500/20" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Manual Change</h3>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Map Filename</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. workshop/123/de_cache"
                    className="w-full pl-11 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-mono text-sm"
                    value={customMap}
                    onChange={(e) => setCustomMap(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => handleChangeMap(customMap)}
                disabled={!customMap}
                className="w-full py-4 bg-white/5 hover:bg-white/10 disabled:bg-transparent disabled:text-slate-700 text-white font-black rounded-2xl border border-white/10 hover:border-green-500/50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                Execute
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Maps;

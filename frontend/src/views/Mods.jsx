import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Download, ExternalLink, RefreshCw } from 'lucide-react';

const Mods = () => {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [installUrl, setInstallUrl] = useState('');
  const [installName, setInstallName] = useState('');

  const fetchMods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/mods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMods(response.data.plugins);
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
      await axios.post('http://localhost:5000/api/mods/install', {
        url: installUrl,
        fileName: installName.endsWith('.smx') ? installName : `${installName}.smx`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mod installed successfully!');
      setInstallUrl('');
      setInstallName('');
      fetchMods();
    } catch (err) {
      alert('Error installing mod');
    }
  };

  const handleDelete = async (fileName) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/mods/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMods();
    } catch (err) {
      alert('Error deleting mod');
    }
  };

  if (loading) return <div className="text-white">Loading SourceMod...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold text-white">SourceMod Management</h2>
        </div>
        <button
          onClick={fetchMods}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
          <div className="bg-slate-900 px-8 py-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Installed Plugins</h3>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold border border-blue-500/20">
              {mods.length} Active
            </span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mods.length > 0 ? (
                mods.map((mod, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-blue-500/30 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="text-white font-medium text-sm">{mod}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(mod)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No SourceMod plugins detected or directory not accessible.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg h-fit">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-semibold text-white">Install Plugin</h3>
          </div>
          <form onSubmit={handleInstall} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Direct Download URL</label>
              <input
                type="url"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/plugin.smx"
                value={installUrl}
                onChange={(e) => setInstallUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Save As</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="plugin_name.smx"
                value={installName}
                onChange={(e) => setInstallName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              <Plus className="w-5 h-5" />
              Install Plugin
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-4">
              Make sure the URL is a direct link to the .smx file.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Mods;

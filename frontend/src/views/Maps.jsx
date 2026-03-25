import React, { useState } from 'react';
import axios from 'axios';
import { Map as MapIcon, Plus, ChevronRight, Globe } from 'lucide-react';

const Maps = () => {
  const [map, setMap] = useState('');
  const [workshopId, setWorkshopId] = useState('');

  const handleChangeMap = async (mapName) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/server/change-map', {
        map: mapName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Changing map to ${mapName}...`);
    } catch (err) {
      alert('Error changing map');
    }
  };

  const handleWorkshopMap = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/mods/workshop-map', {
        workshop_id: workshopId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Setting workshop map to ID ${workshopId}...`);
      setWorkshopId('');
    } catch (err) {
      alert('Error setting workshop map');
    }
  };

  const officialMaps = [
    'de_dust2', 'de_mirage', 'de_inferno', 'de_overpass', 'de_nuke', 'de_ancient', 'de_anubis', 'de_train'
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <MapIcon className="w-8 h-8 text-blue-500" />
        <h2 className="text-3xl font-bold text-white">Map Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <MapIcon className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-semibold text-white">Official Maps</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {officialMaps.map((mapName) => (
              <button
                key={mapName}
                onClick={() => handleChangeMap(mapName)}
                className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 hover:border-blue-500/50 group"
              >
                <span className="font-medium">{mapName}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-semibold text-white">Workshop Map</h3>
            </div>
            <form onSubmit={handleWorkshopMap} className="space-y-4">
              <p className="text-slate-400 text-sm">Enter the Workshop ID to host a map from the collection.</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. 125438255"
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={workshopId}
                  onChange={(e) => setWorkshopId(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Load
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold text-white">Custom Command</h3>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. de_cache"
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={map}
                onChange={(e) => setMap(e.target.value)}
              />
              <button
                onClick={() => handleChangeMap(map)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
              >
                Change Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maps;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Users, Map as MapIcon, Activity } from 'lucide-react';

const Dashboard = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/server/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatus(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-white">Loading status...</div>;
  if (!status) return <div className="text-red-400">Error connecting to server</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Server Dashboard</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
          <Activity className="w-4 h-4" />
          <span className="text-sm font-medium">Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Server Name</p>
              <h3 className="text-xl font-semibold text-white truncate max-w-[200px]">{status.name}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Players</p>
              <h3 className="text-xl font-semibold text-white">
                {status.players.length} / {status.maxplayers}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <MapIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Current Map</p>
              <h3 className="text-xl font-semibold text-white">{status.map}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
            Restart Match
          </button>
          <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors">
            Swap Teams
          </button>
          <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl border border-red-500/20 transition-colors">
            Stop Server
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

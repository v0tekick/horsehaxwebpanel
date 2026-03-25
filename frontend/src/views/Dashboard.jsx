import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Users, Map as MapIcon, Activity, Wifi, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, subValue, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-surface/40 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] shadow-xl"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-4 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
    {subValue && (
      <div className="pt-4 border-t border-white/5">
        <span className="text-slate-500 text-sm font-medium">{subValue}</span>
      </div>
    )}
  </motion.div>
);

const Dashboard = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/server/status', {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Syncing with game server...</p>
      </div>
    );
  }

  const serverName = status?.name || status?.raw?.name || "CS:GO Server";
  const currentMap = status?.map || status?.raw?.map || "unknown";
  const players = status?.players || [];
  const playerCount = players.length;
  const botCount = players.filter(p => p.isBot || p.raw?.bot).length;
  const maxPlayers = status?.maxplayers || 64;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-400 mt-1 font-medium">Real-time server monitoring and control</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-bold uppercase tracking-wider">Server Online</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={Server} 
          label="Server Instance" 
          value={serverName}
          subValue={`Address: ${status?.raw?.address || 'Local'}`}
          color="blue"
        />
        <StatCard 
          icon={Users} 
          label="Active Players" 
          value={`${playerCount} / ${maxPlayers}`}
          subValue={botCount > 0 ? `${botCount} bots connected` : 'No bots detected'}
          color="purple"
        />
        <StatCard 
          icon={MapIcon} 
          label="Current Mission" 
          value={currentMap}
          subValue={`Game Mode: ${status?.raw?.game || 'Competitive'}`}
          color="orange"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface/40 backdrop-blur-md border border-white/5 p-10 rounded-[2.5rem] shadow-xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Wifi className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">System Controls</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center gap-3 p-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-3xl transition-all duration-200 shadow-lg shadow-primary/20 group">
            <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Restart Match</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-3xl border border-white/5 transition-all duration-200 group">
            <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform text-slate-400" />
            <span>Swap Sides</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-3xl border border-white/5 transition-all duration-200 group">
            <Clock className="w-6 h-6 group-hover:scale-110 transition-transform text-slate-400" />
            <span>Reset Map</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-3 p-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-3xl border border-red-500/10 transition-all duration-200 group">
            <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Stop Instance</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

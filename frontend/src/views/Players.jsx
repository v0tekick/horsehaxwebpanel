import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserMinus, Ban, Info, ShieldAlert, Users, Search, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/server/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlayers(response.data.players || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleKick = async (playerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/server/kick', {
        player_id: playerId,
        reason: reason || 'Kicked by administrator'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlayers();
      setReason('');
    } catch (err) {
      alert('Error kicking player');
    }
  };

  const handleBan = async (playerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/server/ban', {
        player_id: playerId,
        reason: reason || 'Banned by administrator',
        duration: 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlayers();
      setReason('');
    } catch (err) {
      alert('Error banning player');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Scanning server players...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Player Management</h2>
          <p className="text-slate-400 mt-1 font-medium">Monitor and manage active connections</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Action reason (e.g. Griefing)"
              className="pl-11 pr-4 py-3 bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all w-full sm:w-64"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="px-5 py-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-white font-bold">{players.length} <span className="text-slate-500 font-medium ml-1 text-sm uppercase tracking-wider">Online</span></span>
          </div>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-xs">Player Info</th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-xs">Status</th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-xs text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {players.length > 0 ? (
                  players.map((player, idx) => (
                    <motion.tr 
                      key={player.name || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner ${
                            player.isBot || player.raw?.bot 
                              ? 'bg-slate-800 text-slate-500 border border-white/5' 
                              : 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20'
                          }`}>
                            {player.name ? player.name[0].toUpperCase() : '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-lg group-hover:text-primary transition-colors">{player.name}</span>
                            <span className="text-slate-500 text-xs font-medium uppercase tracking-tighter">
                              {player.isBot || player.raw?.bot ? 'Synthetic Entity' : 'Human Operator'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {player.isBot || player.raw?.bot ? (
                          <span className="px-3 py-1 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-500/20">
                            Bot
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          {!(player.isBot || player.raw?.bot) ? (
                            <>
                              <button
                                onClick={() => handleKick(player.name)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all duration-200 border border-orange-500/20 font-bold text-sm group/btn"
                                title="Kick Player"
                              >
                                <UserMinus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                <span>Kick</span>
                              </button>
                              <button
                                onClick={() => handleBan(player.name)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 border border-red-500/20 font-bold text-sm group/btn"
                                title="Ban Player"
                              >
                                <Ban className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                <span>Ban</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-600 text-xs italic font-medium">Protected System Process</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-white/5 rounded-full text-slate-600">
                          <Users className="w-12 h-12" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-white font-bold text-xl">No active connections</p>
                          <p className="text-slate-500 font-medium">The server is currently empty</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Players;

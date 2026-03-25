import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserMinus, Ban, Info, ShieldAlert } from 'lucide-react';

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
      setPlayers(response.data.players);
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
        reason: reason
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
        reason: reason,
        duration: 0 // permanent for now
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlayers();
      setReason('');
    } catch (err) {
      alert('Error banning player');
    }
  };

  if (loading) return <div className="text-white">Loading players...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Player Management</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Action reason (e.g. Griefing)"
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 text-slate-400 font-medium">Player</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {players.length > 0 ? (
              players.map((player, idx) => (
                <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        player.isBot || player.raw?.bot 
                          ? 'bg-slate-600 text-slate-400' 
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {player.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{player.name}</span>
                        {(player.isBot || player.raw?.bot) && (
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">AI Bot</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {!(player.isBot || player.raw?.bot) && (
                        <>
                          <button
                            onClick={() => handleKick(player.name)}
                            className="p-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-lg transition-colors border border-orange-500/20"
                            title="Kick"
                          >
                            <UserMinus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleBan(player.name)}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                            title="Ban"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-slate-500">
                  No players currently on the server
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Players;

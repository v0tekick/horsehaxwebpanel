import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, RefreshCw } from 'lucide-react';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold text-white">System Logs</h2>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-700 shadow-2xl p-6 font-mono overflow-y-auto min-h-[500px]">
        <div className="space-y-1">
          {logs.length > 0 ? (
            logs.map((log, idx) => (
              <div key={idx} className="text-sm text-slate-300 border-b border-slate-800/50 py-1">
                {log}
              </div>
            ))
          ) : (
            <div className="text-slate-500 italic">No logs available yet...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;

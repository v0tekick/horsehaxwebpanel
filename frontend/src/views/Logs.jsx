import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Activity, RefreshCw, Terminal, AlertCircle, Info, CheckCircle, Search, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const logsEndRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.logs || []);
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

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (log) => {
    if (log.includes('ERROR') || log.includes('Failed')) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (log.includes('SUCCESS') || log.includes('connected')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (log.includes('INFO') || log.includes('Trying')) return <Info className="w-4 h-4 text-blue-500" />;
    return <Terminal className="w-4 h-4 text-slate-500" />;
  };

  const filteredLogs = logs.filter(log => 
    log.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Retrieving system diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight uppercase italic flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            System Core
          </h2>
          <p className="text-slate-400 mt-1 font-medium">Real-time kernel diagnostics and connection telemetry</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Filter events..."
              className="pl-11 pr-4 py-2.5 bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm w-48 sm:w-64"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button
            onClick={fetchLogs}
            className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-primary rounded-2xl border border-white/5 transition-all group"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-950/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl p-8 font-mono overflow-hidden flex flex-col h-[calc(100vh-16rem)] relative ring-1 ring-white/5"
      >
        <div className="flex items-center gap-2 mb-6 px-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
          <Activity className="w-3 h-3 animate-pulse text-primary" />
          <span>Live Telemetry Stream</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-4">
          <AnimatePresence initial={false}>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group flex items-start gap-4 py-2 px-3 hover:bg-white/[0.03] rounded-lg transition-colors border-l-2 border-transparent hover:border-primary/30"
                >
                  <div className="mt-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                    {getLogIcon(log)}
                  </div>
                  <div className="flex-1 text-sm leading-relaxed break-all">
                    <span className="text-slate-300 group-hover:text-white transition-colors">{log}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20 py-20">
                <Terminal className="w-16 h-16" />
                <p className="text-xl font-black uppercase tracking-[0.5em]">No event data</p>
              </div>
            )}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">
          <div className="flex items-center gap-4">
            <span>Buffer: {logs.length} entries</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <span>Filter: {filteredLogs.length} matches</span>
          </div>
          <div className="flex items-center gap-2 text-primary/50">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Connected
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemLogs;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, Send, ChevronRight, Hash, Trash2, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Console = () => {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleSendCommand = async (e) => {
    if (e) e.preventDefault();
    if (!command.trim()) return;

    const newLogEntry = { 
      type: 'cmd', 
      text: command, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    };
    
    setLogs(prev => [...prev, newLogEntry]);
    const currentCommand = command;
    setCommand('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/server/command', {
        command: currentCommand
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLogs(prev => [...prev, { 
        type: 'res', 
        text: response.data.response, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
      }]);
    } catch (err) {
      setLogs(prev => [...prev, { 
        type: 'err', 
        text: 'System: Failed to transmit command to server instance.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
      }]);
    }
  };

  const clearConsole = () => setLogs([]);

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight italic">Live Console</h2>
            <p className="text-slate-400 font-medium text-sm">Direct RCON interface with server kernel</p>
          </div>
        </div>
        
        <button 
          onClick={clearConsole}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all font-bold text-sm group"
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Purge Buffer</span>
        </button>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 bg-slate-950/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl p-8 font-mono overflow-y-auto relative group custom-scrollbar ring-1 ring-white/5"
      >
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-slate-950/40 to-transparent pointer-events-none z-10" />
        
        <div className="space-y-3 relative z-0">
          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-20 select-none">
              <Cpu className="w-20 h-20 mb-4 animate-pulse" />
              <p className="text-xl font-black uppercase tracking-[0.5em]">Terminal Ready</p>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {logs.map((log, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-4 text-sm leading-relaxed ${
                  log.type === 'cmd' ? 'text-primary' :
                  log.type === 'err' ? 'text-red-400' : 'text-slate-300'
                }`}
              >
                <span className="text-slate-600 select-none font-bold shrink-0">[{log.time}]</span>
                <div className="flex-1 whitespace-pre-wrap break-all">
                  {log.type === 'cmd' ? (
                    <span className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                      <span className="font-bold tracking-tight">{log.text}</span>
                    </span>
                  ) : (
                    <span className="opacity-90">{log.text}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none z-10" />
      </motion.div>

      <form 
        onSubmit={handleSendCommand}
        className="relative group"
      >
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex items-center bg-surface/40 backdrop-blur-md border border-white/10 rounded-3xl p-2 pl-6 shadow-xl ring-1 ring-white/5 group-focus-within:border-primary/50 transition-all overflow-hidden">
          <div className="flex items-center gap-3 text-primary pr-4 border-r border-white/10 shrink-0">
            <Hash className="w-5 h-5 opacity-50" />
            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">RCON</span>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            className="flex-1 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none font-mono text-lg px-4"
            placeholder="Awaiting instruction..."
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            autoFocus
          />
          
          <button
            type="submit"
            disabled={!command.trim()}
            className="p-4 bg-primary hover:bg-primary/90 disabled:bg-white/5 disabled:text-slate-600 text-white rounded-2xl transition-all duration-200 shadow-lg shadow-primary/20 group/send"
          >
            <Zap className={`w-5 h-5 ${command.trim() ? 'animate-pulse' : ''} group-hover/send:scale-125 transition-transform`} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Console;

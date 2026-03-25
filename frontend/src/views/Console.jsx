import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, Send, ChevronRight } from 'lucide-react';

const Console = () => {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleSendCommand = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/server/command', {
        command: command
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs([...logs, { type: 'cmd', text: command }, { type: 'res', text: response.data.response }]);
      setCommand('');
    } catch (err) {
      setLogs([...logs, { type: 'cmd', text: command }, { type: 'err', text: 'Error executing command' }]);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-3">
        <Terminal className="w-8 h-8 text-blue-500" />
        <h2 className="text-3xl font-bold text-white">Server Console</h2>
      </div>

      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-700 shadow-2xl p-6 font-mono overflow-y-auto min-h-[400px]">
        <div className="space-y-2">
          {logs.map((log, idx) => (
            <div key={idx} className={`flex gap-3 text-sm leading-relaxed ${
              log.type === 'cmd' ? 'text-blue-400' :
              log.type === 'err' ? 'text-red-400' : 'text-slate-300'
            }`}>
              <span className="opacity-50 select-none">[{new Date().toLocaleTimeString()}]</span>
              <span className="flex-1 whitespace-pre-wrap">
                {log.type === 'cmd' ? `> ${log.text}` : log.text}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendCommand} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          <ChevronRight className="w-5 h-5" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-16 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all shadow-lg"
          placeholder="Type a command..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default Console;

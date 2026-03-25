import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Terminal, Map, Settings, LogOut, Package } from 'lucide-react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Players from './views/Players';
import Console from './views/Console';
import Maps from './views/Maps';
import Mods from './views/Mods';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" />
            CS:GO Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/players" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
            Players
          </Link>
          <Link to="/console" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
            <Terminal className="w-5 h-5" />
            Console
          </Link>
          <Link to="/maps" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
            <Map className="w-5 h-5" />
            Maps
          </Link>
          <Link to="/mods" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
            <Package className="w-5 h-5" />
            SourceMod
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="/console" element={<Console />} />
                  <Route path="/maps" element={<Maps />} />
                  <Route path="/mods" element={<Mods />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

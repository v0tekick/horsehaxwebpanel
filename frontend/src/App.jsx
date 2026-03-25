import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Terminal, Map, Settings, LogOut, Package, Activity, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Players from './views/Players';
import Console from './views/Console';
import Maps from './views/Maps';
import Mods from './views/Mods';
import SystemLogs from './views/Logs';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const NavItem = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
      <span className="font-medium">{children}</span>
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Sidebar */}
      <aside className="w-72 bg-surface/30 backdrop-blur-md border-r border-white/5 flex flex-col p-6 z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            HORSEHAX
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Main Menu</div>
          <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
          <NavItem to="/players" icon={Users}>Players</NavItem>
          <NavItem to="/console" icon={Terminal}>Console</NavItem>
          <NavItem to="/maps" icon={Map}>Maps</NavItem>
          <NavItem to="/mods" icon={Package}>SourceMod</NavItem>
          <NavItem to="/logs" icon={Activity}>System Logs</NavItem>
        </nav>

        <div className="pt-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8 max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
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
                  <Route path="/logs" element={<SystemLogs />} />
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

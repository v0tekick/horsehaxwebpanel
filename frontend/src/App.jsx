import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Terminal, Map, Settings, LogOut, Package, Activity, Shield, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useMediaQuery } from './hooks/useMediaQuery';

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

const NavItem = ({ to, icon: Icon, children, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      title={isCollapsed ? children : undefined}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-slate-400 hover:text-white hover:bg-white/5",
        isCollapsed && "justify-center px-0"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
      {!isCollapsed && <span className="font-medium">{children}</span>}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className={cn("absolute left-0 w-1 h-6 bg-primary rounded-r-full", isCollapsed && "right-0 left-auto rounded-l-full rounded-r-none")}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const sidebarVariants = {
    expanded: { width: "18rem" },
    collapsed: { width: "5rem" },
    mobileOpen: { x: 0 },
    mobileClosed: { x: "-100%" }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={isMobile ? "mobileClosed" : "expanded"}
        animate={isMobile ? (isMobileOpen ? "mobileOpen" : "mobileClosed") : (isCollapsed ? "collapsed" : "expanded")}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "bg-surface/30 backdrop-blur-md border-r border-white/5 flex flex-col p-6 z-50 h-screen shrink-0",
          isMobile ? "fixed top-0 left-0 w-72" : "relative"
        )}
      >
        <div className={cn("flex items-center mb-10 px-2", isCollapsed ? "justify-center" : "gap-3")}>
          <div className="p-2 bg-primary/20 rounded-lg shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent truncate">
              HORSEHAX
            </h1>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Main Menu</div>
          )}
          <NavItem to="/" icon={LayoutDashboard} isCollapsed={isCollapsed}>Dashboard</NavItem>
          <NavItem to="/players" icon={Users} isCollapsed={isCollapsed}>Players</NavItem>
          <NavItem to="/console" icon={Terminal} isCollapsed={isCollapsed}>Console</NavItem>
          <NavItem to="/maps" icon={Map} isCollapsed={isCollapsed}>Maps</NavItem>
          <NavItem to="/mods" icon={Package} isCollapsed={isCollapsed}>SourceMod</NavItem>
          <NavItem to="/logs" icon={Activity} isCollapsed={isCollapsed}>System Logs</NavItem>
        </nav>

        {/* Toggle Button (Desktop) */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border border-white/10 z-50 hover:scale-110 transition-transform"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        <div className={cn("pt-6 border-t border-white/5", isCollapsed && "flex justify-center")}>
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sign Out" : undefined}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200",
              isCollapsed && "px-0 justify-center w-full"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {isMobile && (
          <header className="h-16 flex items-center justify-between px-6 bg-surface/30 backdrop-blur-md border-b border-white/5 z-30">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-bold text-white tracking-tight">HORSEHAX</span>
            </div>
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </header>
        )}

        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-8 max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
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

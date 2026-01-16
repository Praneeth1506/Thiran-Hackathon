import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, ClipboardList, Settings, User } from 'lucide-react';
import CitizenPage from './pages/CitizenPage';
import DepartmentPage from './pages/DepartmentPage';
import ActivityLog from './pages/ActivityLog';
import './styles/Pages.css';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex text-slate-100 bg-[#0b0f1a] font-['Outfit']">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 p-8 flex flex-col gap-10 bg-[#0d121f] sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">CivicLink</span>
        </div>

        <nav className="flex flex-col gap-3">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Citizen Portal</span>
          </NavLink>
          <NavLink
            to="/department"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck size={20} />
            <span>Department Hub</span>
          </NavLink>
          <NavLink
            to="/logs"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ClipboardList size={20} />
            <span>Activity Logs</span>
          </NavLink>
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                TR
              </div>
              <div>
                <p className="text-sm font-semibold">Tejas R</p>
                <p className="text-xs text-slate-500">System Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-[#0b0f1a]/80 backdrop-blur-xl z-50 shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span className="hover:text-slate-300 cursor-pointer">Dashboard</span>
            <span>/</span>
            <span className="text-slate-100 uppercase tracking-widest text-[10px] font-bold">Workspace</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Settings size={20} className="text-slate-400 hover:text-white cursor-pointer transition-colors" />
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 rounded-lg">Profile Settings</button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-red-500/10 text-red-400 rounded-lg">Sign Out</button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-10 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CitizenPage />} />
          <Route path="/department" element={<DepartmentPage />} />
          <Route path="/logs" element={<ActivityLog />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

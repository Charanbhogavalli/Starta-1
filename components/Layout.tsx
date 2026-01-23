
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAudioMuted, setAudioMuted } from '../services/elevenLabsService';
import { useAuth } from '../contexts/AuthContext';
import DatabaseStatus from './DatabaseStatus';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [muted, setMuted] = useState(isAudioMuted());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleToggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    setAudioMuted(newMuted);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] selection:bg-blue-500/30">
      <header className="border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-2xl sticky top-0 z-[100] h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-blue-500/20 transition-transform group-hover:scale-110 group-hover:rotate-3">S</div>
                <span className="text-2xl font-black tracking-tighter text-white">Starta</span>
              </Link>
              <div className="hidden lg:block">
                <DatabaseStatus />
              </div>
            </div>
            
            <nav className="flex items-center space-x-1 md:space-x-4">
              <div className="flex items-center bg-slate-950/40 border border-slate-800/60 rounded-2xl p-1 gap-1">
                <Link to="/" className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${location.pathname === '/' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-white'}`}>Home</Link>
                <Link to="/funder/dashboard" className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${location.pathname.startsWith('/funder') ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-white'}`}>Funders</Link>
                {isAuthenticated && user?.role === 'founder' && (
                  <Link to="/founder/requests" className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all relative ${location.pathname === '/founder/requests' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-white'}`}>
                    Inbox
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></span>
                  </Link>
                )}
              </div>

              <div className="w-px h-6 bg-slate-800/60 mx-2 hidden md:block"></div>

              <button onClick={handleToggleMute} className="w-10 h-10 flex items-center justify-center text-lg text-slate-400 hover:text-white transition-all hover:bg-slate-800 rounded-xl">
                {muted ? '🔇' : '🔊'}
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 p-1 border border-slate-800/60 bg-slate-800/30 rounded-full hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                    <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full ring-2 ring-slate-900" />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-4 w-64 bg-slate-900/95 border border-slate-800 rounded-[2rem] shadow-2xl py-3 overflow-hidden z-[110] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="px-6 py-4 border-b border-slate-800/50 mb-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated</p>
                        <p className="text-sm text-white font-bold truncate">{user?.email}</p>
                      </div>
                      <Link to="/founder/idea" className="block px-6 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors" onClick={() => setShowProfileMenu(false)}>Analyze New Idea</Link>
                      <button onClick={handleLogout} className="w-full text-left px-6 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-colors">Sign Out</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95">Sign In</Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="border-t border-slate-800/50 bg-slate-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-slate-600 border border-slate-800 shadow-inner">S</div>
          </div>
          <p className="text-slate-500 text-sm font-bold tracking-[0.1em] uppercase">© 2024 Starta. AI-Powered Evaluation Architecture.</p>
          <div className="mt-6 flex justify-center lg:hidden">
             <DatabaseStatus />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

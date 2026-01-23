
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
      <header className="border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110">S</div>
                <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Starta</span>
              </Link>
              <div className="hidden md:block">
                <DatabaseStatus />
              </div>
            </div>
            
            <nav className="flex items-center space-x-2 md:space-x-6 text-sm font-semibold">
              <button onClick={handleToggleMute} className="p-2 text-slate-400 hover:text-white transition-all bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50">
                {muted ? '🔇' : '🔊'}
              </button>

              <Link to="/" className={`${location.pathname === '/' ? 'text-blue-500' : 'text-slate-400 hover:text-white'} transition`}>Home</Link>
              <Link to="/funder/dashboard" className={`${location.pathname.startsWith('/funder') ? 'text-blue-500' : 'text-slate-400 hover:text-white'} transition`}>Funders</Link>
              
              {isAuthenticated && user?.role === 'founder' && (
                <Link to="/founder/requests" className={`${location.pathname === '/founder/requests' ? 'text-blue-500' : 'text-slate-400 hover:text-white'} transition relative`}>
                  Requests
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></span>
                </Link>
              )}

              {isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 p-1 border border-slate-700/50 bg-slate-800/30 rounded-full hover:bg-slate-800 transition shadow-inner">
                    <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full ring-2 ring-slate-800" />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                      </div>
                      <Link to="/founder/idea" className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors" onClick={() => setShowProfileMenu(false)}>Analyze New Idea</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">Sign Out</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20 active:scale-95">Sign In</Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="border-t border-slate-800/50 bg-slate-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400 border border-slate-700">S</div>
          </div>
          <p className="text-slate-500 text-sm font-medium tracking-wide">© 2024 Starta. Powered by Supabase & Gemini AI.</p>
          <div className="mt-4 flex justify-center md:hidden">
             <DatabaseStatus />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

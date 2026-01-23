
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { ConnectionRequest, StartupIdea } from '../types';
import { useNavigate } from 'react-router-dom';

const FounderRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reqs, setReqs] = useState<ConnectionRequest[]>([]);
  const [ideas, setIdeas] = useState<Record<string, StartupIdea>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Fetch requests and ideas in parallel for mapping
      const [requests, allIdeas] = await Promise.all([
        db.getRequestsForFounder(user.id),
        db.getIdeas()
      ]);

      // Map ideas by ID for quick lookup
      const ideaMap: Record<string, StartupIdea> = {};
      allIdeas.forEach(i => {
        if (i.founderId === user.id) ideaMap[i.id] = i;
      });

      setIdeas(ideaMap);
      setReqs(requests);
    } catch (err) {
      console.error("Failed to sync inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const updateStatus = async (id: string, status: 'accepted' | 'declined') => {
    const request = await db.getRequestById(id);
    if (request) {
      const updatedReq = { ...request, status };
      await db.saveRequest(updatedReq);
      
      // Update local state immediately for snappy feel
      setReqs(prev => prev.map(r => r.id === id ? updatedReq : r));
      
      if (status === 'accepted') {
        navigate(`/chat/${id}`);
      }
    }
  };

  const sortedReqs = useMemo(() => {
    return [...reqs].sort((a, b) => {
      // Sort by status (pending first) then by timestamp
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [reqs]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'accepted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'declined': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 text-white">Request Inbox</h1>
          <p className="text-slate-400 font-medium">Manage incoming interest from vetted funders.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Live Sync</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-900/50 rounded-[2.5rem] animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : sortedReqs.length === 0 ? (
        <div className="text-center py-32 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800 animate-in fade-in zoom-in-95 duration-700">
           <div className="text-6xl mb-6 opacity-20">📥</div>
           <h3 className="text-2xl font-black text-white mb-2">No active requests</h3>
           <p className="text-slate-500 font-medium max-w-xs mx-auto">
             When funders request access to your published ideas, they'll appear here for your review.
           </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReqs.map(r => {
            const idea = ideas[r.ideaId];
            const isHighPotential = (idea?.analysis?.score || 0) >= 80;
            const isPending = r.status === 'pending';
            
            return (
              <div 
                key={r.id} 
                className="group bg-slate-900/40 border border-slate-800/60 p-6 md:p-8 rounded-[2.5rem] hover:border-slate-700 transition-all flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden"
              >
                {/* Glow Effect */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-all ${isPending ? 'bg-amber-500' : r.status === 'accepted' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                {/* Funder Info */}
                <div className="relative">
                  <img src={r.funderAvatar} alt={r.funderName} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-slate-800 shadow-xl" />
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-800 rounded-full px-2 py-1 text-[8px] font-black text-slate-500 uppercase tracking-tighter">Funder</div>
                </div>

                {/* Details */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h3 className="text-xl font-black text-white">{r.funderName}</h3>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${getStatusStyle(r.status)}`}>
                      {r.status}
                    </span>
                    {isHighPotential && (
                      <span className="text-[9px] font-black px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest animate-pulse">
                        🔥 High Potential
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-1">
                    Requested access to: <span className="text-white font-bold">{idea?.title || 'Unknown Idea'}</span>
                  </p>
                  <p className="text-slate-600 text-[10px] font-bold uppercase">
                    Received {new Date(r.timestamp).toLocaleDateString()} at {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {isPending ? (
                    <>
                      <button 
                        onClick={() => updateStatus(r.id, 'accepted')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                      >
                        ACCEPT & CHAT
                      </button>
                      <button 
                        onClick={() => updateStatus(r.id, 'declined')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-2xl font-black text-sm transition-all border border-slate-700 active:scale-95"
                      >
                        DECLINE
                      </button>
                    </>
                  ) : r.status === 'accepted' ? (
                    <button 
                      onClick={() => navigate(`/chat/${r.id}`)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 active:scale-95"
                    >
                      <span>OPEN CHAT</span>
                      <span className="text-lg">→</span>
                    </button>
                  ) : (
                    <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-xl">
                      Decision Finalized
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FounderRequests;


import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { StartupIdea, ConnectionRequest } from '../types';
import ScoreDisplay from '../components/ScoreDisplay';
import { speakText, stopSpeaking, isAudioMuted } from '../services/elevenLabsService';

const FunderView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<StartupIdea | null>(null);
  const [request, setRequest] = useState<ConnectionRequest | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollInterval = useRef<number | null>(null);

  const loadData = async () => {
    if (id && user) {
      const currentIdea = await db.getIdeaById(id);
      if (currentIdea) setIdea(currentIdea);
      
      const existingReq = await db.getRequest(id, user.id);
      setRequest(existingReq || null);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Start polling to catch status changes (Accepted/Declined) automatically
    pollInterval.current = window.setInterval(loadData, 3000);
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [id, user]);

  const handleRequest = async () => {
    if (!idea || !user) return;
    
    if (idea.founderId === user.id) {
      alert("You are the owner of this idea.");
      return;
    }

    // Deterministic ID prevents duplicate records in DB
    const reqId = `${idea.id}_${user.id}`;
    const newReq: ConnectionRequest = {
      id: reqId,
      ideaId: idea.id,
      founderId: idea.founderId,
      funderId: user.id,
      funderName: user.name,
      funderAvatar: user.avatar,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    await db.saveRequest(newReq);
    setRequest(newReq);
  };

  const handleUpdateStatus = async (status: 'accepted' | 'declined') => {
    if (!request) return;
    const updatedReq = { ...request, status };
    await db.saveRequest(updatedReq);
    setRequest(updatedReq);
    if (status === 'accepted') {
      navigate(`/chat/${request.id}`);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest">Accessing Secure Vault...</div>;
  if (!idea) return <div className="p-20 text-center">Idea not found</div>;

  const isOwner = user?.id === idea.founderId;
  const isAccepted = request?.status === 'accepted';
  const isLocked = !isOwner && !isAccepted;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link to="/funder/dashboard" className="text-slate-400 hover:text-white mb-8 inline-block flex items-center gap-2 group font-semibold">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Deal Flow
      </Link>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 mb-8 relative overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
          <div className={`${isLocked ? 'blur-2xl grayscale opacity-30' : 'animate-in zoom-in-75 duration-700'} transition-all duration-1000`}>
             <ScoreDisplay score={idea.analysis?.score || 0} size="lg" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
               <h1 className="text-5xl font-black text-white">{idea.title}</h1>
               {isOwner && <span className="bg-blue-600/20 text-blue-400 text-[10px] px-3 py-1 rounded-full border border-blue-500/20 font-black uppercase tracking-widest">Owner</span>}
               {isAccepted && (
                 <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[10px] px-3 py-1 rounded-full border border-emerald-500/20 font-black uppercase tracking-widest">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   Connection Active
                 </div>
               )}
            </div>
            
            <p className="text-slate-400 text-xl mb-10 leading-relaxed font-medium">
              {isLocked ? (
                <span className="italic opacity-50">"The core proposition involves a highly scalable AI-driven architecture focused on {idea.analysis?.oneLineSummary.split(' ').slice(-4).join(' ')}..."</span>
              ) : idea.description}
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {isLocked ? (
                <>
                  {request?.status === 'pending' ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/50">
                      <div className="text-center sm:text-left">
                        <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Status: Pending Verification</p>
                        <p className="text-slate-400 text-xs font-medium mb-4 sm:mb-0">You can confirm the connection manually below.</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleUpdateStatus('accepted')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
                        >
                          <span className="text-xl">✅</span> ACCEPT CHAT
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus('declined')}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-400 px-8 py-4 rounded-2xl font-black transition-all border border-slate-700 active:scale-95"
                        >
                          DECLINE
                        </button>
                      </div>
                    </div>
                  ) : request?.status === 'declined' ? (
                    <div className="bg-rose-500/10 text-rose-500 px-10 py-5 rounded-2xl border border-rose-500/20 font-black">
                      ACCESS DECLINED
                    </div>
                  ) : (
                    <button 
                      onClick={handleRequest} 
                      className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-blue-600/30 active:scale-95 group"
                    >
                      REQUEST FULL DISCLOSURE <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  {!isOwner && request && (
                    <button 
                      onClick={() => navigate(`/chat/${request.id}`)} 
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-emerald-600/30 flex items-center gap-3 active:scale-95 group"
                    >
                      <span className="text-2xl group-hover:rotate-12 transition-transform">💬</span>
                      <span>OPEN SECURE CHATROOM</span>
                    </button>
                  )}
                  {isOwner && (
                    <Link to={`/founder/result/${idea.id}`} className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-5 rounded-2xl font-black transition border border-slate-700">
                      GO TO FOUNDER VIEW
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {isLocked && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl flex items-center justify-center p-12">
            <div className="text-center bg-slate-900/90 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl max-w-sm border-t-white/5">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">🔐</div>
              <h3 className="text-2xl font-black mb-4 text-white">Confidential Idea</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Proprietary analysis, market roadmap, and technical scores are encrypted. Request access to connect with the founder.
              </p>
            </div>
          </div>
        )}
      </div>

      {!isLocked && idea.analysis && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.entries(idea.analysis.breakdown).map(([k, v]) => (
              <div key={k} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-center group hover:border-blue-500/50 transition-all hover:-translate-y-1">
                <div className="text-[10px] uppercase text-slate-500 font-black mb-2 tracking-[0.2em]">{k}</div>
                <div className="text-3xl font-black text-white group-hover:text-blue-400 transition">{v}%</div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-600/5 border border-blue-500/10 p-12 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-blue-500/10 transition"></div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
               <div>
                  <h2 className="text-3xl font-black text-white mb-1">Founder's Pitch</h2>
                  <p className="text-blue-500 text-xs font-black uppercase tracking-widest">AI Synthesized Audio Available</p>
               </div>
               <button 
                  onClick={() => { if(isPlaying) { stopSpeaking(); setIsPlaying(false); } else { speakText(idea.analysis!.pitch); setIsPlaying(true); } }}
                  className={`${isPlaying ? 'bg-rose-600 animate-pulse' : 'bg-white hover:bg-slate-100'} p-6 rounded-2xl transition-all shadow-2xl active:scale-90`}
                >
                 {isPlaying ? (
                   <div className="w-6 h-6 text-white flex items-center justify-center">■</div>
                 ) : (
                   <div className="w-6 h-6 text-slate-900 flex items-center justify-center ml-1">▶</div>
                 )}
               </button>
            </div>
            <p className="text-4xl italic text-white/90 font-serif leading-snug text-center md:text-left max-w-4xl mx-auto md:mx-0">
              "{idea.analysis.pitch}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunderView;

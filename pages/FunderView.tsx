
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { StartupIdea, ConnectionRequest } from '../types';
import ScoreDisplay from '../components/ScoreDisplay';
import { speakText, stopSpeaking, isAudioMuted } from '../services/elevenLabsService';

const FunderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<StartupIdea | null>(null);
  const [request, setRequest] = useState<ConnectionRequest | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (id && user) {
        const currentIdea = await db.getIdeaById(id);
        setIdea(currentIdea || null);
        const existingReq = await db.getRequest(id, user.id);
        setRequest(existingReq || null);
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const handleRequest = async () => {
    if (!idea || !user) return;
    
    if (idea.founderId === user.id) {
      alert("You are the owner of this idea. You have full access already.");
      return;
    }

    const newReq: ConnectionRequest = {
      id: Math.random().toString(36).substr(2, 9),
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

  if (loading) return <div className="p-20 text-center animate-pulse">Loading idea analysis...</div>;
  if (!idea) return <div className="p-20 text-center">Idea not found</div>;

  const isOwner = user?.id === idea.founderId;
  const isLocked = !isOwner && (!request || request.status !== 'accepted');

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link to="/funder/dashboard" className="text-slate-400 hover:text-white mb-8 inline-block flex items-center gap-2 group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Deal Flow
      </Link>

      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className={`${isLocked ? 'blur-2xl grayscale opacity-50' : 'animate-in zoom-in-50 duration-500'} transition-all duration-700`}>
             <ScoreDisplay score={idea.analysis?.score || 0} size="lg" />
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
               <h1 className="text-4xl font-bold">{idea.title}</h1>
               {isOwner && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Your Idea</span>}
            </div>
            
            <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-2xl">
              {isLocked ? (
                <span className="italic">"The core proposition involves a novel application of AI to solve the problem of {idea.analysis?.oneLineSummary.split(' ').slice(-5).join(' ')}..."</span>
              ) : idea.description}
            </p>

            {isLocked ? (
              <div className="flex flex-col items-center md:items-start gap-4">
                {request?.status === 'pending' ? (
                  <div className="bg-amber-500/10 text-amber-500 px-8 py-4 rounded-xl border border-amber-500/20 font-bold flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                    Access Request Pending...
                  </div>
                ) : request?.status === 'declined' ? (
                  <div className="bg-rose-500/10 text-rose-500 px-8 py-4 rounded-xl border border-rose-500/20 font-bold">
                    Access Declined by Founder
                  </div>
                ) : (
                  <button 
                    onClick={handleRequest} 
                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-600/30 active:scale-95"
                  >
                    Request Full Access
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {!isOwner && request && (
                  <button 
                    onClick={() => navigate(`/chat/${request.id}`)} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                  >
                    <span>💬 Message Founder</span>
                  </button>
                )}
                {isOwner && (
                  <Link to={`/founder/result/${idea.id}`} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl font-bold transition">
                    View as Founder
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {isLocked && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-12">
            <div className="text-center bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-2xl max-w-sm border-t-white/10">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold mb-3">IP Protection Active</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                To protect the founder's intellectual property, full analysis, roadmap, and scores are only revealed after an access request is accepted.
              </p>
            </div>
          </div>
        )}
      </div>

      {!isLocked && idea.analysis && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Detailed breakdown and pitch rendering... */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(idea.analysis.breakdown).map(([k, v]) => (
              <div key={k} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 text-center group hover:border-blue-500/50 transition">
                <div className="text-[10px] uppercase text-slate-500 font-black mb-1 tracking-widest">{k}</div>
                <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition">{v}%</div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-600/5 border border-blue-500/10 p-10 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition"></div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
               <h2 className="text-3xl font-bold font-serif text-slate-100 italic">The Founder's Vision</h2>
               <button 
                  onClick={() => { if(isPlaying) { stopSpeaking(); setIsPlaying(false); } else { speakText(idea.analysis!.pitch); setIsPlaying(true); } }}
                  className={`${isPlaying ? 'bg-rose-600' : 'bg-blue-600 hover:bg-blue-500'} text-white p-5 rounded-full transition-all shadow-xl hover:scale-105 active:scale-90`}
                >
                 {isPlaying ? (
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>
                 ) : (
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                 )}
               </button>
            </div>
            <p className="text-2xl italic text-slate-300 font-serif leading-relaxed text-center md:text-left">
              "{idea.analysis.pitch}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunderView;

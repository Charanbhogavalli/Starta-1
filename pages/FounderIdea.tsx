
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { analyzeStartupIdea } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

const FounderIdea: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !user) return;

    setIsSubmitting(true);
    const id = Math.random().toString(36).substring(7);
    
    const newIdea = {
      id,
      founderId: user.id,
      title,
      description,
      status: 'analyzing' as const,
      isPublished: false,
      createdAt: new Date().toISOString(),
    };

    await db.saveIdea(newIdea);
    navigate(`/founder/result/${id}`);

    try {
      const result = await analyzeStartupIdea(`${title}: ${description}`);
      await db.saveIdea({ ...newIdea, status: 'completed', analysis: result });
    } catch (err) {
      await db.saveIdea({ ...newIdea, status: 'failed' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 lg:py-24">
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-black mb-4 text-white tracking-tight">Idea Workbench</h1>
        <p className="text-slate-400 text-lg font-medium">Submit your concept for deep evaluation. This analysis is <span className="text-white">100% private</span>.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -mr-32 -mt-32"></div>
        
        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Project Name</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full px-8 py-5 bg-slate-950/50 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-xl font-bold text-white placeholder-slate-700 shadow-inner" 
              placeholder="e.g. Project Hyperion" 
              required 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Problem & Solution Statement</label>
            <textarea 
              rows={8} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full px-8 py-6 bg-slate-950/50 border border-slate-800 rounded-[2rem] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-lg font-medium text-slate-200 placeholder-slate-700 shadow-inner leading-relaxed" 
              placeholder="Describe the market gap, your technical approach, and the competitive advantage..." 
              required 
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-95 text-lg group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>RUNNING ANALYSIS...</span>
                </>
              ) : (
                <>
                  <span>INITIALIZE EVALUATION</span>
                  <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
        <div className="flex items-center gap-4 text-slate-500">
           <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">🛡️</div>
           <span className="text-xs font-bold uppercase tracking-widest">Enterprise Encryption</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
           <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">🤖</div>
           <span className="text-xs font-bold uppercase tracking-widest">Gemini 3 Pro Engine</span>
        </div>
      </div>
    </div>
  );
};

export default FounderIdea;


import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { StartupIdea } from '../types';

const FunderDashboard: React.FC = () => {
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      const all = await db.getIdeas();
      // Only show published ideas to funders
      setIdeas(all.filter(i => i.isPublished));
      setLoading(false);
    };
    load();
  }, []);

  const filteredIdeas = useMemo(() => {
    if (!searchQuery.trim()) return ideas;
    
    const query = searchQuery.toLowerCase();
    return ideas.filter(idea => 
      idea.title.toLowerCase().includes(query) || 
      idea.description.toLowerCase().includes(query) ||
      idea.analysis?.oneLineSummary.toLowerCase().includes(query)
    );
  }, [ideas, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black mb-4 text-white tracking-tight">Deal Flow</h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">Browse high-potential ventures screened by our VC intelligence engine. Unlock full analysis by requesting founder disclosure.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full lg:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search sector, tech, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 py-5 bg-slate-900/40 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder-slate-600 font-bold shadow-2xl backdrop-blur-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-500 hover:text-white transition-colors"
            >
              <span className="bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black uppercase">✕</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-80 bg-slate-900/30 rounded-[2.5rem] animate-pulse border border-slate-800"></div>
           ))}
        </div>
      ) : filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIdeas.map(idea => (
            <div key={idea.id} className="group relative bg-slate-900/30 border border-slate-800/80 p-8 rounded-[2.5rem] hover:border-blue-500/40 transition-all hover:-translate-y-2 shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex-1 pr-4">
                   <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight mb-2">{idea.title}</h3>
                   <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 uppercase tracking-widest">Vetted</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">SCORE</span>
                  <div className="text-3xl font-black text-blue-500 font-mono leading-none group-hover:scale-110 transition-transform origin-right">
                    {idea.analysis?.score || '--'}
                  </div>
                </div>
              </div>

              <p className="text-slate-400 font-medium italic mb-10 leading-relaxed flex-grow relative z-10 text-sm">
                "{idea.analysis?.oneLineSummary || 'Proprietary summary pending evaluation...'}"
              </p>

              <Link 
                to={`/funder/view/${idea.id}`}
                className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 relative z-10 text-center"
              >
                REQUEST ACCESS
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 bg-slate-900/20 rounded-[4rem] border border-dashed border-slate-800/50 animate-in fade-in zoom-in-95 duration-700">
           <div className="text-7xl mb-8 opacity-20">🔎</div>
           <h3 className="text-3xl font-black text-white mb-3">Zero Matches</h3>
           <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg">
             No ventures match your current search parameters. Expand your criteria or check back later.
           </p>
           <button 
             onClick={() => setSearchQuery('')}
             className="mt-10 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-xl"
           >
             Reset Deal Flow
           </button>
        </div>
      )}
    </div>
  );
};

export default FunderDashboard;


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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 text-white">Deal Flow</h1>
          <p className="text-slate-400 font-medium">Browse summaries of vetted ideas. Request access to unlock full analysis.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, tech, or market..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-white placeholder-slate-600 font-semibold shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
            >
              <span className="bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">✕</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-72 bg-slate-800/50 rounded-[2rem] animate-pulse border border-slate-800"></div>
           ))}
        </div>
      ) : filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIdeas.map(idea => (
            <div key={idea.id} className="group bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] hover:border-blue-500/50 transition-all hover:-translate-y-1 shadow-xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{idea.title}</h3>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full uppercase font-black tracking-widest mb-2">Vetted</span>
                  <div className="text-xl font-mono font-black text-slate-500 group-hover:text-blue-500 transition-colors">
                    {idea.analysis?.score || '--'}
                  </div>
                </div>
              </div>

              <p className="text-slate-400 italic mb-10 leading-relaxed flex-grow font-medium relative z-10">
                "{idea.analysis?.oneLineSummary || 'Confidential summary pending analysis...'}"
              </p>

              <Link 
                to={`/funder/view/${idea.id}`}
                className="w-full bg-slate-800 text-center py-4 rounded-2xl font-black text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95 relative z-10"
              >
                REQUEST ACCESS
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800 animate-in fade-in zoom-in-95 duration-500">
           <div className="text-6xl mb-6 opacity-30">🔍</div>
           <h3 className="text-2xl font-black text-white mb-2">No matches found</h3>
           <p className="text-slate-500 font-medium max-w-xs mx-auto">
             Try adjusting your search criteria or explore our featured deal flow.
           </p>
           <button 
             onClick={() => setSearchQuery('')}
             className="mt-8 text-blue-500 font-black text-sm uppercase tracking-widest hover:text-blue-400 transition"
           >
             Clear Search
           </button>
        </div>
      )}
    </div>
  );
};

export default FunderDashboard;

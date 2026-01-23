
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { StartupIdea } from '../types';

const FunderDashboard: React.FC = () => {
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const all = await db.getIdeas();
      setIdeas(all.filter(i => i.isPublished));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Deal Flow</h1>
        <p className="text-slate-400">Browse summaries of vetted ideas. Request access to unlock full analysis.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-800 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map(idea => (
            <div key={idea.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl hover:border-blue-500 transition shadow-lg flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{idea.title}</h3>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">Private</span>
              </div>
              <p className="text-slate-300 italic mb-6 leading-relaxed flex-grow">
                "{idea.analysis?.oneLineSummary || 'Summary pending analysis...'}"
              </p>
              <Link 
                to={`/funder/view/${idea.id}`}
                className="w-full bg-slate-900 text-center py-3 rounded-xl font-bold text-blue-500 hover:bg-blue-600 hover:text-white transition"
              >
                Request to Unlock
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FunderDashboard;

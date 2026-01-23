
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { StartupIdea } from '../types';

const FounderInsights: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<StartupIdea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const i = await db.getIdeaById(id);
        setIdea(i || null);
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Loading roadmap...</div>;
  if (!idea || !idea.analysis) {
    return <div className="p-20 text-center">Idea not found</div>;
  }

  const { analysis } = idea;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to={`/founder/result/${id}`} className="text-slate-400 hover:text-white mb-8 inline-block">← Back to Results</Link>
      
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Strategic Roadmap</h1>
        <p className="text-slate-400">AI-generated steps to improve your idea's viability and score.</p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-6 text-blue-500">Core Improvement Suggestions</h2>
          <div className="grid grid-cols-1 gap-6">
            {analysis.suggestions.map((suggestion, i) => (
              <div key={i} className="flex space-x-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="text-slate-200 text-lg leading-relaxed">
                    {suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Competitor Analysis Summary</h2>
          <p className="text-slate-400 mb-6">
            Based on current market data, your idea faces moderate competition.
          </p>
        </section>
      </div>
    </div>
  );
};

export default FounderInsights;


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { StartupIdea } from '../types';

const LandingPage: React.FC = () => {
  const [recentIdeas, setRecentIdeas] = useState<StartupIdea[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const ideas = await db.getIdeas();
      setRecentIdeas(ideas.filter(i => i.isPublished).slice(0, 3));
    };
    fetch();
  }, []);

  return (
    <div className="relative isolate">
      {/* Hero Glow */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-indigo-800 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold leading-6 text-blue-400 ring-1 ring-inset ring-blue-500/20 bg-blue-500/5 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
              Now powered by Supabase Real-time
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8 leading-[1.1]">
              The ATS for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Startup Ideas</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-slate-400 max-w-2xl mx-auto">
              Screen concepts, validate market-fit, and connect with venture capital using our deep-learning evaluation engine.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/founder/idea"
                className="w-full sm:w-auto rounded-2xl bg-blue-600 px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-600/30 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all hover:scale-105 active:scale-95"
              >
                Analyze My Concept
              </Link>
              <Link to="/funder/dashboard" className="text-base font-bold leading-6 text-white hover:text-blue-400 transition-colors flex items-center gap-2">
                Discover Deal Flow <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Live Pulse Section */}
          <div className="mt-32">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold">Deep Tech Pulse</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                LIVE FROM SUPABASE
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentIdeas.length > 0 ? recentIdeas.map(idea => (
                <div key={idea.id} className="group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 transition-all hover:-translate-y-1">
                  <div className="text-blue-500 text-xs font-black uppercase tracking-widest mb-4">Vetted Idea</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{idea.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed italic">
                    "{idea.analysis?.oneLineSummary}"
                  </p>
                  <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500">SCORE</span>
                    <span className="text-lg font-mono font-bold text-blue-500">{idea.analysis?.score}</span>
                  </div>
                </div>
              )) : (
                [1,2,3].map(i => (
                  <div key={i} className="h-64 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl flex items-center justify-center">
                    <span className="text-slate-600 font-bold text-sm">Awaiting submissions...</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 font-bold">01</div>
              <h3 className="text-xl font-bold mb-3 text-white">Private Screening</h3>
              <p className="text-slate-400 leading-relaxed">Evaluation is kept strictly confidential until you decide to publish for vetted investors.</p>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-500 font-bold">02</div>
              <h3 className="text-xl font-bold mb-3 text-white">Gemini Analysis</h3>
              <p className="text-slate-400 leading-relaxed">Our models dissect your idea across 5 key dimensions: Innovation, Market, Feasibility, Scale, and Monetization.</p>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-emerald-600/10 rounded-full flex items-center justify-center text-emerald-500 font-bold">03</div>
              <h3 className="text-xl font-bold mb-3 text-white">Secure Deal Flow</h3>
              <p className="text-slate-400 leading-relaxed">Funders request access to your full analysis and IP through a secure double-opt-in request system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

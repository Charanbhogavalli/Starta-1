
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
    <div className="relative isolate overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-slate-900/0 to-slate-900/0"></div>
        <div className="absolute top-0 inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute inset-0 bg-grid-slate-800/[0.05] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      </div>

      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] leading-6 text-blue-400 ring-1 ring-inset ring-blue-500/20 bg-blue-500/5 mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
              The Standard for Idea Validation
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white sm:text-8xl mb-8 leading-[0.9] lg:px-10">
              Transforming <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">Concepts</span> into Capital.
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-slate-400 max-w-2xl mx-auto font-medium">
              Starta is an AI-driven screening platform designed for the next generation of founders and venture capitalists.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/founder/idea"
                className="w-full sm:w-auto rounded-2xl bg-white px-10 py-5 text-lg font-black text-slate-950 shadow-2xl hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
              >
                Analyze Concept
              </Link>
              <Link to="/funder/dashboard" className="text-base font-black uppercase tracking-widest leading-6 text-white hover:text-blue-400 transition-colors flex items-center gap-2 group">
                Discover Deal Flow <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Live Pulse Section */}
          <div className="mt-40">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4 border-b border-slate-800/50 pb-8">
              <div>
                <h2 className="text-3xl font-black text-white">Market Pulse</h2>
                <p className="text-slate-500 font-medium">Recently published and vetted opportunities.</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE UPDATES
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentIdeas.length > 0 ? recentIdeas.map(idea => (
                <div key={idea.id} className="group relative bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2.5rem] hover:border-blue-500/40 transition-all hover:-translate-y-2 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6 block bg-blue-500/5 w-fit px-3 py-1 rounded-full border border-blue-500/10">Vetted Idea</div>
                  <h3 className="text-2xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors">{idea.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed font-medium mb-8">
                    {idea.analysis?.oneLineSummary}
                  </p>
                  <div className="pt-6 border-t border-slate-800/50 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Match Score</span>
                      <span className="text-3xl font-black text-blue-500 font-mono leading-none">{idea.analysis?.score}</span>
                    </div>
                    <Link to={`/funder/view/${idea.id}`} className="text-white bg-slate-800 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-600 transition-colors">VIEW</Link>
                  </div>
                </div>
              )) : (
                [1,2,3].map(i => (
                  <div key={i} className="h-72 bg-slate-900/20 border border-slate-800/50 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/50 mb-4 animate-pulse"></div>
                    <span className="text-slate-600 font-bold text-sm">Synchronizing deal flow...</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="relative group">
              <div className="mb-6 w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl shadow-blue-600/5">01</div>
              <h3 className="text-2xl font-black mb-4 text-white">Private Screening</h3>
              <p className="text-slate-400 leading-relaxed font-medium">Evaluation is kept strictly confidential until you decide to publish for vetted investors.</p>
            </div>
            <div className="relative group">
              <div className="mb-6 w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-xl shadow-indigo-600/5">02</div>
              <h3 className="text-2xl font-black mb-4 text-white">Gemini Analysis</h3>
              <p className="text-slate-400 leading-relaxed font-medium">Our models dissect your idea across 5 key dimensions: Innovation, Market, Feasibility, Scale, and Monetization.</p>
            </div>
            <div className="relative group">
              <div className="mb-6 w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500 text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-xl shadow-emerald-600/5">03</div>
              <h3 className="text-2xl font-black mb-4 text-white">Secure Access</h3>
              <p className="text-slate-400 leading-relaxed font-medium">Funders request access to your full analysis and IP through a secure double-opt-in request system.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

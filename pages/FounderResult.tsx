
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { StartupIdea } from '../types';
import ScoreDisplay from '../components/ScoreDisplay';
import RadarChart from '../components/RadarChart';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { speakText, generateVoicePitch, stopSpeaking, isAudioMuted } from '../services/elevenLabsService';

const FounderResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<StartupIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiceGenerating, setVoiceGenerating] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    const pollIdea = async () => {
      if (!id) return;
      const currentIdea = await db.getIdeaById(id);
      if (currentIdea) {
        setIdea(currentIdea);
        if (currentIdea.status === 'completed' || currentIdea.status === 'failed') {
          setLoading(false);
          return;
        }
      }
      timeoutId = window.setTimeout(pollIdea, 2000);
    };
    pollIdea();
    return () => clearTimeout(timeoutId);
  }, [id]);

  const handleGenerateVoice = async () => {
    if (!idea?.analysis?.pitch) return;
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }
    if (isAudioMuted()) {
      alert("Audio is muted. Please unmute in the header to listen.");
      return;
    }
    setVoiceGenerating(true);
    await generateVoicePitch(idea.analysis.pitch);
    setVoiceGenerating(false);
    setVoiceReady(true);
    setIsPlaying(true);
    speakText(idea.analysis.pitch);
  };

  const handlePublish = async () => {
    if (!id || !idea) return;
    const updatedIdea = { ...idea, isPublished: true };
    await db.saveIdea(updatedIdea);
    setIdea(updatedIdea);
  };

  if (loading || !idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-3 text-white">Analyzing Your Idea...</h1>
          <p className="text-slate-400 text-lg">Our VC-trained models are running a multi-dimensional stress test.</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (idea.status === 'failed' || !idea.analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-6">📉</div>
        <h1 className="text-3xl font-bold mb-4 text-white">Evaluation Failed</h1>
        <p className="text-slate-400 mb-8">We couldn't process your idea at this time. Please check your internet connection.</p>
        <Link to="/founder/idea" className="bg-blue-600 px-8 py-3 rounded-2xl inline-block font-bold hover:bg-blue-500 transition shadow-xl">Back to Workbench</Link>
      </div>
    );
  }

  const { analysis } = idea;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row gap-12 mb-20">
        <div className="lg:w-1/3 flex flex-col items-center">
           <ScoreDisplay score={analysis.score} size="lg" />
           <div className="mt-8 w-full">
              <RadarChart data={analysis.breakdown} />
           </div>
        </div>

        <div className="lg:w-2/3">
          <div className="flex flex-wrap items-center gap-3 mb-4">
             <h1 className="text-5xl font-black text-white">{idea.title}</h1>
             {idea.isPublished && (
               <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest animate-pulse">
                 Live in Deal Flow
               </span>
             )}
          </div>
          <p className="text-slate-400 text-xl mb-10 leading-relaxed font-medium">
            {idea.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handlePublish}
              disabled={idea.isPublished}
              className={`${
                idea.isPublished 
                ? 'bg-slate-800/50 text-slate-500 border border-slate-700 cursor-default' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-600/20 active:scale-95'
              } px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3`}
            >
              {idea.isPublished ? (
                <><span>PUBLISHED</span><span className="text-emerald-500">✓</span></>
              ) : (
                <>
                   <span className="text-xl">🚀</span>
                   <span>PUBLISH TO INVESTORS</span>
                </>
              )}
            </button>
            
            {!idea.isPublished && (
              <Link to={`/founder/insights/${id}`} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold transition border border-slate-700">
                View Roadmap
              </Link>
            )}

            {idea.isPublished && (
              <Link to="/funder/dashboard" className="text-blue-500 hover:text-blue-400 font-bold transition flex items-center text-sm underline underline-offset-8">
                View Public Listing →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-emerald-500/10 text-8xl font-black select-none pointer-events-none group-hover:scale-110 transition-transform">PROS</div>
          <h2 className="text-2xl font-black mb-8 text-emerald-400 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">✓</div>
             Strategic Advantage
          </h2>
          <ul className="space-y-4">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-4 text-slate-300 leading-relaxed">
                <span className="text-emerald-500 mt-1">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/10 p-10 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-rose-500/10 text-8xl font-black select-none pointer-events-none group-hover:scale-110 transition-transform">CONS</div>
          <h2 className="text-2xl font-black mb-8 text-rose-400 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-sm">!</div>
             Risk Vector
          </h2>
          <ul className="space-y-4">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-4 text-slate-300 leading-relaxed">
                <span className="text-rose-500 mt-1">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The Pitch Card */}
      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 p-12 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32"></div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-2">Elevator Pitch</h2>
            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">Synthesized by AI Engine</p>
          </div>
          <button
            onClick={handleGenerateVoice}
            disabled={voiceGenerating}
            className={`flex items-center gap-4 ${isPlaying ? 'bg-rose-600 hover:bg-rose-500' : 'bg-white hover:bg-slate-100 text-slate-900'} px-10 py-5 rounded-2xl text-lg font-black transition-all shadow-2xl active:scale-95 disabled:opacity-50`}
          >
            {voiceGenerating ? (
              <div className="w-6 h-6 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <>
                <div className="w-6 h-6">{isPlaying ? '■' : '▶'}</div>
                <span>{isPlaying ? 'STOP PLAYBACK' : (voiceReady ? 'REPLAY PITCH' : 'LISTEN TO AI PITCH')}</span>
              </>
            )}
          </button>
        </div>
        <p className="text-3xl italic text-white leading-[1.6] font-serif text-center md:text-left max-w-4xl mx-auto">
          "{analysis.pitch}"
        </p>
      </div>
    </div>
  );
};

export default FounderResult;

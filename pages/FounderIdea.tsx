
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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Submit Your Idea</h1>
        <p className="text-slate-400">Describe your concept. Analysis is private until you publish.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Idea Name</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. AI-Powered CRM" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Detailed Description</label>
          <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Problem, Solution, Roadmap..." required />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition shadow-lg flex items-center justify-center gap-2">
          {isSubmitting ? <><div className="w-5 h-5 border-2 border-t-white rounded-full animate-spin"></div>Processing...</> : 'Analyze My Idea'}
        </button>
      </form>
    </div>
  );
};

export default FounderIdea;

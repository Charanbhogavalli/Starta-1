
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { ConnectionRequest } from '../types';
import { useNavigate } from 'react-router-dom';

const FounderRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reqs, setReqs] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    if (user) {
      const requests = await db.getRequestsForFounder(user.id);
      setReqs(requests);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const updateStatus = async (id: string, status: 'accepted' | 'declined') => {
    const request = await db.getRequestById(id);
    if (request) {
      const updatedReq = { ...request, status };
      await db.saveRequest(updatedReq);
      await loadRequests();
      if (status === 'accepted') {
        navigate(`/chat/${id}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Access Requests</h1>
          <p className="text-slate-400">Funders who want to see your detailed analysis and IP.</p>
        </div>
        <div className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 animate-pulse">
          Live Updates Active
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : reqs.length === 0 ? (
        <div className="text-center py-24 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
           <div className="text-5xl mb-4">📬</div>
           <p className="text-slate-400 text-lg mb-2">Your inbox is quiet for now.</p>
           <p className="text-slate-500 text-sm max-w-xs mx-auto">Make sure your ideas are published.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reqs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(r => (
            <div key={r.id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-600 transition">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={r.funderAvatar} className="w-14 h-14 rounded-full border-2 border-slate-700" alt="Funder" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{r.funderName}</h3>
                  <p className="text-sm text-slate-400">Requested access to idea ID: <span className="text-blue-400 font-semibold">{r.ideaId}</span></p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                {r.status === 'pending' ? (
                  <>
                    <button onClick={() => updateStatus(r.id, 'accepted')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold transition">Accept</button>
                    <button onClick={() => updateStatus(r.id, 'declined')} className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-xl font-bold transition">Decline</button>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg ${r.status === 'accepted' ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border border-rose-500/20'}`}>
                      {r.status}
                    </span>
                    {r.status === 'accepted' && (
                      <button onClick={() => navigate(`/chat/${r.id}`)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Open Chat</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FounderRequests;

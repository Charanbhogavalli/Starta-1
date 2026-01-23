
import React, { useState, useEffect } from 'react';
import { db, DBStatus } from '../services/db';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<DBStatus>('connecting');

  useEffect(() => {
    const check = () => setStatus(db.getStatus());
    const interval = setInterval(check, 3000);
    check();
    return () => clearInterval(interval);
  }, []);

  const config = {
    connecting: { label: 'Syncing...', color: 'bg-amber-500', text: 'text-amber-500' },
    cloud: { label: 'Supabase Cloud', color: 'bg-emerald-500', text: 'text-emerald-500' },
    local: { label: 'Local Storage', color: 'bg-blue-500', text: 'text-blue-500' }
  };

  const current = config[status];

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-[10px] font-bold uppercase tracking-wider">
      <div className={`w-1.5 h-1.5 rounded-full ${current.color} ${status === 'connecting' ? 'animate-pulse' : ''}`}></div>
      <span className={current.text}>{current.label}</span>
    </div>
  );
};

export default DatabaseStatus;


import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
        <div className="w-48 h-48 bg-slate-800 rounded-full"></div>
        <div className="flex-1 space-y-4 w-full">
          <div className="h-8 bg-slate-800 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-32 bg-slate-800 rounded"></div>
        <div className="h-32 bg-slate-800 rounded"></div>
        <div className="h-32 bg-slate-800 rounded"></div>
        <div className="h-32 bg-slate-800 rounded"></div>
      </div>
      <div className="h-64 bg-slate-800 rounded"></div>
    </div>
  );
};

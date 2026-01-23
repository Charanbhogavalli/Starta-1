
import React from 'react';

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, size = 'md' }) => {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (s >= 60) return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
    if (s >= 40) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
  };

  const dimensions = {
    sm: 'w-12 h-12 text-sm border-2',
    md: 'w-24 h-24 text-2xl border-4',
    lg: 'w-48 h-48 text-6xl border-8'
  };

  return (
    <div className={`rounded-full flex items-center justify-center font-bold font-mono transition-all duration-1000 ${dimensions[size]} ${getColor(score)}`}>
      {score}
    </div>
  );
};

export default ScoreDisplay;

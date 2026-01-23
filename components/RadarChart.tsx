
import React from 'react';

interface RadarChartProps {
  data: {
    innovation: number;
    market: number;
    feasibility: number;
    scalability: number;
    monetization: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const size = 300;
  const center = size / 2;
  const radius = center * 0.8;
  // Fix: Explicitly cast Object.values(data) to number[] to prevent 'unknown' inference in map callbacks.
  const points = Object.values(data) as number[];
  const keys = Object.keys(data);

  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const x = center + (radius * value / 100) * Math.cos(angle);
    const y = center + (radius * value / 100) * Math.sin(angle);
    return { x, y };
  };

  const polyPoints = points.map((val, i) => {
    const { x, y } = getCoordinates(val, i, points.length);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative w-full max-w-[300px] aspect-square mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-xl overflow-visible">
        {/* Background Hexagon Rings */}
        {[20, 40, 60, 80, 100].map((ring) => (
          <polygon
            key={ring}
            points={points.map((_, i) => {
              const { x, y } = getCoordinates(ring, i, points.length);
              return `${x},${y}`;
            }).join(' ')}
            className="fill-none stroke-slate-700/50 stroke-1"
          />
        ))}
        
        {/* Axis Lines */}
        {keys.map((_, i) => {
          const { x, y } = getCoordinates(100, i, points.length);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-slate-700/50 stroke-1"
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={polyPoints}
          className="fill-blue-500/20 stroke-blue-500 stroke-2 transition-all duration-1000"
        />

        {/* Labels */}
        {keys.map((key, i) => {
          const { x, y } = getCoordinates(115, i, points.length);
          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] uppercase font-black tracking-tighter"
            >
              {key}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;

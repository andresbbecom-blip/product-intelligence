'use client';

import { useEffect, useState } from 'react';

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColor(score: number, inverted: boolean) {
  const v = inverted ? 100 - score : score;
  if (v >= 70) return '#10B981';
  if (v >= 40) return '#F59E0B';
  return '#EF4444';
}

interface ScoreCircleProps {
  score: number;
  label: string;
  size?: number;
  inverted?: boolean;
  delay?: number;
}

export default function ScoreCircle({ score, label, size = 96, inverted = false, delay = 0 }: ScoreCircleProps) {
  const [offset, setOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, score)) / 100));
    }, 150 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const color = scoreColor(score, inverted);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none" strokeWidth="8"
            stroke="rgba(255,255,255,0.06)"
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none" strokeWidth="8"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              transformOrigin: '50px 50px',
              transform: 'rotate(-90deg)',
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
        </svg>
        {/* Center text */}
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-xl"
          style={{ color }}
        >
          {score}
        </div>
      </div>
      <span className="text-xs text-center font-medium leading-tight" style={{ color: 'var(--text-secondary)', maxWidth: size }}>
        {label}
      </span>
    </div>
  );
}

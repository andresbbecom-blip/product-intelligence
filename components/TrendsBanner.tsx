'use client';

import { ResearchResult } from '@/types';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const TT: object = {
  contentStyle: {
    background: '#15151E',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: 12,
    color: '#F1F5F9',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  labelStyle: { color: '#94A3B8', fontWeight: 600 },
};

function periodLabel(period?: number): string {
  if (!period) return '30 días';
  if (period === 365) return '12 meses';
  if (period === 90) return '90 días';
  if (period === 30) return '30 días';
  if (period === 15) return '15 días';
  if (period === 8) return '8 días';
  return `${period} días`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch {
    return dateStr;
  }
}

export default function TrendsBanner({ result }: { result: ResearchResult }) {
  const { trendTimeline, relatedQueries, trendPeriod, country, query } = result;

  if (!trendTimeline?.length) return null;

  const chartData = trendTimeline.map(pt => ({
    date: formatDate(pt.date),
    interest: pt.interest,
  }));

  return (
    <div
      className="rounded-2xl overflow-hidden animate-fade-in"
      style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold" style={{ color: '#93C5FD' }}>
          📈 Tendencias de los últimos {periodLabel(trendPeriod)} en {country}
        </span>
        <span
          className="text-xs px-2.5 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.3)' }}
        >
          {query}
        </span>
      </div>

      {/* Area chart */}
      <div className="px-2 pb-2">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="trendsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#448AFF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#448AFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              {...TT}
              formatter={(v: unknown) => [`${v ?? 0}%`, 'Interés']}
            />
            <Area
              type="monotone"
              dataKey="interest"
              stroke="#448AFF"
              fill="url(#trendsGrad)"
              strokeWidth={2.5}
              dot={{ fill: '#448AFF', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#448AFF', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Related queries */}
      {relatedQueries?.length ? (
        <div className="px-5 pb-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>
            🔍 Búsquedas relacionadas
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedQueries.map((q, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

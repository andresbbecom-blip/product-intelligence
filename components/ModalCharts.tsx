'use client';

import { Product } from '@/types';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend,
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

const MONTH_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const CHANNEL_COLORS = ['#448AFF', '#FF1744', '#FFD740', '#00E676'];
const DEFAULT_CHANNELS = [
  { name: 'Meta Ads', value: 40 },
  { name: 'TikTok', value: 30 },
  { name: 'Google Ads', value: 20 },
  { name: 'WhatsApp', value: 10 },
];

function getDateLabels(period: number): string[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const daysAgo = Math.round((period / 5) * (5 - i));
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    if (period <= 30) return `${d.getDate()}/${d.getMonth() + 1}`;
    if (period <= 90) return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
    return MONTH_SHORT[d.getMonth()];
  });
}

export default function ModalCharts({ product, trendPeriod }: { product: Product; trendPeriod?: number }) {
  const radarData = [
    { metric: 'Demanda',     value: product.demandScore  ?? product.trendScore ?? 65 },
    { metric: 'Margen',      value: product.marginScore  ?? product.ease ?? 60 },
    { metric: 'Facilidad',   value: product.ease         ?? 65 },
    { metric: 'Tendencia',   value: product.trendScore   ?? 70 },
    { metric: 'Viralidad',   value: product.virality     ?? product.viralPotential ?? 60 },
    { metric: 'Oportunidad', value: 100 - (product.competitionScore ?? 40) },
  ];

  const defaultHistory = [48, 55, 61, 67, 73, product.opportunityScore ?? 75];
  const dateLabels = getDateLabels(trendPeriod ?? 30);
  const trendData = ((product.trendHistory?.length === 6 ? product.trendHistory : defaultHistory)).map((v, i) => ({
    month: dateLabels[i] ?? `M${i + 1}`,
    value: v,
  }));

  const channelData = product.channels?.length ? product.channels : DEFAULT_CHANNELS;

  return (
    <div className="space-y-4">

      {/* ── Radar ── */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(170,0,255,0.06)', border: '1px solid rgba(170,0,255,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C4B5FD' }}>📡 Perfil Multidimensional</div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
            <PolarGrid stroke="rgba(255,255,255,0.07)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'DM Sans' }}
            />
            <Radar
              dataKey="value"
              stroke="#AA00FF"
              fill="#AA00FF"
              fillOpacity={0.18}
              strokeWidth={2}
              dot={{ fill: '#AA00FF', r: 3, strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Area trend ── */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(68,138,255,0.06)', border: '1px solid rgba(68,138,255,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#93C5FD' }}>📈 Tendencia 6 Meses</div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`aGrad-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#448AFF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#448AFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
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
              dataKey="value"
              stroke="#448AFF"
              fill={`url(#aGrad-${product.id})`}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#448AFF', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Channels pie ── */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#6EE7B7' }}>📣 Canales Recomendados</div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={channelData}
              dataKey="value"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              strokeWidth={0}
            >
              {channelData.map((_, i) => (
                <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
              ))}
            </Pie>
            <Legend
              iconType="circle"
              iconSize={7}
              formatter={(value) => (
                <span style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'DM Sans' }}>{value}</span>
              )}
            />
            <Tooltip
              {...TT}
              formatter={(v: unknown) => [`${v ?? 0}%`, 'Peso']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

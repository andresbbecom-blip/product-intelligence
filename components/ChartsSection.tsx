'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
  PieChart, Pie, Legend,
} from 'recharts';

const BAR_COLORS = ['#AA00FF', '#FF1744', '#00E676', '#FFD740', '#448AFF', '#FF6D00', '#00E5FF', '#69F0AE'];
const STATUS_COLORS: Record<string, string> = {
  Hot: '#FF1744',
  Trending: '#AA00FF',
  Estable: '#448AFF',
  Nuevo: '#FFD740',
};

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
  cursor: { fill: 'rgba(255,255,255,0.03)' },
};

export default function ChartsSection({ products }: { products: Product[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || products.length === 0) return null;

  const barData = [...products]
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .map(p => ({
      name: p.name.length > 24 ? p.name.slice(0, 24) + '…' : p.name,
      score: p.opportunityScore,
    }));

  const statusCount: Record<string, number> = {};
  products.forEach(p => { statusCount[p.status] = (statusCount[p.status] || 0) + 1; });
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(170,0,255,0.6), transparent)' }} />
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Análisis Visual</h2>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(170,0,255,0.6), transparent)' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Bar chart ── */}
        <div className="glass-card rounded-2xl p-5">
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>📊 Ranking por Oportunidad</div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Score 0–100 ordenado de mayor a menor</div>
          <ResponsiveContainer width="100%" height={Math.max(180, barData.length * 32)}>
            <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 32, top: 4, bottom: 4 }}>
              <XAxis type="number" domain={[0, 100]} hide axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...TT}
                formatter={(v: unknown) => [`${v ?? 0}/100`, 'Score de Oportunidad']}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} label={{ position: 'right', fill: '#64748B', fontSize: 10 }}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Donut chart ── */}
        <div className="glass-card rounded-2xl p-5">
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>🍩 Distribución por Status</div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Proporción de productos por categoría</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={4}
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#94A3B8'} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'DM Sans' }}>{value}</span>
                )}
              />
              <Tooltip
                {...TT}
                formatter={(v: unknown, name: unknown) => [`${v} producto${v !== 1 ? 's' : ''}`, String(name)]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

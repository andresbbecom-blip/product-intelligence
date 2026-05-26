'use client';

import { ProductStatus } from '@/types';

const CONFIG: Record<ProductStatus, { label: string; bg: string; color: string; border: string; pulse?: boolean }> = {
  Hot: {
    label: '🔥 Hot',
    bg: 'rgba(255,23,68,0.14)',
    color: '#FF5252',
    border: 'rgba(255,23,68,0.45)',
    pulse: true,
  },
  Trending: {
    label: '📈 Trending',
    bg: 'rgba(170,0,255,0.14)',
    color: '#CE93D8',
    border: 'rgba(170,0,255,0.4)',
  },
  Estable: {
    label: '✅ Estable',
    bg: 'rgba(68,138,255,0.14)',
    color: '#82B1FF',
    border: 'rgba(68,138,255,0.4)',
  },
  Nuevo: {
    label: '✨ Nuevo',
    bg: 'rgba(255,215,64,0.14)',
    color: '#FFD740',
    border: 'rgba(255,215,64,0.4)',
  },
};

export default function StatusBadge({ status }: { status: ProductStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.Estable;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        letterSpacing: '0.02em',
      }}
    >
      {cfg.pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: cfg.color, animation: 'pulse-ring 2s ease-in-out infinite' }}
        />
      )}
      {cfg.label}
    </span>
  );
}

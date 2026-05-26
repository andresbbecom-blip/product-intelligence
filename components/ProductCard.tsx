'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import StatusBadge from './StatusBadge';

/* ── Animated score ring ── */
function ScoreRing({ score }: { score: number }) {
  const [on, setOn] = useState(false);
  const R = 34, CIRC = 2 * Math.PI * R;
  const color = score >= 70 ? '#00E676' : score >= 40 ? '#FFD740' : '#FF1744';
  const glow  = score >= 70 ? 'rgba(0,230,118,0.4)' : score >= 40 ? 'rgba(255,215,64,0.4)' : 'rgba(255,23,68,0.4)';

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex-shrink-0" style={{ width: 84, height: 84 }}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={R} fill="none" strokeWidth="6" stroke="rgba(255,255,255,0.06)" />
        <circle
          cx="42" cy="42" r={R} fill="none" strokeWidth="6"
          stroke={color} strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={on ? CIRC * (1 - score / 100) : CIRC}
          style={{
            transformOrigin: '42px 42px',
            transform: 'rotate(-90deg)',
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)',
            filter: `drop-shadow(0 0 6px ${glow})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-lg font-black leading-none" style={{ color, fontFamily: 'var(--font-mono)' }}>{score}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Score</span>
      </div>
    </div>
  );
}

/* ── Mini sparkline SVG ── */
function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const W = 62, H = 22;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 2) - 1}`)
    .join(' ');
  const isUp = data[data.length - 1] >= data[0];
  const col = isUp ? '#00E676' : '#FF1744';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={col}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${col})` }}
      />
      {/* End dot */}
      {(() => {
        const last = data[data.length - 1];
        const x = W, y = H - ((last - min) / range) * (H - 2) - 1;
        return <circle cx={x} cy={y} r="3" fill={col} style={{ filter: `drop-shadow(0 0 4px ${col})` }} />;
      })()}
    </svg>
  );
}

/* ── Stars ── */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 12, color: i <= Math.floor(rating) ? '#FFD740' : 'rgba(255,255,255,0.12)' }}>★</span>
      ))}
      <span className="ml-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{rating.toFixed(1)}</span>
    </span>
  );
}

/* ── Trend label ── */
function TrendLabel({ dir }: { dir: 'up' | 'down' | 'stable' }) {
  const map = {
    up:     ['↑ Subiendo', '#00E676'],
    down:   ['↓ Bajando', '#FF1744'],
    stable: ['→ Estable', '#94A3B8'],
  } as const;
  const [label, color] = map[dir];
  return <span className="text-xs font-bold" style={{ color }}>{label}</span>;
}

interface ProductCardProps {
  product: Product;
  source: string;
  index: number;
  onClick: (p: Product) => void;
}

export default function ProductCard({ product, source, index, onClick }: ProductCardProps) {
  return (
    <div
      onClick={() => onClick(product)}
      className="product-card glass-card rounded-2xl flex flex-col"
      style={{
        padding: '20px',
        animationDelay: `${index * 0.07}s`,
        gap: '14px',
      }}
    >
      {/* ── Header: status + score ring ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={product.status} />
            {product.category && (
              <span className="text-[11px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>{product.category}</span>
            )}
          </div>
          <h3
            className="font-bold text-[15px] leading-snug"
            style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}
            title={product.name}
          >
            {product.name}
          </h3>
        </div>
        <ScoreRing score={product.opportunityScore} />
      </div>

      {/* ── Key metrics ── */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {product.price && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Precio</div>
            <span className="text-xl font-black" style={{ color: '#00E676', fontFamily: 'var(--font-mono)' }}>{product.price}</span>
          </div>
        )}
        {product.sales && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Ventas est.</div>
            <span className="text-base font-bold" style={{ color: '#AA00FF' }}>{product.sales}</span>
          </div>
        )}
        {product.rating != null && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Rating</div>
            <Stars rating={product.rating} />
          </div>
        )}
        {product.reviews != null && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Reseñas</div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {product.reviews >= 1000 ? `${(product.reviews / 1000).toFixed(1)}k` : product.reviews}
            </span>
          </div>
        )}
      </div>

      {/* ── Sparkline ── */}
      {product.trendHistory && product.trendHistory.length >= 2 && (
        <div className="flex items-center gap-3">
          <MiniSparkline data={product.trendHistory} />
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {product.trendHistory[product.trendHistory.length - 1] >= product.trendHistory[0]
              ? <span style={{ color: '#00E676' }}>↑ Tendencia al alza</span>
              : <span style={{ color: '#FF1744' }}>↓ Tendencia a la baja</span>
            }
          </div>
        </div>
      )}

      {/* ── Why sells ── */}
      {product.whySells && (
        <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {product.whySells}
        </p>
      )}

      {/* ── Marketing angle ── */}
      {product.marketingAngle && (
        <div
          className="rounded-xl px-3.5 py-2.5"
          style={{
            background: 'rgba(170,0,255,0.08)',
            borderLeft: '3px solid rgba(170,0,255,0.55)',
          }}
        >
          <span className="text-xs font-bold" style={{ color: '#C4B5FD' }}>💡 Ángulo: </span>
          <span className="text-xs" style={{ color: '#DDD6FE' }}>{product.marketingAngle}</span>
        </div>
      )}

      {/* ── Source-specific extras ── */}
      {source === 'google_trends' && product.trendDirection && (
        <TrendLabel dir={product.trendDirection} />
      )}
      {source === 'google_trends' && product.relatedQueries?.length && (
        <div className="flex flex-wrap gap-1.5">
          {product.relatedQueries.slice(0, 3).map((q, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(68,138,255,0.12)', color: '#93C5FD', border: '1px solid rgba(68,138,255,0.25)' }}>{q}</span>
          ))}
        </div>
      )}
      {source === 'tiktok' && product.hashtags?.length && (
        <div className="flex flex-wrap gap-1.5">
          {product.hashtags.slice(0, 4).map((h, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(236,72,153,0.12)', color: '#F9A8D4', border: '1px solid rgba(236,72,153,0.25)' }}>
              {h.startsWith('#') ? h : `#${h}`}
            </span>
          ))}
        </div>
      )}
      {source === 'tiktok' && product.viralPotential != null && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full" style={{ width: `${product.viralPotential}%`, background: 'linear-gradient(90deg, #EC4899, #F43F5E)' }} />
          </div>
          <span className="text-xs font-bold flex-shrink-0" style={{ color: '#F472B6' }}>🎵 {product.viralPotential}%</span>
        </div>
      )}
      {source === 'meta_ads' && product.hooks?.[0] && (
        <div className="text-xs italic" style={{ color: '#818CF8' }}>
          💬 &ldquo;{product.hooks[0]}&rdquo;
        </div>
      )}
      {(source === 'aliexpress' || source === 'dropi') && product.supplier && (
        <div className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>🏭 {product.supplier}</div>
      )}
      {product.leadTime && (
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>⏱️ {product.leadTime}</div>
      )}
      {source === 'complete' && (product.demandScore != null || product.competitionScore != null) && (
        <div className="grid grid-cols-3 gap-2">
          {product.demandScore != null && (
            <div className="text-center rounded-lg py-1.5" style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)' }}>
              <div className="text-base font-black" style={{ color: '#00E676', fontFamily: 'var(--font-mono)' }}>{product.demandScore}</div>
              <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Demanda</div>
            </div>
          )}
          {product.competitionScore != null && (
            <div className="text-center rounded-lg py-1.5" style={{ background: 'rgba(255,215,64,0.08)', border: '1px solid rgba(255,215,64,0.2)' }}>
              <div className="text-base font-black" style={{ color: product.competitionScore < 50 ? '#00E676' : '#FFD740', fontFamily: 'var(--font-mono)' }}>{product.competitionScore}</div>
              <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Comp.</div>
            </div>
          )}
          {product.marginScore != null && (
            <div className="text-center rounded-lg py-1.5" style={{ background: 'rgba(170,0,255,0.08)', border: '1px solid rgba(170,0,255,0.2)' }}>
              <div className="text-base font-black" style={{ color: '#AA00FF', fontFamily: 'var(--font-mono)' }}>{product.marginScore}</div>
              <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Margen</div>
            </div>
          )}
        </div>
      )}

      {/* ── Customer pains ── */}
      {product.customerPains?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {product.customerPains.slice(0, 2).map((pain, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'rgba(255,215,64,0.09)', color: '#FFD740', border: '1px solid rgba(255,215,64,0.22)' }}
            >
              ⚡ {pain}
            </span>
          ))}
        </div>
      )}

      {/* ── Footer CTA ── */}
      <div
        className="flex items-center justify-between pt-3 mt-auto"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Ver análisis completo</span>
        <div
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(170,0,255,0.15)', color: '#C4B5FD' }}
        >
          Abrir <span>→</span>
        </div>
      </div>
    </div>
  );
}

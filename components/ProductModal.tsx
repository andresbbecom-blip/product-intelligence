'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Product, DATA_SOURCES } from '@/types';
import StatusBadge from './StatusBadge';
import ScoreCircle from './ScoreCircle';

const ModalCharts = dynamic(() => import('./ModalCharts'), { ssr: false });

type SectionColor = 'purple' | 'green' | 'orange' | 'blue' | 'pink' | 'default';
const SECTION_COLORS: Record<SectionColor, { bg: string; border: string; accent: string; titleColor: string }> = {
  purple:  { bg:'rgba(124,58,237,0.08)',  border:'rgba(124,58,237,0.25)',  accent:'rgba(124,58,237,0.7)',  titleColor:'#C4B5FD' },
  green:   { bg:'rgba(16,185,129,0.08)',  border:'rgba(16,185,129,0.25)',  accent:'rgba(16,185,129,0.7)',  titleColor:'#6EE7B7' },
  orange:  { bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.25)',  accent:'rgba(245,158,11,0.7)',  titleColor:'#FCD34D' },
  blue:    { bg:'rgba(59,130,246,0.08)',  border:'rgba(59,130,246,0.25)',  accent:'rgba(59,130,246,0.7)',  titleColor:'#93C5FD' },
  pink:    { bg:'rgba(236,72,153,0.08)',  border:'rgba(236,72,153,0.25)',  accent:'rgba(236,72,153,0.7)',  titleColor:'#F9A8D4' },
  default: { bg:'rgba(255,255,255,0.03)', border:'rgba(255,255,255,0.08)', accent:'rgba(255,255,255,0.3)', titleColor:'var(--text-muted)' },
};

function Section({ title, children, color = 'default', icon }: { title: string; children: React.ReactNode; color?: SectionColor; icon?: string }) {
  const c = SECTION_COLORS[color];
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
        {icon && <span className="text-base">{icon}</span>}
        <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: c.titleColor }}>{title}</h4>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 14, color: i <= Math.floor(rating) ? '#FBBF24' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
      <span className="ml-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{rating.toFixed(1)}</span>
    </span>
  );
}

interface ProductModalProps {
  product: Product;
  source: string;
  trendPeriod?: number;
  onClose: () => void;
}

export default function ProductModal({ product, source, trendPeriod, onClose }: ProductModalProps) {
  const sourceMeta = DATA_SOURCES.find(s => s.id === source);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const isComplete = source === 'complete';
  const trendLabel = { up: '📈 Subiendo', down: '📉 Bajando', stable: '→ Estable' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl animate-scale-in"
        style={{ background: '#12121A', border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.1)' }}
      >
        {/* Top gradient accent */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7C3AED, #6D28D9, #4F46E5)' }} />

        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 flex items-start gap-3 px-5 py-4"
          style={{ background: 'rgba(18,18,26,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Drag handle for mobile */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full sm:hidden" style={{ background: 'rgba(255,255,255,0.15)' }} />

          <div className="flex-1 min-w-0 mt-3 sm:mt-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <StatusBadge status={product.status} />
              {sourceMeta && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: sourceMeta.bgColor, color: 'var(--text-secondary)', border: `1px solid ${sourceMeta.borderColor}` }}>
                  {sourceMeta.icon} {sourceMeta.name}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black leading-snug" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h2>
            {product.category && (
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>{product.category}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all mt-3 sm:mt-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.color = '#FCA5A5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {product.price && (
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6EE7B7' }}>Precio</div>
                <div className="font-black text-xl" style={{ color: '#34D399' }}>{product.price}</div>
              </div>
            )}
            {product.rating != null && (
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#FDE68A' }}>Rating</div>
                <Stars rating={product.rating} />
              </div>
            )}
            {product.reviews != null && (
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#C7D2FE' }}>Reseñas</div>
                <div className="font-black text-xl" style={{ color: '#A5B4FC' }}>{product.reviews >= 1000 ? `${(product.reviews/1000).toFixed(1)}k` : product.reviews}</div>
              </div>
            )}
            {product.sales && (
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#DDD6FE' }}>Ventas est.</div>
                <div className="font-black text-lg" style={{ color: '#C4B5FD' }}>{product.sales}</div>
              </div>
            )}
          </div>

          {/* Opportunity score */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', boxShadow: '0 0 24px rgba(124,58,237,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: '#C4B5FD' }}>🎯 Score de Oportunidad</span>
              <span
                className="text-2xl font-black"
                style={{ color: product.opportunityScore >= 70 ? '#10B981' : product.opportunityScore >= 40 ? '#F59E0B' : '#EF4444' }}
              >
                {product.opportunityScore}%
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${product.opportunityScore}%`,
                  background: product.opportunityScore >= 70
                    ? 'linear-gradient(90deg, #059669, #10B981)'
                    : product.opportunityScore >= 40
                    ? 'linear-gradient(90deg, #D97706, #F59E0B)'
                    : 'linear-gradient(90deg, #DC2626, #EF4444)',
                  transition: 'width 1.3s cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: '0 0 10px currentColor',
                }}
              />
            </div>
          </div>

          {/* Complete analysis: score circles */}
          {isComplete && (product.demandScore != null || product.competitionScore != null || product.marginScore != null) && (
            <Section title="Análisis multidimensional" color="purple" icon="📊">
              <div className="flex items-center justify-around py-3">
                {product.demandScore != null && <ScoreCircle score={product.demandScore} label="Demanda" delay={0} />}
                {product.competitionScore != null && <ScoreCircle score={product.competitionScore} label="Competencia" inverted delay={200} />}
                {product.marginScore != null && <ScoreCircle score={product.marginScore} label="Margen" delay={400} />}
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>En Competencia: verde = poca competencia (mejor)</p>
            </Section>
          )}

          {/* Why sells */}
          <Section title="¿Por qué vende?" color="green" icon="🧠">
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{product.whySells}</p>
          </Section>

          {/* Customer pains */}
          {product.customerPains?.length > 0 && (
            <Section title="Dolores del cliente" color="orange" icon="⚡">
              <ul className="space-y-2.5">
                {product.customerPains.map((pain, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(245,158,11,0.2)', color: '#FCD34D' }}>
                      {i + 1}
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{pain}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Marketing angle */}
          {product.marketingAngle && (
            <Section title="Ángulo de marketing" color="purple" icon="💡">
              <p className="text-[15px] leading-relaxed font-medium" style={{ color: '#C4B5FD' }}>{product.marketingAngle}</p>
            </Section>
          )}

          {/* Google Trends specific */}
          {source === 'google_trends' && (
            <>
              {product.trendDirection && (
                <Section title="Dirección de tendencia" color="blue" icon="📈">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{product.trendDirection === 'up' ? '📈' : product.trendDirection === 'down' ? '📉' : '➡️'}</span>
                    <span className="font-bold text-base" style={{ color: product.trendDirection === 'up' ? '#10B981' : product.trendDirection === 'down' ? '#EF4444' : '#94A3B8' }}>
                      {product.trendDirection === 'up' ? 'Tendencia al alza 🔥' : product.trendDirection === 'down' ? 'Tendencia a la baja' : 'Tendencia estable'}
                    </span>
                  </div>
                </Section>
              )}
              {product.relatedQueries?.length && (
                <Section title="Queries relacionadas" color="blue" icon="🔍">
                  <div className="flex flex-wrap gap-2">
                    {product.relatedQueries.map((q, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.3)' }}>{q}</span>
                    ))}
                  </div>
                </Section>
              )}
              {product.peakMonths?.length && (
                <Section title="Meses de mayor demanda" color="green" icon="📅">
                  <div className="flex flex-wrap gap-2">
                    {product.peakMonths.map((m, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.25)' }}>{m}</span>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}

          {/* Meta Ads specific */}
          {source === 'meta_ads' && (
            <>
              {product.hooks?.length && (
                <Section title="Hooks publicitarios" color="blue" icon="📢">
                  <ul className="space-y-2.5">
                    {product.hooks.map((hook, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'rgba(99,102,241,0.25)', color: '#A5B4FC' }}>{i + 1}</span>
                        <span className="text-sm italic leading-relaxed" style={{ color: '#C7D2FE' }}>&ldquo;{hook}&rdquo;</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {product.adFormats?.length && (
                <Section title="Formatos de anuncio" color="blue" icon="🎬">
                  <div className="flex flex-wrap gap-2">
                    {product.adFormats.map((f, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide" style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' }}>{f}</span>
                    ))}
                  </div>
                </Section>
              )}
              {product.audienceAge && (
                <Section title="Audiencia objetivo" color="blue" icon="👥">
                  <p className="text-sm font-semibold" style={{ color: '#93C5FD' }}>Edad: {product.audienceAge}</p>
                </Section>
              )}
            </>
          )}

          {/* TikTok specific */}
          {source === 'tiktok' && (
            <>
              {product.hashtags?.length && (
                <Section title="Hashtags" color="pink" icon="🎵">
                  <div className="flex flex-wrap gap-2">
                    {product.hashtags.map((h, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: 'rgba(236,72,153,0.15)', color: '#F9A8D4', border: '1px solid rgba(236,72,153,0.3)' }}>
                        {h.startsWith('#') ? h : `#${h}`}
                      </span>
                    ))}
                  </div>
                </Section>
              )}
              {product.contentStrategy && (
                <Section title="Estrategia de contenido" color="pink" icon="🎬">
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{product.contentStrategy}</p>
                </Section>
              )}
              {product.viralPotential != null && (
                <Section title="Potencial viral" color="pink" icon="🚀">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-full rounded-full" style={{ width: `${product.viralPotential}%`, background: 'linear-gradient(90deg, #EC4899, #F43F5E)', boxShadow: '0 0 10px rgba(236,72,153,0.5)' }} />
                    </div>
                    <span className="font-black text-xl flex-shrink-0" style={{ color: '#F472B6' }}>{product.viralPotential}%</span>
                  </div>
                </Section>
              )}
            </>
          )}

          {/* Supplier info */}
          {(product.supplier || product.minOrder || product.leadTime) && (
            <Section title="Información de proveedor" color="default" icon="🏭">
              <div className="grid grid-cols-2 gap-4">
                {product.supplier && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Proveedor</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{product.supplier}</div>
                  </div>
                )}
                {product.minOrder && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Orden mínima</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{product.minOrder}</div>
                  </div>
                )}
                {product.leadTime && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Tiempo de entrega</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{product.leadTime}</div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Complete: also show trend + hashtags + hooks */}
          {isComplete && product.trendDirection && (
            <Section title="Tendencia global">
              <div className="flex items-center gap-2">
                <span className="text-xl">{product.trendDirection === 'up' ? '📈' : product.trendDirection === 'down' ? '📉' : '➡️'}</span>
                <span className="text-sm font-semibold" style={{ color: product.trendDirection === 'up' ? '#10B981' : product.trendDirection === 'down' ? '#EF4444' : '#94A3B8' }}>
                  {trendLabel[product.trendDirection]}
                </span>
              </div>
            </Section>
          )}
          {isComplete && product.hooks?.length && (
            <Section title="Hooks para anuncios" color="blue" icon="📢">
              <ul className="space-y-2">
                {product.hooks.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm italic" style={{ color: '#C7D2FE' }}>
                    <span className="font-black not-italic" style={{ color: '#818CF8' }}>💡</span>
                    &ldquo;{h}&rdquo;
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {isComplete && product.hashtags?.length && (
            <Section title="Hashtags TikTok" color="pink" icon="🎵">
              <div className="flex flex-wrap gap-2">
                {product.hashtags.map((h, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'rgba(236,72,153,0.12)', color: '#F9A8D4', border: '1px solid rgba(236,72,153,0.25)' }}>
                    {h.startsWith('#') ? h : `#${h}`}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* ── Charts section ── */}
          {mounted && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(170,0,255,0.5), transparent)' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Análisis Gráfico</span>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(170,0,255,0.5), transparent)' }} />
              </div>
              <ModalCharts product={product} trendPeriod={trendPeriod} />
            </div>
          )}

        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 p-4 border-t"
          style={{ background: 'rgba(18,18,26,0.98)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.09)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  );
}

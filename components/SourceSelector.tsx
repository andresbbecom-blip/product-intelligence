'use client';

import { DATA_SOURCES } from '@/types';

export default function SourceSelector({ selectedSource, onSelect }: { selectedSource: string; onSelect: (id: string) => void }) {
  return (
    <section className="px-4 sm:px-6 pb-5 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, rgba(170,0,255,0.6), transparent)' }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Elige tu fuente de datos
          </h2>
          <div className="h-px w-8" style={{ background: 'linear-gradient(270deg, rgba(170,0,255,0.6), transparent)' }} />
        </div>
        {selectedSource && (
          <button
            onClick={() => onSelect('')}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ color: '#C4B5FD', background: 'rgba(170,0,255,0.1)', border: '1px solid rgba(170,0,255,0.2)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(170,0,255,0.18)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(170,0,255,0.1)'}
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* 4+4 grid — all cards equal width */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {DATA_SOURCES.map(src => {
          const isSelected = selectedSource === src.id;
          const isFeatured = 'featured' in src && src.featured;

          const bgSelected    = src.bgColor.replace(/[\d.]+\)$/, '0.22)');
          const borderSelected = src.borderColor.replace(/[\d.]+\)$/, '0.7)');
          const glowColor     = src.bgColor.replace(/[\d.]+\)$/, '0.35)');

          return (
            <button
              key={src.id}
              onClick={() => onSelect(src.id === selectedSource ? '' : src.id)}
              className="source-card relative rounded-2xl text-left overflow-hidden"
              style={{
                background: isSelected ? bgSelected : isFeatured ? src.bgColor.replace(/[\d.]+\)$/, '0.1)') : src.bgColor,
                border: `1px solid ${isSelected ? borderSelected : isFeatured ? src.borderColor.replace(/[\d.]+\)$/, '0.5)') : src.borderColor}`,
                boxShadow: isSelected
                  ? `0 0 28px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`
                  : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                padding: '14px 16px',
                minHeight: '108px',
              }}
            >
              {/* Selected gradient overlay */}
              {isSelected && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${src.bgColor.replace(/[\d.]+\)$/, '0.12)')}, transparent)` }}
                />
              )}

              {/* Icon row */}
              <div className="flex items-start justify-between mb-2.5">
                <span
                  className="text-3xl leading-none"
                  style={{ filter: isSelected ? `drop-shadow(0 0 8px currentColor)` : 'none' }}
                >
                  {src.icon}
                </span>
                {isSelected ? (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #AA00FF, #7C3AED)', boxShadow: '0 0 10px rgba(170,0,255,0.5)' }}
                  >
                    ✓
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
                )}
              </div>

              {/* Name */}
              <div
                className="font-bold text-[13px] leading-tight mb-1"
                style={{ color: isSelected ? '#fff' : 'var(--text-primary)' }}
              >
                {src.name}
              </div>

              {/* Description */}
              <div className="text-[11px] leading-snug" style={{ color: isSelected ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>
                {src.description}
              </div>

              {/* Featured tag */}
              {isFeatured && (
                <div
                  className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(170,0,255,0.2)', color: '#C4B5FD', border: '1px solid rgba(170,0,255,0.35)' }}
                >
                  ⭐ Todas las fuentes
                </div>
              )}

              {/* Bottom glow bar */}
              {isSelected && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: `linear-gradient(90deg, transparent, ${src.borderColor.replace(/[\d.]+\)$/, '0.9)')}, transparent)` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import { HistoryItem, DATA_SOURCES } from '@/types';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

interface ResearchHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function ResearchHistory({ history, onSelect, onClear }: ResearchHistoryProps) {
  if (history.length === 0) return null;

  return (
    <aside className="px-4 sm:px-6 pb-2 max-w-7xl mx-auto w-full">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🕐</span>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Historial de sesión
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#C4B5FD' }}
            >
              {history.length}
            </span>
          </div>
          <button
            onClick={onClear}
            className="text-xs px-2.5 py-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#EF4444'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >
            Limpiar
          </button>
        </div>

        {/* History list - horizontal scroll on mobile */}
        <div className="scroll-x flex gap-2 p-3">
          {history.map(item => {
            const src = DATA_SOURCES.find(s => s.id === item.source);
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex-shrink-0 flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all max-w-[220px] min-w-[160px]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.1)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <span className="text-lg flex-shrink-0">{src?.icon ?? '🔍'}</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.query}
                  </div>
                  <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {src?.name ?? item.source} · {item.country}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#6EE7B7' }}
                    >
                      {item.resultCount} prods
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(item.timestamp)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

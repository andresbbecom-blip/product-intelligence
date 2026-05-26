'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ResearchResult, Product, DATA_SOURCES } from '@/types';
import ProductCard from './ProductCard';

const ChartsSection = dynamic(() => import('./ChartsSection'), { ssr: false });

/* ── Rotating loading messages ── */
const LOADING_MSGS = [
  'Escaneando datos de mercado...',
  'Analizando tendencias del nicho...',
  'Calculando scores de oportunidad...',
  'Identificando productos ganadores...',
  'Procesando análisis competitivo...',
  'Evaluando potencial de margen...',
  'Generando insights para tu negocio...',
];

function PremiumSpinner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LOADING_MSGS.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-20 animate-fade-in">
      {/* Multi-ring spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full" style={{ border: '2px solid rgba(124,58,237,0.12)' }} />
        <div className="absolute inset-0 rounded-full" style={{ border: '2px solid transparent', borderTopColor: '#AA00FF', animation: 'spin 1s linear infinite' }} />
        <div className="absolute inset-3 rounded-full" style={{ border: '1.5px solid rgba(68,138,255,0.12)' }} />
        <div className="absolute inset-3 rounded-full" style={{ border: '1.5px solid transparent', borderTopColor: '#448AFF', animation: 'spin 0.65s linear infinite reverse' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full" style={{ background: '#AA00FF', boxShadow: '0 0 14px rgba(170,0,255,0.9)' }} />
        </div>
      </div>

      {/* Rotating message */}
      <div className="text-center space-y-2 h-12">
        <p
          key={idx}
          className="font-semibold text-[15px] animate-msg"
          style={{ color: 'var(--text-primary)' }}
        >
          {LOADING_MSGS[idx]}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Claude AI analizando en tiempo real</p>
      </div>

      {/* Skeleton grid */}
      <div className="w-full max-w-7xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} delay={i * 0.08} />)}
      </div>
    </div>
  );
}

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="glass-card rounded-2xl space-y-4 animate-fade-in"
      style={{ padding: '20px', animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-16 rounded-full skeleton" />
          <div className="h-5 w-3/4 rounded-lg skeleton" />
        </div>
        <div className="w-20 h-20 rounded-full skeleton flex-shrink-0" />
      </div>
      <div className="flex gap-4">
        <div className="h-7 w-20 rounded skeleton" />
        <div className="h-7 w-16 rounded skeleton" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded skeleton" />
        <div className="h-3.5 w-4/5 rounded skeleton" />
      </div>
      <div className="h-10 rounded-xl skeleton" />
      <div className="flex gap-2">
        <div className="h-7 w-24 rounded-full skeleton" />
        <div className="h-7 w-28 rounded-full skeleton" />
      </div>
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-in-up">
      <div className="text-7xl mb-6 animate-float">🔍</div>
      <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        {hasQuery ? 'Elige una fuente y presiona Investigar' : 'Comienza tu investigación'}
      </h3>
      <p className="text-base max-w-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {hasQuery
          ? 'Selecciona una de las 8 fuentes de datos arriba y haz clic en Investigar'
          : 'Escribe un producto, selecciona un nicho, elige la fuente de datos y presiona Investigar'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {['📦 Amazon', '📈 Trends', '🎵 TikTok', '🎯 Completo'].map(s => (
          <span key={s} className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(170,0,255,0.1)', color: '#C4B5FD', border: '1px solid rgba(170,0,255,0.2)' }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-bold mb-3" style={{ color: '#FCA5A5' }}>Error en la búsqueda</h3>
      <div className="max-w-md rounded-2xl p-4 text-sm leading-relaxed text-left" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
        {message}
      </div>
    </div>
  );
}

interface ResultsSectionProps {
  result: ResearchResult | null;
  isLoading: boolean;
  error: string | null;
  selectedSource: string;
  searchQuery: string;
  onProductClick: (p: Product) => void;
}

export default function ResultsSection({ result, isLoading, error, selectedSource, searchQuery, onProductClick }: ResultsSectionProps) {
  const sourceMeta = DATA_SOURCES.find(s => s.id === result?.source);

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <PremiumSpinner />
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <ErrorState message={error} />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <EmptyState hasQuery={!!searchQuery} />
      </div>
    );
  }

  const { products, summary, query, country, timestamp } = result;

  return (
    <div className="px-4 sm:px-6 pb-12 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">

      {/* ── Result header ── */}
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {sourceMeta && (
              <span
                className="text-sm px-3 py-1 rounded-full font-semibold"
                style={{ background: sourceMeta.bgColor, color: 'var(--text-secondary)', border: `1px solid ${sourceMeta.borderColor}` }}
              >
                {sourceMeta.icon} {sourceMeta.name}
              </span>
            )}
            <span className="text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.07)' }}>
              🌎 {country}
            </span>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(0,230,118,0.1)', color: '#6EE7B7', border: '1px solid rgba(0,230,118,0.25)' }}
            >
              {products.length} producto{products.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
            Resultados para &ldquo;{query}&rdquo;
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date(timestamp).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      </div>

      {/* ── Verdict panel ── */}
      {summary && (
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(170,0,255,0.1) 0%, rgba(124,58,237,0.12) 50%, rgba(79,70,229,0.06) 100%)',
            border: '1px solid rgba(170,0,255,0.3)',
            borderLeft: '4px solid #AA00FF',
            boxShadow: '0 0 48px rgba(170,0,255,0.08)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #AA00FF, rgba(124,58,237,0.4), transparent)' }} />
          <div className="flex items-start gap-4 p-5">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(170,0,255,0.2)', border: '1px solid rgba(170,0,255,0.35)', boxShadow: '0 0 20px rgba(170,0,255,0.2)' }}
            >
              🧠
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#AA00FF' }}>
                Veredicto IA
              </div>
              <p className="text-base leading-relaxed font-medium" style={{ color: '#E2D9F3' }}>
                {summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Products grid ── */}
      {products.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="text-5xl">🤔</div>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>No se encontraron productos. Intenta con otro nicho o fuente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} source={result.source} index={i} onClick={onProductClick} />
          ))}
        </div>
      )}

      {/* ── Charts section ── */}
      {products.length > 0 && (
        <ChartsSection products={products} />
      )}

    </div>
  );
}

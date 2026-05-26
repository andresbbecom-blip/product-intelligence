'use client';

import { useState, useCallback, useEffect } from 'react';
import { ResearchResult, HistoryItem, Product, COUNTRIES } from '@/types';
import Header from '@/components/Header';
import SourceSelector from '@/components/SourceSelector';
import ResultsSection from '@/components/ResultsSection';
import ProductModal from '@/components/ProductModal';
import ResearchHistory from '@/components/ResearchHistory';

const SESSION_KEY = 'pi_history';

function loadHistory(): HistoryItem[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(items: HistoryItem[]) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(items)); } catch {}
}

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0].name);
  const [selectedSource, setSelectedSource] = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [productUrl, setProductUrl]     = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [result, setResult]             = useState<ResearchResult | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [history, setHistory]           = useState<HistoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<number>(30);
  const [topVentasPeriod, setTopVentasPeriod] = useState<number>(30);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const handleResearch = useCallback(async () => {
    const query = searchQuery.trim();
    const url   = productUrl.trim();

    if (!query && !url && !imageBase64) {
      setError('Escribe un producto, sube una foto, o pega un link para analizar.');
      return;
    }
    if (!selectedSource) {
      setError('Selecciona una fuente de datos antes de investigar.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          source: selectedSource,
          country: selectedCountry,
          productUrl: url || undefined,
          imageBase64: imageBase64 || undefined,
          imageMimeType: imageMimeType || undefined,
          trendPeriod: selectedSource === 'google_trends' ? trendPeriod : undefined,
          topVentasPeriod: selectedSource === 'topventas' ? topVentasPeriod : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      setResult(data);

      const historyItem: HistoryItem = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        query: data.query,          // use display query returned by API
        source: selectedSource,
        country: selectedCountry,
        timestamp: data.timestamp,
        resultCount: data.products?.length ?? 0,
        results: data,
      };
      const updated = [historyItem, ...history].slice(0, 12);
      setHistory(updated);
      saveHistory(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, productUrl, imageBase64, imageMimeType, selectedSource, selectedCountry, history, trendPeriod, topVentasPeriod]);

  function handleHistorySelect(item: HistoryItem) {
    setResult(item.results);
    setSearchQuery(item.query);
    setSelectedSource(item.source);
    setSelectedCountry(item.country);
    setProductUrl('');
    setImageBase64(null);
    setImageMimeType(null);
    setImagePreviewUrl(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleClearHistory() { setHistory([]); saveHistory([]); }
  function handleSourceSelect(id: string) { setSelectedSource(id); setError(null); }

  return (
    <div className="min-h-screen bg-grid" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient top glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.11) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      <Header
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        searchQuery={searchQuery}
        onSearchChange={v => { setSearchQuery(v); setError(null); }}
        selectedNiche={selectedNiche}
        onNicheChange={setSelectedNiche}
        productUrl={productUrl}
        onUrlChange={v => { setProductUrl(v); setError(null); }}
        imageBase64={imageBase64}
        imageMimeType={imageMimeType}
        imagePreviewUrl={imagePreviewUrl}
        onImageChange={(b64, mime, preview) => {
          setImageBase64(b64);
          setImageMimeType(mime);
          setImagePreviewUrl(preview);
          setError(null);
        }}
        onSearch={handleResearch}
        isLoading={isLoading}
      />

      <main className="relative z-10 pt-4 space-y-2">
        <SourceSelector selectedSource={selectedSource} onSelect={handleSourceSelect} />

        {/* Google Trends period selector */}
        {selectedSource === 'google_trends' && (
          <div className="px-4 sm:px-6 max-w-7xl mx-auto w-full animate-fade-in">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--text-muted)' }}>📅 Período</span>
              {([15, 30, 90, 365] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setTrendPeriod(p)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: trendPeriod === p ? 'rgba(170,0,255,0.25)' : 'rgba(255,255,255,0.04)',
                    color: trendPeriod === p ? '#E9D5FF' : 'var(--text-muted)',
                    border: `1px solid ${trendPeriod === p ? 'rgba(170,0,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: trendPeriod === p ? '0 0 16px rgba(170,0,255,0.25)' : 'none',
                  }}
                >
                  {`${p} días`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Top Ventas por País period selector */}
        {selectedSource === 'topventas' && (
          <div className="px-4 sm:px-6 max-w-7xl mx-auto w-full animate-fade-in">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--text-muted)' }}>📅 Período</span>
              {([8, 15, 30, 90] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setTopVentasPeriod(p)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: topVentasPeriod === p ? 'rgba(234,179,8,0.22)' : 'rgba(255,255,255,0.04)',
                    color: topVentasPeriod === p ? '#FDE68A' : 'var(--text-muted)',
                    border: `1px solid ${topVentasPeriod === p ? 'rgba(234,179,8,0.55)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: topVentasPeriod === p ? '0 0 16px rgba(234,179,8,0.2)' : 'none',
                  }}
                >
                  {`${p} días`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Validation error */}
        {error && !isLoading && (
          <div className="px-4 sm:px-6 max-w-7xl mx-auto animate-fade-in">
            <div
              className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}
            >
              <span className="flex-shrink-0">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <ResearchHistory history={history} onSelect={handleHistorySelect} onClear={handleClearHistory} />

        <ResultsSection
          result={result}
          isLoading={isLoading}
          error={isLoading ? null : (error && result === null ? error : null)}
          selectedSource={selectedSource}
          searchQuery={searchQuery}
          onProductClick={setSelectedProduct}
        />
      </main>

      {selectedProduct && result && (
        <ProductModal
          product={selectedProduct}
          source={result.source}
          trendPeriod={
            result.source === 'google_trends' ? trendPeriod :
            result.source === 'topventas' ? topVentasPeriod :
            undefined
          }
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

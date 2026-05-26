'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { COUNTRIES, NICHES } from '@/types';

// ── Niche color palette ───────────────────────────────────────────────────────
const NICHE_COLORS: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  'Fajas':    { bg:'rgba(244,63,94,0.14)',   text:'#FB7185', border:'rgba(244,63,94,0.35)',   emoji:'👙' },
  'Belleza':  { bg:'rgba(192,132,252,0.14)', text:'#E9D5FF', border:'rgba(192,132,252,0.35)', emoji:'💄' },
  'Salud':    { bg:'rgba(16,185,129,0.14)',  text:'#6EE7B7', border:'rgba(16,185,129,0.35)',  emoji:'💊' },
  'Hogar':    { bg:'rgba(56,189,248,0.14)',  text:'#7DD3FC', border:'rgba(56,189,248,0.35)',  emoji:'🏠' },
  'Fitness':  { bg:'rgba(251,146,60,0.14)',  text:'#FDBA74', border:'rgba(251,146,60,0.35)',  emoji:'💪' },
  'Tech':     { bg:'rgba(34,211,238,0.14)',  text:'#67E8F9', border:'rgba(34,211,238,0.35)',  emoji:'💻' },
  'Mascotas': { bg:'rgba(245,158,11,0.14)',  text:'#FCD34D', border:'rgba(245,158,11,0.35)',  emoji:'🐾' },
  'Bebés':    { bg:'rgba(251,207,232,0.12)', text:'#FBCFE8', border:'rgba(251,207,232,0.3)',  emoji:'👶' },
  'Moda':     { bg:'rgba(139,92,246,0.14)',  text:'#C4B5FD', border:'rgba(139,92,246,0.35)',  emoji:'👗' },
};

// ── Platform detection (client-side) ─────────────────────────────────────────
const PLATFORMS: Array<{ match: string[]; name: string; color: string; bg: string; icon: string }> = [
  { match: ['amazon.com', 'amzn.to', 'amzn.com'], name: 'Amazon',       color: '#FF9900', bg: 'rgba(255,153,0,0.12)',    icon: '📦' },
  { match: ['aliexpress.com'],                     name: 'AliExpress',   color: '#FF4747', bg: 'rgba(255,71,71,0.12)',    icon: '🌏' },
  { match: ['alibaba.com'],                        name: 'Alibaba',      color: '#FF6A00', bg: 'rgba(255,106,0,0.12)',    icon: '🏭' },
  { match: ['mercadolibre.'],                      name: 'MercadoLibre', color: '#FFE600', bg: 'rgba(255,230,0,0.12)',    icon: '🛒' },
  { match: ['temu.com'],                           name: 'Temu',         color: '#FA5151', bg: 'rgba(250,81,81,0.12)',    icon: '🔴' },
  { match: ['tiktok.com'],                         name: 'TikTok Shop',  color: '#EE1D52', bg: 'rgba(238,29,82,0.12)',   icon: '🎵' },
  { match: ['myshopify.com', 'shopify.com'],       name: 'Shopify',      color: '#96BF48', bg: 'rgba(150,191,72,0.12)',  icon: '🛍️' },
  { match: ['dropi.co', 'dropi.com'],              name: 'Dropi',        color: '#7C3AED', bg: 'rgba(124,58,237,0.12)',  icon: '💧' },
  { match: ['shein.com'],                          name: 'Shein',        color: '#E91E8C', bg: 'rgba(233,30,140,0.12)', icon: '👗' },
  { match: ['ebay.com'],                           name: 'eBay',         color: '#E53238', bg: 'rgba(229,50,56,0.12)',   icon: '🏷️' },
  { match: ['walmart.com'],                        name: 'Walmart',      color: '#0071CE', bg: 'rgba(0,113,206,0.12)',   icon: '🏪' },
  { match: ['etsy.com'],                           name: 'Etsy',         color: '#F56400', bg: 'rgba(245,100,0,0.12)',   icon: '🎨' },
];

function detectPlatformClient(url: string) {
  const u = url.toLowerCase();
  return PLATFORMS.find(p => p.match.some(m => u.includes(m))) ?? null;
}

function isValidUrl(str: string): boolean {
  try { new URL(str); return true; } catch { return false; }
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface HeaderProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedNiche: string;
  onNicheChange: (niche: string) => void;
  productUrl: string;
  onUrlChange: (url: string) => void;
  imageBase64: string | null;
  imageMimeType: string | null;
  imagePreviewUrl: string | null;
  onImageChange: (base64: string | null, mimeType: string | null, previewUrl: string | null) => void;
  onSearch: () => void;
  isLoading: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Header({
  selectedCountry, onCountryChange,
  searchQuery, onSearchChange,
  selectedNiche, onNicheChange,
  productUrl, onUrlChange,
  imageBase64, imageMimeType: _imageMimeType, imagePreviewUrl, onImageChange,
  onSearch, isLoading,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const current = COUNTRIES.find(c => c.name === selectedCountry) ?? COUNTRIES[0];

  const detectedPlatform = productUrl ? detectPlatformClient(productUrl) : null;
  const urlIsValid = productUrl.length > 10 && isValidUrl(productUrl);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const [meta, base64] = dataUrl.split(',');
      const mimeType = meta.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
      onImageChange(base64, mimeType, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [onImageChange]);

  function handleNiche(niche: string) {
    const next = niche === selectedNiche ? '' : niche;
    onNicheChange(next);
    onSearchChange(next);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const canSearch = !isLoading && (searchQuery.trim().length > 0 || productUrl.trim().length > 0 || imageBase64 !== null);

  // Country dropdown: split into two groups
  const sudamerica = COUNTRIES.slice(0, 8);
  const centroamerica = COUNTRIES.slice(8);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: 'rgba(10,10,12,0.97)', backdropFilter: 'blur(28px)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">

        {/* ── Row 1: logo + search + country ── */}
        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xl flex-shrink-0 logo-animated"
            >
              🎯
            </div>
            <div className="hidden sm:block leading-none space-y-1">
              <div
                className="text-[17px] font-black tracking-tight leading-none"
                style={{
                  background: 'linear-gradient(135deg, #E9D5FF 0%, #C4B5FD 35%, #AA00FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Product Intelligence
              </div>
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(170,0,255,0.18)', color: '#CE93D8', border: '1px solid rgba(170,0,255,0.3)' }}
              >
                v2.0 · VIVAEE
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-base" style={{ color: 'var(--text-muted)' }}>🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canSearch && onSearch()}
                placeholder="Busca un producto, marca o nicho..."
                className="search-input w-full h-12 pl-11 rounded-2xl text-[15px] font-medium"
                style={{ paddingRight: searchQuery ? '48px' : '16px' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { onSearchChange(''); onNicheChange(''); setTimeout(() => inputRef.current?.focus(), 10); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors"
                  style={{ width: '40px', height: '40px', color: '#64748B', background: 'none', border: 'none', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#F87171'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748B'}
                  aria-label="Limpiar búsqueda"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Image button — label triggers native file picker directly (works on mobile + desktop) */}
            <label
              htmlFor="pi-image-input"
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-xl border transition-all cursor-pointer flex-shrink-0"
              style={{
                background: imageBase64 ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.04)',
                borderColor: imageBase64 ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.09)',
                boxShadow: imageBase64 ? '0 0 16px rgba(124,58,237,0.2)' : 'none',
              }}
              title="Analizar por imagen (cámara o galería)"
            >
              📷
            </label>

            <button
              onClick={onSearch}
              disabled={!canSearch}
              className="btn-primary h-12 px-5 rounded-2xl text-[15px] font-bold flex-shrink-0 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingRing />
                  <span className="hidden sm:inline">Buscando...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Investigar</span>
                  <span className="sm:hidden text-lg">🔎</span>
                </>
              )}
            </button>
          </div>

          {/* Country dropdown */}
          <div className="relative flex-shrink-0" ref={ref}>
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-2 h-12 px-3.5 rounded-2xl text-sm font-semibold border transition-all"
              style={{
                background: open ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)',
                borderColor: open ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.09)',
                color: 'var(--text-primary)',
                boxShadow: open ? '0 0 16px rgba(124,58,237,0.15)' : 'none',
              }}
            >
              <span className="text-xl">{current.flag}</span>
              <span className="hidden md:inline">{current.name}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {open && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-2xl animate-slide-down z-50"
                style={{ background: '#15151E', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
              >
                {/* Sudamérica group */}
                <div className="px-3.5 pt-3 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Sudamérica</span>
                </div>
                {sudamerica.map(c => <CountryOption key={c.code} c={c} selected={selectedCountry} onSelect={name => { onCountryChange(name); setOpen(false); }} />)}

                {/* Centroamérica group */}
                <div className="px-3.5 pt-3 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Centroamérica</span>
                </div>
                {centroamerica.map(c => <CountryOption key={c.code} c={c} selected={selectedCountry} onSelect={name => { onCountryChange(name); setOpen(false); }} />)}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: URL input ── */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-sm" style={{ color: 'var(--text-muted)' }}>🔗</span>
            <input
              type="url"
              value={productUrl}
              onChange={e => onUrlChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSearch && onSearch()}
              onPaste={e => {
                // Give paste a tick to settle, then auto-focus search if empty
                setTimeout(() => {
                  const pasted = e.currentTarget.value.trim();
                  if (pasted && !searchQuery.trim()) inputRef.current?.focus();
                }, 50);
              }}
              placeholder="🔗 Pega el link de un producto (Amazon, AliExpress, MercadoLibre, Shopify, TikTok Shop...)"
              className="w-full h-10 pl-9 pr-4 rounded-xl text-sm font-medium transition-all"
              style={{
                background: urlIsValid ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${urlIsValid ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.07)'}`,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.1), 0 0 20px rgba(56,189,248,0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = urlIsValid ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Platform badge */}
          {productUrl && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {detectedPlatform ? (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap"
                  style={{ background: detectedPlatform.bg, color: detectedPlatform.color, border: `1px solid ${detectedPlatform.color}33` }}
                >
                  <span>{detectedPlatform.icon}</span>
                  {detectedPlatform.name}
                </div>
              ) : (
                <div
                  className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  🌐 Tienda online
                </div>
              )}
              <button
                onClick={() => onUrlChange('')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}
                title="Limpiar link"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* ── Row 3: image preview ── */}
        {imagePreviewUrl && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl animate-fade-in"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)' }}
          >
            <img
              src={imagePreviewUrl}
              alt="Producto"
              className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
              style={{ border: '1px solid rgba(124,58,237,0.3)' }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: '#C4B5FD' }}>📷 Imagen cargada</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Selecciona fuente y país, luego click en Investigar
              </div>
            </div>
            <button
              onClick={() => onImageChange(null, null, null)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}
              title="Eliminar imagen"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.22)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Row 4: niche chips ── */}
        <div className="scroll-x flex items-center gap-2 pb-0.5">
          <span className="text-xs font-bold uppercase tracking-widest flex-shrink-0 mr-1" style={{ color: 'var(--text-muted)' }}>Nichos</span>
          {NICHES.map(niche => {
            const active = selectedNiche === niche;
            const colors = NICHE_COLORS[niche];
            return (
              <button
                key={niche}
                onClick={() => handleNiche(niche)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all duration-200"
                style={{
                  background: active ? colors.bg.replace('0.14','0.25').replace('0.12','0.22') : 'rgba(255,255,255,0.04)',
                  borderColor: active ? colors.border : 'rgba(255,255,255,0.07)',
                  color: active ? colors.text : 'var(--text-muted)',
                  boxShadow: active ? `0 0 12px ${colors.bg}` : 'none',
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = colors.bg; el.style.borderColor = colors.border; el.style.color = colors.text; } }}
                onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.04)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.color = 'var(--text-muted)'; } }}
              >
                <span>{colors.emoji}</span>
                {niche}
              </button>
            );
          })}
        </div>
      </div>

      {/* Single file input — accept="image/*" lets mobile OS show camera+gallery chooser natively */}
      <input
        id="pi-image-input"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />
    </header>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function CountryOption({ c, selected, onSelect }: { c: { code: string; name: string; flag: string }; selected: string; onSelect: (name: string) => void }) {
  const active = selected === c.name;
  return (
    <button
      onClick={() => onSelect(c.name)}
      className="w-full flex items-center gap-3 px-3.5 py-2 text-sm font-medium text-left transition-all"
      style={{
        background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
        color: active ? '#C4B5FD' : 'var(--text-secondary)',
        borderLeft: active ? '2px solid #7C3AED' : '2px solid transparent',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span className="text-lg w-7 text-center">{c.flag}</span>
      <span className="flex-1">{c.name}</span>
      {active && <span className="text-xs font-bold" style={{ color: '#A78BFA' }}>✓</span>}
    </button>
  );
}

function LoadingRing() {
  return (
    <div className="relative w-5 h-5 flex-shrink-0">
      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

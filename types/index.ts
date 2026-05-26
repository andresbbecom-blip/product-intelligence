export type ProductStatus = 'Hot' | 'Trending' | 'Estable' | 'Nuevo';

export interface Product {
  id: string;
  name: string;
  price?: string;
  rating?: number;
  reviews?: number;
  sales?: string;
  opportunityScore: number;
  status: ProductStatus;
  whySells: string;
  customerPains: string[];
  marketingAngle: string;
  category?: string;
  trendDirection?: 'up' | 'down' | 'stable';
  relatedQueries?: string[];
  peakMonths?: string[];
  hooks?: string[];
  adFormats?: string[];
  audienceAge?: string;
  hashtags?: string[];
  contentStrategy?: string;
  viralPotential?: number;
  demandScore?: number;
  competitionScore?: number;
  marginScore?: number;
  supplier?: string;
  minOrder?: string;
  leadTime?: string;
  link?: string;
  trendScore?: number;
  virality?: number;
  ease?: number;
  channels?: { name: string; value: number }[];
  trendHistory?: number[];
  platform?: string;
}

export interface ResearchResult {
  products: Product[];
  summary: string;
  source: string;
  country: string;
  query: string;
  timestamp: string;
  trendPeriod?: number;
  trendTimeline?: { date: string; interest: number }[];
  relatedQueries?: string[];
  trendsError?: boolean;
}

export interface HistoryItem {
  id: string;
  query: string;
  source: string;
  country: string;
  timestamp: string;
  resultCount: number;
  results: ResearchResult;
}

export const COUNTRIES = [
  // Sudamérica
  { code: 'CO', name: 'Colombia',     flag: '🇨🇴' },
  { code: 'MX', name: 'México',       flag: '🇲🇽' },
  { code: 'BR', name: 'Brasil',       flag: '🇧🇷' },
  { code: 'CL', name: 'Chile',        flag: '🇨🇱' },
  { code: 'PE', name: 'Perú',         flag: '🇵🇪' },
  { code: 'AR', name: 'Argentina',    flag: '🇦🇷' },
  { code: 'EC', name: 'Ecuador',      flag: '🇪🇨' },
  { code: 'US', name: 'USA Latino',   flag: '🇺🇸' },
  // Centroamérica
  { code: 'GT', name: 'Guatemala',    flag: '🇬🇹' },
  { code: 'SV', name: 'El Salvador',  flag: '🇸🇻' },
  { code: 'CR', name: 'Costa Rica',   flag: '🇨🇷' },
  { code: 'HN', name: 'Honduras',     flag: '🇭🇳' },
  { code: 'PA', name: 'Panamá',       flag: '🇵🇦' },
];

export const NICHES = [
  'Fajas', 'Belleza', 'Salud', 'Hogar', 'Fitness',
  'Tech', 'Mascotas', 'Bebés', 'Moda',
];

export const DATA_SOURCES = [
  {
    id: 'amazon',
    name: 'Amazon Bestsellers',
    icon: '📦',
    description: 'Top ventas y tendencias en Amazon',
    gradient: 'from-orange-500 to-amber-500',
    bgColor: 'rgba(249,115,22,0.08)',
    borderColor: 'rgba(249,115,22,0.25)',
  },
  {
    id: 'google_trends',
    name: 'Google Trends',
    icon: '📈',
    description: 'Tendencias de búsqueda en tiempo real',
    gradient: 'from-blue-500 to-cyan-400',
    bgColor: 'rgba(59,130,246,0.08)',
    borderColor: 'rgba(59,130,246,0.25)',
  },
  {
    id: 'meta_ads',
    name: 'Meta Ad Library',
    icon: '📢',
    description: 'Anuncios virales en Facebook e Instagram',
    gradient: 'from-indigo-500 to-blue-600',
    bgColor: 'rgba(99,102,241,0.08)',
    borderColor: 'rgba(99,102,241,0.25)',
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    icon: '🎵',
    description: 'Productos más vendidos en TikTok Shop USA',
    gradient: 'from-pink-500 to-rose-500',
    bgColor: 'rgba(236,72,153,0.08)',
    borderColor: 'rgba(236,72,153,0.25)',
  },
  {
    id: 'dropi',
    name: 'Dropi',
    icon: '💧',
    description: 'Buscar producto en catálogo Dropi',
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'rgba(139,92,246,0.08)',
    borderColor: 'rgba(139,92,246,0.25)',
  },
  {
    id: 'topventas',
    name: 'Top Ventas por País',
    icon: '🌎',
    description: 'Productos más vendidos por país y periodo',
    gradient: 'from-yellow-400 to-amber-500',
    bgColor: 'rgba(234,179,8,0.08)',
    borderColor: 'rgba(234,179,8,0.25)',
  },
  {
    id: 'aliexpress',
    name: 'AliExpress / Alibaba',
    icon: '🌏',
    description: 'Proveedores y productos en tendencia',
    gradient: 'from-red-500 to-orange-500',
    bgColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  {
    id: 'complete',
    name: 'Análisis Completo',
    icon: '🎯',
    description: 'Todas las fuentes + scores avanzados',
    gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    bgColor: 'rgba(124,58,237,0.12)',
    borderColor: 'rgba(124,58,237,0.4)',
    featured: true,
  },
] as const;

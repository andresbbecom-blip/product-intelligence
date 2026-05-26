import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Platform detection ────────────────────────────────────────────────────────
function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('amazon.com') || u.includes('amzn.to') || u.includes('amzn.com')) return 'Amazon';
  if (u.includes('aliexpress.com')) return 'AliExpress';
  if (u.includes('alibaba.com')) return 'Alibaba';
  if (u.includes('mercadolibre.') || u.includes('mercadolibre.com')) return 'MercadoLibre';
  if (u.includes('temu.com')) return 'Temu';
  if (u.includes('tiktok.com')) return 'TikTok Shop';
  if (u.includes('myshopify.com') || u.includes('shopify.com')) return 'Shopify';
  if (u.includes('dropi.co') || u.includes('dropi.com')) return 'Dropi';
  if (u.includes('shein.com')) return 'Shein';
  if (u.includes('ebay.com')) return 'eBay';
  if (u.includes('walmart.com')) return 'Walmart';
  if (u.includes('etsy.com')) return 'Etsy';
  return 'tienda online';
}

// ── Source-specific analysis angles ──────────────────────────────────────────
const SOURCE_CONTEXT: Record<string, string> = {
  amazon:       `Analiza la competencia en Amazon para este producto en ${'${country}'}. ¿Cuántos sellers lo venden? ¿Cuál es el rango de precios? ¿Hay espacio para un nuevo vendedor? Incluye precio, rating, reviews y ventas estimadas de productos similares en Amazon.`,
  google_trends:`Investiga la tendencia de búsqueda en Google Trends para este producto en ${'${country}'} durante los últimos {period} días. ¿Está en tendencia al alza, bajando o estable? Devuelve los productos más buscados relacionados con este nicho. Incluye: trendDirection ("up"/"down"/"stable"), relatedQueries (array 3-5 términos de búsqueda relacionados en ${'${country}'}), peakMonths (array con nombres de meses de mayor demanda). El array trendHistory debe reflejar el comportamiento REAL de las búsquedas en los últimos {period} días (6 puntos equidistantes, más antiguo primero).`,
  meta_ads:     `Analiza qué anuncios de Facebook/Instagram existen para este tipo de producto dirigidos a ${'${country}'}. ¿Hay muchos anunciantes? ¿Qué hooks están usando? Incluye: hooks (array 3-5 hooks efectivos), adFormats (array), audienceAge.`,
  tiktok:       `Investiga qué productos se están vendiendo AHORA en TikTok Shop USA (Estados Unidos). Encuentra los más vendidos actualmente en TikTok Shop. Para cada producto incluye: nombre del producto, precio en USD, volumen de ventas estimado, rating, nombre de la tienda que lo vende, y evalúa si es viable para dropshipping en Latinoamérica / ${'${country}'}.`,
  dropi:        `Investiga si el producto buscado está disponible en el catálogo de Dropi (dropi.co), la plataforma de dropshipping para Latinoamérica. Si lo encuentras: nombre del producto en Dropi, precio proveedor, precio sugerido de venta en ${'${country}'}, margen estimado (%), si tiene envío rápido, usa supplier: "Dropi". Si NO lo encuentras: sugiere 3-5 productos similares disponibles en Dropi con sus precios y márgenes estimados. Llena leadTime con el tiempo de entrega estimado de Dropi.`,
  topventas:    `Investiga cuáles son los productos más vendidos en e-commerce en ${'${country}'} en los últimos {period} días. Para cada producto incluye: plataforma principal donde se vende (MercadoLibre, Amazon, Shopify, TikTok Shop, etc.) en campo platform, tendencia actual (up/down/stable en trendDirection), volumen de ventas estimado, categoría, y si es una oportunidad de dropshipping. Ordena por volumen de ventas de mayor a menor.`,
  aliexpress:   `Busca proveedores en AliExpress/Alibaba para este producto. ¿Cuál es el precio de costo? ¿Cuánto margen deja para vender en ${'${country}'}? Incluye: supplier (nombre), minOrder, leadTime.`,
  complete:     `Haz un análisis COMPLETO de 360° de este producto para ${'${country}'}: demanda, competencia, margen, viralidad y viabilidad dropshipping. Incluye: demandScore (0-100), competitionScore (0-100, menor=menos competencia), marginScore (0-100), trendDirection, hashtags (array 4-6), hooks (array 3-4), supplier, leadTime.`,
};

// ── Prompt builders ───────────────────────────────────────────────────────────
function periodNote(source: string, trendPeriod?: number, topVentasPeriod?: number): string {
  if (source === 'google_trends' && trendPeriod) {
    return `\n- trendHistory: los 6 puntos deben representar los últimos ${trendPeriod} días divididos en intervalos iguales (punto 1 = hace ${trendPeriod}d, punto 6 = hoy)`;
  }
  if (source === 'topventas' && topVentasPeriod) {
    return `\n- trendHistory: los 6 puntos representan la evolución de ventas en los ${topVentasPeriod} días analizados (más antiguo primero, punto 6 = hoy)`;
  }
  return '';
}

function buildSourceCtx(source: string, country: string, trendPeriod?: number, topVentasPeriod?: number): string {
  const period = source === 'google_trends'
    ? String(trendPeriod ?? 30)
    : String(topVentasPeriod ?? 30);
  return (SOURCE_CONTEXT[source] || SOURCE_CONTEXT.complete)
    .replaceAll("${'${country}'}", country)
    .replaceAll('${country}', country)
    .replaceAll('{period}', period);
}

function googleTrendsExtras(source: string, period?: number): { schema: string; rules: string } {
  if (source !== 'google_trends') return { schema: '', rules: '' };
  const today = new Date().toISOString().slice(0, 10);
  const days = period ?? 30;
  return {
    schema: ',\n  "trendTimeline": [\n    {"date":"YYYY-MM-DD","interest":85},{"date":"YYYY-MM-DD","interest":72},\n    {"date":"YYYY-MM-DD","interest":91},{"date":"YYYY-MM-DD","interest":78},\n    {"date":"YYYY-MM-DD","interest":88},{"date":"YYYY-MM-DD","interest":95}\n  ],\n  "relatedQueries": ["término 1", "término 2", "término 3", "término 4"]',
    rules: `\n- trendTimeline: array de 6 objetos {date:"YYYY-MM-DD", interest:0-100} con fechas REALES de los últimos ${days} días (más antigua primero, última = ${today})\n- relatedQueries: array de 3-5 búsquedas relacionadas populares en el país`,
  };
}

function buildUrlPrompt(productUrl: string, source: string, country: string, extraQuery?: string, trendPeriod?: number, topVentasPeriod?: number): string {
  const platform = detectPlatform(productUrl);
  const sourceCtx = buildSourceCtx(source, country, trendPeriod, topVentasPeriod);
  const gt = googleTrendsExtras(source, trendPeriod);

  return `Eres un experto en ecommerce y dropshipping en Latinoamérica.

TAREA: Analizar el siguiente producto específico de ${platform}:
URL: ${productUrl}
${extraQuery ? `Contexto adicional: "${extraQuery}"` : ''}

PAÍS OBJETIVO: ${country}
FUENTE DE ANÁLISIS: ${source.toUpperCase()}

${sourceCtx}

Basándote en tu conocimiento general sobre este tipo de producto, la plataforma ${platform} y el mercado de ${country}:
1. Identifica de qué producto se trata a partir de la URL
2. Analiza su viabilidad para ecommerce/dropshipping en ${country}
3. Evalúa demanda, competencia, margen y estrategia

Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional:

{
  "products": [
    {
      "id": "prod_1",
      "name": "Nombre del producto identificado desde la URL",
      "price": "$XX.XX USD (precio estimado en ${country})",
      "rating": 4.5,
      "reviews": 1234,
      "sales": "~XXX/mes (estimado)",
      "opportunityScore": 78,
      "status": "Hot",
      "whySells": "Por qué este producto tiene potencial en ${country}",
      "customerPains": ["dolor 1", "dolor 2", "dolor 3"],
      "marketingAngle": "Mejor ángulo de marketing para este producto en ${country}",
      "category": "Categoría del producto",
      "trendScore": 72,
      "virality": 68,
      "ease": 75,
      "channels": [{"name":"Meta Ads","value":40},{"name":"TikTok","value":30},{"name":"Google Ads","value":20},{"name":"WhatsApp","value":10}],
      "trendHistory": [48, 55, 62, 68, 74, 78],
      "platform": "MercadoLibre"
    }
  ],
  "summary": "Análisis ejecutivo: viabilidad, oportunidad y recomendación para vender este producto en ${country}"${gt.schema}
}

REGLAS:
- status: "Hot" / "Trending" / "Estable" / "Nuevo"
- opportunityScore: 0-100 (demanda + competencia + margen)
- Si puedes identificar múltiples variantes del producto, inclúyelas (máx 4)
- trendScore (0-100): puntuación de tendencia actual del producto
- virality (0-100): potencial viral en redes sociales
- ease (0-100): facilidad de venta/implementación para un emprendedor
- channels: array de exactamente 4 objetos {name, value} con los canales más efectivos (Meta Ads, TikTok, Google Ads, WhatsApp, etc.) y su peso relativo (suman ~100)
- trendHistory: array de exactamente 6 números 0-100 representando evolución del interés en los últimos 6 meses (más antiguo primero)${periodNote(source, trendPeriod, topVentasPeriod)}
- platform (opcional): plataforma principal donde se vende este producto (ej: MercadoLibre, Amazon, Shopify, TikTok Shop)
- Incluye campos adicionales según la fuente seleccionada
- Todo en español${gt.rules}`;
}

function buildQueryPrompt(source: string, query: string, country: string, trendPeriod?: number, topVentasPeriod?: number): string {
  const sourceCtx = buildSourceCtx(source, country, trendPeriod, topVentasPeriod);
  const gt = googleTrendsExtras(source, trendPeriod);

  return `Eres un experto investigador de productos para ecommerce y dropshipping en Latinoamérica.

FUENTE: ${source.toUpperCase()}
PAÍS OBJETIVO: ${country}
NICHO/PRODUCTO: "${query}"

${sourceCtx}

Basándote en tu conocimiento general sobre productos bestsellers y tendencias de ecommerce en Latinoamérica, responde con los productos más relevantes para este nicho y país.

Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional:

{
  "products": [
    {
      "id": "prod_1",
      "name": "Nombre exacto del producto",
      "price": "$XX.XX USD",
      "rating": 4.5,
      "reviews": 1234,
      "sales": "~500/mes",
      "opportunityScore": 78,
      "status": "Hot",
      "whySells": "Explicación concreta de por qué vende en ${country}",
      "customerPains": ["dolor 1", "dolor 2", "dolor 3"],
      "marketingAngle": "El ángulo de marketing más efectivo",
      "category": "Categoría",
      "trendScore": 72,
      "virality": 68,
      "ease": 75,
      "channels": [{"name":"Meta Ads","value":40},{"name":"TikTok","value":30},{"name":"Google Ads","value":20},{"name":"WhatsApp","value":10}],
      "trendHistory": [48, 55, 62, 68, 74, 78],
      "platform": "MercadoLibre"
    }
  ],
  "summary": "Resumen ejecutivo de 2-3 oraciones con hallazgos y oportunidad en ${country}"${gt.schema}
}

REGLAS:
- status: "Hot" / "Trending" / "Estable" / "Nuevo"
- opportunityScore: 0-100 considerando demanda, competencia y margen
- Encuentra 5-8 productos específicos y reales
- trendScore (0-100): tendencia actual del producto
- virality (0-100): potencial viral en redes sociales
- ease (0-100): facilidad de venta para un emprendedor
- channels: array de 4 objetos {name, value} con los mejores canales de venta y su peso relativo (suman ~100)
- trendHistory: array de exactamente 6 números 0-100 mostrando evolución del interés en los últimos 6 meses${periodNote(source, trendPeriod, topVentasPeriod)}
- platform (opcional): plataforma principal donde más se vende el producto
- Todos los textos en español
- Incluye campos adicionales según la fuente indicada${gt.rules}`;
}

function buildImagePrompt(source: string, country: string, extraQuery?: string, trendPeriod?: number, topVentasPeriod?: number): string {
  const sourceCtx = buildSourceCtx(source, country, trendPeriod, topVentasPeriod);
  const gt = googleTrendsExtras(source, trendPeriod);

  return `Eres un experto en ecommerce y dropshipping en Latinoamérica.

TAREA: Analizar el producto que aparece en la imagen adjunta.
${extraQuery ? `Contexto adicional del usuario: "${extraQuery}"` : ''}

PAÍS OBJETIVO: ${country}
FUENTE DE ANÁLISIS: ${source.toUpperCase()}

Primero identifica el producto en la imagen:
1. Nombre exacto del producto
2. Categoría y tipo de producto
3. Marca (si es visible)
4. Rango de precio estimado para ${country}

Luego realiza el análisis según la fuente seleccionada:
${sourceCtx}

Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional:

{
  "products": [
    {
      "id": "prod_1",
      "name": "Nombre del producto identificado en la imagen",
      "price": "$XX.XX USD (precio estimado en ${country})",
      "rating": 4.5,
      "reviews": 1234,
      "sales": "~XXX/mes (estimado)",
      "opportunityScore": 78,
      "status": "Hot",
      "whySells": "Por qué este producto tiene potencial en ${country}",
      "customerPains": ["dolor 1", "dolor 2", "dolor 3"],
      "marketingAngle": "Mejor ángulo de marketing para este producto en ${country}",
      "category": "Categoría del producto",
      "trendScore": 72,
      "virality": 68,
      "ease": 75,
      "channels": [{"name":"Meta Ads","value":40},{"name":"TikTok","value":30},{"name":"Google Ads","value":20},{"name":"WhatsApp","value":10}],
      "trendHistory": [48, 55, 62, 68, 74, 78],
      "platform": "MercadoLibre"
    }
  ],
  "summary": "Análisis ejecutivo: producto identificado, viabilidad, oportunidad y recomendación para vender en ${country}"${gt.schema}
}

REGLAS:
- status: "Hot" / "Trending" / "Estable" / "Nuevo"
- opportunityScore: 0-100 (demanda + competencia + margen)
- Si identifies múltiples variantes del producto en la imagen, inclúyelas (máx 4)
- trendScore (0-100): tendencia actual del producto
- virality (0-100): potencial viral en redes sociales
- ease (0-100): facilidad de venta para un emprendedor
- channels: array de 4 objetos {name, value} con los mejores canales de venta y su peso relativo (suman ~100)
- trendHistory: array de exactamente 6 números 0-100 mostrando evolución del interés en los últimos 6 meses${periodNote(source, trendPeriod, topVentasPeriod)}
- platform (opcional): plataforma principal donde se vende el producto
- Incluye campos adicionales según la fuente seleccionada
- Todo en español${gt.rules}`;
}

function extractJSON(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Request body inválido' }, { status: 400 });

    const { query, source, country, productUrl, imageBase64, imageMimeType, trendPeriod, topVentasPeriod } = body;

    const hasImage = typeof imageBase64 === 'string' && imageBase64.trim().length > 0;
    const hasUrl   = typeof productUrl  === 'string' && productUrl.trim().length  > 0;
    const hasQuery = typeof query       === 'string' && query.trim().length        > 0;

    if (!hasImage && !hasUrl && !hasQuery) {
      return NextResponse.json({ error: 'Proporciona un producto para buscar, sube una imagen, o pega un link.' }, { status: 400 });
    }
    if (!source) return NextResponse.json({ error: 'Selecciona una fuente de datos.' }, { status: 400 });
    if (!country) return NextResponse.json({ error: 'Selecciona un país.' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY no configurada. Edita .env.local y reinicia el servidor.' },
        { status: 500 }
      );
    }

    const period    = typeof trendPeriod    === 'number' ? trendPeriod    : undefined;
    const topPeriod = typeof topVentasPeriod === 'number' ? topVentasPeriod : undefined;

    // Build prompt: image > URL > text query
    const prompt = hasImage
      ? buildImagePrompt(source, country, hasQuery ? query.trim() : undefined, period, topPeriod)
      : hasUrl
      ? buildUrlPrompt(productUrl.trim(), source, country, hasQuery ? query.trim() : undefined, period, topPeriod)
      : buildQueryPrompt(source, query.trim(), country, period, topPeriod);

    const displayQuery = hasImage
      ? `📷 Imagen${hasQuery ? ': ' + query.trim() : ''}`
      : hasUrl
      ? detectPlatform(productUrl.trim()) + ': ' + (hasQuery ? query.trim() : productUrl.trim().slice(0, 60))
      : query.trim();

    type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const VALID_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const safeMediaType: ImageMediaType = VALID_MIME.includes(imageMimeType) ? imageMimeType : 'image/jpeg';

    const messages = hasImage
      ? [{
          role: 'user' as const,
          content: [
            {
              type: 'image' as const,
              source: { type: 'base64' as const, media_type: safeMediaType, data: imageBase64.trim() },
            },
            { type: 'text' as const, text: prompt },
          ],
        }]
      : [{ role: 'user' as const, content: prompt }];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages,
    });

    let responseText = '';
    for (const block of response.content) {
      if (block.type === 'text') responseText += block.text;
    }

    const jsonStr = extractJSON(responseText);
    if (!jsonStr) throw new Error('La IA no retornó un JSON válido. Intenta de nuevo.');

    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed.products)) throw new Error('Respuesta inesperada de la IA');

    const products = parsed.products.map((p: Record<string, unknown>, i: number) => ({
      ...p,
      id: (p.id as string) || `prod_${Date.now()}_${i}`,
    }));

    return NextResponse.json({
      products,
      summary: parsed.summary || '',
      source,
      country,
      query: displayQuery,
      timestamp: new Date().toISOString(),
      ...(source === 'google_trends' && {
        trendPeriod: period,
        trendTimeline: Array.isArray(parsed.trendTimeline) ? parsed.trendTimeline : undefined,
        relatedQueries: Array.isArray(parsed.relatedQueries) ? parsed.relatedQueries : undefined,
      }),
    });
  } catch (err) {
    console.error('[/api/research]', err);
    const msg = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleTrends = require('google-trends-api') as {
  interestOverTime: (opts: { keyword: string; geo: string; startTime: Date; endTime: Date }) => Promise<string>;
  relatedQueries:   (opts: { keyword: string; geo: string; startTime: Date; endTime: Date }) => Promise<string>;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Request inválido' }, { status: 400 });

    const { query, geo, period } = body;
    if (!query || !geo || !period) {
      return NextResponse.json({ error: 'Parámetros requeridos: query, geo, period' }, { status: 400 });
    }

    const endTime   = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - Number(period));

    const opts = { keyword: String(query), geo: String(geo), startTime, endTime };

    const [timelineResult, relatedResult] = await Promise.allSettled([
      googleTrends.interestOverTime(opts),
      googleTrends.relatedQueries(opts),
    ]);

    // Parse interest over time
    let trendTimeline: { date: string; interest: number }[] = [];
    if (timelineResult.status === 'fulfilled') {
      const parsed = JSON.parse(timelineResult.value);
      const rawPoints: { time: string; value: number[] }[] = parsed?.default?.timelineData ?? [];
      trendTimeline = rawPoints.map(pt => ({
        date: new Date(Number(pt.time) * 1000).toISOString().slice(0, 10),
        interest: pt.value[0] ?? 0,
      }));
    }

    // Parse top related queries
    let relatedQueries: string[] = [];
    if (relatedResult.status === 'fulfilled') {
      const parsed = JSON.parse(relatedResult.value);
      const topKeywords: { query: string }[] = parsed?.default?.rankedList?.[0]?.rankedKeyword ?? [];
      relatedQueries = topKeywords.slice(0, 5).map((k) => k.query);
    }

    return NextResponse.json({ trendTimeline, relatedQueries });
  } catch (err) {
    console.error('[/api/trends]', err);
    return NextResponse.json(
      { error: 'No se pudieron obtener datos de Google Trends' },
      { status: 500 },
    );
  }
}

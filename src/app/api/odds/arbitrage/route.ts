/**
 * GET /api/odds/arbitrage
 *
 * Returns currently active arbitrage opportunities, sorted by margin (desc).
 * Redis fast path → Postgres fallback → static seed data.
 */

import { NextResponse } from 'next/server';
import { redisService } from '@/lib/redis';
import { prisma } from '@/lib/db';

export interface ArbitrageOpportunityItem {
  matchSlug: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  /** Margin as a PERCENTAGE, e.g. 2.3 means 2.3% */
  margin: number;
  bestHomeBookmaker: string;
  bestHomeOdds: number;
  bestDrawBookmaker: string;
  bestDrawOdds: number;
  bestAwayBookmaker: string;
  bestAwayOdds: number;
  detectedAt: string;
}

/** Derive display names from a match slug like "gor-mahia-vs-afc-leopards" */
function slugToTeams(slug: string): { homeTeam: string; awayTeam: string; league: string } {
  const parts = slug.split('-vs-');
  const toTitle = (s: string) =>
    s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const homeTeam = parts[0] ? toTitle(parts[0]) : 'Home';
  const awayTeam = parts[1] ? toTitle(parts[1]) : 'Away';

  // Infer league from known teams
  const africaTeams = ['gor mahia', 'afc leopards', 'al ahly', 'zamalek', 'simba', 'yanga',
    'young africans', 'sundowns', 'orlando', 'esperance', 'wydad', 'kaizer', 'cape town'];
  const isAfrica = africaTeams.some(
    (t) => slug.includes(t.replace(/ /g, '-'))
  );
  const league = isAfrica ? 'African Football' : 'European Football';

  return { homeTeam, awayTeam, league };
}

/** Normalise margin to always be a percentage (0–100 scale) */
function normMargin(raw: number): number {
  // If stored as decimal (< 1), convert; if already percentage (>= 1), keep
  if (raw > 0 && raw < 1) return parseFloat((raw * 100).toFixed(4));
  return parseFloat(raw.toFixed(4));
}

/** Static seed data — shown when Redis + Postgres are both empty */
function getSeedOpportunities(): ArbitrageOpportunityItem[] {
  const now = new Date().toISOString();
  const jitter = (b: number) => parseFloat((b + Math.random() * 0.06 - 0.03).toFixed(2));
  return [
    {
      matchSlug: 'gor-mahia-vs-afc-leopards',
      homeTeam: 'Gor Mahia', awayTeam: 'AFC Leopards', league: 'Kenyan Premier League',
      margin: 2.34,
      bestHomeBookmaker: 'SportPesa', bestHomeOdds: jitter(1.95),
      bestDrawBookmaker: 'Betika',    bestDrawOdds: jitter(3.60),
      bestAwayBookmaker: 'Odibets',   bestAwayOdds: jitter(4.20),
      detectedAt: now,
    },
    {
      matchSlug: 'arsenal-vs-chelsea',
      homeTeam: 'Arsenal', awayTeam: 'Chelsea', league: 'English Premier League',
      margin: 1.87,
      bestHomeBookmaker: 'Betika',    bestHomeOdds: jitter(2.25),
      bestDrawBookmaker: 'Odibets',   bestDrawOdds: jitter(3.55),
      bestAwayBookmaker: 'SportPesa', bestAwayOdds: jitter(3.45),
      detectedAt: now,
    },
    {
      matchSlug: 'al-ahly-vs-zamalek',
      homeTeam: 'Al Ahly', awayTeam: 'Zamalek', league: 'Egyptian Premier League',
      margin: 1.55,
      bestHomeBookmaker: 'Odibets',   bestHomeOdds: jitter(2.20),
      bestDrawBookmaker: 'SportPesa', bestDrawOdds: jitter(3.40),
      bestAwayBookmaker: 'Betika',    bestAwayOdds: jitter(3.55),
      detectedAt: now,
    },
    {
      matchSlug: 'simba-vs-young-africans',
      homeTeam: 'Simba SC', awayTeam: 'Young Africans', league: 'Tanzanian Mainland',
      margin: 2.11,
      bestHomeBookmaker: 'Betika',    bestHomeOdds: jitter(2.15),
      bestDrawBookmaker: 'SportPesa', bestDrawOdds: jitter(3.35),
      bestAwayBookmaker: 'Odibets',   bestAwayOdds: jitter(3.65),
      detectedAt: now,
    },
    {
      matchSlug: 'man-city-vs-liverpool',
      homeTeam: 'Man City', awayTeam: 'Liverpool', league: 'English Premier League',
      margin: 1.42,
      bestHomeBookmaker: 'Betika',    bestHomeOdds: jitter(1.98),
      bestDrawBookmaker: 'Odibets',   bestDrawOdds: jitter(3.95),
      bestAwayBookmaker: 'SportPesa', bestAwayOdds: jitter(4.15),
      detectedAt: now,
    },
    {
      matchSlug: 'sundowns-vs-orlando-pirates',
      homeTeam: 'Sundowns', awayTeam: 'Orlando Pirates', league: 'South African PSL',
      margin: 1.98,
      bestHomeBookmaker: 'SportPesa', bestHomeOdds: jitter(1.88),
      bestDrawBookmaker: 'Odibets',   bestDrawOdds: jitter(3.55),
      bestAwayBookmaker: 'Betika',    bestAwayOdds: jitter(4.30),
      detectedAt: now,
    },
  ];
}

export async function GET() {
  try {
    // ── 1. Redis fast path ──────────────────────────────────────────────────
    let redisArbs: any[] = [];
    try {
      redisArbs = await redisService.getActiveArbitrages();
    } catch (redisErr: any) {
      console.warn('[API] Redis error:', redisErr.message);
    }

    if (redisArbs.length > 0) {
      const shaped = redisArbs.map((a): ArbitrageOpportunityItem => {
        const { homeTeam, awayTeam, league } = slugToTeams(a.matchSlug);
        return {
          matchSlug: a.matchSlug,
          homeTeam:  a.homeTeam  ?? homeTeam,
          awayTeam:  a.awayTeam  ?? awayTeam,
          league:    a.league    ?? league,
          margin:    normMargin(a.margin),
          bestHomeBookmaker: a.bestHomeBookmaker,
          bestHomeOdds:      Number(a.bestHomeOdds),
          bestDrawBookmaker: a.bestDrawBookmaker,
          bestDrawOdds:      Number(a.bestDrawOdds),
          bestAwayBookmaker: a.bestAwayBookmaker,
          bestAwayOdds:      Number(a.bestAwayOdds),
          detectedAt: a.detectedAt ?? new Date().toISOString(),
        };
      }).sort((a, b) => b.margin - a.margin);

      return NextResponse.json(
        { dataSource: 'redis', lastCheckedAt: new Date().toISOString(), opportunities: shaped },
        { headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=40' } }
      );
    }

    // ── 2. Postgres fallback ────────────────────────────────────────────────
    let dbArbs: any[] = [];
    try {
      dbArbs = await prisma.arbitrageOpportunity.findMany({
        where: { expiredAt: null },
        orderBy: { margin: 'desc' },
        take: 20,
      });
    } catch (dbErr: any) {
      console.warn('[API] Postgres error:', dbErr.message);
    }

    if (dbArbs.length > 0) {
      const shaped = dbArbs.map((a): ArbitrageOpportunityItem => {
        const { homeTeam, awayTeam, league } = slugToTeams(a.matchSlug);
        return {
          matchSlug: a.matchSlug,
          homeTeam,
          awayTeam,
          league,
          margin:    normMargin(a.margin),
          bestHomeBookmaker: a.bestHomeBookmaker,
          bestHomeOdds:      a.bestHomeOdds,
          bestDrawBookmaker: a.bestDrawBookmaker,
          bestDrawOdds:      a.bestDrawOdds,
          bestAwayBookmaker: a.bestAwayBookmaker,
          bestAwayOdds:      a.bestAwayOdds,
          detectedAt: a.detectedAt ? a.detectedAt.toISOString() : new Date().toISOString(),
        };
      });

      return NextResponse.json(
        { dataSource: 'postgres', lastCheckedAt: new Date().toISOString(), opportunities: shaped },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    }

    // ── 3. Both empty → serve seed data so the page is never blank ─────────
    const seed = getSeedOpportunities();
    return NextResponse.json(
      { dataSource: 'seed', lastCheckedAt: new Date().toISOString(), opportunities: seed },
      { headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=40' } }
    );

  } catch (err: any) {
    console.error('[API /api/odds/arbitrage] Error:', err.message);
    // Even on total failure, return seed data so UI is never blank
    return NextResponse.json(
      { dataSource: 'seed', lastCheckedAt: new Date().toISOString(), opportunities: getSeedOpportunities() },
      { status: 200 }
    );
  }
}

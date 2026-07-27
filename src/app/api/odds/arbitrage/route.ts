/**
 * GET /api/odds/arbitrage
 *
 * Returns currently active arbitrage opportunities, sorted by margin (desc).
 * Redis fast path with Postgres fallback.
 *
 * Response:
 * {
 *   dataSource: "redis" | "postgres",
 *   lastCheckedAt: string,
 *   opportunities: ArbOpportunity[]
 * }
 */

import { NextResponse } from 'next/server';
import { redisService } from '@/lib/redis';
import { prisma } from '@/lib/db';

export interface ArbitrageOpportunityItem {
  matchSlug: string;
  margin: number;
  bestHomeBookmaker: string;
  bestHomeOdds: number;
  bestDrawBookmaker: string;
  bestDrawOdds: number;
  bestAwayBookmaker: string;
  bestAwayOdds: number;
  detectedAt?: string | null;
}

export async function GET() {
  try {
    // 1. Try Redis fast path
    const redisArbs = (await redisService.getActiveArbitrages()) as ArbitrageOpportunityItem[];

    if (redisArbs && redisArbs.length > 0) {
      const sorted = redisArbs.sort((a: ArbitrageOpportunityItem, b: ArbitrageOpportunityItem) => b.margin - a.margin);
      return NextResponse.json(
        {
          dataSource: 'redis',
          lastCheckedAt: new Date().toISOString(),
          opportunities: sorted,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=40',
          },
        }
      );
    }

    // 2. Redis cold — fall back to Postgres
    const dbArbs = await prisma.arbitrageOpportunity.findMany({
      where: { expiredAt: null },
      orderBy: { margin: 'desc' },
    });

    return NextResponse.json(
      {
        dataSource: 'postgres',
        lastCheckedAt: new Date().toISOString(),
        staleWarning: redisArbs.length === 0,
        opportunities: dbArbs.map((a) => ({
          matchSlug: a.matchSlug,
          margin: a.margin,
          bestHomeBookmaker: a.bestHomeBookmaker,
          bestHomeOdds: a.bestHomeOdds,
          bestDrawBookmaker: a.bestDrawBookmaker,
          bestDrawOdds: a.bestDrawOdds,
          bestAwayBookmaker: a.bestAwayBookmaker,
          bestAwayOdds: a.bestAwayOdds,
          detectedAt: a.detectedAt ? a.detectedAt.toISOString() : null,
        })),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/odds/arbitrage] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

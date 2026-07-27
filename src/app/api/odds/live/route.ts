/**
 * GET /api/odds/live
 *
 * Returns live odds for a specific match from Redis.
 * Falls back to most recent Postgres snapshot if Redis is cold.
 *
 * Query params:
 *   ?slug=arsenal-vs-chelsea   (required)
 *
 * Response:
 * {
 *   matchSlug: string,
 *   dataSource: "redis" | "postgres" | "static",
 *   lastScrapedAt: string | null,
 *   odds: ScrapedMatchOdds[]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisService } from '@/lib/redis';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Missing ?slug= parameter' }, { status: 400 });
  }

  try {
    // 1. Try Redis first (fast path)
    const liveOdds = await redisService.getAllOddsForMatch(slug);

    if (liveOdds && liveOdds.length > 0) {
      const lastScrapedAt = liveOdds
        .map((o: { scrapedAt?: string }) => o.scrapedAt)
        .filter((dateStr): dateStr is string => typeof dateStr === 'string')
        .sort()
        .at(-1) ?? null;

      return NextResponse.json(
        {
          matchSlug: slug,
          dataSource: 'redis',
          lastScrapedAt,
          odds: liveOdds,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          },
        }
      );
    }

    // 2. Redis cold — fall back to Postgres snapshot
    const snapshots = await prisma.oddsSnapshot.findMany({
      where: { matchSlug: slug },
      orderBy: { scrapedAt: 'desc' },
      take: 30, // Last ~10 scrapers × 3 bookmakers
    });

    if (snapshots.length > 0) {
      // Group by bookmaker, take most recent per bookmaker
      const byBookmaker = new Map<string, (typeof snapshots)[0]>();
      for (const snap of snapshots) {
        if (!byBookmaker.has(snap.bookmaker)) {
          byBookmaker.set(snap.bookmaker, snap);
        }
      }

      const oddsArray = Array.from(byBookmaker.values()).map((snap) => ({
        bookmaker: snap.bookmaker,
        matchSlug: snap.matchSlug,
        homeTeam: '',
        awayTeam: '',
        homeOdds: snap.homeOdds,
        drawOdds: snap.drawOdds,
        awayOdds: snap.awayOdds,
        scrapedAt: snap.scrapedAt.toISOString(),
      }));

      const lastScrapedAt = snapshots[0]?.scrapedAt?.toISOString() ?? null;

      return NextResponse.json(
        {
          matchSlug: slug,
          dataSource: 'postgres',
          lastScrapedAt,
          staleWarning: true,
          odds: oddsArray,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    }

    // 3. No data at all — return empty with static fallback signal
    return NextResponse.json(
      {
        matchSlug: slug,
        dataSource: 'static',
        lastScrapedAt: null,
        staleWarning: true,
        odds: [],
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[API /api/odds/live] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

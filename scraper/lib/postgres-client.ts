/**
 * Postgres client — gracefully optional.
 *
 * If @prisma/client fails to initialize (e.g. prisma generate wasn't run,
 * or DATABASE_URL is missing), the scraper keeps running using Redis only.
 * All functions below are no-ops when Prisma is unavailable.
 */

import { ScrapedMatchOdds } from './normalize';

// Safely try to load PrismaClient — don't crash if it fails
let prisma: any = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('[Postgres] PrismaClient initialized.');
} catch (err: any) {
  console.warn('[Postgres] PrismaClient unavailable — running Redis-only mode:', err.message);
}

export async function saveOddsSnapshot(odds: ScrapedMatchOdds): Promise<void> {
  if (!prisma) return;
  try {
    await prisma.oddsSnapshot.create({
      data: {
        matchSlug: odds.matchSlug,
        bookmaker: odds.bookmaker,
        homeOdds: odds.homeOdds,
        drawOdds: odds.drawOdds,
        awayOdds: odds.awayOdds,
        scrapedAt: new Date(odds.scrapedAt),
      },
    });
  } catch (err) {
    console.error(`[Postgres] Failed to save odds snapshot for ${odds.matchSlug}:`, err);
  }
}

export async function saveArbitrageOpportunity(arb: {
  matchSlug: string;
  margin: number;
  bestHomeBookmaker: string;
  bestHomeOdds: number;
  bestDrawBookmaker: string;
  bestDrawOdds: number;
  bestAwayBookmaker: string;
  bestAwayOdds: number;
}): Promise<void> {
  if (!prisma) return;
  try {
    const existing = await prisma.arbitrageOpportunity.findFirst({
      where: { matchSlug: arb.matchSlug, expiredAt: null },
    });
    if (existing) {
      await prisma.arbitrageOpportunity.update({
        where: { id: existing.id },
        data: {
          margin: arb.margin,
          bestHomeBookmaker: arb.bestHomeBookmaker,
          bestHomeOdds: arb.bestHomeOdds,
          bestDrawBookmaker: arb.bestDrawBookmaker,
          bestDrawOdds: arb.bestDrawOdds,
          bestAwayBookmaker: arb.bestAwayBookmaker,
          bestAwayOdds: arb.bestAwayOdds,
          detectedAt: new Date(),
        },
      });
    } else {
      await prisma.arbitrageOpportunity.create({
        data: {
          matchSlug: arb.matchSlug,
          margin: arb.margin,
          bestHomeBookmaker: arb.bestHomeBookmaker,
          bestHomeOdds: arb.bestHomeOdds,
          bestDrawBookmaker: arb.bestDrawBookmaker,
          bestDrawOdds: arb.bestDrawOdds,
          bestAwayBookmaker: arb.bestAwayBookmaker,
          bestAwayOdds: arb.bestAwayOdds,
          detectedAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.error(`[Postgres] Failed to save arb for ${arb.matchSlug}:`, err);
  }
}

export async function expireArbitrageOpportunity(matchSlug: string): Promise<void> {
  if (!prisma) return;
  try {
    await prisma.arbitrageOpportunity.updateMany({
      where: { matchSlug, expiredAt: null },
      data: { expiredAt: new Date() },
    });
  } catch (err) {
    console.error(`[Postgres] Failed to expire arb for ${matchSlug}:`, err);
  }
}

export async function getActiveArbitrageFromDB(): Promise<any[]> {
  if (!prisma) return [];
  try {
    return await prisma.arbitrageOpportunity.findMany({
      where: { expiredAt: null },
      orderBy: { margin: 'desc' },
    });
  } catch (err) {
    console.error('[Postgres] Error querying active arbitrage from DB:', err);
    return [];
  }
}

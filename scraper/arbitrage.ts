/**
 * Arbitrage Detection Engine
 *
 * Runs after every scrape batch. Instead of only checking a hardcoded list,
 * it now discovers ALL matches currently in Redis and checks every one for
 * cross-bookmaker arbitrage opportunities.
 *
 * Algorithm per match:
 *  1. Pull all bookmaker odds from Redis (must be < STALE_THRESHOLD_MS old)
 *  2. Find the best Home / Draw / Away price across all bookmakers
 *  3. Calculate implied probability sum: 1/home + 1/draw + 1/away
 *  4. If sum < 1 → arbitrage opportunity exists → write to Redis + Postgres
 *  5. If sum >= 1 → clear any previously active arb record for that match
 */

import { redisService } from './lib/redis-client';
import {
  saveArbitrageOpportunity,
  expireArbitrageOpportunity,
} from './lib/postgres-client';
import { ScrapedMatchOdds } from './lib/normalize';

/** Odds scrape must be no older than 5 minutes to participate */
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

export interface ArbResult {
  matchSlug: string;
  homeTeam: string;
  awayTeam: string;
  margin: number;
  bestHomeBookmaker: string;
  bestHomeOdds: number;
  bestDrawBookmaker: string;
  bestDrawOdds: number;
  bestAwayBookmaker: string;
  bestAwayOdds: number;
  detectedAt: string;
}

function isFresh(scrapedAt: string): boolean {
  return Date.now() - new Date(scrapedAt).getTime() < STALE_THRESHOLD_MS;
}

function isSane(odds: number): boolean {
  return odds >= 1.01 && odds <= 100;
}

export async function runArbitrageDetection(): Promise<ArbResult[]> {
  const opportunities: ArbResult[] = [];

  try {
    // Discover ALL match slugs currently in Redis dynamically
    const allSlugs = await redisService.getAllMatchSlugs();

    if (allSlugs.length === 0) {
      console.log('[Arbitrage] No matches in Redis yet — waiting for first scrape.');
      return [];
    }

    console.log(`[Arbitrage] Checking ${allSlugs.length} matches for arbitrage...`);

    for (const matchSlug of allSlugs) {
      try {
        const allOdds: ScrapedMatchOdds[] = await redisService.getAllOddsForMatch(matchSlug);

        // Filter to only fresh, sane data
        const fresh = allOdds.filter(
          (o) =>
            isFresh(o.scrapedAt) &&
            isSane(o.homeOdds) &&
            isSane(o.drawOdds) &&
            isSane(o.awayOdds)
        );

        if (fresh.length < 2) continue; // Need odds from at least 2 bookmakers

        // Find best (highest) odds per outcome across all bookmakers
        let bestHomeOdds = 0, bestHomeBookmaker = '';
        let bestDrawOdds = 0, bestDrawBookmaker = '';
        let bestAwayOdds = 0, bestAwayBookmaker = '';
        let homeTeam = '', awayTeam = '';

        for (const o of fresh) {
          if (o.homeOdds > bestHomeOdds) { bestHomeOdds = o.homeOdds; bestHomeBookmaker = o.bookmaker; }
          if (o.drawOdds > bestDrawOdds) { bestDrawOdds = o.drawOdds; bestDrawBookmaker = o.bookmaker; }
          if (o.awayOdds > bestAwayOdds) { bestAwayOdds = o.awayOdds; bestAwayBookmaker = o.bookmaker; }
          if (!homeTeam) { homeTeam = o.homeTeam; awayTeam = o.awayTeam; }
        }

        const impliedSum = 1 / bestHomeOdds + 1 / bestDrawOdds + 1 / bestAwayOdds;

        if (impliedSum < 1) {
          const margin = parseFloat(((1 - impliedSum) * 100).toFixed(4));
          const detectedAt = new Date().toISOString();

          const arb: ArbResult = {
            matchSlug,
            homeTeam,
            awayTeam,
            margin,
            bestHomeBookmaker,
            bestHomeOdds,
            bestDrawBookmaker,
            bestDrawOdds,
            bestAwayBookmaker,
            bestAwayOdds,
            detectedAt,
          };

          console.log(
            `[Arbitrage] ✅ ${matchSlug}: margin ${margin.toFixed(2)}% ` +
            `(Home: ${bestHomeOdds} @${bestHomeBookmaker}, ` +
            `Draw: ${bestDrawOdds} @${bestDrawBookmaker}, ` +
            `Away: ${bestAwayOdds} @${bestAwayBookmaker})`
          );

          await redisService.setActiveArbitrage(matchSlug, arb, 900);
          await saveArbitrageOpportunity({
            matchSlug,
            margin,
            bestHomeBookmaker,
            bestHomeOdds,
            bestDrawBookmaker,
            bestDrawOdds,
            bestAwayBookmaker,
            bestAwayOdds,
          });

          opportunities.push(arb);
        } else {
          await redisService.clearActiveArbitrage(matchSlug);
          await expireArbitrageOpportunity(matchSlug);
        }
      } catch (err: any) {
        console.error(`[Arbitrage] Error processing ${matchSlug}: ${err.message}`);
      }
    }

    console.log(`[Arbitrage] Found ${opportunities.length} active opportunities.`);
  } catch (err: any) {
    console.error(`[Arbitrage] Detection run failed: ${err.message}`);
  }

  return opportunities;
}

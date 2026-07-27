/**
 * Arbitrage Detection Engine
 *
 * Runs after every scrape batch. For each tracked match:
 *   1. Pulls all bookmaker odds from Redis (must be < STALE_THRESHOLD_MS old)
 *   2. Finds the best Home / Draw / Away price across all bookmakers
 *   3. Calculates implied probability sum
 *   4. If sum < 1 → arbitrage opportunity exists; writes to Redis + Postgres
 *   5. If sum >= 1 → clears any previously active arb record for that match
 */

import { redisService } from './lib/redis-client';
import {
  saveArbitrageOpportunity,
  expireArbitrageOpportunity,
} from './lib/postgres-client';
import { ScrapedMatchOdds } from './lib/normalize';

/** Odds scrape must be no older than 5 minutes to participate in arbitrage detection */
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

const TRACKED_SLUGS = [
  'arsenal-vs-chelsea',
  'man-city-vs-liverpool',
  'real-madrid-vs-barcelona',
  'man-united-vs-tottenham',
  'psg-vs-bayern-munich',
  'chelsea-vs-man-united',
  'liverpool-vs-arsenal',
];

interface ArbResult {
  matchSlug: string;
  margin: number;
  bestHomeBookmaker: string;
  bestHomeOdds: number;
  bestDrawBookmaker: string;
  bestDrawOdds: number;
  bestAwayBookmaker: string;
  bestAwayOdds: number;
  detectedAt: string;
}

/** True if the scrapedAt timestamp is within the freshness threshold */
function isFresh(scrapedAt: string): boolean {
  return Date.now() - new Date(scrapedAt).getTime() < STALE_THRESHOLD_MS;
}

/** Check odds are within sane bounds (not a parsing error) */
function isSane(odds: number): boolean {
  return odds >= 1.01 && odds <= 100;
}

export async function runArbitrageDetection(): Promise<ArbResult[]> {
  const opportunities: ArbResult[] = [];

  for (const matchSlug of TRACKED_SLUGS) {
    try {
      const allOdds: ScrapedMatchOdds[] = await redisService.getAllOddsForMatch(matchSlug);

      // Filter to only fresh, sane data points
      const fresh = allOdds.filter(
        (o) =>
          isFresh(o.scrapedAt) &&
          isSane(o.homeOdds) &&
          isSane(o.drawOdds) &&
          isSane(o.awayOdds)
      );

      if (fresh.length < 2) {
        // Need odds from at least 2 bookmakers to detect cross-bookmaker arbitrage
        continue;
      }

      // Find the best (highest) odds per outcome across all available bookmakers
      let bestHomeOdds = 0;
      let bestHomeBookmaker = '';
      let bestDrawOdds = 0;
      let bestDrawBookmaker = '';
      let bestAwayOdds = 0;
      let bestAwayBookmaker = '';

      for (const o of fresh) {
        if (o.homeOdds > bestHomeOdds) {
          bestHomeOdds = o.homeOdds;
          bestHomeBookmaker = o.bookmaker;
        }
        if (o.drawOdds > bestDrawOdds) {
          bestDrawOdds = o.drawOdds;
          bestDrawBookmaker = o.bookmaker;
        }
        if (o.awayOdds > bestAwayOdds) {
          bestAwayOdds = o.awayOdds;
          bestAwayBookmaker = o.bookmaker;
        }
      }

      // Implied probability sum using best odds per outcome (potentially cross-bookmaker)
      const impliedSum =
        1 / bestHomeOdds + 1 / bestDrawOdds + 1 / bestAwayOdds;

      if (impliedSum < 1) {
        // ✅ Arbitrage opportunity detected
        const margin = parseFloat(((1 - impliedSum) * 100).toFixed(4));
        const detectedAt = new Date().toISOString();

        const arb: ArbResult = {
          matchSlug,
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

        // Write to Redis (fast path for frontend polling)
        await redisService.setActiveArbitrage(matchSlug, arb, 900);

        // Persist to Postgres for history & dashboard
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
        // No arbitrage for this match — expire any open record
        await redisService.clearActiveArbitrage(matchSlug);
        await expireArbitrageOpportunity(matchSlug);
      }
    } catch (err: any) {
      console.error(`[Arbitrage] Error processing ${matchSlug}: ${err.message}`);
    }
  }

  return opportunities;
}

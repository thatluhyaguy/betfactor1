"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runArbitrageDetection = runArbitrageDetection;
const redis_client_1 = require("./lib/redis-client");
const postgres_client_1 = require("./lib/postgres-client");
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
/** True if the scrapedAt timestamp is within the freshness threshold */
function isFresh(scrapedAt) {
    return Date.now() - new Date(scrapedAt).getTime() < STALE_THRESHOLD_MS;
}
/** Check odds are within sane bounds (not a parsing error) */
function isSane(odds) {
    return odds >= 1.01 && odds <= 100;
}
async function runArbitrageDetection() {
    const opportunities = [];
    for (const matchSlug of TRACKED_SLUGS) {
        try {
            const allOdds = await redis_client_1.redisService.getAllOddsForMatch(matchSlug);
            // Filter to only fresh, sane data points
            const fresh = allOdds.filter((o) => isFresh(o.scrapedAt) &&
                isSane(o.homeOdds) &&
                isSane(o.drawOdds) &&
                isSane(o.awayOdds));
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
            const impliedSum = 1 / bestHomeOdds + 1 / bestDrawOdds + 1 / bestAwayOdds;
            if (impliedSum < 1) {
                // ✅ Arbitrage opportunity detected
                const margin = parseFloat(((1 - impliedSum) * 100).toFixed(4));
                const detectedAt = new Date().toISOString();
                const arb = {
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
                console.log(`[Arbitrage] ✅ ${matchSlug}: margin ${margin.toFixed(2)}% ` +
                    `(Home: ${bestHomeOdds} @${bestHomeBookmaker}, ` +
                    `Draw: ${bestDrawOdds} @${bestDrawBookmaker}, ` +
                    `Away: ${bestAwayOdds} @${bestAwayBookmaker})`);
                // Write to Redis (fast path for frontend polling)
                await redis_client_1.redisService.setActiveArbitrage(matchSlug, arb, 900);
                // Persist to Postgres for history & dashboard
                await (0, postgres_client_1.saveArbitrageOpportunity)({
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
            }
            else {
                // No arbitrage for this match — expire any open record
                await redis_client_1.redisService.clearActiveArbitrage(matchSlug);
                await (0, postgres_client_1.expireArbitrageOpportunity)(matchSlug);
            }
        }
        catch (err) {
            console.error(`[Arbitrage] Error processing ${matchSlug}: ${err.message}`);
        }
    }
    return opportunities;
}

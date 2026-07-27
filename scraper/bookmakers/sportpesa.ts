/**
 * SportPesa Kenya Scraper
 *
 * Strategy: Intercept the internal XHR that SportPesa's SPA fires to populate
 * the soccer event list. The browser loads the page normally and we capture
 * the JSON response before it's rendered — far more stable than CSS selectors.
 *
 * Known endpoint pattern (inspect Network tab if this ever breaks):
 *   https://www.sportpesa.co.ke/api/v5/events?SportId=...&MarketId=1
 *
 * If the endpoint changes:
 *   1. Open sportpesa.co.ke in Chrome → DevTools → Network → filter "XHR"
 *   2. Navigate to the Football section
 *   3. Find the request that returns a JSON array of matches with odds
 *   4. Update URL_PATTERN below
 *
 * ⚠️  Legal: Scraping may breach SportPesa's ToS. Proceed only after legal review.
 */

import type { Page } from 'playwright';
import { normalizeMatchSlug, sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'SportPesa';

/**
 * URL substring patterns to match SportPesa's internal odds API response.
 * Listed in priority order — first match wins.
 */
const URL_PATTERNS = [
  '/api/v5/events',
  '/api/v4/events',
  '/api/events',
  'sportpesa.co.ke/api',
];

/**
 * Maximum time to wait for the internal API response before giving up.
 * SportPesa's SPA can be slow to hydrate on first load.
 */
const API_TIMEOUT_MS = 25_000;

const TRACKED_SLUGS = [
  'arsenal-vs-chelsea',
  'man-city-vs-liverpool',
  'real-madrid-vs-barcelona',
  'man-united-vs-tottenham',
  'psg-vs-bayern-munich',
  'chelsea-vs-man-united',
  'liverpool-vs-arsenal',
];

/**
 * Parse a single match object from SportPesa's API response.
 * Field names are inferred from common SportPesa JSON shapes —
 * update if their schema changes.
 */
function parseMatch(match: any, scrapedAt: string): ScrapedMatchOdds | null {
  try {
    // Team names — SportPesa uses various field names across API versions
    const homeTeam: string =
      match.HomeTeam ?? match.home_team ?? match.home ?? match.competitors?.[0]?.name ?? '';
    const awayTeam: string =
      match.AwayTeam ?? match.away_team ?? match.away ?? match.competitors?.[1]?.name ?? '';

    if (!homeTeam || !awayTeam) return null;

    const matchSlug = normalizeMatchSlug(homeTeam, awayTeam);
    if (!TRACKED_SLUGS.includes(matchSlug ?? '')) return null;

    // Odds — SportPesa embeds them in a Markets or Outcomes array.
    // Common shapes: [{ OddsValue }, ...] or [{ odd }, ...] or a flat object.
    let homeOdds = 1.01, drawOdds = 1.01, awayOdds = 1.01;

    const outcomes: any[] =
      match.Outcomes ??
      match.outcomes ??
      match.Markets?.[0]?.Outcomes ??
      match.markets?.[0]?.outcomes ??
      [];

    if (outcomes.length >= 3) {
      homeOdds = sanitizeOdds(
        outcomes[0]?.OddsValue ?? outcomes[0]?.odd ?? outcomes[0]?.odds ?? outcomes[0]?.price ?? 1.01
      );
      drawOdds = sanitizeOdds(
        outcomes[1]?.OddsValue ?? outcomes[1]?.odd ?? outcomes[1]?.odds ?? outcomes[1]?.price ?? 1.01
      );
      awayOdds = sanitizeOdds(
        outcomes[2]?.OddsValue ?? outcomes[2]?.odd ?? outcomes[2]?.odds ?? outcomes[2]?.price ?? 1.01
      );
    } else {
      // Flat odds object on the match itself
      homeOdds = sanitizeOdds(match.HomeOdds ?? match.home_odds ?? match.odd1 ?? 1.01);
      drawOdds = sanitizeOdds(match.DrawOdds ?? match.draw_odds ?? match.oddX ?? 1.01);
      awayOdds = sanitizeOdds(match.AwayOdds ?? match.away_odds ?? match.odd2 ?? 1.01);
    }

    // All three defaulted to minimum → parse failure
    if (homeOdds === 1.01 && drawOdds === 1.01 && awayOdds === 1.01) return null;

    return {
      bookmaker: BOOKMAKER,
      matchSlug: matchSlug!,
      homeTeam,
      awayTeam,
      homeOdds,
      drawOdds,
      awayOdds,
      scrapedAt,
    };
  } catch {
    return null;
  }
}

export async function scrapeSportPesa(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();
  let capturedJson: any = null;

  // Set up response listener BEFORE navigating so we don't miss early requests
  page.on('response', async (response) => {
    if (capturedJson) return; // already captured
    const url = response.url();
    const matches = URL_PATTERNS.some((p) => url.includes(p));
    if (!matches) return;
    if (response.status() !== 200) return;
    const ct = response.headers()['content-type'] ?? '';
    if (!ct.includes('application/json')) return;

    try {
      const json = await response.json();
      capturedJson = json;
    } catch {
      // Not valid JSON — skip
    }
  });

  try {
    await page.goto('https://www.sportpesa.co.ke/sports/soccer', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });

    // Wait for the XHR to complete (up to API_TIMEOUT_MS)
    const deadline = Date.now() + API_TIMEOUT_MS;
    while (!capturedJson && Date.now() < deadline) {
      await page.waitForTimeout(500);
    }

    if (!capturedJson) {
      console.warn(`[${BOOKMAKER}] No internal API response captured — site may have changed.`);
      return results;
    }

    // Normalise response shape: could be array or { events: [], data: [], matches: [] }
    const rawMatches: any[] = Array.isArray(capturedJson)
      ? capturedJson
      : capturedJson.events ?? capturedJson.data ?? capturedJson.matches ?? capturedJson.Events ?? [];

    for (const match of rawMatches) {
      const parsed = parseMatch(match, scrapedAt);
      if (parsed) results.push(parsed);
    }

    console.log(`[${BOOKMAKER}] Scraped ${results.length} matches at ${scrapedAt}`);
  } catch (err: any) {
    console.error(`[${BOOKMAKER}] Scrape failed: ${err.message}`);
    throw err;
  }

  return results;
}

/**
 * Betika Kenya Scraper
 *
 * Strategy: Hit Betika's documented internal REST API directly — they expose a
 * paginated JSON endpoint used by both their web SPA and mobile apps.
 *
 * Known endpoint:
 *   https://api.betika.com/v1/uo/matches?sub_type_id=1&page=1&per_page=50
 *
 * sub_type_id=1 → 1X2 (football 3-way market)
 *
 * If the endpoint changes:
 *   1. Open betika.com → DevTools → Network → filter "XHR/Fetch"
 *   2. Navigate to the Football section
 *   3. Find the request returning match data
 *   4. Update BETIKA_API_URL below
 *
 * ⚠️  Legal: Scraping may breach Betika's ToS. Proceed only after legal review.
 */

import type { Page } from 'playwright';
import { normalizeMatchSlug, sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'Betika';

const BETIKA_API_URL =
  'https://api.betika.com/v1/uo/matches?sub_type_id=1&page=1&per_page=50&sport_id=1';

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
 * Parse a single match from Betika's API response.
 *
 * Betika API shape (v1):
 * {
 *   home_team: "Arsenal",
 *   away_team: "Chelsea",
 *   picks: [
 *     { odd_key: "1",  odd: "2.10" },
 *     { odd_key: "X",  odd: "3.40" },
 *     { odd_key: "2",  odd: "3.60" }
 *   ]
 * }
 *
 * Alternate shapes (API version changes):
 *   outcomes: [{ outcome_id, odd }, ...]
 *   markets: [{ outcomes: [...] }]
 */
function parseMatch(match: any, scrapedAt: string): ScrapedMatchOdds | null {
  try {
    const homeTeam: string = match.home_team ?? match.hometeam ?? match.home ?? '';
    const awayTeam: string = match.away_team ?? match.awayteam ?? match.away ?? '';
    if (!homeTeam || !awayTeam) return null;

    const matchSlug = normalizeMatchSlug(homeTeam, awayTeam);
    if (!TRACKED_SLUGS.includes(matchSlug ?? '')) return null;

    // Picks / outcomes array
    const picks: any[] =
      match.picks ??
      match.outcomes ??
      match.markets?.[0]?.outcomes ??
      [];

    let homeOdds = 1.01;
    let drawOdds = 1.01;
    let awayOdds = 1.01;

    if (picks.length >= 3) {
      // Find by odd_key first (most reliable), then fall back to index order
      const find = (key: string, idx: number) => {
        const byKey = picks.find((p) =>
          (p.odd_key ?? p.outcome_key ?? p.market_type ?? '').toLowerCase() === key
        );
        return byKey ?? picks[idx];
      };

      homeOdds = sanitizeOdds(
        find('1', 0)?.odd ?? find('1', 0)?.odds ?? find('1', 0)?.price ?? 1.01
      );
      drawOdds = sanitizeOdds(
        find('x', 1)?.odd ?? find('x', 1)?.odds ?? find('x', 1)?.price ?? 1.01
      );
      awayOdds = sanitizeOdds(
        find('2', 2)?.odd ?? find('2', 2)?.odds ?? find('2', 2)?.price ?? 1.01
      );
    } else {
      // Flat fields on the match object
      homeOdds = sanitizeOdds(match.home_odds ?? match.odd1 ?? 1.01);
      drawOdds = sanitizeOdds(match.draw_odds ?? match.oddX ?? 1.01);
      awayOdds = sanitizeOdds(match.away_odds ?? match.odd2 ?? 1.01);
    }

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

export async function scrapeBetika(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();

  try {
    // Navigate directly to the JSON endpoint using the Playwright page.
    // Using page.goto gives us cookies from the browser context, which
    // some API endpoints require for CORS/auth.
    await page.goto(BETIKA_API_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });

    // The browser renders the raw JSON as text in the body
    const bodyText = await page.evaluate(() => document.body.innerText);
    let json: any;

    try {
      json = JSON.parse(bodyText);
    } catch {
      // API didn't return JSON — try the full-page SPA approach with interception
      console.warn(`[${BOOKMAKER}] Direct API did not return JSON — falling back to SPA interception`);
      json = await spaFallback(page);
    }

    if (!json) {
      console.warn(`[${BOOKMAKER}] No data captured`);
      return results;
    }

    // Normalise: response could be { data: [...] } or a direct array
    const rawMatches: any[] = Array.isArray(json)
      ? json
      : json.data ?? json.matches ?? json.events ?? [];

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

/** Fallback: load the SPA and intercept the XHR that returns match data */
async function spaFallback(page: Page): Promise<any | null> {
  let capturedJson: any = null;

  page.on('response', async (response) => {
    if (capturedJson) return;
    const url = response.url();
    if (!url.includes('betika.com') || !url.includes('matches')) return;
    if (response.status() !== 200) return;
    try {
      const j = await response.json();
      if (j?.data && Array.isArray(j.data) && j.data.length > 0) {
        capturedJson = j;
      }
    } catch { /* skip */ }
  });

  await page.goto('https://www.betika.com/ke/s/soccer', {
    waitUntil: 'networkidle',
    timeout: 30_000,
  });

  // Give XHR 3 more seconds to finish
  await page.waitForTimeout(3_000);
  return capturedJson;
}

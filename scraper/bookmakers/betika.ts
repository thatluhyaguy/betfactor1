/**
 * Betika Scraper
 *
 * ⚠️  Legal: Scraping may breach Betika's ToS. Proceed only after legal review.
 *
 * Implementation note: Betika uses a React-based SPA. Their odds are typically
 * fetched via REST endpoints like:
 *   https://api.betika.com/v1/uo/matches?sub_type_id=1&page=1
 * which returns JSON directly. This is more reliable than parsing rendered HTML.
 * Inspect browser DevTools → Network tab on betika.com to confirm the exact endpoint.
 */
import type { Page } from 'playwright';
import { normalizeMatchSlug, sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'Betika';

const TRACKED_SLUGS = [
  'arsenal-vs-chelsea',
  'man-city-vs-liverpool',
  'real-madrid-vs-barcelona',
  'man-united-vs-tottenham',
  'psg-vs-bayern-munich',
  'chelsea-vs-man-united',
  'liverpool-vs-arsenal',
];

export async function scrapeBetika(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();

  try {
    // Option A: Intercept Betika's internal API response (most reliable)
    const interceptedData: any[] = [];

    page.on('response', async (response) => {
      try {
        if (
          response.url().includes('betika.com') &&
          response.url().includes('matches') &&
          response.status() === 200
        ) {
          const json = await response.json().catch(() => null);
          if (json?.data && Array.isArray(json.data)) {
            interceptedData.push(...json.data);
          }
        }
      } catch (_) {}
    });

    // ---- ADAPT THIS URL ----
    await page.goto('https://www.betika.com/ke/s/soccer', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Allow time for XHR responses to be captured
    await page.waitForTimeout(2000);

    if (interceptedData.length > 0) {
      // Option A: Parse from intercepted API JSON
      for (const match of interceptedData) {
        try {
          // ---- ADAPT FIELD NAMES ----
          // Betika's API fields may be named differently — inspect actual JSON response
          const homeTeam: string = match.home_team ?? match.hometeam ?? '';
          const awayTeam: string = match.away_team ?? match.awayteam ?? '';
          const matchSlug = normalizeMatchSlug(homeTeam, awayTeam);
          if (!matchSlug || !TRACKED_SLUGS.includes(matchSlug)) continue;

          // Outcomes array from Betika API: [home, draw, away] or similar structure
          const outcomes: any[] = match.outcomes ?? match.picks ?? match.markets?.[0]?.outcomes ?? [];
          if (outcomes.length < 3) continue;

          const homeOdds = sanitizeOdds(outcomes[0]?.odd ?? outcomes[0]?.odds ?? outcomes[0]?.price ?? 0);
          const drawOdds = sanitizeOdds(outcomes[1]?.odd ?? outcomes[1]?.odds ?? outcomes[1]?.price ?? 0);
          const awayOdds = sanitizeOdds(outcomes[2]?.odd ?? outcomes[2]?.odds ?? outcomes[2]?.price ?? 0);

          if (homeOdds === 1.01 && drawOdds === 1.01 && awayOdds === 1.01) continue;

          results.push({ bookmaker: BOOKMAKER, matchSlug, homeTeam, awayTeam, homeOdds, drawOdds, awayOdds, scrapedAt });
        } catch (_) {
          continue;
        }
      }
    } else {
      // Option B: Fall back to HTML selectors
      const matchRows = await page.$$('[class*="match"], [class*="event"], [data-match]');
      for (const row of matchRows) {
        try {
          const homeTeam = (await (await row.$('[class*="home"]'))?.textContent())?.trim() ?? '';
          const awayTeam = (await (await row.$('[class*="away"]'))?.textContent())?.trim() ?? '';
          const matchSlug = normalizeMatchSlug(homeTeam, awayTeam);
          if (!matchSlug || !TRACKED_SLUGS.includes(matchSlug)) continue;

          const oddsEls = await row.$$('[class*="odds"], [class*="price"]');
          if (oddsEls.length < 3) continue;

          const homeOdds = sanitizeOdds(parseFloat((await oddsEls[0].textContent()) ?? '0'));
          const drawOdds = sanitizeOdds(parseFloat((await oddsEls[1].textContent()) ?? '0'));
          const awayOdds = sanitizeOdds(parseFloat((await oddsEls[2].textContent()) ?? '0'));

          if (homeOdds === 1.01 && drawOdds === 1.01 && awayOdds === 1.01) continue;

          results.push({ bookmaker: BOOKMAKER, matchSlug, homeTeam, awayTeam, homeOdds, drawOdds, awayOdds, scrapedAt });
        } catch (_) {
          continue;
        }
      }
    }

    console.log(`[${BOOKMAKER}] Scraped ${results.length} matches at ${scrapedAt}`);
  } catch (err: any) {
    console.error(`[${BOOKMAKER}] Scrape failed: ${err.message}`);
    throw err;
  }

  return results;
}

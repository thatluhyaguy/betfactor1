/**
 * SportPesa Scraper
 *
 * Fetches odds for tracked matches from SportPesa's public pages.
 * NOTE: Inspect SportPesa's network tab — they often serve odds via an internal
 * JSON API endpoint (XHR) which is more stable than parsing rendered HTML.
 * Adapt the URL/selectors below once you've found that endpoint.
 *
 * ⚠️  Legal: Scraping may breach SportPesa's ToS. Proceed only after legal review.
 */
import type { Page } from 'playwright';
import { normalizeMatchSlug, sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'SportPesa';

// These are the match slugs we actively track. Extend as needed.
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
 * Scrapes SportPesa for 1X2 (Home/Draw/Away) odds on tracked matches.
 *
 * @param page  - A Playwright Page object, launched by the orchestrator.
 * @returns     - Array of scraped match odds, or empty array on failure.
 */
export async function scrapeSportPesa(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();

  try {
    // ---- ADAPT THIS URL ----
    // SportPesa typically serves odds at: https://www.sportpesa.co.ke/sports/soccer
    // Inspect network requests to find if there's an internal API like:
    //   https://api.sportpesa.co.ke/events?sport=soccer&market=1x2
    // That endpoint is more reliable than HTML scraping.
    await page.goto('https://www.sportpesa.co.ke/sports/soccer', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // ---- ADAPT THESE SELECTORS ----
    // These are placeholder selectors — map them to SportPesa's real DOM structure
    // after inspecting their rendered HTML in DevTools.
    const matchRows = await page.$$('[data-testid="match-row"], .match-event, .event-row');

    for (const row of matchRows) {
      try {
        const homeTeamEl = await row.$('.home-team, [data-team="home"], .team-name:first-child');
        const awayTeamEl = await row.$('.away-team, [data-team="away"], .team-name:last-child');
        const homeOddsEl = await row.$('.home-odds, [data-odds="1"], .outcome:nth-child(1) .odds');
        const drawOddsEl = await row.$('.draw-odds, [data-odds="x"], .outcome:nth-child(2) .odds');
        const awayOddsEl = await row.$('.away-odds, [data-odds="2"], .outcome:nth-child(3) .odds');

        if (!homeTeamEl || !awayTeamEl || !homeOddsEl || !drawOddsEl || !awayOddsEl) continue;

        const homeTeam = (await homeTeamEl.textContent())?.trim() ?? '';
        const awayTeam = (await awayTeamEl.textContent())?.trim() ?? '';
        const rawHome = parseFloat((await homeOddsEl.textContent())?.trim() ?? '0');
        const rawDraw = parseFloat((await drawOddsEl.textContent())?.trim() ?? '0');
        const rawAway = parseFloat((await awayOddsEl.textContent())?.trim() ?? '0');

        const matchSlug = normalizeMatchSlug(homeTeam, awayTeam);
        if (!TRACKED_SLUGS.includes(matchSlug ?? '')) continue;

        const homeOdds = sanitizeOdds(rawHome);
        const drawOdds = sanitizeOdds(rawDraw);
        const awayOdds = sanitizeOdds(rawAway);

        // Reject if any odds failed sanitization (all defaulted to 1.01 means parse failure)
        if (homeOdds === 1.01 && drawOdds === 1.01 && awayOdds === 1.01) continue;

        results.push({
          bookmaker: BOOKMAKER,
          matchSlug: matchSlug!,
          homeTeam,
          awayTeam,
          homeOdds,
          drawOdds,
          awayOdds,
          scrapedAt,
        });
      } catch (rowErr) {
        // Skip rows that fail to parse without stopping the whole pass
        continue;
      }
    }

    console.log(`[${BOOKMAKER}] Scraped ${results.length} matches at ${scrapedAt}`);
  } catch (err: any) {
    console.error(`[${BOOKMAKER}] Scrape failed: ${err.message}`);
    throw err; // Re-throw so orchestrator can count the failure
  }

  return results;
}

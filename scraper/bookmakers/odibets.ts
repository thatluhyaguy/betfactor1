/**
 * Odibets Scraper
 *
 * ⚠️  Legal: Scraping may breach Odibets' ToS. Proceed only after legal review.
 *
 * Odibets is typically server-rendered (SSR), so HTML scraping is more viable
 * than on React SPAs. That said — check DevTools Network tab first. If they
 * expose a JSON API (many bookmakers do for their mobile apps), prefer that.
 */
import type { Page } from 'playwright';
import { normalizeMatchSlug, sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'Odibets';

const TRACKED_SLUGS = [
  'arsenal-vs-chelsea',
  'man-city-vs-liverpool',
  'real-madrid-vs-barcelona',
  'man-united-vs-tottenham',
  'psg-vs-bayern-munich',
  'chelsea-vs-man-united',
  'liverpool-vs-arsenal',
];

export async function scrapeOdibets(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();

  try {
    // ---- ADAPT THIS URL ----
    await page.goto('https://www.odibets.com/ke/sports/soccer', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Odibets may paginate. For now scrape the first page (top matches) only.
    // ---- ADAPT THESE SELECTORS ----
    const matchRows = await page.$$(
      '.match-row, .event-list-item, [class*="match"], [data-event]'
    );

    for (const row of matchRows) {
      try {
        const homeTeamEl = await row.$('.home-team, .team:first-child, [class*="home"]');
        const awayTeamEl = await row.$('.away-team, .team:last-child, [class*="away"]');
        const oddsEls = await row.$$('.odds, .price, [class*="odd"]');

        if (!homeTeamEl || !awayTeamEl || oddsEls.length < 3) continue;

        const homeTeam = (await homeTeamEl.textContent())?.trim() ?? '';
        const awayTeam = (await awayTeamEl.textContent())?.trim() ?? '';
        const matchSlug = normalizeMatchSlug(homeTeam, awayTeam);
        if (!matchSlug || !TRACKED_SLUGS.includes(matchSlug)) continue;

        const homeOdds = sanitizeOdds(parseFloat((await oddsEls[0].textContent())?.trim() ?? '0'));
        const drawOdds = sanitizeOdds(parseFloat((await oddsEls[1].textContent())?.trim() ?? '0'));
        const awayOdds = sanitizeOdds(parseFloat((await oddsEls[2].textContent())?.trim() ?? '0'));

        if (homeOdds === 1.01 && drawOdds === 1.01 && awayOdds === 1.01) continue;

        results.push({ bookmaker: BOOKMAKER, matchSlug, homeTeam, awayTeam, homeOdds, drawOdds, awayOdds, scrapedAt });
      } catch (_) {
        continue;
      }
    }

    console.log(`[${BOOKMAKER}] Scraped ${results.length} matches at ${scrapedAt}`);
  } catch (err: any) {
    console.error(`[${BOOKMAKER}] Scrape failed: ${err.message}`);
    throw err;
  }

  return results;
}

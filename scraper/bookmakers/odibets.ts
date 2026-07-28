import type { Page } from 'playwright';
import { normalizeMatchSlug, sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'Odibets';

export async function scrapeOdibets(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();

  try {
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Linux"',
    });

    let capturedData: any[] = [];

    const responseHandler = async (response: any) => {
      const url = response.url();
      if ((url.includes('/game') || url.includes('/api/')) && response.status() === 200) {
        try {
          const ct = response.headers()['content-type'] ?? '';
          if (ct.includes('json') || ct.includes('text')) {
            const json = await response.json();
            const raw = Array.isArray(json) ? json : json.data ?? json.games ?? json.events ?? [];
            if (raw.length > 0) capturedData = raw;
          }
        } catch { /* ignore */ }
      }
    };

    page.on('response', responseHandler);

    await page.goto('https://www.odibets.com/ke/sports/soccer', {
      waitUntil: 'domcontentloaded',
      timeout: 25_000,
    });

    await page.waitForTimeout(4_000);
    page.off('response', responseHandler);

    if (capturedData.length > 0) {
      for (const item of capturedData) {
        const home = item.home ?? item.home_team ?? item.HomeTeam ?? '';
        const away = item.away ?? item.away_team ?? item.AwayTeam ?? '';
        if (!home || !away) continue;

        const slug = normalizeMatchSlug(home, away);
        if (!slug) continue;

        const outcomes = item.bet_outcomes ?? item.outcomes ?? [];
        let h = 1.01, d = 1.01, a = 1.01;
        if (outcomes.length >= 3) {
          h = sanitizeOdds(outcomes[0]?.odd ?? 1.01);
          d = sanitizeOdds(outcomes[1]?.odd ?? 1.01);
          a = sanitizeOdds(outcomes[2]?.odd ?? 1.01);
        }

        results.push({ bookmaker: BOOKMAKER, matchSlug: slug, homeTeam: home, awayTeam: away, homeOdds: h, drawOdds: d, awayOdds: a, scrapedAt });
      }
    }

    console.log(`[${BOOKMAKER}] Scraped ${results.length} matches at ${scrapedAt}`);
  } catch (err: any) {
    console.warn(`[${BOOKMAKER}] Scrape pass completed with warnings: ${err.message}`);
  }

  return results;
}

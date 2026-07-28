import type { Page } from 'playwright';
import { sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'Betika';

/**
 * Betika API endpoints:
 * Football (sport_id=1, sub_type_id=1 for 1X2)
 * Basketball (sport_id=2, sub_type_id=18 for Moneyline / 12)
 */
const ENDPOINTS = [
  { sport: 'Soccer', url: 'https://api.betika.com/v1/uo/matches?sub_type_id=1&page=1&per_page=100&sport_id=1' },
  { sport: 'Basketball', url: 'https://api.betika.com/v1/uo/matches?page=1&per_page=50&sport_id=2' },
];

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function scrapeBetika(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();

  for (const ep of ENDPOINTS) {
    try {
      // Use page.evaluate fetch with browser headers to avoid Cloudflare bot blocking
      const json = await page.evaluate(async (apiUrl) => {
        try {
          const res = await fetch(apiUrl, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': navigator.userAgent,
            },
          });
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      }, ep.url);

      if (!json) continue;

      const rawMatches: any[] = Array.isArray(json) ? json : json.data ?? [];

      for (const match of rawMatches) {
        const home = match.home_team ?? match.home ?? '';
        const away = match.away_team ?? match.away ?? '';
        if (!home || !away) continue;

        const homeSlug = slugify(home);
        const awaySlug = slugify(away);
        if (!homeSlug || !awaySlug) continue;

        const matchSlug = `${homeSlug}-vs-${awaySlug}`;

        // Picks array
        const picks: any[] = match.picks ?? match.outcomes ?? [];
        let h = 1.01, d = 1.01, a = 1.01;

        if (ep.sport === 'Soccer') {
          if (picks.length >= 3) {
            const findPick = (key: string, idx: number) =>
              picks.find((p) => (p.odd_key ?? '').toString().toLowerCase() === key) ?? picks[idx];
            h = sanitizeOdds(findPick('1', 0)?.odd ?? 1.01);
            d = sanitizeOdds(findPick('x', 1)?.odd ?? 1.01);
            a = sanitizeOdds(findPick('2', 2)?.odd ?? 1.01);
          } else {
            h = sanitizeOdds(match.home_odd ?? match.odd1 ?? 1.01);
            d = sanitizeOdds(match.draw_odd ?? match.oddX ?? 1.01);
            a = sanitizeOdds(match.away_odd ?? match.odd2 ?? 1.01);
          }
        } else {
          // Basketball Moneyline (2-way: Home vs Away)
          if (picks.length >= 2) {
            h = sanitizeOdds(picks[0]?.odd ?? 1.01);
            a = sanitizeOdds(picks[1]?.odd ?? 1.01);
            d = 1.01; // No draw in basketball 2-way
          }
        }

        if (h > 1.01 || a > 1.01) {
          results.push({
            bookmaker: BOOKMAKER,
            matchSlug,
            homeTeam: home,
            awayTeam: away,
            homeOdds: h,
            drawOdds: d,
            awayOdds: a,
            scrapedAt,
          });
        }
      }
    } catch (err: any) {
      console.warn(`[${BOOKMAKER}] Error scraping ${ep.sport}: ${err.message}`);
    }
  }

  console.log(`[${BOOKMAKER}] Dynamically scraped ${results.length} total active matches at ${scrapedAt}`);
  return results;
}

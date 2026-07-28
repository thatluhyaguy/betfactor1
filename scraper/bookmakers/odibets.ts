import type { Page } from 'playwright';
import { sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'Odibets';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Scrape Odibets using network interception + DOM fallback.
 */
export async function scrapeOdibets(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();
  const capturedMatches: any[] = [];

  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (
        url.includes('odibets') &&
        (url.includes('/game') || url.includes('/match') || url.includes('/events') || url.includes('/odds')) &&
        response.status() === 200
      ) {
        const ct = response.headers()['content-type'] ?? '';
        if (ct.includes('json')) {
          const body = await response.json().catch(() => null);
          if (body) {
            const raw: any[] = Array.isArray(body)
              ? body
              : body.data ?? body.games ?? body.matches ?? body.events ?? [];
            capturedMatches.push(...raw);
          }
        }
      }
    } catch { /* ignore */ }
  });

  try {
    await page.goto('https://www.odibets.com/soccer', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
  } catch (err: any) {
    console.warn(`[${BOOKMAKER}] Navigation warning: ${err.message}`);
  }

  await page.waitForTimeout(4000);

  // API call fallback
  if (capturedMatches.length === 0) {
    const apiMatches = await page.evaluate(async () => {
      const endpoints = [
        'https://www.odibets.com/api/game/games?sport=soccer&type=prematch',
        'https://www.odibets.com/api/game/games?sport=soccer',
        'https://api.odibets.com/v1/events?sport_id=1',
      ];
      const all: any[] = [];
      for (const url of endpoints) {
        try {
          const r = await fetch(url, {
            headers: { 'Accept': 'application/json' },
          });
          if (r.ok) {
            const j = await r.json();
            const items: any[] = Array.isArray(j) ? j : j.data ?? j.games ?? j.events ?? [];
            all.push(...items);
          }
        } catch { /* ignore */ }
      }
      return all;
    }).catch(() => [] as any[]);
    capturedMatches.push(...apiMatches);
  }

  // DOM fallback
  if (capturedMatches.length === 0) {
    const domMatches = await page.evaluate(() => {
      const rows: any[] = [];
      const matchEls = document.querySelectorAll('[class*="match"], [class*="event"], [class*="game-row"]');
      matchEls.forEach((el) => {
        const teams = el.querySelectorAll('[class*="team"], [class*="participant"]');
        const odds = el.querySelectorAll('[class*="odd"], button[data-odd], [class*="price"]');
        if (teams.length >= 2) {
          rows.push({
            home: teams[0]?.textContent?.trim() ?? '',
            away: teams[1]?.textContent?.trim() ?? '',
            home_odd: parseFloat(odds[0]?.textContent?.trim() ?? '0') || 0,
            draw_odd: parseFloat(odds[1]?.textContent?.trim() ?? '0') || 0,
            away_odd: parseFloat(odds[2]?.textContent?.trim() ?? '0') || 0,
          });
        }
      });
      return rows;
    }).catch(() => [] as any[]);
    capturedMatches.push(...domMatches);
  }

  for (const item of capturedMatches) {
    const home = item.home ?? item.home_team ?? item.HomeTeam ?? '';
    const away = item.away ?? item.away_team ?? item.AwayTeam ?? '';
    if (!home || !away) continue;

    const homeSlug = slugify(home);
    const awaySlug = slugify(away);
    if (!homeSlug || !awaySlug) continue;

    const matchSlug = `${homeSlug}-vs-${awaySlug}`;

    const outcomes = item.bet_outcomes ?? item.outcomes ?? item.markets ?? [];
    let h = 1.01, d = 1.01, a = 1.01;

    if (outcomes.length >= 3) {
      h = sanitizeOdds(outcomes[0]?.odd ?? outcomes[0]?.price ?? 1.01);
      d = sanitizeOdds(outcomes[1]?.odd ?? outcomes[1]?.price ?? 1.01);
      a = sanitizeOdds(outcomes[2]?.odd ?? outcomes[2]?.price ?? 1.01);
    } else {
      h = sanitizeOdds(item.home_odd ?? item.HomeOdds ?? 1.01);
      d = sanitizeOdds(item.draw_odd ?? item.DrawOdds ?? 1.01);
      a = sanitizeOdds(item.away_odd ?? item.AwayOdds ?? 1.01);
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

  console.log(`[${BOOKMAKER}] Scraped ${results.length} matches at ${scrapedAt}`);
  return results;
}

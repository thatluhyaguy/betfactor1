import type { Page } from 'playwright';
import { sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'SportPesa';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Scrape SportPesa using network interception + DOM fallback.
 * SportPesa is an SPA; we navigate the page and intercept XHR responses.
 */
export async function scrapeSportPesa(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();
  const capturedMatches: any[] = [];

  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (
        (url.includes('sportpesa') || url.includes('sportycs')) &&
        (url.includes('/events') || url.includes('/matches') || url.includes('/prematch') || url.includes('/games')) &&
        response.status() === 200
      ) {
        const ct = response.headers()['content-type'] ?? '';
        if (ct.includes('json')) {
          const body = await response.json().catch(() => null);
          if (body) {
            const raw: any[] = Array.isArray(body)
              ? body
              : body.events ?? body.data?.events ?? body.data ?? body.matches ?? [];
            capturedMatches.push(...raw);
          }
        }
      }
    } catch { /* ignore */ }
  });

  try {
    // Try SportPesa's upcoming matches section with domcontentloaded
    await page.goto('https://www.sportpesa.co.ke/sports/football', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
  } catch (err: any) {
    console.warn(`[${BOOKMAKER}] Navigation warning: ${err.message}`);
  }

  await page.waitForTimeout(4000);

  // Fallback: try API calls via page evaluate
  if (capturedMatches.length === 0) {
    const apiMatches = await page.evaluate(async () => {
      const endpoints = [
        'https://www.sportpesa.co.ke/api/v5/prematch/events?sportId=1&marketId=1&page=1&pageSize=50',
        'https://www.sportpesa.co.ke/api/v5/events?sportId=1',
        'https://www.sportpesa.co.ke/api/v4/events?sportId=1&isLive=false',
      ];
      const all: any[] = [];
      for (const url of endpoints) {
        try {
          const r = await fetch(url, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          });
          if (r.ok) {
            const j = await r.json();
            const items: any[] = Array.isArray(j) ? j : j.events ?? j.data ?? j.matches ?? j.items ?? [];
            all.push(...items);
          }
        } catch { /* ignore */ }
      }
      return all;
    }).catch(() => [] as any[]);
    capturedMatches.push(...apiMatches);
  }

  // DOM scraping fallback
  if (capturedMatches.length === 0) {
    const domMatches = await page.evaluate(() => {
      const rows: any[] = [];
      const matchEls = document.querySelectorAll('[class*="EventCard"], [class*="event-card"], [class*="match-item"]');
      matchEls.forEach((el) => {
        const teams = el.querySelectorAll('[class*="TeamName"], [class*="team-name"], [class*="participant"]');
        const odds = el.querySelectorAll('[class*="OddsButton"], [class*="odd-button"], [class*="price"]');
        if (teams.length >= 2) {
          rows.push({
            HomeTeam: teams[0]?.textContent?.trim() ?? '',
            AwayTeam: teams[1]?.textContent?.trim() ?? '',
            HomeOdds: parseFloat(odds[0]?.textContent?.trim() ?? '0') || 0,
            DrawOdds: parseFloat(odds[1]?.textContent?.trim() ?? '0') || 0,
            AwayOdds: parseFloat(odds[2]?.textContent?.trim() ?? '0') || 0,
          });
        }
      });
      return rows;
    }).catch(() => [] as any[]);
    capturedMatches.push(...domMatches);
  }

  for (const item of capturedMatches) {
    const home = item.HomeTeam ?? item.home_team ?? item.homeName ?? item.home ?? item.competitors?.[0]?.name ?? '';
    const away = item.AwayTeam ?? item.away_team ?? item.awayName ?? item.away ?? item.competitors?.[1]?.name ?? '';
    if (!home || !away) continue;

    const homeSlug = slugify(home);
    const awaySlug = slugify(away);
    if (!homeSlug || !awaySlug) continue;

    const matchSlug = `${homeSlug}-vs-${awaySlug}`;

    const outcomes = item.Outcomes ?? item.outcomes ?? item.markets?.[0]?.outcomes ?? [];
    let h = 1.01, d = 1.01, a = 1.01;

    if (outcomes.length >= 3) {
      h = sanitizeOdds(outcomes[0]?.OddsValue ?? outcomes[0]?.odd ?? outcomes[0]?.price ?? 1.01);
      d = sanitizeOdds(outcomes[1]?.OddsValue ?? outcomes[1]?.odd ?? outcomes[1]?.price ?? 1.01);
      a = sanitizeOdds(outcomes[2]?.OddsValue ?? outcomes[2]?.odd ?? outcomes[2]?.price ?? 1.01);
    } else {
      h = sanitizeOdds(item.HomeOdds ?? item.home_odd ?? item.HomeOdds ?? 1.01);
      d = sanitizeOdds(item.DrawOdds ?? item.draw_odd ?? item.DrawOdds ?? 1.01);
      a = sanitizeOdds(item.AwayOdds ?? item.away_odd ?? item.AwayOdds ?? 1.01);
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

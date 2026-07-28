import type { Page } from 'playwright';
import { sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'Betika';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Intercept Betika's internal XHR and parse match data from network responses.
 * Also falls back to DOM scraping if network interception yields nothing.
 */
export async function scrapeBetika(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();

  // Attempt 1: intercept network responses for Betika's internal match API
  const capturedMatches: any[] = [];

  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (
        url.includes('betika.com') &&
        (url.includes('/matches') || url.includes('/events') || url.includes('/games')) &&
        response.status() === 200
      ) {
        const ct = response.headers()['content-type'] ?? '';
        if (ct.includes('json')) {
          const body = await response.json().catch(() => null);
          if (body) {
            const raw: any[] = Array.isArray(body) ? body : body.data ?? body.matches ?? body.games ?? [];
            capturedMatches.push(...raw);
          }
        }
      }
    } catch { /* ignore */ }
  });

  try {
    // Navigate to the live/upcoming soccer page
    await page.goto('https://www.betika.com/en-ke/s/upcoming/1', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
  } catch (err: any) {
    console.warn(`[${BOOKMAKER}] Navigation warning: ${err.message}`);
  }

  // Give time for XHR responses
  await page.waitForTimeout(4000);

  // Attempt 2: also try the API directly via page.evaluate if network capture got nothing
  if (capturedMatches.length === 0) {
    const apiMatches = await page.evaluate(async () => {
      const urls = [
        'https://api.betika.com/v1/uo/matches?sub_type_id=1&page=1&per_page=100&sport_id=1&status=UPCOMING',
        'https://api.betika.com/v1/uo/matches?sub_type_id=1&page=1&per_page=50&sport_id=1&status=LIVE',
      ];
      const all: any[] = [];
      for (const url of urls) {
        try {
          const r = await fetch(url, {
            headers: { 'Accept': 'application/json', 'Origin': 'https://www.betika.com' },
            credentials: 'omit',
          });
          if (r.ok) {
            const j = await r.json();
            const arr: any[] = Array.isArray(j) ? j : j.data ?? j.matches ?? [];
            all.push(...arr);
          }
        } catch { /* ignore */ }
      }
      return all;
    }).catch(() => [] as any[]);
    capturedMatches.push(...apiMatches);
  }

  // Attempt 3: DOM scraping as last resort
  if (capturedMatches.length === 0) {
    const domMatches = await page.evaluate(() => {
      const rows: any[] = [];
      // Try to find match rows in the DOM
      const matchEls = document.querySelectorAll('[class*="match-row"], [class*="event-row"], [data-testid*="match"]');
      matchEls.forEach((el) => {
        const teams = el.querySelectorAll('[class*="team-name"], [class*="teamName"]');
        const odds = el.querySelectorAll('[class*="odd"], [class*="market-odd"], button[data-odd]');
        if (teams.length >= 2) {
          rows.push({
            home_team: teams[0]?.textContent?.trim() ?? '',
            away_team: teams[1]?.textContent?.trim() ?? '',
            odd1: parseFloat(odds[0]?.textContent?.trim() ?? '0') || 0,
            oddX: parseFloat(odds[1]?.textContent?.trim() ?? '0') || 0,
            odd2: parseFloat(odds[2]?.textContent?.trim() ?? '0') || 0,
          });
        }
      });
      return rows;
    }).catch(() => [] as any[]);
    capturedMatches.push(...domMatches);
  }

  // Parse captured matches
  for (const match of capturedMatches) {
    const home = match.home_team ?? match.home ?? match.HomeTeam ?? '';
    const away = match.away_team ?? match.away ?? match.AwayTeam ?? '';
    if (!home || !away) continue;

    const homeSlug = slugify(home);
    const awaySlug = slugify(away);
    if (!homeSlug || !awaySlug) continue;

    const matchSlug = `${homeSlug}-vs-${awaySlug}`;

    const picks: any[] = match.picks ?? match.outcomes ?? match.markets ?? [];
    let h = 1.01, d = 1.01, a = 1.01;

    if (picks.length >= 3) {
      const findPick = (key: string, idx: number) =>
        picks.find((p: any) => (p.odd_key ?? p.key ?? '').toString().toLowerCase() === key) ?? picks[idx];
      h = sanitizeOdds(findPick('1', 0)?.odd ?? findPick('1', 0)?.value ?? 1.01);
      d = sanitizeOdds(findPick('x', 1)?.odd ?? findPick('x', 1)?.value ?? 1.01);
      a = sanitizeOdds(findPick('2', 2)?.odd ?? findPick('2', 2)?.value ?? 1.01);
    } else {
      h = sanitizeOdds(match.home_odd ?? match.odd1 ?? match.HomeOdds ?? 1.01);
      d = sanitizeOdds(match.draw_odd ?? match.oddX ?? match.DrawOdds ?? 1.01);
      a = sanitizeOdds(match.away_odd ?? match.odd2 ?? match.AwayOdds ?? 1.01);
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

import type { Page } from 'playwright';
import { sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'Odibets';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function scrapeOdibets(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();

  try {
    const rawMatches = await page.evaluate(async () => {
      try {
        const res = await fetch('https://odibets.com/api/game/games?sport=soccer', {
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : json.data ?? json.games ?? [];
      } catch {
        return [];
      }
    });

    for (const item of rawMatches) {
      const home = item.home ?? item.home_team ?? item.HomeTeam ?? '';
      const away = item.away ?? item.away_team ?? item.AwayTeam ?? '';
      if (!home || !away) continue;

      const homeSlug = slugify(home);
      const awaySlug = slugify(away);
      if (!homeSlug || !awaySlug) continue;

      const matchSlug = `${homeSlug}-vs-${awaySlug}`;

      const outcomes = item.bet_outcomes ?? item.outcomes ?? [];
      let h = 1.01, d = 1.01, a = 1.01;
      if (outcomes.length >= 3) {
        h = sanitizeOdds(outcomes[0]?.odd ?? 1.01);
        d = sanitizeOdds(outcomes[1]?.odd ?? 1.01);
        a = sanitizeOdds(outcomes[2]?.odd ?? 1.01);
      } else {
        h = sanitizeOdds(item.home_odd ?? item.odd1 ?? 1.01);
        d = sanitizeOdds(item.draw_odd ?? item.oddX ?? 1.01);
        a = sanitizeOdds(item.away_odd ?? item.odd2 ?? 1.01);
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

    console.log(`[${BOOKMAKER}] Dynamically scraped ${results.length} active matches at ${scrapedAt}`);
  } catch (err: any) {
    console.warn(`[${BOOKMAKER}] Error: ${err.message}`);
  }

  return results;
}

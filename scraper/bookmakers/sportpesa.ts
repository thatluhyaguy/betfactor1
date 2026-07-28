import type { Page } from 'playwright';
import { sanitizeOdds, ScrapedMatchOdds } from '../lib/normalize';

const BOOKMAKER = 'SportPesa';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function scrapeSportPesa(page: Page): Promise<ScrapedMatchOdds[]> {
  const results: ScrapedMatchOdds[] = [];
  const scrapedAt = new Date().toISOString();

  try {
    const rawMatches = await page.evaluate(async () => {
      try {
        const res = await fetch('https://www.sportpesa.co.ke/api/v5/events?sportId=1&marketId=1', {
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : json.events ?? json.data ?? [];
      } catch {
        return [];
      }
    });

    for (const item of rawMatches) {
      const home = item.HomeTeam ?? item.home_team ?? item.competitors?.[0]?.name ?? '';
      const away = item.AwayTeam ?? item.away_team ?? item.competitors?.[1]?.name ?? '';
      if (!home || !away) continue;

      const homeSlug = slugify(home);
      const awaySlug = slugify(away);
      if (!homeSlug || !awaySlug) continue;

      const matchSlug = `${homeSlug}-vs-${awaySlug}`;

      const outcomes = item.Outcomes ?? item.markets?.[0]?.outcomes ?? [];
      let h = 1.01, d = 1.01, a = 1.01;
      if (outcomes.length >= 3) {
        h = sanitizeOdds(outcomes[0]?.OddsValue ?? outcomes[0]?.odd ?? 1.01);
        d = sanitizeOdds(outcomes[1]?.OddsValue ?? outcomes[1]?.odd ?? 1.01);
        a = sanitizeOdds(outcomes[2]?.OddsValue ?? outcomes[2]?.odd ?? 1.01);
      } else {
        h = sanitizeOdds(item.HomeOdds ?? item.odd1 ?? 1.01);
        d = sanitizeOdds(item.DrawOdds ?? item.oddX ?? 1.01);
        a = sanitizeOdds(item.AwayOdds ?? item.odd2 ?? 1.01);
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

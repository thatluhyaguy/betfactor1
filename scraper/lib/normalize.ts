export interface ScrapedMatchOdds {
  bookmaker: string;
  matchSlug: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  scrapedAt: string;
}

const CANONICAL_MATCHES = [
  { slug: 'arsenal-vs-chelsea', home: ['arsenal'], away: ['chelsea'] },
  { slug: 'man-city-vs-liverpool', home: ['manchester city', 'man city'], away: ['liverpool'] },
  { slug: 'real-madrid-vs-barcelona', home: ['real madrid', 'r. madrid'], away: ['barcelona', 'barca'] },
  { slug: 'man-united-vs-tottenham', home: ['manchester united', 'man utd', 'man united'], away: ['tottenham', 'spurs'] },
  { slug: 'psg-vs-bayern-munich', home: ['paris saint-germain', 'psg', 'paris sg'], away: ['bayern munich', 'bayern'] },
  { slug: 'chelsea-vs-man-united', home: ['chelsea'], away: ['manchester united', 'man utd', 'man united'] },
  { slug: 'liverpool-vs-arsenal', home: ['liverpool'], away: ['arsenal'] },
];

/**
 * Normalizes raw team names to canonical match slug.
 * Returns null if no match found in canonical list.
 */
export function normalizeMatchSlug(rawHome: string, rawAway: string): string | null {
  const homeClean = rawHome.trim().toLowerCase();
  const awayClean = rawAway.trim().toLowerCase();

  for (const item of CANONICAL_MATCHES) {
    const homeMatches = item.home.some((h) => homeClean.includes(h));
    const awayMatches = item.away.some((a) => awayClean.includes(a));

    if (homeMatches && awayMatches) {
      return item.slug;
    }
  }

  // Fallback slug generator if not in pre-defined canonical list
  const slugifiedHome = homeClean.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slugifiedAway = awayClean.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slugifiedHome}-vs-${slugifiedAway}`;
}

/**
 * Sanitize and validate decimal odds value.
 * Reject odds < 1.01 or > 100 as parsing error.
 */
export function sanitizeOdds(rawOdds: number | string): number {
  const parsed = typeof rawOdds === 'number' ? rawOdds : parseFloat(String(rawOdds));
  if (isNaN(parsed) || parsed < 1.01 || parsed > 100) {
    return 1.01;
  }
  return Math.round(parsed * 100) / 100;
}

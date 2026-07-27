import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import OddsTable from '@/components/OddsTable';
import matches from '@/data/matches.json';
import Link from 'next/link';

export const revalidate = 10800; // ISR: revalidate every 3 hours

type Match = (typeof matches)[number];

function getMatch(slug: string): Match | undefined {
  return matches.find((m) => m.slug === slug);
}

export async function generateStaticParams() {
  return matches.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const match = getMatch(slug);
  if (!match) return {};

  const title = `${match.homeTeam} vs ${match.awayTeam} Best Odds Kenya`;
  const description = `Compare ${match.homeTeam} vs ${match.awayTeam} odds across SportPesa, Betika, and Odibets. Best ${match.competition} odds in Kenya — updated regularly.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | BetFactor`,
      description,
      url: `https://betfactor.co.ke/odds/${slug}`,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });
}

function isStale(iso: string): boolean {
  const diff = Date.now() - new Date(iso).getTime();
  return diff > 24 * 60 * 60 * 1000;
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const match = getMatch(slug);
  if (!match) notFound();

  const stale = isStale(match.lastUpdated);
  const kickoffDate = new Date(match.kickoff).toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });

  const bestHome = Math.max(...match.odds.map((o) => o.home));
  const bestDraw = Math.max(...match.odds.map((o) => o.draw));
  const bestAway = Math.max(...match.odds.map((o) => o.away));

  // Structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeam} vs ${match.awayTeam}`,
    startDate: match.kickoff,
    sport: 'Soccer',
    description: `${match.competition} match: ${match.homeTeam} vs ${match.awayTeam}. Compare best odds from Kenya's top bookmakers.`,
    homeTeam: { '@type': 'SportsTeam', name: match.homeTeam },
    awayTeam: { '@type': 'SportsTeam', name: match.awayTeam },
    organizer: { '@type': 'Organization', name: match.competition },
    location: { '@type': 'Place', name: 'Kenya' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="match-hero" aria-labelledby="match-title">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span aria-hidden="true"> / </span>
            <Link href="/#matches" className="breadcrumb-link">Odds</Link>
            <span aria-hidden="true"> / </span>
            <span className="breadcrumb-current">{match.homeTeam} vs {match.awayTeam}</span>
          </nav>

          {/* Competition badge */}
          <div className="match-competition-badge">{match.competition}</div>

          {/* Teams */}
          <div className="match-teams-hero">
            <div className="team-block">
              <span className="team-name-hero">{match.homeTeam}</span>
              <span className="team-role">Home</span>
            </div>
            <div className="match-vs-block">
              <span className="vs-large">VS</span>
              <span className="kickoff-date">{kickoffDate}</span>
            </div>
            <div className="team-block">
              <span className="team-name-hero">{match.awayTeam}</span>
              <span className="team-role">Away</span>
            </div>
          </div>

          {/* Best odds summary */}
          <div className="match-best-summary">
            <div className="best-quick-cell">
              <span className="bq-label">{match.homeTeam} Win</span>
              <span className="bq-value">{bestHome.toFixed(2)}</span>
              <span className="bq-badge">Best</span>
            </div>
            <div className="best-quick-cell">
              <span className="bq-label">Draw</span>
              <span className="bq-value">{bestDraw.toFixed(2)}</span>
              <span className="bq-badge">Best</span>
            </div>
            <div className="best-quick-cell">
              <span className="bq-label">{match.awayTeam} Win</span>
              <span className="bq-value">{bestAway.toFixed(2)}</span>
              <span className="bq-badge">Best</span>
            </div>
          </div>
        </div>
      </section>

      {/* Odds Table */}
      <section className="section" aria-labelledby="odds-table-heading">
        <div className="container">
          <div className="section-header">
            <h2 id="odds-table-heading" className="section-title">
              Full Odds Comparison
            </h2>
            <div className="last-updated-block">
              <span className={`last-updated ${stale ? 'stale' : 'fresh'}`}>
                {stale ? '⚠️' : '🟢'} Last updated: {formatDate(match.lastUpdated)}
                {stale && ' · These odds may be outdated — verify on the bookmaker\'s site.'}
              </span>
            </div>
          </div>

          <OddsTable
            odds={match.odds}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
          />

          <div className="odds-disclaimer">
            <p>
              ⚠️ Odds are manually curated and may not reflect live prices.
              Always verify on <strong>SportPesa</strong>, <strong>Betika</strong>, or{' '}
              <strong>Odibets</strong> before placing your bet.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator CTA */}
      <section className="section section-alt" aria-labelledby="calc-cta-heading">
        <div className="container">
          <div className="cta-block">
            <h2 id="calc-cta-heading" className="cta-title">
              Know your net take-home before you bet
            </h2>
            <p className="cta-desc">
              Use our calculator to see exactly what you'll receive after Kenya's 5% betting withdrawal tax and M-Pesa fees.
            </p>
            <Link href="/#calculator" className="cta-button">
              Open Calculator →
            </Link>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="section" aria-labelledby="seo-heading">
        <div className="container">
          <div className="explainer">
            <h2 id="seo-heading" className="explainer-title">
              {match.homeTeam} vs {match.awayTeam} — Odds Guide for Kenyan Bettors
            </h2>
            <div className="explainer-body">
              <p>
                This page compares <strong>{match.homeTeam} vs {match.awayTeam}</strong> odds across Kenya's top bookmakers —
                SportPesa, Betika, and Odibets. The best available odds for each market are highlighted in{' '}
                <span style={{ color: '#FB2056' }}>red</span>.
              </p>
              <p>
                Getting the best odds matters more than you might think. On a KES 1,000 bet, a difference of 0.10 in decimal odds
                is KES 100 in gross payout — and that's before Kenya's 5% withdrawal tax and M-Pesa fees.
              </p>
              <p>
                Always use our <Link href="/#calculator" className="explainer-link">net payout calculator</Link> to convert odds
                into your actual take-home amount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Other matches */}
      <section className="section section-alt" aria-labelledby="other-matches-heading">
        <div className="container">
          <h2 id="other-matches-heading" className="section-title">Other Matches</h2>
          <div className="other-matches">
            {matches
              .filter((m) => m.slug !== match.slug)
              .slice(0, 3)
              .map((m) => (
                <Link key={m.slug} href={`/odds/${m.slug}`} className="other-match-link">
                  <span className="other-match-name">
                    {m.homeTeam} vs {m.awayTeam}
                  </span>
                  <span className="other-match-comp">{m.competition}</span>
                  <span className="other-match-arrow">→</span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}

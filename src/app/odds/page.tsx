import type { Metadata } from 'next';
import MatchCard from '@/components/MatchCard';
import matches from '@/data/matches.json';

export const metadata: Metadata = {
  title: 'This Week\'s Odds Comparison | BetFactor Kenya',
  description:
    'Compare decimal odds side-by-side across SportPesa, Betika, Odibets, Mozzart, and 1xBet for top football fixtures.',
};

export default function OddsPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ maxWidth: '820px' }}>
          <span className="page-tag">HAND-PICKED FIXTURES</span>
          <h1 className="page-title">This Week's Odds, Compared By Hand</h1>
          <p className="page-lead">
            Until live scanning is ready, we're manually checking and updating odds for the week's biggest fixtures — Premier League, La Liga, and Champions League. Every match below shows when it was last checked.
          </p>
        </div>

        <div className="matches-grid" style={{ marginTop: '40px' }}>
          {matches.map((match) => (
            <MatchCard key={match.slug} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}

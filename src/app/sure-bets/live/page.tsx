import type { Metadata } from 'next';
import ArbFeed from '@/components/surebets/ArbFeed';

export const metadata: Metadata = {
  title: 'Live Scanner — Active Surebets | BetFactor Kenya',
  description:
    'Live arbitrage scanner feed updating every 25 seconds across SportPesa, Betika, and Odibets.',
};

export default function LiveSurebetsPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ maxWidth: '860px' }}>
          <span className="page-tag">LIVE SCANNER FEED</span>
          <h1 className="page-title">Active Surebets &amp; Arbitrage Opportunities</h1>
          <p className="page-lead">
            Real-time feed updating every 25 seconds. Place calculated stakes across bookmakers to lock in guaranteed profit regardless of match outcome.
          </p>
        </div>

        <section className="arb-feed-section" aria-label="Live arbitrage opportunities">
          <ArbFeed />
        </section>
      </div>
    </div>
  );
}

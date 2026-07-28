import type { Metadata } from 'next';
import Link from 'next/link';
import ArbFeed from '@/components/surebets/ArbFeed';

export const metadata: Metadata = {
  title: 'Prematch Surebets — Scanned Bookmaker Odds | BetFactor Kenya',
  description:
    'Scan prematch arbitrage opportunities across SportPesa, Betika, and Odibets. Calculate guaranteed margins before kickoff.',
};

export default function PrematchSurebetsPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        {/* Navigation Sub-Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Link href="/sure-bets" className="sb-btn sb-btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            📖 How Surebets Work
          </Link>
          <Link href="/sure-bets/prematch" className="sb-btn sb-btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            ⚽ Prematch Surebets
          </Link>
          <Link href="/sure-bets/live" className="sb-btn sb-btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            ⚡ Live In-Play Surebets
          </Link>
        </div>

        <div className="page-header" style={{ maxWidth: '860px' }}>
          <span className="page-tag">PREMATCH SCANNER</span>
          <h1 className="page-title">Prematch Surebets &amp; Odds Arbitrage</h1>
          <p className="page-lead">
            Prematch opportunities appear hours or days before kickoff. Odds move predictably, giving you time to log in to bookmaker accounts and place stakes.
          </p>
        </div>

        <section className="arb-feed-section" aria-label="Prematch arbitrage opportunities">
          <ArbFeed />
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import PricingTable from '@/components/PricingTable';

export const metadata: Metadata = {
  title: 'Simple, Honest Pricing | BetFactor Kenya',
  description:
    'The calculator and manually checked odds are free permanently. A single Member tier unlocks automated live odds scanning and sure bets when launched.',
};

export default function PricingPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ maxWidth: '820px' }}>
          <span className="page-tag">SIMPLE, HONEST PRICING</span>
          <h1 className="page-title">Free Today. One Paid Tier When Live Scanning Launches.</h1>
          <p className="page-lead">
            The calculator and this week's manually-checked odds are free, permanently, no signup. When automated live scanning and sure bets launch, a single Member tier unlocks them — priced once, not staged into confusing bundles.
          </p>
        </div>

        <PricingTable />

        <div className="content-body" style={{ maxWidth: '860px', marginTop: '64px' }}>
          <div className="content-section">
            <h2>We're Not Charging for Something That Doesn't Exist Yet</h2>
            <p>
              The calculator works today and it's free. Live odds scanning and arbitrage detection are still in development — charging for a "Member" tier before that's real would mean charging you for a promise. When it's actually running reliably, we'll announce pricing and give existing free users first access.
            </p>
            <div className="info-box" style={{ marginTop: '20px' }}>
              📲 <strong>No surprise charges, no auto-enrollment.</strong> Sign up for launch notifications to get early access when live scanning ships.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

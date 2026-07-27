import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How the Numbers Actually Work | BetFactor Kenya',
  description:
    'Step-by-step breakdown of Kenya 5% withholding tax (Finance Act 2025), Safaricom M-Pesa agent withdrawal tariffs, and odds shopping math.',
};

export default function HowItWorksPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ maxWidth: '820px' }}>
          <span className="page-tag">TRANSPARENT METHODOLOGY</span>
          <h1 className="page-title">How the Numbers Actually Work</h1>
          <p className="page-lead">
            No jargon — here's exactly how BetFactor calculates your net take-home, and how odds comparison and arbitrage detection will work once live scanning launches.
          </p>
        </div>

        <div className="content-body" style={{ maxWidth: '860px' }}>
          {/* Section 1: Step by Step */}
          <div className="content-section">
            <h2>From Stake to Actual Cash in Your M-Pesa</h2>

            <div className="worked-example">
              <div className="we-row">
                <span>Step 1 — Gross Payout</span>
                <span>Stake × Odds = Gross Payout (e.g. KES 1,000 × 2.40 = KES 2,400)</span>
              </div>
              <div className="we-row deduct">
                <span>Step 2 — Withholding Tax</span>
                <span>5% on full gross payout under Finance Act 2025 (− KES 120)</span>
              </div>
              <div className="we-row deduct">
                <span>Step 3 — M-Pesa Fee</span>
                <span>Safaricom published agent withdrawal tariff (− KES 29)</span>
              </div>
              <div className="we-row subtotal">
                <span>Step 4 — Net Take-Home</span>
                <span>Gross − Tax − Fee = KES 2,251 actual cash received</span>
              </div>
            </div>

            <div className="info-box">
              ✓ <strong>Verification note:</strong> Both the tax rate and M-Pesa tariff table are checked periodically against KRA (kra.go.ke) and Safaricom's published rates. The "last verified" date next to the calculator tells you how current the numbers are.
            </div>
          </div>

          {/* Section 2: How Odds Comparison Works Today */}
          <div className="content-section">
            <h2>Manually Checked, Honestly Labeled</h2>
            <p>
              Right now, odds shown on BetFactor are checked by hand against each bookmaker's own platform for the week's biggest fixtures. Every match card shows the exact time it was last checked — if it's been a while, verify directly on the bookmaker's site before betting, since prices move.
            </p>
          </div>

          {/* Section 3: How Arbitrage Detection Will Work */}
          <div className="content-section">
            <h2>The Math Behind Sure Bets</h2>
            <p>
              Once live scanning launches, BetFactor continuously compares odds across tracked bookmakers for each outcome (Home/Draw/Away). When the combined implied probability of the best available odds across all three outcomes drops below 100%, a risk-free arbitrage window exists — the gap between 100% and that combined probability is your guaranteed margin, before tax and fees.
            </p>
            <p>
              This only works with fast, continuous scanning — see the <Link href="/sure-bets" className="explainer-link">Sure Bets page</Link> for why this isn't a manual process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

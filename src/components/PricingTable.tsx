'use client';

import Link from 'next/link';

export default function PricingTable() {
  return (
    <div className="pricing-section-container">
      <div className="pricing-table-wrapper">
        <table className="pricing-table">
          <thead>
            <tr>
              <th className="feature-col">Feature</th>
              <th className="tier-col free">Free Tier</th>
              <th className="tier-col member">Member Tier ⚡</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="feature-name">Live odds comparison</td>
              <td className="check-cell">✅</td>
              <td className="check-cell">✅</td>
            </tr>
            <tr>
              <td className="feature-name">Net payout calculator</td>
              <td className="check-cell">✅</td>
              <td className="check-cell">✅</td>
            </tr>
            <tr>
              <td className="feature-name">Sure bets page</td>
              <td className="check-cell text-muted">Limited preview</td>
              <td className="check-cell highlight">✅ Full live access</td>
            </tr>
            <tr>
              <td className="feature-name">Per-match arbitrage calculator</td>
              <td className="check-cell locked">🔒 Locked</td>
              <td className="check-cell highlight">✅ Unlocked</td>
            </tr>
            <tr>
              <td className="feature-name">Real-time alerts on new arbitrage opportunities</td>
              <td className="check-cell cross">❌</td>
              <td className="check-cell highlight">✅</td>
            </tr>
            <tr>
              <td className="feature-name">Priority updates on odds changes</td>
              <td className="check-cell cross">❌</td>
              <td className="check-cell highlight">✅</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pricing-cta-row">
        <Link href="/pricing" className="cta-button">
          Unlock Full Access →
        </Link>
        <span className="pricing-subtext">No credit card required. Upgrade via M-Pesa STK Push anytime.</span>
      </div>
    </div>
  );
}

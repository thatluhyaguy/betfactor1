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
              <th className="tier-col free">Free (available now)</th>
              <th className="tier-col member">Member (launches with live scanning) ⚡</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="feature-name">Net payout calculator</td>
              <td className="check-cell highlight">✅ Always free</td>
              <td className="check-cell highlight">✅</td>
            </tr>
            <tr>
              <td className="feature-name">This week's manually-checked odds</td>
              <td className="check-cell highlight">✅ Always free</td>
              <td className="check-cell highlight">✅</td>
            </tr>
            <tr>
              <td className="feature-name">Live automated odds scanning</td>
              <td className="check-cell text-muted">—</td>
              <td className="check-cell highlight">✅</td>
            </tr>
            <tr>
              <td className="feature-name">Sure bets / arbitrage detection</td>
              <td className="check-cell text-muted">—</td>
              <td className="check-cell highlight">✅</td>
            </tr>
            <tr>
              <td className="feature-name">Per-match arbitrage calculator</td>
              <td className="check-cell text-muted">—</td>
              <td className="check-cell highlight">✅</td>
            </tr>
            <tr>
              <td className="feature-name">Real-time alerts on new opportunities</td>
              <td className="check-cell text-muted">—</td>
              <td className="check-cell highlight">✅</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pricing-cta-row">
        <span className="pricing-subtext">
          Member pricing will be announced when live scanning launches. If you sign up now, you'll be notified with the exact price before it goes live — no surprise charges, no auto-enrollment.
        </span>
        <Link href="/signup" className="cta-button">
          Notify me at launch →
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import ArbFeed from '@/components/surebets/ArbFeed';

export const metadata: Metadata = {
  title: 'Sure Bets — Live Arbitrage Opportunities | BetFactor Kenya',
  description:
    'Live arbitrage scanner across SportPesa, Betika, Odibets, Mozzart, and 1xBet. See guaranteed-profit opportunities with margin %, bookmakers, and real-time data age.',
};

export default function SureBetsPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">

        {/* Page Header */}
        <div className="page-header" style={{ maxWidth: '860px' }}>
          <span className="page-tag">LIVE ARBITRAGE SCANNER</span>
          <h1 className="page-title">Sure Bets — Guaranteed-Profit Opportunities</h1>
          <p className="page-lead">
            When bookmakers price the same match differently enough, you can place stakes across all outcomes and profit regardless of the result. The feed below updates every 25 seconds. If it shows zero opportunities, the market is currently too tight — check back shortly.
          </p>
        </div>

        {/* Live Arb Feed */}
        <section className="arb-feed-section" aria-label="Live arbitrage opportunities">
          <ArbFeed />
        </section>

        {/* Explainer below the live feed */}
        <div className="content-body" style={{ maxWidth: '860px', marginTop: '64px' }}>

          <div className="content-section">
            <h2>The Math Behind a "Sure Bet"</h2>
            <p>
              Arbitrage happens when bookmakers disagree enough on a match's outcome that you can place bets across all possible results — split across different platforms — and come out ahead no matter which result actually happens.
            </p>

            <div className="pricing-table-wrapper" style={{ margin: '24px 0' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Outcome</th>
                    <th>Best Odds</th>
                    <th>Bookmaker</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="feature-name">Arsenal Win</td>
                    <td>2.20</td>
                    <td className="text-positive"><strong>SportPesa</strong></td>
                  </tr>
                  <tr>
                    <td className="feature-name">Draw</td>
                    <td>3.60</td>
                    <td className="text-positive"><strong>Betika</strong></td>
                  </tr>
                  <tr>
                    <td className="feature-name">Chelsea Win</td>
                    <td>3.80</td>
                    <td className="text-positive"><strong>Odibets</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              If you split a KES 10,000 budget proportionally across all three outcomes at these odds, you land a small guaranteed profit regardless of the result — typically 1–4% of your total stake. It's not a way to get rich fast; it's a way to extract a small, mathematically guaranteed edge from bookmakers pricing the same match differently.
            </p>
          </div>

          <div className="content-section">
            <h2>One Thing to Understand Going In</h2>
            <p>
              Arbitrage betting doesn't put your stake at risk the way a normal bet does — that's the point. But bookmakers know arbitrage patterns exist, and they actively watch for accounts that use them repeatedly. Consistent arbitrage betting can lead to a bookmaker limiting your stakes or closing your account. That's not a reason to avoid it, but it's a real trade-off worth knowing before you rely on it as a regular strategy.
            </p>
          </div>

          <div className="content-section">
            <h2>About the Stake Calculator</h2>
            <p>
              Each opportunity card has a locked <strong>Stake Calculator</strong> button. This will calculate the exact split across bookmakers for any total stake size, accounting for Kenya's 5% withholding tax and M-Pesa fees, so your guaranteed profit figure is the actual amount hitting your phone — not the gross figure. This unlocks with the upcoming Member plan. Use the <Link href="/calculator" className="inline-link">Net Payout Calculator</Link> for manual estimates in the meantime.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

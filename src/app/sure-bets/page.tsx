import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Risk-Free Arbitrage Betting (Coming Soon) | BetFactor Kenya',
  description:
    'Automated live odds scanning for sure bets across SportPesa, Betika, Odibets, Mozzart, and 1xBet is in active development. Sign up for launch notifications.',
};

export default function SureBetsPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        {/* Hero */}
        <div className="page-header" style={{ maxWidth: '820px' }}>
          <span className="page-tag">COMING SOON</span>
          <h1 className="page-title">
            Risk-Free Arbitrage Betting — Live Scanning Launching Soon
          </h1>
          <p className="page-lead">
            BetFactor is building an automated scanner across SportPesa, Betika, Odibets, Mozzart, and 1xBet to catch moments when combined odds guarantee a profit regardless of match outcome. It's not live yet — here's what it will do, and how to get notified the moment it is.
          </p>

          <form action="/signup" className="hero-ctas-row" style={{ justifyContent: 'center', marginTop: '28px' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="calc-input"
              style={{ maxWidth: '340px', fontSize: '0.95rem', padding: '12px 16px' }}
              required
            />
            <button type="submit" className="btn-primary-large" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
              Notify me when it launches →
            </button>
          </form>
        </div>

        <div className="content-body" style={{ maxWidth: '860px', marginTop: '48px' }}>
          {/* Section: What Is Arbitrage Betting? */}
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

          {/* Section: Why This Needs Automation */}
          <div className="content-section">
            <h2>Why We're Not Just Publishing a List</h2>
            <p>
              Real arbitrage windows are narrow — odds shift the moment enough people bet into them, and by the time three bookmakers' prices are manually compared, the opportunity is often gone. That's why this page isn't live yet: doing this properly means constantly scanning odds in near real time, not checking by hand once an hour.
            </p>
            <p>
              We're building that scanning infrastructure now. When it launches, this page will show active opportunities with margins updating continuously, plus a per-match calculator to split your stake correctly.
            </p>
          </div>

          {/* Section: Know the Risk Before You Start */}
          <div className="content-section">
            <h2>One Thing to Understand Going In</h2>
            <p>
              Arbitrage betting doesn't put your stake at risk the way a normal bet does — that's the point. But bookmakers know arbitrage patterns exist, and they actively watch for accounts that use them repeatedly. Consistent arbitrage betting can lead to a bookmaker limiting your stakes or closing your account. That's not a reason to avoid it, but it's a real trade-off worth knowing before you rely on it as a regular strategy.
            </p>
          </div>

          {/* Section: CTA */}
          <div className="social-proof-card" style={{ textAlign: 'center', marginTop: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Be First to Know
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Live scanning is in active development. Leave your email and we'll notify you the moment it's ready — no spam, one email at launch.
            </p>
            <form action="/signup" className="hero-ctas-row" style={{ justifyContent: 'center' }}>
              <input
                type="email"
                placeholder="Enter your email"
                className="calc-input"
                style={{ maxWidth: '300px', fontSize: '0.95rem', padding: '12px 16px' }}
                required
              />
              <button type="submit" className="btn-primary-large" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                Notify Me →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

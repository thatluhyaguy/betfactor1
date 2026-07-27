import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What BetFactor Is — and Isn\'t | BetFactor Kenya',
  description:
    'Independent tax calculator and odds comparison tool for Kenyan bettors. Not a bookmaker, not financial advice.',
};

export default function AboutPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ maxWidth: '820px' }}>
          <span className="page-tag">TRANSPARENCY &amp; INDEPENDENCE</span>
          <h1 className="page-title">What BetFactor Is — and Isn't</h1>
        </div>

        <div className="content-body" style={{ maxWidth: '860px' }}>
          {/* What We Are */}
          <div className="content-section">
            <h2>What We Are</h2>
            <p>
              BetFactor is an independent calculator and odds-comparison tool built for Kenyan bettors. We help you see two things clearly: what you'll actually take home after tax and M-Pesa fees, and how odds differ across bookmakers for the same match.
            </p>
          </div>

          {/* What We Are Not */}
          <div className="content-section">
            <h2>What We Are Not</h2>
            <ul className="comp-list-fw bad" style={{ margin: '16px 0' }}>
              <li>
                <strong>We are not a bookmaker.</strong> We do not accept bets, hold stakes, or process wagers.
              </li>
              <li>
                <strong>We are not affiliated</strong> with SportPesa, Betika, Odibets, Mozzart, 1xBet, or any bookmaker we compare.
              </li>
              <li>
                <strong>We are not a financial advisor.</strong> Every figure shown is an estimate based on publicly available tax and fee information, not a guarantee.
              </li>
            </ul>
          </div>

          {/* Where Our Numbers Come From */}
          <div className="content-section">
            <h2>Where Our Numbers Come From</h2>
            <ul className="comp-list-fw good" style={{ margin: '16px 0' }}>
              <li>Tax calculations use the Finance Act 2025 withholding rate, verified against KRA's published guidance.</li>
              <li>M-Pesa fee calculations use Safaricom's published agent withdrawal tariff.</li>
              <li>Odds shown today are manually checked against each bookmaker's own platform. Automated live scanning is in development — see How It Works for details.</li>
            </ul>
            <p style={{ marginTop: '16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Rates change. Always confirm current tax rules at kra.go.ke and current M-Pesa tariffs at safaricom.co.ke before relying on an exact figure for a significant payout.
            </p>
          </div>

          {/* Responsible Gambling */}
          <div className="content-section">
            <h2>Responsible Gambling</h2>
            <p>
              Betting carries real financial risk, and BetFactor's tools are meant to help you make clearer decisions — not to encourage betting more than you otherwise would. If gambling has stopped being enjoyable or is causing financial strain, free support is available through the National Council on Problem Gambling Kenya (NCPG) at{' '}
              <a href="https://www.ncpg.or.ke" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                ncpg.or.ke
              </a>. You must be 18 or older to bet in Kenya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

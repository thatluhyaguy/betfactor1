import Link from 'next/link';

export default function TrustBlock() {
  return (
    <div className="trust-block-container">
      <div className="trust-header">
        <span className="trust-badge">🛡️ INDEPENDENT UTILITY</span>
        <h3 className="trust-title">We're a Comparison Tool, Not a Bookmaker</h3>
      </div>
      <p className="trust-text">
        BetFactor doesn't take bets, hold your money, or place wagers on your behalf. We show you public odds data and help you do the math. You always bet directly on the bookmaker's own platform.
      </p>

      <div className="trust-warning">
        <p>
          ⚠️ <strong>Responsible gambling matters.</strong> Betting carries financial risk. If gambling stops being fun, support resources are available — contact{' '}
          <a href="https://www.ncpg.or.ke" target="_blank" rel="noopener noreferrer" className="trust-link">
            National Council on Problem Gambling Kenya (NCPG)
          </a>.
        </p>
        <p className="warning-sub">
          Arbitrage strategies can also result in bookmakers limiting or closing individual betting accounts; this is a known industry practice and something to weigh before relying on arbitrage regularly.
        </p>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <Link href="/" className="nav-logo" aria-label="BetFactor home">
            <span className="logo-bet">Bet</span>
            <span className="logo-factor">Factor</span>
          </Link>
          <p className="footer-tagline">
            Kenya's sharpest betting calculator.<br />Know what you actually take home.
          </p>
        </div>

        {/* Links */}
        <div className="footer-links">
          <div className="footer-col">
            <h3 className="footer-col-title">Tools</h3>
            <Link href="/#calculator" className="footer-link">Net Payout Calculator</Link>
            <Link href="/#matches" className="footer-link">Best Odds Comparison</Link>
          </div>
          <div className="footer-col">
            <h3 className="footer-col-title">Information</h3>
            <Link href="/how-it-works" className="footer-link">How It Works</Link>
            <Link href="/about" className="footer-link">About &amp; Disclaimer</Link>
          </div>
        </div>
      </div>

      {/* Responsible gambling */}
      <div className="footer-responsible">
        <p>
          🛡️ <strong>Bet Responsibly.</strong> Gambling can be addictive. If you or someone you know needs help, contact{' '}
          <a href="https://www.ncpg.or.ke" target="_blank" rel="noopener noreferrer" className="footer-responsible-link">
            NCPG Kenya
          </a>{' '}
          or call the helpline. You must be 18+ to bet.
        </p>
      </div>

      {/* Disclaimer + copyright */}
      <div className="footer-bottom">
        <p className="footer-disclaimer">
          Disclaimer: BetFactor is an independent calculator and odds comparison tool. We do not accept bets.
          Odds are manually updated and may not reflect live prices — always verify on the bookmaker's platform.
          Calculator figures are estimates only; tax rates and M-Pesa tariffs can change without notice.
        </p>
        <p className="footer-copy">© {year} BetFactor. All rights reserved.</p>
      </div>
    </footer>
  );
}

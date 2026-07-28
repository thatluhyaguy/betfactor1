import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">

      {/* ── Main grid: Brand + Nav columns ── */}
      <div className="footer-main">

        {/* Brand column */}
        <div className="footer-brand">
          <Link href="/" className="footer-logo" aria-label="BetFactor home">
            <Image src="/icon.svg" alt="BetFactor icon" width={28} height={28} style={{ borderRadius: '7px' }} />
            <span><span className="logo-bet">Bet</span><span className="logo-factor">Factor</span></span>
          </Link>
          <p className="footer-tagline">
            Kenya's sharpest arbitrage scanner.<br />
            Find guaranteed profits across bookmakers in real time.
          </p>
          <div className="footer-badge">
            <span className="footer-badge-dot" />
            Live odds scanning
          </div>
        </div>

        {/* Nav column: Explore */}
        <div className="footer-col">
          <h3 className="footer-col-title">Explore</h3>
          <Link href="/sure-bets" className="footer-link">Surebets</Link>
          <Link href="/sure-bets/prematch" className="footer-link">Prematch</Link>
          <Link href="/sure-bets/live" className="footer-link">Live Feed</Link>
          <Link href="/pricing" className="footer-link">Pricing</Link>
        </div>

        {/* Nav column: Company */}
        <div className="footer-col">
          <h3 className="footer-col-title">Company</h3>
          <Link href="/how-it-works" className="footer-link">How It Works</Link>
          <Link href="/about" className="footer-link">About & Disclaimer</Link>
          <Link href="/calculator" className="footer-link">Calculator</Link>
        </div>

        {/* Nav column: Account */}
        <div className="footer-col">
          <h3 className="footer-col-title">Account</h3>
          <Link href="/login" className="footer-link">Log In</Link>
          <Link href="/signup" className="footer-link">Get Access</Link>
          <Link href="/dashboard" className="footer-link">My Dashboard</Link>
        </div>
      </div>

      {/* ── Responsible gambling strip ── */}
      <div className="footer-responsible">
        <span className="footer-resp-icon">🛡️</span>
        <p>
          <strong>Bet Responsibly.</strong> Gambling can be addictive. If you or someone you know needs help, contact{' '}
          <a href="https://www.ncpg.or.ke" target="_blank" rel="noopener noreferrer" className="footer-responsible-link">
            NCPG Kenya
          </a>{' '}
          or call the helpline. You must be <strong>18+</strong> to bet.
        </p>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p className="footer-disclaimer">
          BetFactor is an independent odds comparison tool. We do not accept bets. Odds are indicative — always verify on the bookmaker's platform.
        </p>
        <p className="footer-copy">© {year} BetFactor. All rights reserved.</p>
      </div>

    </footer>
  );
}

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        {/* Logo */}
        <Link href="/" className="nav-logo" aria-label="BetFactor home">
          <span className="logo-bet">Bet</span>
          <span className="logo-factor">Factor</span>
        </Link>

        {/* Nav links */}
        <div className="nav-links">
          <Link href="/#calculator" className="nav-link">
            Calculator
          </Link>
          <Link href="/#matches" className="nav-link">
            Odds
          </Link>
          <Link href="/sure-bets" className="nav-link" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            ⚡ Sure Bets
          </Link>
          <Link href="/pricing" className="nav-link">
            Pricing
          </Link>
          <Link href="/how-it-works" className="nav-link">
            How It Works
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" className="nav-link">
              Log In
            </Link>
            <Link href="/signup" className="nav-cta">
              Get Access →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

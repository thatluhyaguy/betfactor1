'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';

const publicNavItems = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/sure-bets', label: '📖 Surebets Info' },
  { href: '/sure-bets/prematch', label: '⚽ Prematch' },
  { href: '/sure-bets/live', label: '⚡ Live Feed', accent: true },
  { href: '/pricing', label: 'Pricing' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAdmin, isUser, user, logout, loading } = useAuth();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo" aria-label="BetFactor home">
            <span className="logo-bet">Bet</span>
            <span className="logo-factor">Factor</span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links nav-desktop">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
                style={item.accent ? { color: 'var(--accent)', fontWeight: 600 } : undefined}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}

            {/* Admin-only links: Admin Panel & View as Bettor Dashboard */}
            {isAdmin && (
              <>
                <Link href="/admin/dashboard" className="nav-link" style={{ color: '#f59e0b', fontWeight: 700 }}>
                  🔑 Admin Panel
                </Link>
                <Link href="/dashboard" className="nav-link" style={{ color: 'var(--positive)', fontWeight: 600 }}>
                  👤 Bettor Dashboard
                </Link>
              </>
            )}

            {/* Regular logged-in user dashboard */}
            {isUser && !isAdmin && (
              <Link href="/dashboard" className="nav-link" style={{ color: 'var(--positive)', fontWeight: 700 }}>
                👤 My Account
              </Link>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ThemeToggle />
              {!loading && (isAdmin || isUser) ? (
                <button
                  onClick={logout}
                  className="nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}
                >
                  Log Out
                </button>
              ) : (
                <>
                  <Link href="/login" className="nav-link">Log In</Link>
                  <Link href="/signup" className="nav-cta">Get Access →</Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="nav-mobile-actions">
            <ThemeToggle />
            <button
              className="hamburger-btn"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className={`hamburger-line ${menuOpen ? 'open-top' : ''}`} />
              <span className={`hamburger-line ${menuOpen ? 'open-mid' : ''}`} />
              <span className={`hamburger-line ${menuOpen ? 'open-bot' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        id="mobile-menu"
        className={`mobile-drawer ${menuOpen ? 'mobile-drawer-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="mobile-drawer-inner">
          {publicNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mobile-nav-link"
              style={item.accent ? { color: 'var(--accent)' } : undefined}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin-only mobile links */}
          {isAdmin && (
            <>
              <Link href="/admin/dashboard" className="mobile-nav-link" style={{ color: '#f59e0b', fontWeight: 700 }}>
                🔑 Admin Panel
              </Link>
              <Link href="/dashboard" className="mobile-nav-link" style={{ color: 'var(--positive)' }}>
                👤 Bettor Dashboard
              </Link>
            </>
          )}

          {/* User dashboard mobile link */}
          {isUser && !isAdmin && (
            <Link href="/dashboard" className="mobile-nav-link" style={{ color: 'var(--positive)' }}>
              👤 My Account
            </Link>
          )}

          <div className="mobile-drawer-divider" />
          {!loading && (isAdmin || isUser) ? (
            <button
              onClick={logout}
              className="mobile-nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: 'var(--text-secondary)' }}
            >
              Log Out
            </button>
          ) : (
            <>
              <Link href="/login" className="mobile-nav-link">Log In</Link>
              <Link href="/signup" className="btn-primary-large" style={{ marginTop: '8px', textAlign: 'center', display: 'block' }}>
                Get Access →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Calculator from '@/components/Calculator';
import MatchCard from '@/components/MatchCard';
import FaqAccordion from '@/components/FaqAccordion';
import TrustBlock from '@/components/TrustBlock';
import matches from '@/data/matches.json';

export const metadata: Metadata = {
  title: 'BetFactor Kenya — Net Payout & Odds Calculator (Finance Act 2025)',
  description:
    'Calculate your exact net cash-out after Kenya\'s 5% withholding tax (Finance Act 2025) and Safaricom M-Pesa agent withdrawal fees. Free, instant, and transparent.',
};

export default function HomePage() {
  const featuredMatches = matches.slice(0, 6);

  return (
    <>
      {/* 1. Hero Section — Breakout Illustration Layout */}
      <section className="hero-breakout" aria-labelledby="hero-headline">
        <div className="container full-width-container">
          <div className="hero-breakout-grid">
            {/* Left Content */}
            <div className="hero-text-col">
              <div className="hero-pill-badge">
                🇰🇪 KENYA'S NET PAYOUT &amp; ODDS CALCULATOR
              </div>
              <h1 id="hero-headline" className="hero-breakout-title">
                You Don't Know What You Actually Take Home.{' '}
                <span className="hero-highlight-text">Until Now.</span>
              </h1>
              <p className="hero-breakout-sub">
                Enter your stake and odds. See your exact net payout after Kenya's 5% withholding tax (Finance Act 2025) and M-Pesa withdrawal fees — before you place the bet, not after you're staring at a smaller number than you expected.
              </p>

              <div className="hero-ctas-row">
                <Link href="/#calculator" className="btn-primary-large">
                  Calculate My Payout →
                </Link>
                <Link href="/#how-the-math-works" className="btn-secondary-large">
                  See how the math works ↓
                </Link>
              </div>

              <div className="hero-trust-bar">
                <span className="trust-text-small">
                  ✓ 100% Free · No Signup Required · Verified Finance Act 2025 &amp; M-Pesa Tariff Rates
                </span>
              </div>
            </div>

            {/* Right Column: Layered Breakout Character Illustration */}
            <div className="hero-illustration-col">
              <div className="hero-ambient-glow" aria-hidden="true" />

              {/* Floating UI Badge 1 */}
              <div className="floating-ui-badge ui-top-right">
                <span className="ui-icon-bolt">🧮</span>
                <div>
                  <span className="ui-bold-text text-positive">KES 2,251.00 Net Take-Home</span>
                  <span className="ui-sub-text">5% Tax &amp; M-Pesa Fee Deducted</span>
                </div>
              </div>

              {/* Floating UI Badge 2 */}
              <div className="floating-ui-badge ui-middle-left">
                <span className="ui-icon-lock">⚖️</span>
                <div>
                  <span className="ui-bold-text">0.15 Odds Gap</span>
                  <span className="ui-sub-text text-positive">= KES 150 Difference / Bet</span>
                </div>
              </div>

              {/* Character Image */}
              <div className="character-crop-box">
                <Image
                  src="/hero_woman.png"
                  alt="Confident Kenyan bettor checking net payouts on her smartphone"
                  width={580}
                  height={800}
                  priority
                  className="breakout-character-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Real Problem Section */}
      <section id="how-the-math-works" className="section section-alt" aria-labelledby="problem-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">WHY YOUR PAYOUT IS LOWER THAN EXPECTED</div>
            <h2 id="problem-heading" className="section-title">
              Every Bookmaker Shows You Odds. Nobody Shows You What You'll Actually Get Paid.
            </h2>
            <p className="section-subtitle">
              You place a bet at odds of 2.40 on a KES 1,000 stake. You do the mental math: KES 2,400. That's not what lands in your M-Pesa.
            </p>
          </div>

          <div className="agitation-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Here's what actually happens:
            </h3>
            <ul className="comp-list-fw bad" style={{ marginBottom: '24px' }}>
              <li>
                <strong>5% withholding tax</strong> comes off your gross winnings under the Finance Act 2025 — automatically, no exceptions.
              </li>
              <li>
                <strong>M-Pesa withdrawal fees</strong> apply based on the amount bracket, whether you're pulling out KES 500 or KES 50,000.
              </li>
              <li>
                Most bettors find out the real number only after the payout lands — and by then it's too late to have shopped for better odds elsewhere.
              </li>
            </ul>
            <div className="agitation-highlight">
              💡 <strong>BetFactor does the math before you bet, not after.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Calculator Section */}
      <section id="calculator" className="section" aria-labelledby="calc-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">THE ONLY NUMBER THAT MATTERS</div>
            <h2 id="calc-heading" className="section-title">
              What You'll Actually Walk Away With
            </h2>
            <p className="section-subtitle">
              Enter your stake and decimal odds. We apply the current Finance Act 2025 withholding rate and Safaricom's M-Pesa agent withdrawal tariff — the same numbers the bookmakers use, laid out line by line so you can check our math.
            </p>
          </div>

          <Calculator />
        </div>
      </section>

      {/* 4. Why Odds Shopping Matters Section */}
      <section className="section section-alt" aria-labelledby="shopping-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">REAL NUMBERS, REAL IMPACT</div>
            <h2 id="shopping-heading" className="section-title">
              A 0.15 Difference in Odds Is Real Money
            </h2>
            <p className="section-subtitle" style={{ maxWidth: '780px', margin: '0 auto' }}>
              Bookmakers don't all offer the same price on the same match. SportPesa might have Arsenal to win at 2.10 while another platform has it at 2.25. On a KES 1,000 stake, that's the difference between a KES 2,100 payout and a KES 2,250 payout — before tax and fees even apply.
            </p>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="pricing-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Odds</th>
                    <th>Gross Payout on KES 1,000</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="feature-name">Bookmaker A</td>
                    <td>2.10</td>
                    <td>KES 2,100</td>
                  </tr>
                  <tr>
                    <td className="feature-name">Bookmaker B</td>
                    <td>2.25</td>
                    <td>KES 2,250</td>
                  </tr>
                  <tr style={{ background: 'var(--positive-glow)' }}>
                    <td className="feature-name" style={{ color: 'var(--positive)' }}><strong>Difference</strong></td>
                    <td style={{ color: 'var(--positive)' }}><strong>+0.15</strong></td>
                    <td className="text-positive"><strong>KES 150 per bet</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Multiply that gap across every bet you place in a season, and the bookmaker you default to out of habit is quietly costing you money you never notice.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Built in the Open Section */}
      <section className="section" aria-labelledby="open-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">TRANSPARENCY FIRST</div>
            <h2 id="open-heading" className="section-title">
              Built in the Open
            </h2>
            <p className="section-subtitle">
              Transparency is a feature here, not a weakness — separating BetFactor from sites that claim "live" and aren't.
            </p>
          </div>

          <div className="comparison-grid-fw" style={{ maxWidth: '1000px' }}>
            <div className="comp-card-fw good">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--positive)', marginBottom: '16px' }}>
                ✅ Live Today
              </h3>
              <ul className="comp-list-fw">
                <li>Net payout calculator — Finance Act 2025 tax rate + current M-Pesa tariff schedule</li>
                <li>Manually curated odds comparison for this week's biggest fixtures</li>
                <li>100% free with no login or credit card required</li>
              </ul>
            </div>

            <div className="comp-card-fw bad" style={{ borderColor: 'var(--border)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '16px' }}>
                🔧 In Active Development
              </h3>
              <ul className="comp-list-fw">
                <li>Automated live odds scanning across SportPesa, Betika, Odibets, Mozzart, and 1xBet</li>
                <li>Automated sure bets &amp; arbitrage detection engine</li>
                <li>M-Pesa Member subscription for real-time opportunity alerts</li>
              </ul>
            </div>
          </div>

          {/* Email Capture Waitlist Form */}
          <div className="social-proof-card" style={{ marginTop: '40px', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Get notified when automated live scanning launches
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              No spam. Just one notification email the moment live odds scanning and sure bets go live.
            </p>
            <form action="/signup" className="hero-ctas-row" style={{ justifyContent: 'center' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="calc-input"
                style={{ maxWidth: '320px', fontSize: '0.95rem', padding: '12px 16px' }}
                required
              />
              <button type="submit" className="btn-primary-large" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                Notify Me →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 6. Today's Manually Compared Matches */}
      <section id="matches" className="section section-alt" aria-labelledby="matches-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">HAND-PICKED FIXTURES</div>
            <h2 id="matches-heading" className="section-title">
              This Week's Odds, Compared By Hand
            </h2>
            <p className="section-subtitle">
              Until live scanning is ready, we're manually checking and updating odds for the week's biggest fixtures — Premier League, La Liga, and Champions League first. Every match below shows when it was last checked.
            </p>
          </div>
          <div className="matches-grid">
            {featuredMatches.map((match) => (
              <MatchCard key={match.slug} match={match} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. How BetFactor Works (3 Steps) */}
      <section className="section" aria-labelledby="how-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">3 SIMPLE STEPS</div>
            <h2 id="how-heading" className="section-title">
              How BetFactor Works
            </h2>
          </div>

          <div className="steps-grid-cards">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3 className="step-title">Check the Calculator</h3>
              <p className="step-desc">
                Enter your stake and the odds you're being offered. See your real net take-home instantly.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3 className="step-title">Compare This Week's Matches</h3>
              <p className="step-desc">
                Browse manually-verified odds across major Kenyan bookmakers for the week's top fixtures.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3 className="step-title">Bet with the Full Picture</h3>
              <p className="step-desc">
                Place your bet knowing exactly what tax and fees will take off the top — no surprises at withdrawal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="section section-alt" aria-labelledby="faq-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <h2 id="faq-heading" className="section-title">
              Frequently Asked Questions
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* 9. Final CTA Banner */}
      <section className="section final-cta-section" aria-labelledby="final-cta-heading">
        <div className="container full-width-container">
          <div className="final-cta-card">
            <h2 id="final-cta-heading" className="final-cta-title">
              Know Your Numbers Before You Bet
            </h2>
            <p className="final-cta-desc">
              Free, no signup, no catch. Calculate your real take-home in under 10 seconds.
            </p>
            <Link href="/#calculator" className="btn-primary-large">
              Calculate My Payout →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

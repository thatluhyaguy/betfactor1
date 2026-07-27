import type { Metadata } from 'next';
import Link from 'next/link';
import Calculator from '@/components/Calculator';
import MatchCard from '@/components/MatchCard';
import OddsTicker from '@/components/OddsTicker';
import PricingTable from '@/components/PricingTable';
import FaqAccordion from '@/components/FaqAccordion';
import TrustBlock from '@/components/TrustBlock';
import matches from '@/data/matches.json';

export const metadata: Metadata = {
  title: 'BetFactor Kenya — Stop Leaving Money on the Table Every Time You Bet',
  description:
    'BetFactor scans odds across SportPesa, Betika, Mozzart, SportyBet, and 1xBet in real time. Calculate exact M-Pesa net payouts after Kenya 5% withholding tax & M-Pesa fees.',
};

export default function HomePage() {
  const featuredMatches = matches.slice(0, 6);

  return (
    <>
      {/* 1. Live Ticker & Hero Section */}
      <OddsTicker />

      <section className="hero" aria-labelledby="hero-headline">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">🇰🇪 Scan 5 Bookmakers · Real Time</div>
            <h1 id="hero-headline" className="hero-title">
              Stop Leaving Money on the Table{' '}
              <span className="hero-accent">Every Time</span> You Bet
            </h1>
            <p className="hero-subtitle">
              BetFactor scans odds across <strong>SportPesa, Betika, Mozzart, SportyBet</strong> and <strong>1xBet</strong> in real time — so you always know exactly where the best price is, and exactly what you'll actually take home after tax and M-Pesa fees.
            </p>

            <div className="hero-actions">
              <Link href="/#calculator" className="hero-btn-primary">
                Get Free Access →
              </Link>
              <Link href="#how-it-works-section" className="hero-btn-secondary">
                See how it works ↓
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value accent">5%</span>
                <span className="stat-label">Finance Act 2025 Tax</span>
              </div>
              <div className="stat-divider" aria-hidden="true" />
              <div className="stat">
                <span className="stat-value positive">KES 11–309</span>
                <span className="stat-label">M-Pesa Fee Included</span>
              </div>
              <div className="stat-divider" aria-hidden="true" />
              <div className="stat">
                <span className="stat-value">5</span>
                <span className="stat-label">Bookmakers Scanned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem (Agitation) */}
      <section className="section section-alt" aria-labelledby="problem-heading">
        <div className="container">
          <div className="agitation-card">
            <div className="agitation-badge">⚠️ THE REAL COST OF BETTING BLIND</div>
            <h2 id="problem-heading" className="agitation-title">
              You're Probably Losing Money Without Knowing It
            </h2>
            <p className="agitation-desc">
              Most bettors in Kenya pick one platform and stick with it. But odds move constantly, and a 0.15 difference on your stake adds up fast over a season.
            </p>
            <p className="agitation-desc">
              Worse — nobody tells you what you're <em>really</em> taking home. Withholding tax and M-Pesa withdrawal fees quietly eat into every payout. You place a bet thinking you'll win KES 4,200. You actually walk away with less. Every time.
            </p>
            <div className="agitation-highlight">
              💡 <strong>BetFactor fixes both problems on one screen.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Solution (Feature Overview) & Calculator */}
      <section id="calculator" className="section" aria-labelledby="solution-heading">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">THREE TOOLS. ONE DASHBOARD. ZERO GUESSWORK.</div>
            <h2 id="solution-heading" className="section-title">
              Calculators &amp; Smart Tools
            </h2>
            <p className="section-subtitle">
              Interactive net take-home calculation, live tax deductions, and best odds matching.
            </p>
          </div>

          <div className="tools-grid">
            <div className="tool-card">
              <span className="tool-icon">🔍</span>
              <h3 className="tool-title">Real-Time Odds Comparison</h3>
              <p className="tool-desc">
                See every major Kenyan bookmaker's odds for today's biggest matches, side by side, updated live. The best price is always flagged for you.
              </p>
            </div>
            <div className="tool-card active">
              <span className="tool-icon">🧮</span>
              <h3 className="tool-title">Net Payout Calculator</h3>
              <p className="tool-desc">
                Enter your stake and odds. Instantly see your real take-home amount after withholding tax and M-Pesa fees — before you place the bet.
              </p>
            </div>
            <div className="tool-card">
              <span className="tool-icon">⚡</span>
              <h3 className="tool-title">Sure Bets &amp; Arbitrage Finder</h3>
              <p className="tool-desc">
                Unlock the arbitrage calculator on any match to see if there's a risk-free opportunity across bookmakers where you profit regardless of outcome.
              </p>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className="calculator-wrapper-main">
            <Calculator />
          </div>
        </div>
      </section>

      {/* 4. How It Works (3 Steps) */}
      <section id="how-it-works-section" className="section section-alt" aria-labelledby="how-heading">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">SIMPLE 3-STEP PROCESS</div>
            <h2 id="how-heading" className="section-title">
              How BetFactor Works
            </h2>
          </div>

          <div className="steps-grid-cards">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3 className="step-title">Browse Live Matches</h3>
              <p className="step-desc">
                Open BetFactor and see today's top fixtures with live odds from every major Kenyan bookmaker, updating in real time.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3 className="step-title">Check Your Numbers</h3>
              <p className="step-desc">
                Tap any match to open the calculator. See your projected payout after tax and fees, or check if an arbitrage opportunity exists.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3 className="step-title">Bet Smarter, Not Harder</h3>
              <p className="step-desc">
                Place your bet on whichever platform actually has the best price — and know exactly what you'll walk away with.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Matches Section */}
      <section id="matches" className="section" aria-labelledby="matches-heading">
        <div className="container">
          <div className="section-header">
            <h2 id="matches-heading" className="section-title">
              Today's Best Odds Comparison
            </h2>
            <p className="section-subtitle">
              SportPesa vs Betika vs Odibets vs Mozzart vs 1xBet
            </p>
          </div>
          <div className="matches-grid">
            {featuredMatches.map((match) => (
              <MatchCard key={match.slug} match={match} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Subscribe (Value Stack / Pricing Table) */}
      <section id="pricing" className="section section-alt" aria-labelledby="pricing-heading">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">TRANSPARENT VALUE STACK</div>
            <h2 id="pricing-heading" className="section-title">
              Free vs. BetFactor Member
            </h2>
            <p className="section-subtitle">
              Choose the level of edge you need. Upgrade or downgrade anytime via M-Pesa.
            </p>
          </div>

          <PricingTable />
        </div>
      </section>

      {/* 6. Social Proof */}
      <section className="section" aria-labelledby="proof-heading">
        <div className="container">
          <div className="social-proof-card">
            <div className="proof-icon">🚀</div>
            <h3 id="proof-heading" className="proof-title">
              Join 500+ Early Kenyan Bettors
            </h3>
            <p className="proof-desc">
              Tracking live odds and calculating exact net M-Pesa take-home figures across SportPesa, Betika, Mozzart, SportyBet, and 1xBet.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Trust & Transparency Block */}
      <section className="section section-alt" aria-labelledby="trust-section-heading">
        <div className="container">
          <TrustBlock />
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="section-header">
            <h2 id="faq-heading" className="section-title">
              Frequently Asked Questions
            </h2>
            <p className="section-subtitle">Everything you need to know about BetFactor, taxes, and M-Pesa fees</p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* 9. Final CTA (Bottom of Page) */}
      <section className="section final-cta-section" aria-labelledby="final-cta-heading">
        <div className="container">
          <div className="final-cta-card">
            <h2 id="final-cta-heading" className="final-cta-title">
              Know Your Numbers Before You Bet
            </h2>
            <p className="final-cta-desc">
              Join BetFactor free and start comparing odds, calculating real payouts, and spotting opportunities today.
            </p>
            <Link href="/#calculator" className="cta-button final-btn">
              Get Free Access →
            </Link>
            <p className="final-cta-sub">No credit card required. Upgrade anytime.</p>
          </div>
        </div>
      </section>
    </>
  );
}

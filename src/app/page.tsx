import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Calculator from '@/components/Calculator';
import MatchCard from '@/components/MatchCard';
import OddsTicker from '@/components/OddsTicker';
import PricingTable from '@/components/PricingTable';
import FaqAccordion from '@/components/FaqAccordion';
import TrustBlock from '@/components/TrustBlock';
import matches from '@/data/matches.json';

export const metadata: Metadata = {
  title: 'BetFactor Kenya — Become Every Bookmaker\'s Worst Nightmare',
  description:
    'BetFactor scans odds across SportPesa, Betika, Mozzart, SportyBet, and 1xBet in real time. Calculate exact M-Pesa net payouts after Kenya 5% withholding tax & M-Pesa fees.',
};

export default function HomePage() {
  const featuredMatches = matches.slice(0, 6);

  return (
    <>
      {/* Live Ticker */}
      <OddsTicker />

      {/* Hero Section — BetBurger Inspired */}
      <section className="hero-bb" aria-labelledby="hero-headline">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container">
          <div className="hero-bb-grid">
            {/* Hero Left Content */}
            <div className="hero-bb-content">
              <div className="hero-tag-badge">
                🔥 BECOME EVERY BOOKMAKER'S WORST NIGHTMARE
              </div>
              <h1 id="hero-headline" className="hero-title-bb">
                Beat the Odds.{' '}
                <span className="hero-accent-bb">Walk Away With More Money</span> Every Time.
              </h1>
              <p className="hero-subtitle-bb">
                BetFactor scans odds across <strong>SportPesa, Betika, Mozzart, SportyBet</strong> and <strong>1xBet</strong> in real time — so you always know where the best price is, and exactly what you'll take home after 5% tax and M-Pesa fees.
              </p>

              <div className="hero-actions-bb">
                <Link href="/#calculator" className="hero-btn-primary">
                  Get Free Access →
                </Link>
                <Link href="/sure-bets" className="hero-btn-secondary">
                  ⚡ View Live Sure Bets
                </Link>
              </div>

              {/* Trustpilot-style social proof badge */}
              <div className="hero-trust-rating">
                <div className="stars-row">★★★★★</div>
                <span className="rating-text">
                  <strong>4.9/5 Rating</strong> · Trusted by 500+ Kenyan Bettors
                </span>
              </div>
            </div>

            {/* Hero Right — Cutout Character Image with Floating Cards */}
            <div className="hero-bb-visual">
              <div className="hero-image-wrapper">
                <Image
                  src="/happy_woman_winning.png"
                  alt="Happy Kenyan bettor celebrating a big win on her smartphone"
                  width={520}
                  height={600}
                  priority
                  className="hero-character-img"
                />

                {/* Floating badge 1 */}
                <div className="floating-badge badge-top-right">
                  <span className="badge-icon">💰</span>
                  <div>
                    <span className="badge-title">KES 14,777.50</span>
                    <span className="badge-sub">Net Take-Home (Tax Paid)</span>
                  </div>
                </div>

                {/* Floating badge 2 */}
                <div className="floating-badge badge-bottom-left">
                  <span className="badge-icon">⚡</span>
                  <div>
                    <span className="badge-title">+3.42% Guaranteed</span>
                    <span className="badge-sub">Risk-Free Arbitrage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Banner Section */}
      <section className="quote-section">
        <div className="container">
          <blockquote className="quote-card">
            <p className="quote-text">
              "This arbitrage &amp; payout math tool lets me walk away with more money every time, no matter who wins."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Comparison Section: Without BetFactor vs With BetFactor */}
      <section className="section section-alt" aria-labelledby="comparison-heading">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">WHY BETFACTOR MATTERS</div>
            <h2 id="comparison-heading" className="section-title">
              Stop Guessing Your Real Take-Home
            </h2>
            <p className="section-subtitle">See the difference before placing your next wager</p>
          </div>

          <div className="comparison-grid">
            {/* Without BetFactor */}
            <div className="comp-card bad">
              <div className="comp-badge bad">❌ WITHOUT BETFACTOR</div>
              <ul className="comp-list">
                <li>Pick a single bookmaker and stick with it</li>
                <li>Lose out on 0.15 to 0.45 higher odds on rival platforms</li>
                <li>Surprised by 5% withholding tax deducted at withdrawal</li>
                <li>M-Pesa agent fees eat into your net profit quietly</li>
                <li>No visibility into risk-free arbitrage opportunities</li>
              </ul>
            </div>

            {/* With BetFactor */}
            <div className="comp-card good">
              <div className="comp-badge good">✅ WITH BETFACTOR</div>
              <ul className="comp-list">
                <li>Scan 5 major Kenyan bookmakers side-by-side in real time</li>
                <li>Always place your bet at the absolute highest decimal odds</li>
                <li>Calculate exact M-Pesa net cash out before placing the bet</li>
                <li>Built-in Safaricom Finance Act 2025 tariff tables</li>
                <li>Spot instant risk-free sure bets across bookmakers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tools & Calculator */}
      <section id="calculator" className="section" aria-labelledby="solution-heading">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">TOO QUICK FOR YOUR BOOKIE TO REACT</div>
            <h2 id="solution-heading" className="section-title">
              Calculators &amp; Live Scanners
            </h2>
            <p className="section-subtitle">
              Live tax deductions, Safaricom withdrawal fees, and odds comparison.
            </p>
          </div>

          <div className="tools-grid">
            <div className="tool-card">
              <span className="tool-icon">🔍</span>
              <h3 className="tool-title">Real-Time Odds Scanner</h3>
              <p className="tool-desc">
                Scans SportPesa, Betika, Mozzart, SportyBet, and 1xBet every 60–90 seconds. Always flags the highest return.
              </p>
            </div>
            <div className="tool-card active">
              <span className="tool-icon">🧮</span>
              <h3 className="tool-title">Net Take-Home Calculator</h3>
              <p className="tool-desc">
                Enter your stake and odds. Instantly see your real cash-out after 5% withholding tax and M-Pesa fees.
              </p>
            </div>
            <div className="tool-card">
              <span className="tool-icon">⚡</span>
              <h3 className="tool-title">Sure Bets &amp; Arbitrage Finder</h3>
              <p className="tool-desc">
                Spot cross-bookmaker price gaps where mathematical profit is guaranteed regardless of match result.
              </p>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className="calculator-wrapper-main">
            <Calculator />
          </div>
        </div>
      </section>

      {/* Bookmakers Banner */}
      <section className="bookmakers-section">
        <div className="container">
          <h3 className="bookmakers-title">Works with YOUR Favorite Kenyan Bookmakers</h3>
          <div className="bookmakers-badges">
            <span className="bookie-pill">SportPesa</span>
            <span className="bookie-pill">Betika</span>
            <span className="bookie-pill">Odibets</span>
            <span className="bookie-pill">Mozzart</span>
            <span className="bookie-pill">SportyBet</span>
            <span className="bookie-pill">1xBet</span>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
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
                Open BetFactor and see today's top fixtures with live odds from every major Kenyan bookmaker.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3 className="step-title">Check Your Numbers</h3>
              <p className="step-desc">
                Tap any match to open the calculator. See your projected payout after tax and fees, or check for arbitrage.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3 className="step-title">Bet Smarter, Not Harder</h3>
              <p className="step-desc">
                Place your bet on whichever platform actually has the best price — and know what you walk away with.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Matches */}
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

      {/* Pricing Table */}
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

      {/* Trust & Transparency */}
      <section className="section" aria-labelledby="trust-section-heading">
        <div className="container">
          <TrustBlock />
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="section section-alt" aria-labelledby="faq-heading">
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

      {/* Final CTA Banner */}
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

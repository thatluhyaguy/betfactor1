import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Calculator from '@/components/Calculator';
import MatchCard from '@/components/MatchCard';
import OddsTicker from '@/components/OddsTicker';
import PricingTable from '@/components/PricingTable';
import FaqAccordion from '@/components/FaqAccordion';
import TrustBlock from '@/components/TrustBlock';
import ProfitChart from '@/components/ProfitChart';
import FeatureTabs from '@/components/FeatureTabs';
import matches from '@/data/matches.json';

export const metadata: Metadata = {
  title: 'BetFactor Kenya — Bet Smarter & Find Risk-Free Arbitrage Opportunities',
  description:
    'BetFactor scans odds across SportPesa, Betika, Mozzart, SportyBet, and 1xBet in real time. Calculate exact M-Pesa net payouts after 5% withholding tax & M-Pesa fees.',
};

export default function HomePage() {
  const featuredMatches = matches.slice(0, 6);

  return (
    <>
      {/* Live Odds Ticker */}
      <OddsTicker />

      {/* Breakout Hero Section — Revolut / Stripe / Linear Style */}
      <section className="hero-breakout" aria-labelledby="hero-headline">
        <div className="container full-width-container">
          <div className="hero-breakout-grid">
            {/* Left Content */}
            <div className="hero-text-col">
              <div className="hero-pill-badge">
                🇰🇪 KENYA'S #1 ODDS &amp; PAYOUT COMPARISON PLATFORM
              </div>
              <h1 id="hero-headline" className="hero-breakout-title">
                Bet Smarter.{' '}
                <span className="hero-highlight-text">Find Arbitrage</span> Opportunities.
              </h1>
              <p className="hero-breakout-sub">
                Stop leaving money on the table. BetFactor scans odds across <strong>SportPesa, Betika, Mozzart, SportyBet</strong> and <strong>1xBet</strong> in real time — so you place your wager at the highest price and calculate exact net cash-out after 5% tax and M-Pesa fees.
              </p>

              <div className="hero-ctas-row">
                <Link href="/#calculator" className="btn-primary-large">
                  Get Free Access →
                </Link>
                <Link href="/sure-bets" className="btn-secondary-large">
                  ⚡ View Live Sure Bets
                </Link>
              </div>

              {/* Trustpilot-style rating badge */}
              <div className="hero-trust-bar">
                <div className="stars-gold">★★★★★</div>
                <span className="trust-text-small">
                  <strong>4.9/5 Rating</strong> · Rated by 500+ Kenyan Bettors
                </span>
              </div>
            </div>

            {/* Right Column: Layered Breakout Character Illustration */}
            <div className="hero-illustration-col">
              {/* Ambient Glow */}
              <div className="hero-ambient-glow" aria-hidden="true" />

              {/* Floating UI Element 1: Top Right */}
              <div className="floating-ui-badge ui-top-right">
                <span className="ui-icon-bolt">⚡</span>
                <div>
                  <span className="ui-bold-text text-positive">+12.8% Arbitrage</span>
                  <span className="ui-sub-text">Opportunity Found</span>
                </div>
              </div>

              {/* Floating UI Element 2: Middle Left */}
              <div className="floating-ui-badge ui-middle-left">
                <span className="ui-icon-lock">🔒</span>
                <div>
                  <span className="ui-bold-text">Profit Locked</span>
                  <span className="ui-sub-text text-positive">+ KES 3,240</span>
                </div>
              </div>

              {/* Floating UI Element 3: Bottom Right */}
              <div className="floating-ui-badge ui-bottom-right">
                <span className="ui-icon-bar">📊</span>
                <div>
                  <span className="ui-bold-text">Live Odds Comparison</span>
                  <span className="ui-sub-text">2.35 (SportPesa) vs 1.94</span>
                </div>
              </div>

              {/* Character Image (Extends below hero container for depth) */}
              <div className="character-crop-box">
                <Image
                  src="/hero_woman.png"
                  alt="Confident Kenyan woman looking at her smartphone"
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

      {/* Metric Counters Banner */}
      <section className="stats-banner-section">
        <div className="container full-width-container">
          <div className="stats-banner-grid">
            <div className="stat-box">
              <span className="stat-number text-positive">KES 1.4M+</span>
              <span className="stat-desc">Net Profit Retained by Users</span>
            </div>
            <div className="stat-box">
              <span className="stat-number accent">5</span>
              <span className="stat-desc">Major Scraped Bookmakers</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">60s</span>
              <span className="stat-desc">Real-Time Refresh Frequency</span>
            </div>
            <div className="stat-box">
              <span className="stat-number positive">100%</span>
              <span className="stat-desc">Finance Act 2025 Tax Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Analytics Simulation Chart */}
      <section className="section" aria-labelledby="chart-section-title">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">DATA-DRIVEN BETTING</div>
            <h2 id="chart-section-title" className="section-title">
              Why Odds Optimization Compounds Over Time
            </h2>
            <p className="section-subtitle">
              See how getting a 0.15–0.40 odds difference on every bet adds up to massive profits.
            </p>
          </div>

          <ProfitChart />
        </div>
      </section>

      {/* Feature Showcase Tabs */}
      <section className="section section-alt" aria-labelledby="features-tab-title">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">ENGINEERED FOR VALUE</div>
            <h2 id="features-tab-title" className="section-title">
              Four Core Tools. Zero Guesswork.
            </h2>
          </div>

          <FeatureTabs />
        </div>
      </section>

      {/* Comparison Section: Without vs With BetFactor */}
      <section className="section" aria-labelledby="comparison-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">THE BETFACTOR ADVANTAGE</div>
            <h2 id="comparison-heading" className="section-title">
              Stop Guessing Your Real Cash-Out
            </h2>
          </div>

          <div className="comparison-grid-fw">
            {/* Without BetFactor */}
            <div className="comp-card-fw bad">
              <div className="comp-badge bad">❌ WITHOUT BETFACTOR</div>
              <ul className="comp-list-fw">
                <li>Stick with a single bookmaker and accept lower odds</li>
                <li>Lose KES 150–450 per wager by missing better prices elsewhere</li>
                <li>Surprised by 5% withholding tax deducted automatically</li>
                <li>M-Pesa agent withdrawal fees eat into remaining net profit</li>
                <li>Zero awareness of risk-free cross-bookmaker arbitrage</li>
              </ul>
            </div>

            {/* With BetFactor */}
            <div className="comp-card-fw good">
              <div className="comp-badge good">✅ WITH BETFACTOR</div>
              <ul className="comp-list-fw">
                <li>Scan SportPesa, Betika, Odibets, Mozzart &amp; 1xBet live</li>
                <li>Always place your wager at the highest available decimal odds</li>
                <li>Calculate exact net cash-out after 5% tax and agent fees</li>
                <li>Automated Safaricom Finance Act 2025 tariff schedule</li>
                <li>Instant notification when risk-free sure bets occur</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Live Net Payout Calculator */}
      <section id="calculator" className="section section-alt" aria-labelledby="calc-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">INTERACTIVE CALCULATOR</div>
            <h2 id="calc-heading" className="section-title">
              Net Take-Home Calculator
            </h2>
            <p className="section-subtitle">
              Live updates · Finance Act 2025 rates · M-Pesa agent fees included
            </p>
          </div>

          <Calculator />
        </div>
      </section>

      {/* Supported Bookmakers Banner */}
      <section className="bookmakers-banner-full">
        <div className="container full-width-container">
          <h3 className="bm-heading">Works With Kenya's Top Bookmakers</h3>
          <div className="bm-grid">
            <span className="bm-card">SportPesa</span>
            <span className="bm-card">Betika</span>
            <span className="bm-card">Odibets</span>
            <span className="bm-card">Mozzart</span>
            <span className="bm-card">SportyBet</span>
            <span className="bm-card">1xBet</span>
          </div>
        </div>
      </section>

      {/* Matches Grid */}
      <section id="matches" className="section" aria-labelledby="matches-heading">
        <div className="container full-width-container">
          <div className="section-header">
            <h2 id="matches-heading" className="section-title">
              Today's Scanned Matches
            </h2>
            <p className="section-subtitle">
              Compare live decimal odds side-by-side
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
        <div className="container full-width-container">
          <div className="section-header">
            <div className="section-tag">MEMBERSHIP TIERS</div>
            <h2 id="pricing-heading" className="section-title">
              Free vs. BetFactor Member
            </h2>
            <p className="section-subtitle">
              Upgrade or downgrade anytime via M-Pesa STK Push
            </p>
          </div>

          <PricingTable />
        </div>
      </section>

      {/* Trust & Transparency Block */}
      <section className="section" aria-labelledby="trust-section-heading">
        <div className="container full-width-container">
          <TrustBlock />
        </div>
      </section>

      {/* FAQ Accordion */}
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

      {/* Final Conversion CTA */}
      <section className="section final-cta-section" aria-labelledby="final-cta-heading">
        <div className="container full-width-container">
          <div className="final-cta-card">
            <h2 id="final-cta-heading" className="final-cta-title">
              Know Your Numbers Before You Bet
            </h2>
            <p className="final-cta-desc">
              Join BetFactor free and start comparing odds, calculating real payouts, and spotting arbitrage opportunities today.
            </p>
            <Link href="/#calculator" className="btn-primary-large">
              Get Free Access →
            </Link>
            <p className="final-cta-sub">No credit card required. Instant M-Pesa access.</p>
          </div>
        </div>
      </section>
    </>
  );
}

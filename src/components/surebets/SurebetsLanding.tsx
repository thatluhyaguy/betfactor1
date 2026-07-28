'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SurebetsLanding() {
  // Interactive Calculator State
  const [bankroll, setBankroll] = useState<number>(30000);
  const [strategy, setStrategy] = useState<'simple' | 'standard' | 'aggressive'>('standard');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Profit multipliers based on strategy
  const multipliers = {
    simple: { monthly: 0.15, yearly: 1.8 },      // ~15% / month
    standard: { monthly: 0.30, yearly: 3.6 },    // ~30% / month
    aggressive: { monthly: 0.50, yearly: 6.0 },  // ~50% / month
  };

  const monthlyEarn = Math.round(bankroll * multipliers[strategy].monthly);
  const yearlyEarn = Math.round(bankroll * multipliers[strategy].yearly);

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  return (
    <div className="surebets-landing">
      {/* ── 1. HERO SECTION ── */}
      <section className="sb-hero-section">
        <div className="sb-hero-grid">
          <div className="sb-hero-content">
            <span className="sb-badge">KEY TO SUCCESS IN BETTING</span>
            <h1 className="sb-hero-title">
              Surebets as the key to success in betting
            </h1>
            <p className="sb-hero-lead">
              Arbitrage betting is one of the few sports betting strategies that allows you to make guaranteed profit from every bet you place — split mathematically across SportPesa, Betika, and Odibets regardless of match outcome.
            </p>
            <div className="sb-hero-actions">
              <Link href="/signup" className="sb-btn sb-btn-primary">
                GET SUREBETS NOW
              </Link>
              <a href="#how-it-works" className="sb-btn sb-btn-secondary">
                READ HOW IT WORKS
              </a>
            </div>
          </div>

          <div className="sb-hero-media">
            <div className="sb-media-card">
              <div className="sb-media-badge">WIN EVERY TIME</div>
              <div className="sb-media-screen">
                <div className="sb-play-btn">▶</div>
                <div className="sb-media-stats">
                  <div className="sb-stat-pill">
                    <span className="sb-stat-label">Live Scanned</span>
                    <span className="sb-stat-val text-positive">1,420 odds/min</span>
                  </div>
                  <div className="sb-stat-pill">
                    <span className="sb-stat-label">Avg Margin</span>
                    <span className="sb-stat-val text-positive">+2.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ── */}
      <section id="how-it-works" className="sb-section sb-how-section">
        <div className="sb-section-header">
          <h2>How It Works</h2>
          <p>
            Arbitrage situations (surebets) occur when different bookmakers set different odds for the same sporting event due to varying probability algorithms, market competition, or delayed updates.
          </p>
        </div>

        <div className="sb-how-grid">
          <div className="sb-how-card">
            <div className="sb-how-icon">🔍</div>
            <h3>1. Automated Scanning</h3>
            <p>
              Our scrapers continuously scan odds for thousands of matches across major Kenyan bookmakers including SportPesa, Betika, and Odibets every few seconds.
            </p>
          </div>

          <div className="sb-how-card">
            <div className="sb-how-icon">⚡</div>
            <h3>2. Math Engine</h3>
            <p>
              BetFactor identifies discrepancies where the sum of inverse odds is less than 1.0 (1/Odds1 + 1/OddsX + 1/Odds2 &lt; 1.0).
            </p>
          </div>

          <div className="sb-how-card">
            <div className="sb-how-icon">💰</div>
            <h3>3. Guaranteed Profit</h3>
            <p>
              You place calculated stakes across each outcome on different platforms. No matter which team wins or draws, your total payout exceeds your combined stake.
            </p>
          </div>
        </div>

        {/* Reasons block */}
        <div className="sb-reasons-box">
          <h3>The reasons for arbitrage situation appearance</h3>
          <ul className="sb-reasons-list">
            <li>
              <strong>High competition between bookmakers</strong> — bookmakers aggressively boost odds on specific matches to attract new bettors.
            </li>
            <li>
              <strong>Distinct probability models</strong> — different bookmaker trading desks evaluate team form, injuries, and weather using different statistical models.
            </li>
            <li>
              <strong>Lagged odds adjustments</strong> — when news breaks or a team scores, some bookmakers adjust their odds faster than others.
            </li>
          </ul>
        </div>
      </section>

      {/* ── 3. INTERACTIVE PROFIT CALCULATOR WIDGET ── */}
      <section className="sb-section sb-calc-section">
        <div className="sb-calc-card">
          <div className="sb-calc-header">
            <h2>Earn <span className="text-positive">KES {monthlyEarn.toLocaleString()}</span> and more per month</h2>
            <p>Calculate your expected monthly return based on your starting bankroll and trading strategy.</p>
          </div>

          <div className="sb-calc-body">
            {/* Slider */}
            <div className="sb-slider-group">
              <div className="sb-slider-labels">
                <span>Starting Bankroll:</span>
                <span className="sb-slider-val">KES {bankroll.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={bankroll}
                onChange={(e) => setBankroll(Number(e.target.value))}
                className="sb-range-slider"
              />
              <div className="sb-slider-minmax">
                <span>KES 5,000</span>
                <span>KES 200,000</span>
              </div>
            </div>

            {/* Strategy Toggles */}
            <div className="sb-strategy-group">
              <span className="sb-strategy-label">Choosing strategy:</span>
              <div className="sb-strategy-buttons">
                <button
                  className={`sb-strat-btn ${strategy === 'simple' ? 'active' : ''}`}
                  onClick={() => setStrategy('simple')}
                >
                  Simple (Low)
                </button>
                <button
                  className={`sb-strat-btn ${strategy === 'standard' ? 'active' : ''}`}
                  onClick={() => setStrategy('standard')}
                >
                  Standard (Med)
                </button>
                <button
                  className={`sb-strat-btn ${strategy === 'aggressive' ? 'active' : ''}`}
                  onClick={() => setStrategy('aggressive')}
                >
                  Aggressive (High)
                </button>
              </div>
            </div>

            {/* Output Cards */}
            <div className="sb-results-grid">
              <div className="sb-result-box">
                <span className="sb-res-label">Monthly Expected Profit</span>
                <span className="sb-res-val text-positive">+KES {monthlyEarn.toLocaleString()} / mo</span>
              </div>
              <div className="sb-result-box">
                <span className="sb-res-label">Annual Cumulative Return</span>
                <span className="sb-res-val text-positive">+KES {yearlyEarn.toLocaleString()} / yr</span>
              </div>
            </div>

            <div className="sb-calc-cta">
              <Link href="/signup" className="sb-btn sb-btn-primary sb-btn-lg">
                GET STARTED NOW
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SUREBET TYPES SECTION ── */}
      <section className="sb-section sb-types-section">
        <div className="sb-section-header">
          <h2>Surebet Types</h2>
          <p>Mastering prematch vs live arbitrage strategies</p>
        </div>

        <div className="sb-types-grid">
          <div className="sb-type-card">
            <h3>Prematch Surebets</h3>
            <p>
              Prematch surebets appear hours or days before kickoff. Odds move slowly, giving you ample time to check your bankroll, log in to SportPesa or Betika, and place your stakes comfortably without rushing.
            </p>
          </div>
          <div className="sb-type-card">
            <h3>Live In-Play Surebets</h3>
            <p>
              Live surebets occur during an ongoing match. As game events unfold (goals, red cards, momentum shifts), odds fluctuate rapidly, creating massive profit margins (often 4%–12%) that last for 30–90 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. SUREBET EXAMPLE (STEP-BY-STEP MATH PROOF) ── */}
      <section className="sb-section sb-example-section">
        <div className="sb-section-header">
          <h2>Surebet Example &amp; Math Proof</h2>
          <p>See exactly how KES 10,000 turns into guaranteed KES 10,449.32 regardless of match result.</p>
        </div>

        <div className="sb-example-card">
          <div className="sb-table-wrapper">
            <table className="sb-example-table">
              <thead>
                <tr>
                  <th>Outcome</th>
                  <th>Bookmaker</th>
                  <th>Best Odds</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 (Home Win - Arsenal)</td>
                  <td><strong>SportPesa</strong></td>
                  <td className="text-positive font-mono">2.35</td>
                </tr>
                <tr>
                  <td>X (Draw)</td>
                  <td><strong>Betika</strong></td>
                  <td className="text-positive font-mono">3.50</td>
                </tr>
                <tr>
                  <td>2 (Away Win - Chelsea)</td>
                  <td><strong>Odibets</strong></td>
                  <td className="text-positive font-mono">3.40</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="sb-math-steps">
            <div className="sb-math-box">
              <h4>Step 1: Check Implied Probability Sum ($L$)</h4>
              <p className="font-mono sb-equation">
                L = (1 / 2.35) + (1 / 3.50) + (1 / 3.40) = 0.4255 + 0.2857 + 0.2941 = <strong>0.957</strong>
              </p>
              <p className="sb-math-note">
                Since $L = 0.957 &lt; 1.0$, a <strong>+4.49% surebet opportunity exists</strong>!
              </p>
            </div>

            <div className="sb-math-box">
              <h4>Step 2: Optimal Stake Distribution (Total Stake: KES 10,000)</h4>
              <ul className="sb-stake-list font-mono">
                <li>V1 (SportPesa Home) = 10,000 / (2.35 &times; 0.957) = <strong>KES 4,446.50</strong></li>
                <li>VX (Betika Draw) = 10,000 / (3.50 &times; 0.957) = <strong>KES 2,985.50</strong></li>
                <li>V2 (Odibets Away) = 10,000 / (3.40 &times; 0.957) = <strong>KES 2,568.00</strong></li>
              </ul>
            </div>

            <div className="sb-math-box sb-math-highlight">
              <h4>Step 3: Payout Evaluation Across All Outcomes</h4>
              <div className="sb-payout-grid">
                <div className="sb-payout-item">
                  <span>If Home Wins:</span>
                  <strong>4,446.50 &times; 2.35 = KES 10,449.28</strong>
                </div>
                <div className="sb-payout-item">
                  <span>If Draw Happens:</span>
                  <strong>2,985.50 &times; 3.50 = KES 10,449.25</strong>
                </div>
                <div className="sb-payout-item">
                  <span>If Away Wins:</span>
                  <strong>2,568.00 &times; 3.40 = KES 10,431.20</strong>
                </div>
              </div>
              <p className="sb-guaranteed-badge">
                🎉 Net Guaranteed Profit: <strong>+KES 449.30 (4.49%)</strong> regardless of who wins!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. VALUE GATE / LOCKED LIVE SCANNER PREVIEW ── */}
      <section className="sb-section sb-preview-section">
        <div className="sb-preview-header">
          <h2>Live Arbitrage Scanner Preview</h2>
          <p>Sign up or subscribe to unlock instant real-time bookmaker links &amp; calculator</p>
        </div>

        <div className="sb-locked-container">
          {/* Blurred/Teaser cards */}
          <div className="sb-blurred-feed">
            <div className="sb-blur-card">
              <div className="sb-card-top">
                <span className="sb-badge-green">+3.42%</span>
                <span>Kenyan Premier League</span>
              </div>
              <h4>Gor Mahia vs AFC Leopards</h4>
              <div className="sb-odds-row">
                <span>Home 1.95 (SportPesa)</span>
                <span>Draw 3.60 (Betika)</span>
                <span>Away 4.20 (Odibets)</span>
              </div>
            </div>

            <div className="sb-blur-card">
              <div className="sb-card-top">
                <span className="sb-badge-green">+2.18%</span>
                <span>UEFA Champions League</span>
              </div>
              <h4>Real Madrid vs Barcelona</h4>
              <div className="sb-odds-row">
                <span>Home 2.20 (Betika)</span>
                <span>Draw 3.50 (Odibets)</span>
                <span>Away 3.40 (SportPesa)</span>
              </div>
            </div>
          </div>

          {/* Glassmorphism Lock Overlay */}
          <div className="sb-lock-overlay">
            <div className="sb-lock-box">
              <div className="sb-lock-icon">🔒</div>
              <h3>Unlock Full Live Scanner Feed</h3>
              <p>
                Get real-time updates every 25s, instant direct links to bookmaker betslips, automated KES tax/fee calculator, and SMS alerts.
              </p>
              <div className="sb-lock-actions">
                <Link href="/signup" className="sb-btn sb-btn-primary">
                  CREATE FREE ACCOUNT
                </Link>
                <Link href="/pricing" className="sb-btn sb-btn-outline">
                  VIEW MEMBER PLANS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. 30 DAYS ACCESS BANNER ── */}
      <section className="sb-section sb-banner-section">
        <div className="sb-cta-banner">
          <h2>30 days of unlimited surebets</h2>
          <p className="sb-banner-price">for only <strong>KES 2,500 / month</strong> (less than KES 85/day)</p>
          <Link href="/signup" className="sb-btn sb-btn-primary sb-btn-lg">
            GET UNLIMITED ACCESS NOW
          </Link>
        </div>
      </section>

      {/* ── 8. FREQUENTLY ASKED QUESTIONS ── */}
      <section className="sb-section sb-faq-section">
        <div className="sb-section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about surebets in Kenya</p>
        </div>

        <div className="sb-faq-container">
          {[
            {
              q: 'What is a surebet and how does it guarantee profit?',
              a: 'A surebet (arbitrage opportunity) occurs when bookmakers set different odds for the same match. By placing proportional bets on all possible outcomes across different platforms, your total payout exceeds your total investment no matter the result.',
            },
            {
              q: 'How do I place bets across different Kenyan bookmakers?',
              a: 'You open accounts with SportPesa, Betika, and Odibets. When BetFactor alerts you of a surebet, our calculator gives you the exact amount to stake on each bookmaker. You simply open each bookmaker app and place the corresponding bet.',
            },
            {
              q: 'Are sports betting odds updated in real-time?',
              a: 'Yes. Our scrapers continuously monitor odds across bookmakers. The feed updates every 25 seconds to deliver fresh opportunities.',
            },
            {
              q: 'How does Kenya\'s 5% withholding tax affect my payout?',
              a: 'BetFactor automatically calculates net returns factoring in Kenya\'s 5% withholding tax under the Finance Act and Safaricom M-Pesa withdrawal fees, so the profit figure shown is the net amount hitting your phone.',
            },
            {
              q: 'Can my bookmaker account get limited?',
              a: 'While surebets are 100% legal, bookmakers track betting patterns. To protect your accounts, we recommend rounding your stake amounts to whole numbers (e.g., KES 2,500 instead of KES 2,568.42).',
            },
          ].map((item, idx) => (
            <div key={idx} className={`sb-faq-item ${faqOpen === idx ? 'open' : ''}`}>
              <button className="sb-faq-q" onClick={() => toggleFaq(idx)}>
                <span>{item.q}</span>
                <span className="sb-faq-icon">{faqOpen === idx ? '−' : '+'}</span>
              </button>
              {faqOpen === idx && (
                <div className="sb-faq-a">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

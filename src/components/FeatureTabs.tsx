'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FeatureTabs() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    {
      id: 0,
      title: '🔍 Odds Scanner',
      headline: 'Scan 5 Kenyan Bookmakers Live',
      desc: 'Our scraper continuously monitors SportPesa, Betika, Odibets, Mozzart, and 1xBet. The best available odds for Home, Draw, and Away are highlighted instantly so you never leave money on the table.',
      badge: '60s Refresh Rate',
      cta: 'View Live Odds →',
      ctaLink: '/#matches',
    },
    {
      id: 1,
      title: '🧮 Net Payout Math',
      headline: 'Finance Act 2025 Tax & Fee Logic',
      desc: 'Enter any stake or odds. BetFactor automatically calculates the exact 5% withholding tax on your gross payout plus the exact Safaricom M-Pesa agent withdrawal fee bracket.',
      badge: '100% Tax Accuracy',
      cta: 'Open Calculator →',
      ctaLink: '/#calculator',
    },
    {
      id: 2,
      title: '⚡ Risk-Free Sure Bets',
      headline: 'Guaranteed Arbitrage Returns',
      desc: 'When odd variations across bookmakers create an implied probability sum under 100%, BetFactor flags the exact stake split needed to lock in profit regardless of match outcome.',
      badge: 'Member Feature',
      cta: 'Explore Sure Bets →',
      ctaLink: '/sure-bets',
    },
    {
      id: 3,
      title: '📱 M-Pesa Native',
      headline: 'Agent Tariff Tables Built-In',
      desc: 'No more guessing agent withdrawal fees. Our logic uses Safaricom’s updated 2025/2026 tariff schedule from KES 11 up to KES 309 per cashout.',
      badge: 'Safaricom Integrated',
      cta: 'How It Works →',
      ctaLink: '/how-it-works',
    },
  ];

  return (
    <div className="feature-tabs-container">
      <div className="tabs-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`tab-nav-btn ${activeTab === t.id ? 'active' : ''}`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="tab-content-card">
        <div className="tab-text-side">
          <span className="tab-badge">{tabs[activeTab].badge}</span>
          <h3 className="tab-headline">{tabs[activeTab].headline}</h3>
          <p className="tab-desc">{tabs[activeTab].desc}</p>
          <Link href={tabs[activeTab].ctaLink} className="cta-button">
            {tabs[activeTab].cta}
          </Link>
        </div>

        <div className="tab-preview-side">
          <div className="mockup-window">
            <div className="mockup-dots">
              <span></span><span></span><span></span>
            </div>
            <div className="mockup-body">
              <div className="mockup-stat-big">{tabs[activeTab].badge}</div>
              <div className="mockup-line"></div>
              <div className="mockup-line short"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

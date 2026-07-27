'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Is BetFactor free to use?',
    a: 'Yes — live odds comparison and the net payout calculator are 100% free. Full sure bets access and the per-match arbitrage calculator are part of BetFactor Member.',
  },
  {
    q: 'Does BetFactor place bets for me?',
    a: 'No. BetFactor only compares public odds and runs the tax & M-Pesa fee numbers for you. You place every bet directly on the bookmaker’s official platform.',
  },
  {
    q: 'How often are odds updated?',
    a: 'Odds are updated every 60 to 120 seconds during live match cycles across SportPesa, Betika, Mozzart, SportyBet, and 1xBet.',
  },
  {
    q: 'Is arbitrage betting risky?',
    a: 'Arbitrage betting is mathematically risk-free in terms of outcome profit, but bookmakers can and do limit or close accounts that consistently show arbitrage patterns. Use it knowingly.',
  },
  {
    q: 'What happens with M-Pesa withdrawal fees in the calculator?',
    a: 'We integrate Safaricom’s exact 2025/2026 published agent tariff table, so the figure you see reflects what you actually cash out at an M-Pesa agent.',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="faq-container">
      {FAQS.map((faq, idx) => (
        <div key={idx} className={`faq-item ${openIndex === idx ? 'open' : ''}`}>
          <button className="faq-question" onClick={() => toggle(idx)} aria-expanded={openIndex === idx}>
            <span>{faq.q}</span>
            <span className="faq-icon">{openIndex === idx ? '−' : '+'}</span>
          </button>
          {openIndex === idx && (
            <div className="faq-answer">
              <p>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

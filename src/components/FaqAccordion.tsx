'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Is BetFactor free to use?',
    a: 'Yes. The net payout calculator and this week\'s odds comparison are free, with no signup required.',
  },
  {
    q: 'Does BetFactor place bets for me?',
    a: 'No. BetFactor is a calculator and comparison tool only. You place every bet directly on the bookmaker\'s own platform — we never hold your money or your stake.',
  },
  {
    q: 'How often are the odds updated right now?',
    a: 'Odds shown today are checked and updated by hand, not automatically. Each match card shows exactly when it was last checked, so you always know how current the numbers are. Automated live scanning is in development — see the "Built in the Open" section.',
  },
  {
    q: 'Is arbitrage betting risky?',
    a: 'Arbitrage betting is low-risk to your stake by design — the math is structured so you profit regardless of the match outcome. The real risk is to your bookmaker accounts: platforms actively detect arbitrage patterns and can limit or close accounts that use them consistently. Worth knowing going in.',
  },
  {
    q: 'How accurate is the tax and fee calculation?',
    a: 'We apply the current 5% withholding tax under the Finance Act 2025 and Safaricom\'s published M-Pesa agent withdrawal tariff. Both are verified periodically — check the "last verified" date shown next to the calculator. Rates can change; always confirm with KRA (kra.go.ke) or Safaricom directly before relying on the exact figure for a large payout.',
  },
  {
    q: 'When will live odds scanning launch?',
    a: 'It\'s in active development. Sign up on our waitlist to be notified the moment it\'s live — you won\'t get spammed, just one email when it ships.',
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

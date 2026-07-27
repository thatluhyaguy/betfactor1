'use client';

import React from 'react';

const TICKER_ITEMS = [
  { match: 'Arsenal vs Chelsea', market: '1X2', bestBookmaker: 'SportPesa', bestOdds: '2.15', outcome: 'Arsenal Win' },
  { match: 'Man City vs Liverpool', market: '1X2', bestBookmaker: 'Odibets', bestOdds: '2.00', outcome: 'Man City Win' },
  { match: 'Real Madrid vs Barcelona', market: '1X2', bestBookmaker: 'Betika', bestOdds: '3.40', outcome: 'Draw' },
  { match: 'Man United vs Tottenham', market: '1X2', bestBookmaker: 'Odibets', bestOdds: '2.45', outcome: 'Man Utd Win' },
  { match: 'PSG vs Bayern Munich', market: '1X2', bestBookmaker: 'SportyBet', bestOdds: '2.65', outcome: 'Bayern Win' },
];

export default function OddsTicker() {
  return (
    <div className="ticker-wrap" aria-label="Live odds ticker">
      <div className="ticker-badge">⚡ LIVE ODDS SCANNER</div>
      <div className="ticker-move">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <div key={idx} className="ticker-item">
            <span className="ticker-match">{item.match}:</span>
            <span className="ticker-outcome">{item.outcome}</span>
            <span className="ticker-odds">{item.bestOdds}</span>
            <span className="ticker-bookie">via {item.bestBookmaker}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

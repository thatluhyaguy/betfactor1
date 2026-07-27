'use client';

import { useState } from 'react';

export default function ProfitChart() {
  const [stake, setStake] = useState<number>(5000);

  // Simulation points over 10 wagers
  const singleBookieData = [stake, stake * 1.05, stake * 0.98, stake * 1.08, stake * 1.02, stake * 1.12, stake * 1.05, stake * 1.15, stake * 1.10, stake * 1.18];
  const betFactorData = [stake, stake * 1.14, stake * 1.28, stake * 1.45, stake * 1.62, stake * 1.82, stake * 2.05, stake * 2.30, stake * 2.58, stake * 2.88];

  const maxVal = Math.max(...betFactorData);

  return (
    <div className="profit-chart-card">
      <div className="chart-header">
        <div>
          <span className="chart-tag">📈 10-WAGER PROFIT SIMULATION</span>
          <h3 className="chart-title">Single Bookmaker vs. BetFactor Edge</h3>
        </div>
        <div className="chart-stake-selector">
          <label htmlFor="chart-stake">Initial Bankroll: </label>
          <select
            id="chart-stake"
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            className="chart-select"
          >
            <option value={1000}>KES 1,000</option>
            <option value={5000}>KES 5,000</option>
            <option value={10000}>KES 10,000</option>
            <option value={50000}>KES 50,000</option>
          </select>
        </div>
      </div>

      <div className="chart-visual-container">
        {/* SVG Line Chart */}
        <svg className="chart-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border)" strokeDasharray="4" />
          <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border)" strokeDasharray="4" />
          <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border)" strokeDasharray="4" />

          {/* Single Bookie Line (Red/Grey) */}
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeDasharray="6"
            points={singleBookieData
              .map((val, i) => `${(i / (singleBookieData.length - 1)) * 500},${200 - (val / maxVal) * 170}`)
              .join(' ')}
          />

          {/* BetFactor Optimized Line (Positive Green) */}
          <polyline
            fill="none"
            stroke="var(--positive)"
            strokeWidth="4"
            points={betFactorData
              .map((val, i) => `${(i / (betFactorData.length - 1)) * 500},${200 - (val / maxVal) * 170}`)
              .join(' ')}
          />
        </svg>

        {/* Legend */}
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot positive"></span>
            <span><strong>With BetFactor:</strong> KES {Math.round(betFactorData[9]).toLocaleString()} (+188%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot accent"></span>
            <span><strong>Single Bookie (Without BetFactor):</strong> KES {Math.round(singleBookieData[9]).toLocaleString()} (+18%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

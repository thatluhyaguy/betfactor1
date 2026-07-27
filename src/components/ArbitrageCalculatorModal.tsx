'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ArbitrageModalProps {
  match: {
    homeTeam: string;
    awayTeam: string;
    homeOdds: number;
    drawOdds: number;
    awayOdds: number;
    homeBookie: string;
    drawBookie: string;
    awayBookie: string;
    margin: number;
  };
  isMember: boolean;
  onClose: () => void;
}

export default function ArbitrageCalculatorModal({ match, isMember, onClose }: ArbitrageModalProps) {
  const [totalStake, setTotalStake] = useState<string>('5000');

  const stakeNum = parseFloat(totalStake) || 0;

  // Implied probabilities
  const pH = 1 / match.homeOdds;
  const pD = 1 / match.drawOdds;
  const pA = 1 / match.awayOdds;
  const sumP = pH + pD + pA;

  // Stakes allocation
  const stakeHome = (stakeNum * pH) / sumP;
  const stakeDraw = (stakeNum * pD) / sumP;
  const stakeAway = (stakeNum * pA) / sumP;

  // Gross payout
  const grossReturn = stakeHome * match.homeOdds;
  // Tax 5% Finance Act 2025
  const tax = grossReturn * 0.05;
  const postTax = grossReturn - tax;
  const netProfit = postTax - stakeNum;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-tag">⚡ ARBITRAGE CALCULATOR</span>
            <h2 className="modal-title">{match.homeTeam} vs {match.awayTeam}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!isMember ? (
          <div className="modal-locked-body">
            <div className="locked-blur-preview">
              <div className="locked-stat-row">
                <span>Guaranteed Margin</span>
                <span className="locked-value">+{match.margin.toFixed(2)}%</span>
              </div>
              <div className="locked-stat-row">
                <span>Best Stake Split</span>
                <span className="locked-value">██████ KES</span>
              </div>
            </div>
            <div className="locked-overlay">
              <span className="locked-icon">🔒</span>
              <h3>Unlock Full Arbitrage Calculator</h3>
              <p>See exact stake distribution per bookmaker and guaranteed profit breakdown.</p>
              <Link href="/pricing" className="cta-button">
                Upgrade to Member Access →
              </Link>
            </div>
          </div>
        ) : (
          <div className="modal-member-body">
            <div className="input-group">
              <label htmlFor="arb-stake" className="input-label">Total Investment Budget (KES)</label>
              <input
                id="arb-stake"
                type="number"
                value={totalStake}
                onChange={(e) => setTotalStake(e.target.value)}
                className="calc-input"
              />
            </div>

            <div className="arb-breakdown-grid">
              <div className="arb-col">
                <span className="arb-label">{match.homeTeam} Win</span>
                <span className="arb-bookie">via {match.homeBookie} ({match.homeOdds.toFixed(2)})</span>
                <span className="arb-stake-val">KES {Math.round(stakeHome).toLocaleString()}</span>
              </div>
              <div className="arb-col">
                <span className="arb-label">Draw</span>
                <span className="arb-bookie">via {match.drawBookie} ({match.drawOdds.toFixed(2)})</span>
                <span className="arb-stake-val">KES {Math.round(stakeDraw).toLocaleString()}</span>
              </div>
              <div className="arb-col">
                <span className="arb-label">{match.awayTeam} Win</span>
                <span className="arb-bookie">via {match.awayBookie} ({match.awayOdds.toFixed(2)})</span>
                <span className="arb-stake-val">KES {Math.round(stakeAway).toLocaleString()}</span>
              </div>
            </div>

            <div className="arb-result-summary">
              <div className="res-row">
                <span>Gross Return:</span>
                <span>KES {Math.round(grossReturn).toLocaleString()}</span>
              </div>
              <div className="res-row deduct">
                <span>5% Withholding Tax (Finance Act 2025):</span>
                <span>− KES {Math.round(tax).toLocaleString()}</span>
              </div>
              <div className="res-row final text-positive">
                <span>Guaranteed Net Profit:</span>
                <span>KES {Math.round(netProfit).toLocaleString()}</span>
              </div>
            </div>

            <div className="modal-disclaimer">
              ⚠️ <strong>Arbitrage Warning:</strong> Arbitrage betting can trigger account limits or closures from individual bookmakers. Use responsibly and be aware this may affect your standing with bookmakers.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

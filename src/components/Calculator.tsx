'use client';

import { useState, useCallback } from 'react';
import { calculatePayout, MAX_WITHDRAWAL, TAX_LAST_VERIFIED, MPESA_LAST_VERIFIED } from '@/data/tax-config';

function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function Calculator() {
  const [stake, setStake] = useState<string>('1000');
  const [odds, setOdds] = useState<string>('2.40');

  const stakeNum = parseFloat(stake) || 0;
  const oddsNum = parseFloat(odds) || 0;
  const isValid = stakeNum >= 50 && stakeNum <= MAX_WITHDRAWAL && oddsNum >= 1.01;

  const result = isValid ? calculatePayout(stakeNum, oddsNum) : null;

  const handleStakeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStake(e.target.value);
  }, []);

  const handleOddsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOdds(e.target.value);
  }, []);

  const netPercent = result ? Math.round((result.netTakeHome / result.grossPayout) * 100) : 0;

  return (
    <div className="calculator-card">
      {/* Inputs */}
      <div className="calc-inputs">
        <div className="input-group">
          <label htmlFor="stake-input" className="input-label">
            Stake Amount
            <span className="input-currency">KES</span>
          </label>
          <input
            id="stake-input"
            type="number"
            min="50"
            max="250000"
            step="50"
            value={stake}
            onChange={handleStakeChange}
            className="calc-input"
            placeholder="e.g. 1000"
            aria-label="Bet stake in Kenyan Shillings"
          />
          <span className="input-hint">Min KES 50 · Max KES 250,000</span>
        </div>

        <div className="input-group">
          <label htmlFor="odds-input" className="input-label">
            Decimal Odds
          </label>
          <input
            id="odds-input"
            type="number"
            min="1.01"
            max="1000"
            step="0.01"
            value={odds}
            onChange={handleOddsChange}
            className="calc-input"
            placeholder="e.g. 2.40"
            aria-label="Decimal odds"
          />
          <span className="input-hint">Decimal format (e.g. 2.40 = 2/1 fractional)</span>
        </div>
      </div>

      {/* Validation error */}
      {!isValid && (stakeNum > 0 || oddsNum > 0) && (
        <div className="calc-error" role="alert">
          {stakeNum < 50 && stakeNum > 0 && 'Minimum stake is KES 50. '}
          {stakeNum > MAX_WITHDRAWAL && 'Maximum single M-Pesa withdrawal is KES 250,000. '}
          {oddsNum < 1.01 && oddsNum > 0 && 'Odds must be at least 1.01. '}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="calc-result">
          {/* Net take-home hero */}
          <div className="net-hero">
            <span className="net-label">Net Take-Home</span>
            <span className="net-amount">{formatKES(result.netTakeHome)}</span>
            <span className="net-sub">
              {netPercent}% of gross payout · Effective deductions: {formatKES(result.withholdingTax + result.mpesaFee)}
            </span>
          </div>

          {/* Deduction breakdown */}
          <div className="breakdown">
            <div className="breakdown-row highlight">
              <span className="breakdown-label">Gross Payout</span>
              <span className="breakdown-hint">KES {stakeNum.toLocaleString()} × {oddsNum}</span>
              <span className="breakdown-value gross">{formatKES(result.grossPayout)}</span>
            </div>

            <div className="breakdown-row deduction">
              <span className="breakdown-label">
                Withholding Tax
                <span className="breakdown-badge">5% · Finance Act 2025</span>
              </span>
              <span className="breakdown-hint">Applied to full gross payout</span>
              <span className="breakdown-value deduct">− {formatKES(result.withholdingTax)}</span>
            </div>

            <div className="breakdown-row subtotal">
              <span className="breakdown-label">After-Tax Amount</span>
              <span className="breakdown-hint">Transferred to M-Pesa</span>
              <span className="breakdown-value">{formatKES(result.postTaxAmount)}</span>
            </div>

            <div className="breakdown-row deduction">
              <span className="breakdown-label">
                M-Pesa Withdrawal Fee
                <span className="breakdown-badge">Agent tariff</span>
              </span>
              <span className="breakdown-hint">Based on amount bracket</span>
              <span className="breakdown-value deduct">− {formatKES(result.mpesaFee)}</span>
            </div>

            <div className="breakdown-divider" />

            <div className="breakdown-row final">
              <span className="breakdown-label">Net Take-Home</span>
              <span className="breakdown-hint">What you actually receive</span>
              <span className="breakdown-value net-final">{formatKES(result.netTakeHome)}</span>
            </div>
          </div>

          {/* Legal caveats */}
          <div className="calc-caveats">
            <p>
              ⚠️ <strong>Estimate only.</strong> Withholding tax rate: 5% (Finance Act 2025, verified {TAX_LAST_VERIFIED}).
              M-Pesa agent tariff verified {MPESA_LAST_VERIFIED}. Rates are subject to change — verify at{' '}
              <a href="https://kra.go.ke" target="_blank" rel="noopener noreferrer">kra.go.ke</a> and{' '}
              <a href="https://safaricom.co.ke" target="_blank" rel="noopener noreferrer">safaricom.co.ke</a> before betting.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && stakeNum === 0 && oddsNum === 0 && (
        <div className="calc-empty">
          Enter your stake and odds to see your net take-home instantly.
        </div>
      )}
    </div>
  );
}

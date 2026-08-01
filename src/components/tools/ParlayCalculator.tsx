'use client';

import { useState, useCallback, useMemo } from 'react';
import { calculatePayout, MAX_WITHDRAWAL, TAX_LAST_VERIFIED, MPESA_LAST_VERIFIED } from '@/data/tax-config';
import { formatKES } from '@/lib/format';

interface Leg {
  id: string;
  odds: string;
}

function makeLeg(): Leg {
  return { id: crypto.randomUUID(), odds: '' };
}

export default function ParlayCalculator() {
  const [stake, setStake] = useState<string>('500');
  const [legs, setLegs] = useState<Leg[]>([makeLeg(), makeLeg()]); // start with 2 legs, min for a parlay

  const stakeNum = parseFloat(stake) || 0;

  const legOddsNums = legs.map((l) => parseFloat(l.odds) || 0);
  const allLegsValid = legOddsNums.length >= 2 && legOddsNums.every((o) => o >= 1.01);
  const stakeValid = stakeNum >= 50 && stakeNum <= MAX_WITHDRAWAL;
  const isValid = allLegsValid && stakeValid;

  const combinedOdds = useMemo(() => {
    if (!allLegsValid) return 0;
    return legOddsNums.reduce((acc, o) => acc * o, 1);
  }, [legOddsNums, allLegsValid]);

  const result = isValid ? calculatePayout(stakeNum, combinedOdds) : null;
  const netPercent = result ? Math.round((result.netTakeHome / result.grossPayout) * 100) : 0;

  const handleStakeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStake(e.target.value);
  }, []);

  const handleLegOddsChange = useCallback((id: string, value: string) => {
    setLegs((prev) => prev.map((l) => (l.id === id ? { ...l, odds: value } : l)));
  }, []);

  const addLeg = useCallback(() => {
    setLegs((prev) => (prev.length >= 15 ? prev : [...prev, makeLeg()])); // 15 legs is a generous practical ceiling
  }, []);

  const removeLeg = useCallback((id: string) => {
    setLegs((prev) => (prev.length <= 2 ? prev : prev.filter((l) => l.id !== id))); // never go below 2 — that's not a parlay
  }, []);

  return (
    <div className="calculator-card">
      {/* Stake input */}
      <div className="calc-inputs">
        <div className="input-group">
          <label htmlFor="parlay-stake-input" className="input-label">
            Total Stake
            <span className="input-currency">KES</span>
          </label>
          <input
            id="parlay-stake-input"
            type="number"
            min="50"
            max="250000"
            step="50"
            value={stake}
            onChange={handleStakeChange}
            className="calc-input"
            placeholder="e.g. 500"
            aria-label="Total accumulator stake in Kenyan Shillings"
          />
          <span className="input-hint">Min KES 50 · Max KES 250,000</span>
        </div>
      </div>

      {/* Legs */}
      <div className="parlay-legs">
        <div className="parlay-legs-header">
          <span>Accumulator Legs</span>
          <span className="input-hint">Add each selection&apos;s decimal odds</span>
        </div>

        {legs.map((leg, index) => (
          <div className="parlay-leg-row" key={leg.id}>
            <span className="parlay-leg-number">{index + 1}</span>
            <input
              type="number"
              min="1.01"
              max="1000"
              step="0.01"
              value={leg.odds}
              onChange={(e) => handleLegOddsChange(leg.id, e.target.value)}
              className="calc-input"
              placeholder="e.g. 1.80"
              aria-label={`Decimal odds for leg ${index + 1}`}
            />
            {legs.length > 2 && (
              <button
                type="button"
                className="parlay-leg-remove"
                onClick={() => removeLeg(leg.id)}
                aria-label={`Remove leg ${index + 1}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {legs.length < 15 && (
          <button type="button" className="parlay-leg-add" onClick={addLeg}>
            + Add another leg
          </button>
        )}
      </div>

      {/* Validation error */}
      {!isValid && (stakeNum > 0 || legOddsNums.some((o) => o > 0)) && (
        <div className="calc-error" role="alert">
          {stakeNum > 0 && stakeNum < 50 && 'Minimum stake is KES 50. '}
          {stakeNum > MAX_WITHDRAWAL && 'Maximum single M-Pesa withdrawal is KES 250,000. '}
          {!allLegsValid && 'Every leg needs valid odds of at least 1.01. '}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="calc-result">
          <div className="combined-odds-hero">
            <span className="net-label">Combined Odds</span>
            <span className="combined-odds-value">{combinedOdds.toFixed(2)}</span>
            <span className="net-sub">{legs.length} legs multiplied together</span>
          </div>

          <div className="net-hero">
            <span className="net-label">Net Take-Home</span>
            <span className="net-amount">{formatKES(result.netTakeHome)}</span>
            <span className="net-sub">
              {netPercent}% of gross payout · Effective deductions: {formatKES(result.withholdingTax + result.mpesaFee)}
            </span>
          </div>

          <div className="breakdown">
            <div className="breakdown-row highlight">
              <span className="breakdown-label">Gross Payout</span>
              <span className="breakdown-hint">KES {stakeNum.toLocaleString()} × {combinedOdds.toFixed(2)}</span>
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
              <span className="breakdown-hint">What you actually receive if every leg wins</span>
              <span className="breakdown-value net-final">{formatKES(result.netTakeHome)}</span>
            </div>
          </div>

          <div className="calc-caveats">
            <p>
              ⚠️ <strong>All legs must win for any payout.</strong> If even one selection loses, the entire
              accumulator loses — this calculator shows the payout only for the case where every leg wins.
              Withholding tax rate: 5% (Finance Act 2025, verified {TAX_LAST_VERIFIED}). M-Pesa agent tariff
              verified {MPESA_LAST_VERIFIED}. Verify current rates at{' '}
              <a href="https://kra.go.ke" target="_blank" rel="noopener noreferrer">kra.go.ke</a> and{' '}
              <a href="https://safaricom.co.ke" target="_blank" rel="noopener noreferrer">safaricom.co.ke</a>{' '}
              before betting.
            </p>
          </div>
        </div>
      )}

      {!result && stakeNum === 0 && legOddsNums.every((o) => o === 0) && (
        <div className="calc-empty">
          Enter your stake and each leg&apos;s odds to see your combined odds and net payout instantly.
        </div>
      )}
    </div>
  );
}

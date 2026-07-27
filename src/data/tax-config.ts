// BetFactor Tax & Fee Configuration
// Finance Act 2025 — effective July 2025
// Last verified: July 2026

export const WITHHOLDING_TAX_RATE = 0.05; // 5% on every withdrawal (Finance Act 2025)
export const TAX_LAST_VERIFIED = "July 2026";
export const MPESA_LAST_VERIFIED = "July 2026";

export interface MpesaBracket {
  min: number;
  max: number;
  fee: number;
}

// Safaricom M-Pesa Agent Withdrawal Tariff (2025)
// Source: safaricom.co.ke
export const MPESA_TARIFF: MpesaBracket[] = [
  { min: 50, max: 100, fee: 11 },
  { min: 101, max: 2500, fee: 29 },
  { min: 2501, max: 3500, fee: 52 },
  { min: 3501, max: 5000, fee: 69 },
  { min: 5001, max: 7500, fee: 87 },
  { min: 7501, max: 10000, fee: 115 },
  { min: 10001, max: 15000, fee: 167 },
  { min: 15001, max: 20000, fee: 185 },
  { min: 20001, max: 35000, fee: 197 },
  { min: 35001, max: 50000, fee: 278 },
  { min: 50001, max: 250000, fee: 309 },
];

export const MAX_WITHDRAWAL = 250000;
export const MIN_WITHDRAWAL = 50;

/**
 * Look up the M-Pesa withdrawal fee for a given amount.
 * Returns 0 if amount is below minimum or fee bracket not found.
 */
export function getMpesaFee(amount: number): number {
  if (amount < MIN_WITHDRAWAL) return 0;
  const bracket = MPESA_TARIFF.find((b) => amount >= b.min && amount <= b.max);
  return bracket ? bracket.fee : 0;
}

/**
 * Calculate the full net payout breakdown.
 *
 * Finance Act 2025: 5% WHT is applied to the GROSS payout (the full withdrawal amount).
 * The bookmaker deducts this before sending funds to M-Pesa.
 * M-Pesa fee is then applied to the post-tax amount.
 */
export function calculatePayout(stake: number, odds: number) {
  const grossPayout = stake * odds;
  const withholdingTax = grossPayout * WITHHOLDING_TAX_RATE;
  const postTaxAmount = grossPayout - withholdingTax;
  const mpesaFee = getMpesaFee(postTaxAmount);
  const netTakeHome = postTaxAmount - mpesaFee;

  return {
    stake,
    odds,
    grossPayout,
    withholdingTax,
    postTaxAmount,
    mpesaFee,
    netTakeHome,
    taxRate: WITHHOLDING_TAX_RATE,
  };
}

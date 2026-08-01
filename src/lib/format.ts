// Shared formatting helpers — used by Calculator.tsx, ParlayCalculator.tsx,
// and the rest of the /tools calculator suite. Extracted here instead of
// duplicated per-component so there's one place to fix if the format ever changes.

export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

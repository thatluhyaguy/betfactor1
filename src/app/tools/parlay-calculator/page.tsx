import type { Metadata } from 'next';
import Link from 'next/link';
import CalculatorToolNav from '@/components/CalculatorToolNav';
import ParlayCalculator from '@/components/tools/ParlayCalculator';

export const metadata: Metadata = {
  title: 'Parlay & Accumulator Calculator (KES) — Net Payout After Tax | BetFactor',
  description:
    'Free accumulator calculator for Kenyan bettors. Combine odds across multiple legs and see your exact net payout after the 5% withholding tax and M-Pesa withdrawal fee — before you place the bet.',
};

export default function ParlayCalculatorPage() {
  return (
    <main className="tools-page">
      <CalculatorToolNav current="parlay-calculator" />

      <header className="tools-page-header">
        <h1>Parlay &amp; Accumulator Calculator</h1>
        <p className="tools-page-subhead">
          Combine odds across multiple selections and see your real net payout in KES — after Kenya&apos;s
          withholding tax and M-Pesa withdrawal fee, not just the raw gross number.
        </p>
      </header>

      <ParlayCalculator />

      <section className="tools-explainer">
        <h2>New to accumulators?</h2>
        <p>
          An accumulator (or &quot;multibet&quot;) combines several individual selections into one bet. Every
          leg has to win for the accumulator to pay out — but because the odds multiply together across legs,
          even modest individual odds can add up to a large combined price. That upside comes with real
          downside: one losing leg loses the entire stake, regardless of how the other legs finished.
        </p>
      </section>

      <section className="tools-worked-example">
        <h2>Worked Example</h2>
        <p>
          A 3-leg accumulator at odds of <strong>1.80</strong>, <strong>2.10</strong>, and <strong>1.65</strong>{' '}
          on a <strong>KES 500</strong> stake:
        </p>
        <ul>
          <li>Combined odds: 1.80 × 2.10 × 1.65 = <strong>6.24</strong></li>
          <li>Gross payout: KES 500 × 6.24 = <strong>KES 3,120</strong></li>
          <li>After 5% withholding tax: <strong>KES 2,964</strong></li>
          <li>After M-Pesa withdrawal fee: <strong>≈ KES 2,946 net take-home</strong></li>
        </ul>
        <p>
          That&apos;s roughly <strong>KES 174 in combined deductions</strong> — money most bettors don&apos;t
          account for when eyeballing the gross odds before placing the bet.
        </p>
      </section>

      <section className="tools-how-to">
        <h2>How to Use This Calculator</h2>
        <ol>
          <li>Enter your total stake in KES.</li>
          <li>Add the decimal odds for each selection in your accumulator — use the + button for more legs.</li>
          <li>
            See your combined odds and net take-home update instantly, already accounting for tax and M-Pesa
            fees.
          </li>
        </ol>
      </section>

      <section className="tools-cross-sell">
        <h2>Comparing odds across bookmakers manually?</h2>
        <p>
          Check this week&apos;s manually-verified odds across major Kenyan bookmakers before building your
          accumulator — a small odds difference on one leg compounds across the whole combination.
        </p>
        <Link href="/" className="cross-sell-cta">
          See This Week&apos;s Odds →
        </Link>
      </section>
    </main>
  );
}

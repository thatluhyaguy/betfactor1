import type { Metadata } from 'next';
import Calculator from '@/components/Calculator';

export const metadata: Metadata = {
  title: 'Net Payout Calculator | BetFactor Kenya',
  description:
    'Calculate your exact net cash-out after Kenya\'s 5% withholding tax (Finance Act 2025) and Safaricom M-Pesa agent withdrawal fees.',
};

export default function CalculatorPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ maxWidth: '820px' }}>
          <span className="page-tag">THE ONLY NUMBER THAT MATTERS</span>
          <h1 className="page-title">What You'll Actually Walk Away With</h1>
          <p className="page-lead">
            Enter your stake and decimal odds. We apply the current Finance Act 2025 withholding rate (5%) and Safaricom's M-Pesa agent withdrawal tariff — the same numbers the bookmakers use, laid out line by line so you can check our math.
          </p>
        </div>

        <div style={{ marginTop: '32px' }}>
          <Calculator />
        </div>
      </div>
    </div>
  );
}

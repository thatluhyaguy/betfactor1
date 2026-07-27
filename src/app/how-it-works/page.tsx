import type { Metadata } from 'next';
import { MPESA_TARIFF } from '@/data/tax-config';

export const metadata: Metadata = {
  title: 'How Kenya Betting Tax & M-Pesa Fees Work',
  description:
    'Full explanation of how Kenya\'s 5% betting withdrawal tax (Finance Act 2025) works, how M-Pesa agent fees are calculated, and how to use the BetFactor calculator.',
};

export default function HowItWorksPage() {
  return (
    <div className="static-page">
      <div className="container">
        <div className="page-header">
          <span className="page-tag">Methodology</span>
          <h1 className="page-title">How Kenya Betting Tax &amp; M-Pesa Fees Work</h1>
          <p className="page-lead">
            Everything you need to know about the deductions between your gross payout and the cash in your hand.
          </p>
        </div>

        <div className="content-body">
          {/* Section 1 */}
          <section className="content-section" aria-labelledby="tax-heading">
            <h2 id="tax-heading">1. Withholding Tax on Betting Withdrawals</h2>
            <p>
              The <strong>Finance Act 2025</strong>, effective July 2025, changed how Kenya taxes betting winnings. The previous
              20% tax on <em>net winnings</em> was replaced with a <strong>5% withholding tax on every withdrawal</strong> from
              your betting wallet.
            </p>

            <div className="info-box">
              <strong>Key change:</strong> The 5% applies to your <em>entire gross payout</em> — including your original stake —
              not just your profit. This is collected by the bookmaker before your money is transferred to M-Pesa.
            </div>

            <h3>Example</h3>
            <div className="worked-example">
              <div className="we-row">
                <span>Stake</span>
                <span>KES 1,000</span>
              </div>
              <div className="we-row">
                <span>Odds</span>
                <span>2.40</span>
              </div>
              <div className="we-row highlight">
                <span>Gross Payout (1,000 × 2.40)</span>
                <span>KES 2,400.00</span>
              </div>
              <div className="we-row deduct">
                <span>Withholding Tax (5% of 2,400)</span>
                <span>− KES 120.00</span>
              </div>
              <div className="we-row subtotal">
                <span>After-Tax Amount (sent to M-Pesa)</span>
                <span>KES 2,280.00</span>
              </div>
            </div>

            <p>
              This tax is remitted directly to the Kenya Revenue Authority (KRA) by the bookmaker — you do not pay it separately.
              It appears as a deduction from your payout.
            </p>
            <p>
              <strong>Source:</strong> Finance Act 2025 (Kenya). Current rate verified July 2026. Always confirm at{' '}
              <a href="https://kra.go.ke" target="_blank" rel="noopener noreferrer">kra.go.ke</a>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="content-section" aria-labelledby="mpesa-heading">
            <h2 id="mpesa-heading">2. M-Pesa Withdrawal Fee</h2>
            <p>
              After the bookmaker sends your after-tax payout to your M-Pesa wallet, you pay a Safaricom agent withdrawal fee
              when you cash out. This fee is determined by the amount you&apos;re withdrawing:
            </p>

            <div className="tariff-table-wrapper">
              <table className="tariff-table">
                <thead>
                  <tr>
                    <th>Amount (KES)</th>
                    <th>Withdrawal Fee (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {MPESA_TARIFF.map((bracket) => (
                    <tr key={bracket.min}>
                      <td>{bracket.min.toLocaleString()} – {bracket.max.toLocaleString()}</td>
                      <td className="fee-cell">{bracket.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>
              The fee is applied to the <em>after-tax amount</em> (what actually arrives in your M-Pesa) — not the gross payout.
              Maximum single transaction: KES 250,000.
            </p>
            <p>
              <strong>Source:</strong> Safaricom M-Pesa tariff. Verified July 2026. Confirm at{' '}
              <a href="https://safaricom.co.ke" target="_blank" rel="noopener noreferrer">safaricom.co.ke</a>.
            </p>
          </section>

          {/* Section 3 */}
          <section className="content-section" aria-labelledby="calc-heading">
            <h2 id="calc-heading">3. How the BetFactor Calculator Works</h2>
            <p>Our calculator applies deductions in the correct order:</p>
            <ol className="steps-list">
              <li>
                <strong>Gross Payout</strong> = Stake × Decimal Odds
              </li>
              <li>
                <strong>Withholding Tax</strong> = Gross Payout × 5%
              </li>
              <li>
                <strong>After-Tax Amount</strong> = Gross Payout − Withholding Tax
                (this is what the bookmaker sends to M-Pesa)
              </li>
              <li>
                <strong>M-Pesa Fee</strong> = Agent tariff for the after-tax amount bracket
              </li>
              <li>
                <strong>Net Take-Home</strong> = After-Tax Amount − M-Pesa Fee
              </li>
            </ol>

            <div className="info-box info-box-warn">
              <strong>Estimate disclaimer:</strong> These figures are estimates. Tax rates and M-Pesa tariffs are
              subject to change by KRA and Safaricom respectively. BetFactor updates rates when changes occur, but
              always verify before betting.
            </div>
          </section>

          {/* Section 4 */}
          <section className="content-section" aria-labelledby="responsible-heading">
            <h2 id="responsible-heading">4. Responsible Gambling</h2>
            <p>
              Betting should be entertainment, not a financial strategy. The mathematics of gambling means that over time,
              bookmakers have a built-in edge. Knowing your net payout helps you make informed decisions — it does not
              improve your odds of winning.
            </p>
            <ul>
              <li>Set a budget and stick to it</li>
              <li>Never bet money you cannot afford to lose</li>
              <li>Take regular breaks</li>
              <li>If gambling is affecting your life, seek help</li>
            </ul>
            <p>
              🛡️ For support, contact the{' '}
              <a href="https://www.ncpg.or.ke" target="_blank" rel="noopener noreferrer">
                National Council on Problem Gambling (NCPG) Kenya
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

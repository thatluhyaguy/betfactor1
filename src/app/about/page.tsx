import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About BetFactor Kenya',
  description:
    'About BetFactor — an independent betting calculator and odds comparison tool for Kenya. Disclaimer, data accuracy policy, and contact information.',
};

export default function AboutPage() {
  return (
    <div className="static-page">
      <div className="container">
        <div className="page-header">
          <span className="page-tag">About</span>
          <h1 className="page-title">About BetFactor</h1>
          <p className="page-lead">
            Independent. Data-driven. Built for Kenyan bettors.
          </p>
        </div>

        <div className="content-body">
          <section className="content-section" aria-labelledby="about-heading">
            <h2 id="about-heading">What is BetFactor?</h2>
            <p>
              BetFactor is an independent betting utility tool built specifically for the Kenyan market. We are not a bookmaker
              and we do not accept bets. Our tools help you make more informed decisions by showing you:
            </p>
            <ul>
              <li>Your exact net take-home after Kenya&apos;s 5% betting withdrawal tax (Finance Act 2025) and M-Pesa agent fees</li>
              <li>Which bookmaker offers the best available odds on upcoming matches</li>
            </ul>
            <p>
              We built BetFactor because the math of betting in Kenya is opaque. Most punters don&apos;t realize how much of their
              winnings go to tax and fees — especially after the Finance Act 2025 changed the tax structure.
            </p>
          </section>

          <section className="content-section" aria-labelledby="disclaimer-heading">
            <h2 id="disclaimer-heading">Important Disclaimers</h2>
            <div className="disclaimer-box">
              <h3>Odds Data</h3>
              <p>
                Odds displayed on BetFactor are manually curated and updated periodically. They <strong>may not reflect live
                or current prices</strong> on any bookmaker&apos;s platform. Always verify odds on the bookmaker&apos;s official
                site or app before placing any bet.
              </p>
            </div>
            <div className="disclaimer-box">
              <h3>Calculator Estimates</h3>
              <p>
                The net payout calculator provides <strong>estimates only</strong>. Withholding tax rates and M-Pesa tariffs
                are subject to change by KRA and Safaricom respectively. BetFactor makes reasonable efforts to keep these
                figures current, but cannot guarantee they reflect the exact deductions applied by any bookmaker at any given time.
              </p>
            </div>
            <div className="disclaimer-box">
              <h3>Not Financial Advice</h3>
              <p>
                Nothing on BetFactor constitutes financial advice, investment advice, or a recommendation to bet.
                Gambling involves risk and the majority of bettors lose money over time. Use BetFactor as an
                informational tool only.
              </p>
            </div>
            <div className="disclaimer-box">
              <h3>Regulatory Status</h3>
              <p>
                BetFactor is an information and calculator service. We do not operate as a bookmaker, betting exchange,
                or betting intermediary. We do not facilitate wagering or handle funds. Users are responsible for
                complying with all applicable Kenyan laws relating to gambling.
              </p>
            </div>
          </section>

          <section className="content-section" aria-labelledby="responsible-heading">
            <h2 id="responsible-heading">Responsible Gambling</h2>
            <p>
              BetFactor supports responsible gambling. If you or someone you know is struggling with gambling-related problems:
            </p>
            <ul>
              <li>
                <a href="https://www.ncpg.or.ke" target="_blank" rel="noopener noreferrer">
                  National Council on Problem Gambling (NCPG) Kenya
                </a>
              </li>
              <li>Talk to a trusted friend, family member, or counsellor</li>
              <li>Consider self-exclusion tools offered by individual bookmakers</li>
            </ul>
            <p>
              🛡️ You must be <strong>18 years or older</strong> to use betting services in Kenya.
            </p>
          </section>

          <section className="content-section" aria-labelledby="accuracy-heading">
            <h2 id="accuracy-heading">Data Accuracy</h2>
            <p>
              We take data accuracy seriously. Here&apos;s our policy:
            </p>
            <ul>
              <li>Tax rates and M-Pesa tariffs are reviewed and updated whenever changes are announced by KRA or Safaricom</li>
              <li>Each published rate includes a &quot;last verified&quot; date so you can assess its currency</li>
              <li>Match odds are manually entered and timestamped with a &quot;last updated&quot; indicator on each page</li>
              <li>Pages with data older than 24 hours display a visible staleness warning</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

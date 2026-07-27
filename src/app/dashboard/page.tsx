import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Client Dashboard | BetFactor Kenya',
  description: 'Manage your saved matches, recent calculator activity, and subscription status.',
};

export default function DashboardPage() {
  return (
    <div className="static-page">
      <div className="container">
        <div className="page-header" style={{ marginBottom: '32px', textAlign: 'left' }}>
          <span className="page-tag">USER DASHBOARD</span>
          <h1 className="page-title">Welcome back, Bettor</h1>
          <p className="page-lead">Track your saved odds, calculate payouts, and manage your M-Pesa subscription.</p>
        </div>

        <div className="dashboard-grid">
          {/* Account Overview */}
          <div className="dash-card">
            <h2 className="dash-card-title">Account Overview</h2>
            <div className="dash-status-row">
              <span className="dash-label">Subscription Tier</span>
              <span className="dash-badge free">FREE TIER</span>
            </div>
            <div className="dash-status-row">
              <span className="dash-label">Alert Notifications</span>
              <span className="dash-val">Disabled (Member Feature)</span>
            </div>
            <div style={{ marginTop: '20px' }}>
              <Link href="/pricing" className="cta-button" style={{ width: '100%', textAlign: 'center' }}>
                Upgrade via M-Pesa →
              </Link>
            </div>
          </div>

          {/* Saved Matches */}
          <div className="dash-card">
            <h2 className="dash-card-title">Saved / Watched Matches</h2>
            <ul className="dash-list">
              <li className="dash-list-item">
                <div>
                  <strong>Arsenal vs Chelsea</strong>
                  <div className="dash-sub">Best: 2.15 (SportPesa)</div>
                </div>
                <Link href="/odds/arsenal-vs-chelsea" className="explainer-link">View Odds →</Link>
              </li>
              <li className="dash-list-item">
                <div>
                  <strong>Man City vs Liverpool</strong>
                  <div className="dash-sub">Best: 2.00 (Odibets)</div>
                </div>
                <Link href="/odds/man-city-vs-liverpool" className="explainer-link">View Odds →</Link>
              </li>
            </ul>
          </div>

          {/* Recent Calculator Activity */}
          <div className="dash-card full-width">
            <h2 className="dash-card-title">Recent Calculator Activity</h2>
            <div className="activity-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Stake (KES)</th>
                    <th>Odds</th>
                    <th>Gross Payout</th>
                    <th>5% Tax</th>
                    <th>M-Pesa Fee</th>
                    <th>Net Take-Home</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Today, 14:20</td>
                    <td>1,000</td>
                    <td>2.40</td>
                    <td>2,400.00</td>
                    <td>−120.00</td>
                    <td>−29.00</td>
                    <td className="text-positive"><strong>KES 2,251.00</strong></td>
                  </tr>
                  <tr>
                    <td>Yesterday, 19:45</td>
                    <td>5,000</td>
                    <td>3.15</td>
                    <td>15,750.00</td>
                    <td>−787.50</td>
                    <td>−185.00</td>
                    <td className="text-positive"><strong>KES 14,777.50</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

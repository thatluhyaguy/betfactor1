import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';

async function getUserFromSession() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  const userSession = cookieStore.get('user_session');

  if (adminSession?.value === 'authenticated') {
    return { id: 'admin', emailOrPhone: 'admin@betfactor.co.ke', tier: 'ADMIN' };
  }

  if (userSession?.value) {
    try {
      const parsed = JSON.parse(userSession.value);
      return parsed;
    } catch {
      return null;
    }
  }

  return null;
}

/** Extract a friendly display name from email or phone */
function getDisplayName(emailOrPhone: string, tier: string): string {
  if (tier === 'ADMIN') return 'Admin';
  // Email: take the part before @, capitalize first letter
  if (emailOrPhone.includes('@')) {
    const localPart = emailOrPhone.split('@')[0];
    // Handle dot/underscore/dash separators — take only the first segment
    const firstName = localPart.split(/[._-]/)[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  }
  // Phone number — no name available, return empty so we use the fallback greeting
  return '';
}

export default async function DashboardPage() {
  const user = await getUserFromSession();
  if (!user) redirect('/login');

  const displayName = getDisplayName(user.emailOrPhone, user.tier);

  // CRITICAL: every query below is scoped to user.id — this page shows
  // financial figures (stakes, payouts), so row-level scoping isn't optional
  const [savedMatches, calculatorHistory, alertSub] = await Promise.all([
    prisma.savedMatch.findMany({ where: { userId: user.id }, take: 10 }),
    prisma.calculatorHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.alertSubscription.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="static-page">
      <div className="container full-width-container">
        {/* Header */}
        <div className="page-header" style={{ marginBottom: '32px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-tag">{user.tier === 'ADMIN' ? 'ADMIN VIEW' : 'MY DASHBOARD'}</span>
            <h1 className="page-title">
              {displayName
                ? `Welcome back, ${displayName}! 👋`
                : 'Welcome back! 👋'}
            </h1>
            <p className="page-lead">
              {user.tier === 'ADMIN'
                ? 'You are viewing the dashboard as Admin. All member features are unlocked.'
                : 'Track your saved odds, calculate net payouts, and manage your subscription.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/sure-bets/live" className="sb-btn sb-btn-primary">
              ⚡ Open Live Scanner →
            </Link>
          </div>
        </div>

        {/* Core Dashboard Grid */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>

          {/* 1. SUBSCRIPTION STATUS CARD */}
          <div className="dash-card sb-calc-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="dash-card-title" style={{ fontSize: '1.1rem', margin: 0 }}>Subscription Status</h2>
              <span className={`sb-badge ${user.tier === 'MEMBER' || user.tier === 'ADMIN' ? 'sb-badge-green' : ''}`}>
                {user.tier} TIER
              </span>
            </div>

            <div className="dash-status-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
              <span className="dash-label" style={{ color: '#94A3B8' }}>Access Level:</span>
              <span className="dash-val" style={{ fontWeight: 600 }}>
                {user.tier === 'FREE' ? 'Trial Mode (≤1.0% Surebets)' : 'Full Access (All Margins)'}
              </span>
            </div>

            <div className="dash-status-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
              <span className="dash-label" style={{ color: '#94A3B8' }}>Auto-Renewal:</span>
              <span className="dash-val">{user.tier === 'FREE' ? 'N/A' : 'Active (M-Pesa STK Push)'}</span>
            </div>

            {user.tier === 'FREE' && (
              <div style={{ marginTop: '20px' }}>
                <Link href="/pricing" className="btn-primary-large" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '10px' }}>
                  Upgrade to Member via M-Pesa →
                </Link>
              </div>
            )}
          </div>

          {/* 2. ARBITRAGE ALERTS CARD */}
          <div className="dash-card sb-calc-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="dash-card-title" style={{ fontSize: '1.1rem', margin: 0 }}>Arbitrage Alerts</h2>
              <span className={`sb-badge ${alertSub?.enabled ? 'sb-badge-green' : ''}`}>
                {alertSub?.enabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>

            {user.tier === 'FREE' ? (
              <p style={{ fontSize: '0.88rem', color: '#f87171' }}>
                🔒 Alerts are a Member feature. Upgrade to get instant SMS/WhatsApp alerts on high-margin surebets.
              </p>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                <p>Status: {alertSub?.enabled ? '🟢 Active' : '⚪ Disabled'}</p>
                <p style={{ marginTop: '4px' }}>
                  Minimum margin threshold: <strong>{((alertSub?.minMargin ?? 0.01) * 100).toFixed(1)}%</strong>
                </p>
              </div>
            )}
          </div>

          {/* 3. SAVED MATCHES */}
          <div className="dash-card sb-calc-card" style={{ padding: '24px', gridColumn: 'span 1 / -1' }}>
            <h2 className="dash-card-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
              Saved Matches ({savedMatches.length})
            </h2>

            {savedMatches.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                No saved matches yet. Bookmark a match on the surebets page to track it here.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {savedMatches.map((m) => (
                  <div key={m.id} style={{ background: '#0F172A', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#38BDF8', display: 'block', marginBottom: '8px' }}>
                      {m.matchSlug}
                    </strong>
                    <Link href="/sure-bets/live" className="sb-btn sb-btn-outline" style={{ padding: '4px 10px', fontSize: '0.78rem', textAlign: 'center', display: 'block' }}>
                      View Live Odds →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. RECENT CALCULATOR ACTIVITY */}
          <div className="dash-card sb-calc-card" style={{ padding: '24px', gridColumn: 'span 1 / -1' }}>
            <h2 className="dash-card-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
              Recent Calculator Activity ({calculatorHistory.length})
            </h2>

            {calculatorHistory.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                Your recent payout checks will show up here as you use the profit calculator.
              </p>
            ) : (
              <div className="sb-table-wrapper">
                <table className="sb-example-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Stake (KES)</th>
                      <th>Gross Payout</th>
                      <th>Guaranteed Profit</th>
                      <th>Net Profit</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatorHistory.map((c) => (
                      <tr key={c.id}>
                        <td style={{ color: '#94A3B8' }}>{c.createdAt.toLocaleDateString()}</td>
                        <td className="font-mono" style={{ fontWeight: 700 }}>KES {c.totalStake.toLocaleString()}</td>
                        <td className="font-mono">KES {(c.totalStake + c.guaranteedProfit).toLocaleString()}</td>
                        <td className="font-mono" style={{ color: '#4ADE80' }}>+KES {c.guaranteedProfit.toLocaleString()}</td>
                        <td className="font-mono text-positive" style={{ fontWeight: 800 }}>+KES {c.netProfit.toLocaleString()}</td>
                        <td>
                          <Link href="/calculator" className="sb-btn sb-btn-outline" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                            Re-calculate
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

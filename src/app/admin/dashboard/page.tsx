'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());

interface LeadUser {
  id: string;
  emailOrPhone: string;
  tier: string;
  createdAt: string;
}

interface ArbReport {
  id: string;
  matchSlug: string;
  createdAt: string;
}

interface BookmakerHealth {
  id: string;
  name: string;
  status: string;
  lastScrapedAt: string;
  failureCount: number;
  latencyMs: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading, logout } = useAuth();

  // Active Admin Tab State
  const [activeTab, setActiveTab] = useState<'health' | 'reports' | 'leads' | 'editor'>('health');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchLead, setSearchLead] = useState('');

  // Manual Odds Editor Form State
  const [matchSlug, setMatchSlug] = useState('');
  const [margin, setMargin] = useState('2.15');
  const [homeBookie, setHomeBookie] = useState('SportPesa');
  const [homeOdds, setHomeOdds] = useState('2.20');
  const [drawBookie, setDrawBookie] = useState('Betika');
  const [drawOdds, setDrawOdds] = useState('3.50');
  const [awayBookie, setAwayBookie] = useState('Odibets');
  const [awayOdds, setAwayOdds] = useState('3.60');
  const [editorMsg, setEditorMsg] = useState('');
  const [editorLoading, setEditorLoading] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/admin/login');
    }
  }, [authLoading, isAdmin, router]);

  // SWR Fetches
  const { data: usersData, mutate: mutateUsers } = useSWR(
    isAdmin ? '/api/admin/users' : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  const { data: healthData, mutate: mutateHealth } = useSWR(
    isAdmin ? '/api/admin/health' : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: reportsData, mutate: mutateReports } = useSWR(
    isAdmin ? '/api/admin/arb-reports' : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  // Actions
  const handleToggleTier = async (userId: string, currentTier: string) => {
    const nextTier = currentTier === 'MEMBER' ? 'FREE' : 'MEMBER';
    setUpdatingId(userId);
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, tier: nextTier }),
      });
      mutateUsers();
    } catch {
      alert('Failed to update tier');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDismissReport = async (id: string) => {
    try {
      await fetch('/api/admin/arb-reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      mutateReports();
    } catch {
      alert('Failed to dismiss report');
    }
  };

  const handleAddManualOdds = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditorLoading(true);
    setEditorMsg('');
    try {
      const res = await fetch('/api/admin/manual-odds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          matchSlug,
          margin,
          bestHomeBookmaker: homeBookie,
          bestHomeOdds: homeOdds,
          bestDrawBookmaker: drawBookie,
          bestDrawOdds: drawOdds,
          bestAwayBookmaker: awayBookie,
          bestAwayOdds: awayOdds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to insert');
      setEditorMsg('✅ Opportunity saved live to Postgres!');
      setMatchSlug('');
    } catch (err: any) {
      setEditorMsg(`⚠️ ${err.message}`);
    } finally {
      setEditorLoading(false);
    }
  };

  const exportLeadsCSV = () => {
    if (!usersData?.users?.length) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['EmailOrPhone,Tier,SignedUpDate']
        .concat(
          usersData.users.map(
            (u: LeadUser) => `"${u.emailOrPhone}","${u.tier}","${u.createdAt}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `betfactor_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="static-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying admin credentials…</p>
      </div>
    );
  }

  const filteredUsers = usersData?.users?.filter((u: LeadUser) =>
    u.emailOrPhone.toLowerCase().includes(searchLead.toLowerCase())
  );

  return (
    <div className="static-page">
      <div className="container full-width-container">
        {/* Admin Top Header */}
        <div className="page-header" style={{ maxWidth: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-tag" style={{ background: '#78350f', color: '#f59e0b' }}>🔑 BETFACTOR ADMIN PANEL</span>
            <h1 className="page-title" style={{ fontSize: '1.8rem', marginTop: '4px' }}>System Control &amp; Telemetry</h1>
            <p className="page-lead" style={{ fontSize: '0.9rem' }}>
              Scraper status monitoring, user lead management, report resolution, and live odds editor.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/dashboard" className="sb-btn sb-btn-primary" style={{ fontSize: '0.85rem' }}>
              👤 View User Dashboard →
            </Link>
            <button className="sb-btn sb-btn-outline" onClick={logout} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
              🔒 Admin Log Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', overflowX: 'auto' }}>
          <button
            className={`sb-btn ${activeTab === 'health' ? 'sb-btn-primary' : 'sb-btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('health')}
          >
            🟢 Scraper Health ({healthData?.bookmakers?.length ?? 3})
          </button>
          <button
            className={`sb-btn ${activeTab === 'reports' ? 'sb-btn-primary' : 'sb-btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('reports')}
          >
            ⚠️ Arb Reports Queue ({reportsData?.reports?.length ?? 0})
          </button>
          <button
            className={`sb-btn ${activeTab === 'leads' ? 'sb-btn-primary' : 'sb-btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('leads')}
          >
            📋 Leads List ({usersData?.totalUsers ?? 0})
          </button>
          <button
            className={`sb-btn ${activeTab === 'editor' ? 'sb-btn-primary' : 'sb-btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('editor')}
          >
            ✏️ Manual Odds Editor
          </button>
        </div>

        {/* ── TAB 1: SCRAPER HEALTH MONITOR ── */}
        {activeTab === 'health' && (
          <section className="admin-sec">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Bookmaker Scraper Telemetry</h2>
              <button className="sb-btn sb-btn-outline" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={() => mutateHealth()}>
                🔄 Refresh Status
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {healthData?.bookmakers?.map((b: BookmakerHealth) => (
                <div key={b.id} className="sb-result-box" style={{ padding: '16px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#38BDF8' }}>{b.name}</strong>
                    <span className="sb-badge sb-badge-green" style={{ fontSize: '0.75rem' }}>{b.status}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>🕒 Last Scraped: {new Date(b.lastScrapedAt).toLocaleTimeString()}</span>
                    <span>⚡ Latency: {b.latencyMs} ms</span>
                    <span>❌ Failures (24h): {b.failureCount}</span>
                  </div>
                </div>
              )) || <p style={{ color: '#94A3B8' }}>Loading scraper telemetry…</p>}
            </div>
          </section>
        )}

        {/* ── TAB 2: ARB REPORTS QUEUE ── */}
        {activeTab === 'reports' && (
          <section className="admin-sec">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>User-Reported Incorrect Odds</h2>
              {reportsData?.reports?.length > 0 && (
                <button
                  className="sb-btn sb-btn-outline"
                  style={{ fontSize: '0.8rem', padding: '4px 10px', color: '#f87171', borderColor: '#f87171' }}
                  onClick={() => handleDismissReport('all')}
                >
                  Clear All Reports
                </button>
              )}
            </div>

            {!reportsData?.reports?.length ? (
              <div className="sb-calc-card" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                🎉 No user-reported errors in queue! All bookmaker match odds are synced cleanly.
              </div>
            ) : (
              <div className="sb-calc-card" style={{ padding: '16px' }}>
                <div className="sb-table-wrapper">
                  <table className="sb-example-table">
                    <thead>
                      <tr>
                        <th>Reported Match</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData.reports.map((r: ArbReport) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600, color: '#38BDF8' }}>{r.matchSlug}</td>
                          <td style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                            {new Date(r.createdAt).toLocaleString()}
                          </td>
                          <td>
                            <button
                              className="sb-btn sb-btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                              onClick={() => handleDismissReport(r.id)}
                            >
                              Mark Resolved / Dismiss
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── TAB 3: LEADS LIST ── */}
        {activeTab === 'leads' && (
          <section className="admin-sec">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Captured Waitlist &amp; Signups ({usersData?.totalUsers ?? 0})
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Search lead..."
                  value={searchLead}
                  onChange={(e) => setSearchLead(e.target.value)}
                  className="bb-select"
                  style={{ width: '180px' }}
                />
                <button className="sb-btn sb-btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={exportLeadsCSV}>
                  📥 Export CSV
                </button>
              </div>
            </div>

            <div className="sb-calc-card" style={{ padding: '16px' }}>
              <div className="sb-table-wrapper">
                <table className="sb-example-table">
                  <thead>
                    <tr>
                      <th>Email / Phone</th>
                      <th>Signed Up</th>
                      <th>Tier</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers?.map((user: LeadUser) => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.emailOrPhone}</td>
                        <td style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span className={`sb-badge ${user.tier === 'MEMBER' ? 'sb-badge-green' : ''}`}>
                            {user.tier}
                          </span>
                        </td>
                        <td>
                          <button
                            className="sb-btn sb-btn-outline"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            disabled={updatingId === user.id}
                            onClick={() => handleToggleTier(user.id, user.tier)}
                          >
                            {updatingId === user.id
                              ? 'Updating…'
                              : user.tier === 'MEMBER'
                              ? 'Downgrade to FREE'
                              : 'Upgrade to MEMBER'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 4: MANUAL ODDS EDITOR ── */}
        {activeTab === 'editor' && (
          <section className="admin-sec" style={{ maxWidth: '640px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
              ✏️ Manual Odds &amp; Surebet Form
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '16px' }}>
              Directly insert or update match odds in the Postgres database without needing a code push or redeploy.
            </p>

            {editorMsg && (
              <div className="info-box" style={{ marginBottom: '16px', background: 'rgba(56,189,248,0.1)', borderColor: '#38BDF8', color: '#38BDF8' }}>
                {editorMsg}
              </div>
            )}

            <form onSubmit={handleAddManualOdds} className="sb-calc-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Match Slug (e.g. gor-mahia-vs-afc-leopards)</label>
                <input
                  type="text"
                  className="calc-input"
                  placeholder="e.g. arsenal-vs-chelsea"
                  value={matchSlug}
                  onChange={(e) => setMatchSlug(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Arbitrage Margin % (e.g. 2.45)</label>
                <input
                  type="number"
                  step="0.01"
                  className="calc-input"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Home Bookmaker</label>
                  <input type="text" className="calc-input" value={homeBookie} onChange={(e) => setHomeBookie(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Home Odds</label>
                  <input type="number" step="0.01" className="calc-input" value={homeOdds} onChange={(e) => setHomeOdds(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Draw Bookmaker</label>
                  <input type="text" className="calc-input" value={drawBookie} onChange={(e) => setDrawBookie(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Draw Odds</label>
                  <input type="number" step="0.01" className="calc-input" value={drawOdds} onChange={(e) => setDrawOdds(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Away Bookmaker</label>
                  <input type="text" className="calc-input" value={awayBookie} onChange={(e) => setAwayBookie(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Away Odds</label>
                  <input type="number" step="0.01" className="calc-input" value={awayOdds} onChange={(e) => setAwayOdds(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="sb-btn sb-btn-primary" style={{ marginTop: '8px' }} disabled={editorLoading}>
                {editorLoading ? 'Saving…' : '🚀 Save Live Opportunity'}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface LeadUser {
  id: string;
  emailOrPhone: string;
  tier: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading, logout } = useAuth();

  // Redirect if not authenticated as admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/admin/login');
    }
  }, [authLoading, isAdmin, router]);

  const { data, error, mutate, isLoading } = useSWR(
    isAdmin ? '/api/admin/users' : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleToggleTier = async (userId: string, currentTier: string) => {
    const nextTier = currentTier === 'MEMBER' ? 'FREE' : 'MEMBER';
    setUpdatingId(userId);
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier: nextTier }),
      });
      mutate();
    } catch {
      alert('Failed to update tier');
    } finally {
      setUpdatingId(null);
    }
  };

  // Show loading spinner while auth resolves
  if (authLoading || !isAdmin) {
    return (
      <div className="static-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying admin access…</p>
      </div>
    );
  }

  return (
    <div className="static-page">
      <div className="container full-width-container">
        {/* Admin Header */}
        <div className="page-header" style={{ maxWidth: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-tag">ADMIN DASHBOARD</span>
            <h1 className="page-title" style={{ fontSize: '2rem' }}>Lead &amp; Subscription Management</h1>
            <p className="page-lead" style={{ fontSize: '0.95rem' }}>
              View captured leads, manage user access, and check live scraper metrics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="sb-btn sb-btn-secondary" onClick={() => mutate()}>
              🔄 Refresh Leads
            </button>
            <button
              className="sb-btn sb-btn-outline"
              onClick={logout}
              style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
            >
              🔑 Log Out
            </button>
          </div>
        </div>

        {/* Stats Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', margin: '24px 0 40px' }}>
          <div className="sb-result-box">
            <span className="sb-res-label">Total Leads Captured</span>
            <span className="sb-res-val text-positive">{data?.totalUsers ?? '…'}</span>
          </div>

          <div className="sb-result-box">
            <span className="sb-res-label">Paid Subscribers</span>
            <span className="sb-res-val text-positive">{data?.paidUsers ?? '…'}</span>
          </div>

          <div className="sb-result-box">
            <span className="sb-res-label">Scraper Telemetry</span>
            <span className="sb-res-val text-positive">3 Active (Betika/SP/Odi)</span>
          </div>

          <div className="sb-result-box">
            <span className="sb-res-label">Database</span>
            <span className="sb-res-val text-positive">Neon Postgres</span>
          </div>
        </div>

        {/* User / Lead Table */}
        <div className="sb-calc-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
            Captured User Leads ({data?.users?.length ?? 0})
          </h2>

          {isLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading leads from database…</p>
          ) : error ? (
            <p style={{ color: 'var(--accent)' }}>Failed to load leads from database.</p>
          ) : data?.users?.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No leads captured yet. New signups will appear here automatically.</p>
          ) : (
            <div className="sb-table-wrapper">
              <table className="sb-example-table">
                <thead>
                  <tr>
                    <th>Email or Phone</th>
                    <th>Signed Up Date</th>
                    <th>Current Tier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users?.map((user: LeadUser) => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.emailOrPhone}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
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
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
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
          )}
        </div>
      </div>
    </div>
  );
}

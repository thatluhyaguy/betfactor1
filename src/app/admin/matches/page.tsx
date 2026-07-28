import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function MatchesAdminPage() {
  await requireAdmin();
  const matches = await prisma.match.findMany({
    include: { odds: true },
    orderBy: { kickoff: 'asc' },
  });

  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-tag" style={{ background: '#78350f', color: '#f59e0b' }}>MANUAL MATCHES EDITOR</span>
            <h1 className="page-title">Matches ({matches.length})</h1>
            <p className="page-lead">Manage hand-updated match odds from a form instead of doing git deploys.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/admin/matches/new" className="sb-btn sb-btn-primary">+ Add New Match</Link>
            <Link href="/admin" className="sb-btn sb-btn-outline">← Back to Admin</Link>
          </div>
        </div>

        <div className="sb-calc-card" style={{ padding: '24px', marginTop: '20px' }}>
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
              <p>No manual matches created yet.</p>
              <Link href="/admin/matches/new" className="sb-btn sb-btn-primary" style={{ marginTop: '12px', display: 'inline-block' }}>
                + Add Your First Match
              </Link>
            </div>
          ) : (
            <div className="sb-table-wrapper">
              <table className="sb-example-table">
                <thead>
                  <tr>
                    <th>Match</th>
                    <th>League</th>
                    <th>Kickoff</th>
                    <th>Bookmakers</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 700, color: '#38BDF8' }}>
                        {m.homeTeam} vs {m.awayTeam}
                      </td>
                      <td style={{ color: '#CBD5E1' }}>{m.league}</td>
                      <td style={{ color: '#94A3B8' }}>{m.kickoff.toLocaleString()}</td>
                      <td>
                        <span className="sb-badge sb-badge-green">
                          {m.odds.length} Bookmakers
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/matches/${m.id}`} className="sb-btn sb-btn-outline" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                          Edit Odds
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
  );
}

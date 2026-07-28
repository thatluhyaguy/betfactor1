import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function ArbReportsAdminPage() {
  await requireAdmin();

  const reports = await prisma.arbReport.groupBy({
    by: ['matchSlug'],
    _count: { matchSlug: true },
    orderBy: { _count: { matchSlug: 'desc' } },
  });

  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-tag" style={{ background: '#78350f', color: '#f59e0b' }}>USER FEEDBACK QUEUE</span>
            <h1 className="page-title">Reported Arb Issues</h1>
            <p className="page-lead">Matches with repeated reports likely have a team-name matching or odds parsing bug.</p>
          </div>
          <Link href="/admin" className="sb-btn sb-btn-outline">← Back to Admin</Link>
        </div>

        <div className="sb-calc-card" style={{ padding: '24px', marginTop: '20px' }}>
          {reports.length === 0 ? (
            <p style={{ color: '#94A3B8', textAlign: 'center', padding: '20px' }}>
              🎉 No reported arb issues in queue. All user-flagged matches are clean!
            </p>
          ) : (
            <div className="sb-table-wrapper">
              <table className="sb-example-table">
                <thead>
                  <tr>
                    <th>Match Slug</th>
                    <th>Report Count</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.matchSlug}>
                      <td style={{ fontWeight: 600, color: '#38BDF8' }}>{r.matchSlug}</td>
                      <td>
                        <span className="sb-badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                          {r._count.matchSlug} reports
                        </span>
                      </td>
                      <td style={{ color: '#CBD5E1' }}>Needs Review</td>
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

import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function LeadsPage() {
  await requireAdmin();
  const leads = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-tag" style={{ background: '#78350f', color: '#f59e0b' }}>LEAD GENERATION</span>
            <h1 className="page-title">Waitlist Signups ({leads.length})</h1>
            <p className="page-lead">View all captured lead contacts and download CSV exports for marketing outreach.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a href="/api/admin/leads/export" className="sb-btn sb-btn-primary" download>
              📥 Export CSV
            </a>
            <Link href="/admin" className="sb-btn sb-btn-outline">← Back to Admin</Link>
          </div>
        </div>

        <div className="sb-calc-card" style={{ padding: '24px', marginTop: '20px' }}>
          <div className="sb-table-wrapper">
            <table className="sb-example-table">
              <thead>
                <tr>
                  <th>Email or M-Pesa Phone</th>
                  <th>Tier</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{l.emailOrPhone}</td>
                    <td>
                      <span className={`sb-badge ${l.tier === 'MEMBER' ? 'sb-badge-green' : ''}`}>
                        {l.tier}
                      </span>
                    </td>
                    <td style={{ color: '#94A3B8' }}>{l.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

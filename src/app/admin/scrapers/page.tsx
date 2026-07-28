import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function ScraperHealthPage() {
  await requireAdmin();

  const bookmakers = ['SportPesa', 'Betika', 'Odibets'];
  const health = await Promise.all(
    bookmakers.map(async (bookmaker) => {
      const latest = await prisma.oddsSnapshot.findFirst({
        where: { bookmaker },
        orderBy: { scrapedAt: 'desc' },
      });
      const minutesSinceUpdate = latest
        ? Math.floor((Date.now() - latest.scrapedAt.getTime()) / 60000)
        : null;
      return {
        bookmaker,
        lastScrapedAt: latest?.scrapedAt ?? null,
        minutesSinceUpdate,
        isHealthy: minutesSinceUpdate !== null && minutesSinceUpdate < 5,
      };
    })
  );

  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-tag" style={{ background: '#78350f', color: '#f59e0b' }}>ADMIN TELEMETRY</span>
            <h1 className="page-title">Scraper Health Monitor</h1>
            <p className="page-lead">Queries the most recent OddsSnapshot per bookmaker to detect broken scrapers early.</p>
          </div>
          <Link href="/admin" className="sb-btn sb-btn-outline">← Back to Admin</Link>
        </div>

        <div className="sb-calc-card" style={{ padding: '24px', marginTop: '20px' }}>
          <div className="sb-table-wrapper">
            <table className="sb-example-table">
              <thead>
                <tr>
                  <th>Bookmaker</th>
                  <th>Last Scraped</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {health.map((h) => (
                  <tr key={h.bookmaker}>
                    <td style={{ fontWeight: 700, color: '#38BDF8', fontSize: '1rem' }}>{h.bookmaker}</td>
                    <td style={{ color: '#CBD5E1' }}>
                      {h.minutesSinceUpdate !== null ? `${h.minutesSinceUpdate}m ago` : 'Never'}
                    </td>
                    <td>
                      <span className={`sb-badge ${h.isHealthy ? 'sb-badge-green' : ''}`}>
                        {h.isHealthy ? '✅ Healthy (<5m)' : '⚠️ Stale / Down'}
                      </span>
                    </td>
                    <td>
                      <button className="sb-btn sb-btn-outline" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                        Trigger Manual Ping
                      </button>
                    </td>
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

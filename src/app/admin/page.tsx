import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export default async function AdminOverviewPage() {
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
        minutesSinceUpdate,
        isHealthy: minutesSinceUpdate !== null && minutesSinceUpdate < 5,
      };
    })
  );

  const healthyCount = health.filter((h) => h.isHealthy).length;
  const leadCount = await prisma.user.count();
  const reportCount = await prisma.arbReport.count();

  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="page-header">
          <span className="page-tag" style={{ background: '#78350f', color: '#f59e0b' }}>
            🔑 ADMIN PORTAL OVERVIEW
          </span>
          <h1 className="page-title">BetFactor System Dashboard</h1>
          <p className="page-lead">
            {healthyCount === 3
              ? '🟢 All 3 bookmaker scrapers are operational and healthy.'
              : `⚠️ ${healthyCount}/3 scrapers active — check Scraper Health.`}
          </p>
        </div>

        {/* Quick Nav Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', margin: '24px 0' }}>
          <Link href="/admin/scrapers" className="dash-card sb-calc-card" style={{ padding: '20px', textDecoration: 'none' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700 }}>SCRAPER HEALTH</span>
            <h3 style={{ fontSize: '1.2rem', color: '#38BDF8', marginTop: '8px' }}>🟢 {healthyCount}/3 Online</h3>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px' }}>Monitor live scrape timestamps &amp; bookmaker feeds →</p>
          </Link>

          <Link href="/admin/matches" className="dash-card sb-calc-card" style={{ padding: '20px', textDecoration: 'none' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700 }}>MANUAL MATCHES &amp; ODDS</span>
            <h3 style={{ fontSize: '1.2rem', color: '#4ADE80', marginTop: '8px' }}>✏️ Odds Editor</h3>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px' }}>Add or edit match odds without git deployments →</p>
          </Link>

          <Link href="/admin/arb-reports" className="dash-card sb-calc-card" style={{ padding: '20px', textDecoration: 'none' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700 }}>REPORTED ISSUES QUEUE</span>
            <h3 style={{ fontSize: '1.2rem', color: '#F59E0B', marginTop: '8px' }}>⚠️ {reportCount} Reports</h3>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px' }}>View user-flagged match odds mismatch reports →</p>
          </Link>

          <Link href="/admin/leads" className="dash-card sb-calc-card" style={{ padding: '20px', textDecoration: 'none' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700 }}>WAITLIST &amp; SIGNUPS</span>
            <h3 style={{ fontSize: '1.2rem', color: '#A855F7', marginTop: '8px' }}>📋 {leadCount} Leads</h3>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px' }}>View and export waitlist leads as CSV →</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

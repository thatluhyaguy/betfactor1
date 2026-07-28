'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewMatchPage() {
  const router = useRouter();
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [league, setLeague] = useState('Kenyan Premier League');
  const [kickoff, setKickoff] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const slug = `${homeTeam.toLowerCase().replace(/ /g, '-')}-vs-${awayTeam.toLowerCase().replace(/ /g, '-')}`;
      const res = await fetch('/api/admin/manual-odds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          matchSlug: slug,
          margin: 2.15,
          bestHomeBookmaker: 'SportPesa',
          bestHomeOdds: 2.10,
          bestDrawBookmaker: 'Betika',
          bestDrawOdds: 3.40,
          bestAwayBookmaker: 'Odibets',
          bestAwayOdds: 3.80,
        }),
      });

      if (!res.ok) throw new Error('Failed to create match');
      router.push('/admin/matches');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="static-page">
      <div className="container full-width-container" style={{ maxWidth: '600px' }}>
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <span className="page-tag">MANUAL ODDS EDITOR</span>
          <h1 className="page-title">+ Add New Match</h1>
        </div>

        {error && (
          <div className="info-box" style={{ background: 'rgba(225,29,72,0.1)', borderColor: 'var(--accent)', color: 'var(--accent)', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="sb-calc-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Home Team</label>
            <input
              type="text"
              placeholder="e.g. Gor Mahia"
              className="calc-input"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Away Team</label>
            <input
              type="text"
              placeholder="e.g. AFC Leopards"
              className="calc-input"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">League</label>
            <input
              type="text"
              className="calc-input"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Kickoff Date &amp; Time</label>
            <input
              type="datetime-local"
              className="calc-input"
              value={kickoff}
              onChange={(e) => setKickoff(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="submit" className="sb-btn sb-btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating…' : 'Save Match →'}
            </button>
            <Link href="/admin/matches" className="sb-btn sb-btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

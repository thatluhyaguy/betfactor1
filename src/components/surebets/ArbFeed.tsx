'use client';

import useSWR from 'swr';
import { useState, useMemo } from 'react';
import ArbCard, { type ArbOpportunity } from './ArbCard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type SortMode = 'margin' | 'recent';

export default function ArbFeed() {
  const [sortMode, setSortMode] = useState<SortMode>('margin');

  // Poll every 25s — matches the scraper's ~90s cycle with headroom.
  // No websockets needed at 3-bookmaker scale; revisit if you go to 10+.
  const { data, error, isLoading } = useSWR('/api/odds/arbitrage', fetcher, {
    refreshInterval: 25_000,
    revalidateOnFocus: true,
  });

  const sorted = useMemo<ArbOpportunity[]>(() => {
    if (!data?.opportunities?.length) return [];
    const list: ArbOpportunity[] = [...data.opportunities];
    return sortMode === 'margin'
      ? list.sort((a, b) => b.margin - a.margin)
      : list.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }, [data, sortMode]);

  /* ── Error state ── */
  if (error) {
    return (
      <div className="arb-state-card arb-state-error">
        <span className="arb-state-icon">⚠</span>
        <p>Couldn't reach the scanner right now.</p>
        <button className="arb-retry-btn" onClick={() => location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="arb-state-card arb-state-loading">
        <div className="arb-skeleton-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="arb-skeleton-card">
              <div className="arb-skel arb-skel-badge" />
              <div className="arb-skel arb-skel-title" />
              <div className="arb-skel arb-skel-rows" />
            </div>
          ))}
        </div>
        <p className="arb-scanning-label">Scanning for opportunities…</p>
      </div>
    );
  }

  /* ── Empty state ── */
  if (sorted.length === 0) {
    return (
      <div className="arb-state-card arb-state-empty">
        <span className="arb-state-icon">🔍</span>
        <h3>No active arbitrage opportunities right now</h3>
        <p>
          Odds shift constantly — this list updates every 25 seconds. If no opportunities appear,
          the bookmakers are currently pricing this week's matches too closely for a guaranteed margin.
        </p>
      </div>
    );
  }

  /* ── Live feed ── */
  return (
    <div className="arb-feed">
      <div className="arb-feed-controls">
        <div className="arb-feed-count">
          <span className="arb-live-dot" aria-hidden="true" />
          <strong>{sorted.length}</strong> active {sorted.length === 1 ? 'opportunity' : 'opportunities'}
        </div>
        <div className="arb-sort-toggle" role="group" aria-label="Sort opportunities">
          <button
            className={`arb-sort-btn${sortMode === 'margin' ? ' active' : ''}`}
            onClick={() => setSortMode('margin')}
            aria-pressed={sortMode === 'margin'}
          >
            Best margin first
          </button>
          <button
            className={`arb-sort-btn${sortMode === 'recent' ? ' active' : ''}`}
            onClick={() => setSortMode('recent')}
            aria-pressed={sortMode === 'recent'}
          >
            Newest first
          </button>
        </div>
      </div>

      <ul className="arb-feed-list" aria-label="Live arbitrage opportunities">
        {sorted.map((arb) => (
          <li key={arb.matchSlug}>
            <ArbCard arb={arb} />
          </li>
        ))}
      </ul>

      <p className="arb-feed-footnote">
        Refreshes automatically every 25 seconds · Last refreshed: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import useSWR from 'swr';
import ArbitrageCalculatorModal from '@/components/ArbitrageCalculatorModal';
import Link from 'next/link';

const BOOKMAKER_NAMES: Record<string, string> = {
  'arsenal-vs-chelsea': 'Arsenal vs Chelsea',
  'man-city-vs-liverpool': 'Man City vs Liverpool',
  'real-madrid-vs-barcelona': 'Real Madrid vs Barcelona',
  'man-united-vs-tottenham': 'Man United vs Tottenham',
  'psg-vs-bayern-munich': 'PSG vs Bayern Munich',
  'chelsea-vs-man-united': 'Chelsea vs Man United',
  'liverpool-vs-arsenal': 'Liverpool vs Arsenal',
};

const COMPETITION_MAP: Record<string, string> = {
  'arsenal-vs-chelsea': 'Premier League',
  'man-city-vs-liverpool': 'Premier League',
  'real-madrid-vs-barcelona': 'La Liga',
  'man-united-vs-tottenham': 'Premier League',
  'psg-vs-bayern-munich': 'UEFA Champions League',
  'chelsea-vs-man-united': 'Premier League',
  'liverpool-vs-arsenal': 'Premier League',
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatAge(isoString: string | null): string {
  if (!isoString) return 'Unknown';
  const diffSec = Math.round((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  return `${Math.round(diffSec / 3600)}h ago`;
}

export default function SureBetsPage() {
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  // In production this would read from user session/auth context
  const isMember = false;

  const { data, error, isLoading } = useSWR('/api/odds/arbitrage', fetcher, {
    refreshInterval: 25_000, // Poll every 25 seconds
    revalidateOnFocus: true,
  });

  const opportunities: any[] = data?.opportunities ?? [];
  const dataSource: string = data?.dataSource ?? 'loading';
  const lastCheckedAt: string | null = data?.lastCheckedAt ?? null;
  const staleWarning: boolean = data?.staleWarning ?? false;

  const liveStatus =
    isLoading ? '⏳ Connecting to scraper...'
    : error ? '🔴 Scraper unreachable — showing cached data'
    : staleWarning ? '🟡 Data may be delayed — Redis cold, showing DB snapshot'
    : '🟢 Live · Updated every 60–90s via scraper';

  return (
    <div className="static-page">
      <div className="container">
        <div className="page-header">
          <span className="page-tag">⚡ LIVE ARBITRAGE FINDER</span>
          <h1 className="page-title">Sure Bets &amp; Risk-Free Arbitrage</h1>
          <p className="page-lead">
            Scanned live across SportPesa, Betika, and Odibets. Mathematical profit opportunities — guaranteed regardless of match outcome.
          </p>
        </div>

        <div className="sure-bets-list">
          <div className={`live-status-bar ${staleWarning ? 'stale' : ''}`}>
            <span>{liveStatus}</span>
            <span>
              {dataSource === 'redis' ? 'Source: Live Redis' : dataSource === 'postgres' ? 'Source: DB snapshot' : ''}
              {lastCheckedAt ? ` · Checked ${formatAge(lastCheckedAt)}` : ''}
            </span>
          </div>

          {isLoading && (
            <div className="sb-loading">Loading live arbitrage data...</div>
          )}

          {!isLoading && opportunities.length === 0 && (
            <div className="sb-empty">
              <p>No live arbitrage opportunities detected right now.</p>
              <p>The scraper checks every 60–90 seconds. Opportunities are rare — typically appearing when bookmakers lag in adjusting prices to new information.</p>
            </div>
          )}

          {opportunities.map((opp: any) => {
            const matchName = BOOKMAKER_NAMES[opp.matchSlug] ?? opp.matchSlug;
            const competition = COMPETITION_MAP[opp.matchSlug] ?? 'Football';
            const [homeTeam, awayTeam] = matchName.split(' vs ');

            return (
              <div key={opp.matchSlug} className="sure-bet-card">
                <div className="sb-header">
                  <div>
                    <span className="sb-comp">{competition}</span>
                    <h3 className="sb-teams">{matchName}</h3>
                    {opp.detectedAt && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Detected {formatAge(opp.detectedAt)}
                      </span>
                    )}
                  </div>
                  <div className="sb-margin-block">
                    <span className="sb-margin-label">Arb Margin</span>
                    {isMember ? (
                      <span className="sb-margin-val text-positive">+{opp.margin.toFixed(2)}%</span>
                    ) : (
                      <span className="sb-margin-val blurred">🔒 +?.??%</span>
                    )}
                  </div>
                </div>

                <div className="sb-odds-row">
                  <div className="sb-odds-cell">
                    <span className="sb-label">Home ({homeTeam})</span>
                    <span className="sb-val">{opp.bestHomeOdds?.toFixed(2)}</span>
                    <span className="sb-bookie">{opp.bestHomeBookmaker}</span>
                  </div>
                  <div className="sb-odds-cell">
                    <span className="sb-label">Draw</span>
                    <span className="sb-val">{opp.bestDrawOdds?.toFixed(2)}</span>
                    <span className="sb-bookie">{opp.bestDrawBookmaker}</span>
                  </div>
                  <div className="sb-odds-cell">
                    <span className="sb-label">Away ({awayTeam})</span>
                    <span className="sb-val">{opp.bestAwayOdds?.toFixed(2)}</span>
                    <span className="sb-bookie">{opp.bestAwayBookmaker}</span>
                  </div>
                </div>

                <div className="sb-footer">
                  <span className="sb-updated">Last refreshed {formatAge(lastCheckedAt)}</span>
                  <button
                    className="sb-unlock-btn"
                    onClick={() =>
                      setSelectedMatch({
                        homeTeam,
                        awayTeam,
                        homeOdds: opp.bestHomeOdds,
                        homeBookie: opp.bestHomeBookmaker,
                        drawOdds: opp.bestDrawOdds,
                        drawBookie: opp.bestDrawBookmaker,
                        awayOdds: opp.bestAwayOdds,
                        awayBookie: opp.bestAwayBookmaker,
                        margin: opp.margin,
                      })
                    }
                  >
                    {isMember ? 'Open Arbitrage Calculator →' : '🔒 Unlock Calculator'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* If no live data, explain scraper dependency */}
        {!isLoading && opportunities.length === 0 && (
          <div className="content-body" style={{ marginTop: '40px' }}>
            <div className="info-box">
              ℹ️ The live scraper must be running on Railway or Fly.io and connected to Redis for this page to populate with real-time arbitrage opportunities.
              During development or before the scraper is deployed, this page shows empty state.
            </div>
          </div>
        )}
      </div>

      {selectedMatch && (
        <ArbitrageCalculatorModal
          match={selectedMatch}
          isMember={isMember}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}

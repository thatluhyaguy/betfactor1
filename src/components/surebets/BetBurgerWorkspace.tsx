'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json());

export interface ArbOpportunity {
  matchSlug: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  margin: number;
  bestHomeBookmaker: string;
  bestHomeOdds: number;
  bestDrawBookmaker: string;
  bestDrawOdds: number;
  bestAwayBookmaker: string;
  bestAwayOdds: number;
  detectedAt: string;
}

interface WorkspaceProps {
  initialType?: 'live' | 'prematch';
}

export default function BetBurgerWorkspace({ initialType = 'live' }: WorkspaceProps) {
  const { isAdmin, isUser } = useAuth();
  // Admin and paid members see everything; guests/free users are in trial mode
  const isFullAccess = isAdmin || isUser;

  const [arbType, setArbType] = useState<'live' | 'prematch'>(initialType);
  const [sortBy, setSortBy] = useState<'percent' | 'date' | 'bookmaker'>('percent');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedArb, setSelectedArb] = useState<ArbOpportunity | null>(null);
  const [totalStake, setTotalStake] = useState<number>(10000);

  const { data, isLoading } = useSWR('/api/odds/arbitrage', fetcher, {
    refreshInterval: autoUpdate ? 25000 : 0,
    revalidateOnFocus: true,
  });

  const rawOpportunities: ArbOpportunity[] = useMemo(() => {
    if (!data?.opportunities?.length) return [];
    return data.opportunities;
  }, [data]);

  const filteredOpportunities = useMemo(() => {
    let list = [...rawOpportunities];

    // Trial mode: non-logged-in guests only see arbs ≤ 1%
    if (!isFullAccess) {
      list = list.filter((a) => a.margin <= 1.0);
    }

    if (selectedSport !== 'all') {
      list = list.filter((a) => {
        const l = (a.league || '').toLowerCase();
        if (selectedSport === 'football') {
          return l.includes('football') || l.includes('league') || l.includes('premier') || l.includes('soccer') || l.includes('psl') || l.includes('mainland');
        }
        return l.includes(selectedSport.toLowerCase());
      });
    }

    if (sortBy === 'percent') {
      list.sort((a, b) => b.margin - a.margin);
    } else if (sortBy === 'date') {
      list.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
    }

    return list;
  }, [rawOpportunities, selectedSport, sortBy, isFullAccess]);

  const activeArb = selectedArb || filteredOpportunities[0] || null;

  const stakeCalculations = useMemo(() => {
    if (!activeArb) return null;
    const o1 = activeArb.bestHomeOdds;
    const oX = activeArb.bestDrawOdds;
    const o2 = activeArb.bestAwayOdds;
    const L = (1 / o1) + (1 / oX) + (1 / o2);
    const s1 = Math.round((totalStake / (o1 * L)) * 100) / 100;
    const sX = Math.round((totalStake / (oX * L)) * 100) / 100;
    const s2 = Math.round((totalStake / (o2 * L)) * 100) / 100;
    const p1 = Math.round(s1 * o1 * 100) / 100;
    const pX = Math.round(sX * oX * 100) / 100;
    const p2 = Math.round(s2 * o2 * 100) / 100;
    const grossProfit = Math.round((p1 - totalStake) * 100) / 100;
    const netProfit = Math.round((grossProfit * 0.95) * 100) / 100;
    return {
      stakes: [
        { label: 'Home (1)', bookmaker: activeArb.bestHomeBookmaker, odds: o1, stake: s1, payout: p1 },
        { label: 'Draw (X)', bookmaker: activeArb.bestDrawBookmaker, odds: oX, stake: sX, payout: pX },
        { label: 'Away (2)', bookmaker: activeArb.bestAwayBookmaker, odds: o2, stake: s2, payout: p2 },
      ],
      grossProfit,
      netProfit,
    };
  }, [activeArb, totalStake]);

  const getTimeAge = (iso: string) => {
    if (!iso) return '12 sec';
    const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)} sec`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min`;
    return `${Math.floor(diffSec / 3600)} hours`;
  };

  return (
    <div className="bb-workspace">
      {/* ── TOP BANNER: Trial for guests, Admin tag for admin ── */}
      {isAdmin ? (
        <div className="bb-top-banner" style={{ background: 'linear-gradient(90deg, #78350f, #f59e0b)' }}>
          <span>🔑 Admin View — Full unrestricted access. All arbs visible across all margins.</span>
          <Link href="/admin/dashboard" className="bb-banner-cta">Admin Dashboard →</Link>
        </div>
      ) : isUser ? (
        <div className="bb-top-banner" style={{ background: 'linear-gradient(90deg, #14532d, #16a34a)' }}>
          <span>✅ Member Access — Viewing all surebets with full detail.</span>
          <Link href="/dashboard" className="bb-banner-cta">My Account →</Link>
        </div>
      ) : (
        <div className="bb-top-banner">
          <span>🔒 Free trial mode: only Surebets up to 1% are available. Get unlimited access with a subscription!</span>
          <Link href="/pricing" className="bb-banner-cta">View prices →</Link>
        </div>
      )}

      {/* ── MAIN 3-PANE WORKSPACE ── */}
      <div className="bb-main-grid">
        {/* ── LEFT CONTROL SIDEBAR ── */}
        <aside className="bb-sidebar">
          <div className="bb-sidebar-header">
            <span className="bb-sidebar-logo">BetFactor Scanner</span>
            {isAdmin && <span style={{ fontSize: '0.7rem', color: '#f59e0b', display: 'block', marginTop: '2px' }}>ADMIN MODE</span>}
          </div>

          {/* Arbs Type Toggle */}
          <div className="bb-group">
            <label className="bb-group-label">Arbs type:</label>
            <div className="bb-radio-group">
              <label className="bb-radio">
                <input type="radio" name="arbType" checked={arbType === 'live'} onChange={() => setArbType('live')} />
                <span>● Live</span>
              </label>
              <label className="bb-radio">
                <input type="radio" name="arbType" checked={arbType === 'prematch'} onChange={() => setArbType('prematch')} />
                <span>○ Prematch</span>
              </label>
            </div>
          </div>

          {/* Sorted By */}
          <div className="bb-group">
            <label className="bb-group-label">Sorted by:</label>
            <select className="bb-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'percent' | 'date' | 'bookmaker')}>
              <option value="percent">Percent (Margin %)</option>
              <option value="date">Date / Time</option>
              <option value="bookmaker">Bookmaker</option>
            </select>
          </div>

          {/* Settings */}
          <div className="bb-group">
            <label className="bb-group-label">Settings:</label>
            <div className="bb-checkbox-list">
              <label className="bb-checkbox">
                <input type="checkbox" checked={autoUpdate} onChange={(e) => setAutoUpdate(e.target.checked)} />
                <span>Auto update (25s)</span>
              </label>
              <label className="bb-checkbox">
                <input type="checkbox" checked={soundAlerts} onChange={(e) => setSoundAlerts(e.target.checked)} />
                <span>Sound alerts</span>
              </label>
              <label className="bb-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Group arbs</span>
              </label>
            </div>
          </div>

          {/* Odds Type */}
          <div className="bb-group">
            <label className="bb-group-label">Odds type:</label>
            <select className="bb-select" defaultValue="Decimal">
              <option value="Decimal">Decimal (e.g. 2.35)</option>
              <option value="Fractional">Fractional</option>
              <option value="American">American</option>
            </select>
          </div>

          {/* Sports Filter */}
          <div className="bb-group">
            <label className="bb-group-label">Sports Filter:</label>
            <div className="bb-checkbox-list">
              <label className="bb-checkbox">
                <input type="radio" name="sport" checked={selectedSport === 'all'} onChange={() => setSelectedSport('all')} />
                <span>All Sports</span>
              </label>
              <label className="bb-checkbox">
                <input type="radio" name="sport" checked={selectedSport === 'football'} onChange={() => setSelectedSport('football')} />
                <span>Soccer / Football</span>
              </label>
              <label className="bb-checkbox">
                <input type="radio" name="sport" checked={selectedSport === 'basketball'} onChange={() => setSelectedSport('basketball')} />
                <span>Basketball</span>
              </label>
            </div>
          </div>

          {/* Access status */}
          {!isFullAccess && (
            <div style={{ marginTop: 'auto', padding: '12px', background: 'rgba(225,29,72,0.1)', borderRadius: '8px', border: '1px solid rgba(225,29,72,0.3)' }}>
              <p style={{ fontSize: '0.75rem', color: '#f87171', lineHeight: '1.5', margin: 0 }}>
                🔒 Trial mode active.<br />
                <Link href="/pricing" style={{ color: '#f59e0b', fontWeight: 700 }}>Upgrade for full access →</Link>
              </p>
            </div>
          )}
        </aside>

        {/* ── CENTER SUREBET FEED ── */}
        <section className="bb-feed-column">
          <div className="bb-feed-header">
            <span className="bb-feed-title">
              {arbType === 'live' ? '⚡ Live In-Play Scanner' : '⚽ Prematch Scanner'}
              {isAdmin && <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#f59e0b' }}>[ADMIN — All margins]</span>}
            </span>
            <span className="bb-feed-count">{filteredOpportunities.length} arbs found</span>
          </div>

          {isLoading && !data ? (
            <div className="bb-loading">Scanning live odds across bookmakers…</div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="bb-empty">
              {isFullAccess
                ? 'No active surebets matching selected filters right now.'
                : 'No trial surebets (≤1%) at the moment. Upgrade to see all opportunities.'}
            </div>
          ) : (
            <div className="bb-feed-list">
              {filteredOpportunities.map((arb) => {
                const isSelected = activeArb?.matchSlug === arb.matchSlug;
                return (
                  <div
                    key={arb.matchSlug}
                    className={`bb-arb-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedArb(arb)}
                  >
                    <div className="bb-card-header">
                      <span className="bb-margin-badge">{arb.margin.toFixed(2)}%</span>
                      <span className="bb-sport-tag">{arb.league || 'Soccer'}</span>
                      <span className="bb-age-tag">🕒 {getTimeAge(arb.detectedAt)}</span>
                    </div>
                    <div className="bb-outcomes-table">
                      <div className="bb-outcome-row">
                        <span className="bb-bookie-name">{arb.bestHomeBookmaker}</span>
                        <span className="bb-teams font-mono">{arb.homeTeam} vs {arb.awayTeam}</span>
                        <span className="bb-pick-label">Home Win</span>
                        <span className="bb-odd-val">▲ {arb.bestHomeOdds.toFixed(2)}</span>
                      </div>
                      <div className="bb-outcome-row">
                        <span className="bb-bookie-name">{arb.bestDrawBookmaker}</span>
                        <span className="bb-teams font-mono">{arb.homeTeam} vs {arb.awayTeam}</span>
                        <span className="bb-pick-label">Draw (X)</span>
                        <span className="bb-odd-val">▲ {arb.bestDrawOdds.toFixed(2)}</span>
                      </div>
                      <div className="bb-outcome-row">
                        <span className="bb-bookie-name">{arb.bestAwayBookmaker}</span>
                        <span className="bb-teams font-mono">{arb.homeTeam} vs {arb.awayTeam}</span>
                        <span className="bb-pick-label">Away Win</span>
                        <span className="bb-odd-val">▲ {arb.bestAwayOdds.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── RIGHT PANEL (CALCULATOR & MARKET TABS) ── */}
        <aside className="bb-calculator-panel">
          <div className="bb-market-tabs">
            <button className="bb-tab active">1X2 &amp; ML</button>
            <button className="bb-tab">Handicaps</button>
            <button className="bb-tab">Totals</button>
            <button className="bb-tab">Game Winner</button>
            <button className="bb-tab">Corners</button>
          </div>

          <div className="bb-calc-widget">
            <h3 className="bb-calc-title">Arbitrage Stake Calculator</h3>

            {activeArb && stakeCalculations ? (
              <div className="bb-calc-content">
                <div className="bb-match-summary">
                  <strong>{activeArb.homeTeam}</strong> vs <strong>{activeArb.awayTeam}</strong>
                  <span className="text-positive" style={{ float: 'right', fontWeight: 700 }}>
                    +{activeArb.margin.toFixed(2)}% Margin
                  </span>
                </div>

                <div className="bb-input-group">
                  <label>Total Investment (KES):</label>
                  <input
                    type="number"
                    value={totalStake}
                    onChange={(e) => setTotalStake(Number(e.target.value))}
                    className="bb-stake-input"
                    step="1000"
                  />
                </div>

                <table className="bb-calc-table">
                  <thead>
                    <tr>
                      <th>Outcome</th>
                      <th>Bookmaker</th>
                      <th>Odds</th>
                      <th>Stake (KES)</th>
                      <th>Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stakeCalculations.stakes.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.label}</td>
                        <td className="text-positive"><strong>{row.bookmaker}</strong></td>
                        <td className="font-mono">{row.odds.toFixed(2)}</td>
                        <td className="font-mono" style={{ fontWeight: 700 }}>KES {row.stake.toLocaleString()}</td>
                        <td className="font-mono">KES {row.payout.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bb-calc-totals">
                  <div className="bb-tot-row">
                    <span>Gross Guaranteed Profit:</span>
                    <span className="font-mono">+KES {stakeCalculations.grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="bb-tot-row">
                    <span>KRA 5% Withholding Tax:</span>
                    <span className="font-mono">-KES {(stakeCalculations.grossProfit * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="bb-tot-row highlight">
                    <span>Net Guaranteed Payout:</span>
                    <span className="font-mono text-positive" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                      +KES {stakeCalculations.netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', fontSize: '0.78rem', color: '#f59e0b' }}>
                    🔑 Admin: Viewing full unrestricted arbitrage data
                  </div>
                )}

                <div className="bb-actions" style={{ marginTop: '12px' }}>
                  <button className="sb-btn sb-btn-primary" style={{ width: '100%' }}>
                    Place Bets Across Bookmakers →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bb-calc-placeholder">
                <p>Select any surebet card from the feed to load the calculator.</p>
                {!isFullAccess && (
                  <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#f59e0b' }}>
                    <Link href="/pricing">Upgrade to Member →</Link> to unlock all high-margin opportunities.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

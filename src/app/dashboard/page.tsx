'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface SavedMatchItem {
  slug: string;
  name: string;
  bestBookie: string;
  odds: string;
  margin: string;
}

interface CalcHistoryItem {
  id: string;
  date: string;
  stake: number;
  odds: number;
  grossPayout: number;
  tax: number;
  fee: number;
  netPayout: number;
}

export default function UserDashboardPage() {
  const { isUser, user, isAdmin, logout } = useAuth();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [calcHistory, setCalcHistory] = useState<CalcHistoryItem[]>([]);

  // Load calculation history from localStorage on client side
  useEffect(() => {
    try {
      const stored = localStorage.getItem('betfactor_calc_history');
      if (stored) {
        setCalcHistory(JSON.parse(stored));
      } else {
        // Default initial history if none saved yet
        setCalcHistory([
          {
            id: '1',
            date: 'Today, 15:40',
            stake: 10000,
            odds: 2.35,
            grossPayout: 23500,
            tax: 675,
            fee: 185,
            netPayout: 22640,
          },
          {
            id: '2',
            date: 'Yesterday, 18:20',
            stake: 5000,
            odds: 3.10,
            grossPayout: 15500,
            tax: 525,
            fee: 125,
            netPayout: 14850,
          },
        ]);
      }
    } catch {
      // ignore
    }
  }, []);

  const savedMatches: SavedMatchItem[] = [
    {
      slug: 'gor-mahia-vs-afc-leopards',
      name: 'Gor Mahia vs AFC Leopards',
      bestBookie: 'SportPesa',
      odds: '1.95',
      margin: '2.34%',
    },
    {
      slug: 'arsenal-vs-chelsea',
      name: 'Arsenal vs Chelsea',
      bestBookie: 'Betika',
      odds: '2.25',
      margin: '1.87%',
    },
    {
      slug: 'man-city-vs-liverpool',
      name: 'Man City vs Liverpool',
      bestBookie: 'Odibets',
      odds: '4.15',
      margin: '1.42%',
    },
  ];

  const userTier = user?.tier || (isAdmin ? 'ADMIN' : 'FREE');

  return (
    <div className="static-page">
      <div className="container full-width-container">
        {/* Header */}
        <div className="page-header" style={{ marginBottom: '32px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-tag">USER DASHBOARD</span>
            <h1 className="page-title">Welcome back, {user?.emailOrPhone || 'Bettor'}</h1>
            <p className="page-lead">Track your saved odds, calculate net payouts, and manage your subscription.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/sure-bets/live" className="sb-btn sb-btn-primary">
              ⚡ Open Live Scanner →
            </Link>
          </div>
        </div>

        {/* Core Dashboard Grid */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          {/* 1. SUBSCRIPTION STATUS CARD */}
          <div className="dash-card sb-calc-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="dash-card-title" style={{ fontSize: '1.1rem', margin: 0 }}>Subscription Status</h2>
              <span className={`sb-badge ${userTier === 'MEMBER' || userTier === 'ADMIN' ? 'sb-badge-green' : ''}`}>
                {userTier} TIER
              </span>
            </div>

            <div className="dash-status-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
              <span className="dash-label" style={{ color: '#94A3B8' }}>Access Mode:</span>
              <span className="dash-val" style={{ fontWeight: 600 }}>
                {userTier === 'FREE' ? 'Trial Mode (≤1.0% Surebets)' : 'Full Access (All Margins)'}
              </span>
            </div>

            <div className="dash-status-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
              <span className="dash-label" style={{ color: '#94A3B8' }}>Auto-Renewal:</span>
              <span className="dash-val">{userTier === 'FREE' ? 'N/A' : 'Active (M-Pesa STK Push)'}</span>
            </div>

            {userTier === 'FREE' && (
              <div style={{ marginTop: '20px' }}>
                <Link href="/pricing" className="btn-primary-large" style={{ width: '100%', textAlign: 'center', display: 'block', padding: '10px' }}>
                  Upgrade to Member via M-Pesa →
                </Link>
              </div>
            )}
          </div>

          {/* 2. ACTIVE ALERTS NOTIFICATION TOGGLE & FEED */}
          <div className="dash-card sb-calc-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="dash-card-title" style={{ fontSize: '1.1rem', margin: 0 }}>Arb Alert Notifications</h2>
              <label className="bb-checkbox" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={alertsEnabled}
                  onChange={(e) => setAlertsEnabled(e.target.checked)}
                />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{alertsEnabled ? 'ON' : 'OFF'}</span>
              </label>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '12px' }}>
              Receive instant SMS/WhatsApp alerts whenever high-margin surebets (&gt;2.0%) land across SportPesa, Betika &amp; Odibets.
            </p>

            <div style={{ background: '#0F172A', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38BDF8' }}>
                <span>⚡ Alert Sent (10m ago): Gor Mahia vs AFC</span>
                <span style={{ color: '#4ADE80', fontWeight: 700 }}>+2.34%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>⚡ Alert Sent (2h ago): Simba vs Yanga</span>
                <span style={{ color: '#4ADE80', fontWeight: 700 }}>+2.11%</span>
              </div>
            </div>
          </div>

          {/* 3. SAVED / WATCHED MATCHES */}
          <div className="dash-card sb-calc-card" style={{ padding: '24px', gridColumn: 'span 1 / -1' }}>
            <h2 className="dash-card-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
              Bookmarked / Watched Matches
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {savedMatches.map((match) => (
                <div key={match.slug} style={{ background: '#0F172A', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#E2E8F0' }}>{match.name}</strong>
                    <span className="bb-margin-badge">{match.margin}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '12px' }}>
                    Best Odds: <span style={{ color: '#38BDF8', fontWeight: 700 }}>{match.bestBookie}</span> @ <span className="font-mono" style={{ color: '#4ADE80' }}>{match.odds}</span>
                  </div>
                  <Link href={`/sure-bets/live`} className="sb-btn sb-btn-outline" style={{ padding: '4px 10px', fontSize: '0.78rem', width: '100%', textAlign: 'center', display: 'block' }}>
                    Calculate Stakes →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 4. RECENT CALCULATOR HISTORY */}
          <div className="dash-card sb-calc-card" style={{ padding: '24px', gridColumn: 'span 1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="dash-card-title" style={{ fontSize: '1.1rem', margin: 0 }}>
                Recent Calculator History ({calcHistory.length})
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Saved automatically so you don&apos;t re-enter numbers</span>
            </div>

            <div className="sb-table-wrapper">
              <table className="sb-example-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Stake (KES)</th>
                    <th>Odds</th>
                    <th>Gross Payout</th>
                    <th>5% KRA Tax</th>
                    <th>M-Pesa Fee</th>
                    <th>Net Take-Home</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {calcHistory.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: '#94A3B8' }}>{item.date}</td>
                      <td className="font-mono" style={{ fontWeight: 700 }}>KES {item.stake.toLocaleString()}</td>
                      <td className="font-mono">{item.odds.toFixed(2)}</td>
                      <td className="font-mono">KES {item.grossPayout.toLocaleString()}</td>
                      <td className="font-mono" style={{ color: '#f87171' }}>−KES {item.tax.toLocaleString()}</td>
                      <td className="font-mono" style={{ color: '#f87171' }}>−KES {item.fee.toLocaleString()}</td>
                      <td className="font-mono text-positive" style={{ fontWeight: 800 }}>
                        +KES {item.netPayout.toLocaleString()}
                      </td>
                      <td>
                        <Link href="/calculator" className="sb-btn sb-btn-outline" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                          Re-calculate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

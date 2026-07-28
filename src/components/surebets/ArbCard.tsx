import ArbAge from './ArbAge';
import ReportArbButton from './ReportArbButton';

export type ArbOpportunity = {
  matchSlug: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  margin: number; // percentage, e.g. 2.34 = 2.34%
  bestHomeBookmaker: string;
  bestHomeOdds: number;
  bestDrawBookmaker: string;
  bestDrawOdds: number;
  bestAwayBookmaker: string;
  bestAwayOdds: number;
  detectedAt: string; // ISO timestamp
};

const BOOKMAKER_SHORT: Record<string, string> = {
  sportpesa: 'SportPesa',
  betika: 'Betika',
  odibets: 'Odibets',
  mozzart: 'Mozzart',
  '1xbet': '1xBet',
};

function friendlyBookie(raw: string) {
  return BOOKMAKER_SHORT[raw.toLowerCase()] ?? raw;
}

export default function ArbCard({ arb }: { arb: ArbOpportunity }) {
  const marginPct = arb.margin.toFixed(2);
  // Colour-code the margin badge: <1% amber, ≥1% green
  const marginClass = arb.margin >= 1 ? 'arb-margin-high' : 'arb-margin-low';

  return (
    <div className="arb-card">
      {/* ── Header row ── */}
      <div className="arb-card-header">
        <span className={`arb-margin-badge ${marginClass}`}>+{marginPct}%</span>
        <span className="arb-league-tag">{arb.league}</span>
        <ArbAge detectedAt={arb.detectedAt} />
      </div>

      {/* ── Match title ── */}
      <p className="arb-match-title">
        {arb.homeTeam} <span className="arb-vs">vs</span> {arb.awayTeam}
      </p>

      {/* ── Three outcome rows ── */}
      <div className="arb-outcomes">
        <div className="arb-outcome">
          <span className="arb-outcome-label">Home</span>
          <span className="arb-outcome-odds">{arb.bestHomeOdds.toFixed(2)}</span>
          <span className="arb-outcome-bookie">{friendlyBookie(arb.bestHomeBookmaker)}</span>
        </div>
        <div className="arb-outcome">
          <span className="arb-outcome-label">Draw</span>
          <span className="arb-outcome-odds">{arb.bestDrawOdds.toFixed(2)}</span>
          <span className="arb-outcome-bookie">{friendlyBookie(arb.bestDrawBookmaker)}</span>
        </div>
        <div className="arb-outcome">
          <span className="arb-outcome-label">Away</span>
          <span className="arb-outcome-odds">{arb.bestAwayOdds.toFixed(2)}</span>
          <span className="arb-outcome-bookie">{friendlyBookie(arb.bestAwayBookmaker)}</span>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="arb-card-footer">
        <button className="arb-unlock-btn" disabled title="Stake calculator unlocks when Member plan launches">
          🔒 Stake Calculator
        </button>
        <ReportArbButton matchSlug={arb.matchSlug} />
      </div>
    </div>
  );
}

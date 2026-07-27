interface OddsRow {
  bookmaker: string;
  home: number;
  draw: number;
  away: number;
}

interface OddsTableProps {
  odds: OddsRow[];
  homeTeam: string;
  awayTeam: string;
}

function getBest(odds: OddsRow[], key: keyof OddsRow): number {
  return Math.max(...odds.map((o) => o[key] as number));
}

export default function OddsTable({ odds, homeTeam, awayTeam }: OddsTableProps) {
  const bestHome = getBest(odds, 'home');
  const bestDraw = getBest(odds, 'draw');
  const bestAway = getBest(odds, 'away');

  return (
    <div className="odds-table-wrapper" role="region" aria-label="Odds comparison table">
      <table className="odds-table">
        <thead>
          <tr>
            <th className="odds-th bookmaker-col">Bookmaker</th>
            <th className="odds-th">
              <span className="team-header">{homeTeam}</span>
              <span className="market-sub">Home Win</span>
            </th>
            <th className="odds-th">
              <span className="team-header">Draw</span>
              <span className="market-sub">X</span>
            </th>
            <th className="odds-th">
              <span className="team-header">{awayTeam}</span>
              <span className="market-sub">Away Win</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {odds.map((row) => (
            <tr key={row.bookmaker} className="odds-row">
              <td className="odds-td bookmaker-name">{row.bookmaker}</td>
              <td className="odds-td">
                <span className={`odds-pill ${row.home === bestHome ? 'best-odds' : ''}`}>
                  {row.home.toFixed(2)}
                  {row.home === bestHome && <span className="best-badge">BEST</span>}
                </span>
              </td>
              <td className="odds-td">
                <span className={`odds-pill ${row.draw === bestDraw ? 'best-odds' : ''}`}>
                  {row.draw.toFixed(2)}
                  {row.draw === bestDraw && <span className="best-badge">BEST</span>}
                </span>
              </td>
              <td className="odds-td">
                <span className={`odds-pill ${row.away === bestAway ? 'best-odds' : ''}`}>
                  {row.away.toFixed(2)}
                  {row.away === bestAway && <span className="best-badge">BEST</span>}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Best odds summary row */}
      <div className="best-summary">
        <span className="best-summary-label">Best Available</span>
        <div className="best-summary-odds">
          <div className="best-cell">
            <span className="best-cell-label">{homeTeam}</span>
            <span className="best-cell-value">{bestHome.toFixed(2)}</span>
          </div>
          <div className="best-cell">
            <span className="best-cell-label">Draw</span>
            <span className="best-cell-value">{bestDraw.toFixed(2)}</span>
          </div>
          <div className="best-cell">
            <span className="best-cell-label">{awayTeam}</span>
            <span className="best-cell-value">{bestAway.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

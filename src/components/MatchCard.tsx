import Link from 'next/link';

interface Match {
  slug: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickoff: string;
  odds: {
    bookmaker: string;
    home: number;
    draw: number;
    away: number;
  }[];
  lastUpdated: string;
}

function getBestOdds(odds: Match['odds']) {
  return {
    home: Math.max(...odds.map((o) => o.home)),
    draw: Math.max(...odds.map((o) => o.draw)),
    away: Math.max(...odds.map((o) => o.away)),
  };
}

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });
}

export default function MatchCard({ match }: { match: Match }) {
  const best = getBestOdds(match.odds);
  const bookmakerCount = match.odds.length;

  return (
    <Link href={`/odds/${match.slug}`} className="match-card" aria-label={`${match.homeTeam} vs ${match.awayTeam} odds comparison`}>
      <div className="match-card-header">
        <span className="match-competition">{match.competition}</span>
        <span className="match-kickoff">{formatKickoff(match.kickoff)}</span>
      </div>

      <div className="match-teams">
        <span className="team home">{match.homeTeam}</span>
        <span className="vs-badge">VS</span>
        <span className="team away">{match.awayTeam}</span>
      </div>

      <div className="match-odds-preview">
        <div className="odds-cell">
          <span className="odds-market">Home</span>
          <span className="odds-value best">{best.home.toFixed(2)}</span>
        </div>
        <div className="odds-cell">
          <span className="odds-market">Draw</span>
          <span className="odds-value best">{best.draw.toFixed(2)}</span>
        </div>
        <div className="odds-cell">
          <span className="odds-market">Away</span>
          <span className="odds-value best">{best.away.toFixed(2)}</span>
        </div>
      </div>

      <div className="match-card-footer">
        <span className="bookmaker-count">
          {bookmakerCount} bookmakers compared
        </span>
        <span className="view-odds">View all odds →</span>
      </div>
    </Link>
  );
}

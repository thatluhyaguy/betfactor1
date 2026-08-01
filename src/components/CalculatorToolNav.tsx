import Link from 'next/link';

// Shared cross-nav shown on every /tools/* page. Only build pages get real
// links; the rest render as disabled/"coming soon" until built, per the
// suite's build order (parlay -> surebet -> odds converter -> no-vig -> EV/Kelly -> free bet).
const TOOLS = [
  { slug: 'parlay-calculator', label: 'Parlay Calculator', live: true },
  { slug: 'surebet-calculator', label: 'Surebet Calculator', live: false },
  { slug: 'odds-converter', label: 'Odds Converter', live: false },
  { slug: 'no-vig-calculator', label: 'No-Vig Calculator', live: false },
  { slug: 'ev-calculator', label: 'EV Calculator', live: false },
  { slug: 'kelly-calculator', label: 'Kelly Calculator', live: false },
  { slug: 'free-bet-calculator', label: 'Free Bet Calculator', live: false },
] as const;

export default function CalculatorToolNav({ current }: { current: string }) {
  return (
    <nav className="tool-nav" aria-label="Betting calculator tools">
      <ul className="tool-nav-list">
        {TOOLS.map((tool) => {
          const isCurrent = tool.slug === current;
          if (!tool.live && !isCurrent) {
            return (
              <li key={tool.slug} className="tool-nav-item disabled" aria-disabled="true">
                {tool.label}
                <span className="tool-nav-badge">Soon</span>
              </li>
            );
          }
          return (
            <li key={tool.slug} className={`tool-nav-item ${isCurrent ? 'active' : ''}`}>
              <Link href={`/tools/${tool.slug}`}>{tool.label}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

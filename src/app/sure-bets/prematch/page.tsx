import type { Metadata } from 'next';
import BetBurgerWorkspace from '@/components/surebets/BetBurgerWorkspace';

export const metadata: Metadata = {
  title: 'Prematch Surebets Scanner — Bookmaker Odds | BetFactor Kenya',
  description:
    'Professional prematch arbitrage scanner across SportPesa, Betika, and Odibets. Real-time updates with interactive stake calculator.',
};

export default function PrematchSurebetsPage() {
  return (
    <div className="static-page" style={{ padding: '24px 0' }}>
      <div className="container full-width-container">
        <BetBurgerWorkspace initialType="prematch" />
      </div>
    </div>
  );
}

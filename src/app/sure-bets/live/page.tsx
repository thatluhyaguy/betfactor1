import type { Metadata } from 'next';
import BetBurgerWorkspace from '@/components/surebets/BetBurgerWorkspace';

export const metadata: Metadata = {
  title: 'Live Surebets Scanner — Active In-Play Odds | BetFactor Kenya',
  description:
    'Professional live arbitrage scanner across SportPesa, Betika, and Odibets. Real-time updates every 25s with interactive stake calculator.',
};

export default function LiveSurebetsPage() {
  return (
    <div className="bb-page-root">
      <BetBurgerWorkspace initialType="live" />
    </div>
  );
}

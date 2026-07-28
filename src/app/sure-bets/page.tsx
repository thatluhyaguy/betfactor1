import type { Metadata } from 'next';
import SurebetsLanding from '@/components/surebets/SurebetsLanding';

export const metadata: Metadata = {
  title: 'Surebets — The Key to Guaranteed Betting Profit | BetFactor Kenya',
  description:
    'Learn how arbitrage betting works across SportPesa, Betika, and Odibets. Calculate guaranteed returns and unlock real-time live scanner alerts.',
};

export default function SureBetsPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        <SurebetsLanding />
      </div>
    </div>
  );
}

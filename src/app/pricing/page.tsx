import type { Metadata } from 'next';
import Link from 'next/link';
import PricingTable from '@/components/PricingTable';

export const metadata: Metadata = {
  title: 'Pricing & Member Upgrade | BetFactor Kenya',
  description:
    'Compare BetFactor Free vs Member tier. Access live sure bets, unlocked arbitrage calculators, and real-time alerts via M-Pesa.',
};

export default function PricingPage() {
  return (
    <div className="static-page">
      <div className="container">
        <div className="page-header">
          <span className="page-tag">SUBSCRIPTION PLAN</span>
          <h1 className="page-title">BetFactor Member Access</h1>
          <p className="page-lead">
            Get the full edge. Access live sure bets, per-match arbitrage calculators, and instant odds alerts across 5 Kenyan bookmakers.
          </p>
        </div>

        <PricingTable />

        <div className="content-body" style={{ marginTop: '64px' }}>
          <div className="content-section">
            <h2>M-Pesa STK Push Billing</h2>
            <p>
              Subscribing is fast and seamless. Enter your Safaricom M-Pesa phone number, receive an instant STK prompt on your phone, enter your PIN, and your account unlocks instantly.
            </p>
            <div className="info-box">
              📲 <strong>No bank cards required.</strong> Standard monthly billing is KES 499/month. Cancel or pause anytime directly from your dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

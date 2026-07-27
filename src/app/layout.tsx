import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://betfactor.co.ke'),
  title: {
    default: 'BetFactor Kenya — Net Payout & Arbitrage Calculator',
    template: '%s | BetFactor Kenya',
  },
  description:
    'Calculate your exact M-Pesa net take-home after Kenya betting withholding tax (5%, Finance Act 2025) and M-Pesa withdrawal fees. Discover live sure bets & arbitrage opportunities across SportPesa, Betika, and Odibets.',
  keywords: [
    'Kenya betting calculator',
    'M-Pesa betting payout',
    'Kenya betting tax calculator',
    'SportPesa odds Kenya',
    'Betika odds Kenya',
    'Kenya gambling tax 2025',
    'Finance Act 2025 betting',
    'sure bets Kenya',
    'arbitrage betting Kenya',
  ],
  authors: [{ name: 'BetFactor' }],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://betfactor.co.ke',
    siteName: 'BetFactor Kenya',
    title: 'BetFactor Kenya — Net Payout & Arbitrage Calculator',
    description:
      'Know exactly what you take home. Kenya betting tax + M-Pesa fee calculator with live sure bets & odds comparisons.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BetFactor Kenya' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BetFactor Kenya — Net Payout & Arbitrage Calculator',
    description: 'Know exactly what you take home after Kenya betting tax, M-Pesa fees, and live sure bets.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EquityPulse - Real-Time Indian Stock Screener & Charting Platform',
  description:
    'Institutional-grade stock screener handling 5,000+ NSE & BSE instruments with sub-200ms filter engine, Lightweight Charts, and real-time WebSocket streaming.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased font-sans flex flex-col">{children}</body>
    </html>
  );
}
